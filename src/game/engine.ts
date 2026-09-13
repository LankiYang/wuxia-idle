// ─── 游戏引擎 v4：状态、循环、战斗、秘境、成就、轮回、持久化 ──────────────────
import { useSyncExternalStore } from 'react'
import {
  ACHIEVEMENTS, ACTIONS, AFFIXES, ITEMS, LAB_BLESSINGS, LAB_SHOP, MONSTERS, SKILLS, STYLES, TASK_TEMPLATES,
  labCoinReward, labMonster, rollAffixes, titleFor, xpToNext,
  REBIRTH_REQ_LEVEL, REBIRTH_XP_PCT_PER_POINT, REBIRTH_COIN_PCT_PER_POINT, rebirthPointsGain,
  type AchievementStats, type ActionDef, type AffixRoll, type SkillId, type StyleId, type DailyQuest,
} from './data'

export interface SkillState { level: number; xp: number }

export interface CombatEvent { type: 'dmg' | 'crit' | 'monsterDmg' | 'kill' | 'drop'; value: number; item?: string; time: number }
export interface GatherEvent { type: 'item'; item: string; count: number; time: number }

export interface TaskState {
  id: number
  skill: SkillId
  actionId: string
  item: string
  count: number
  progress: number
  rewardCoins: number
  rewardTokens: number
}

export interface ChatMsg { channel: string; user: string; text: string; time: string }

export interface EquipSlot { item: string; plus: number; affixes?: AffixRoll[]; fractures?: number }
export type EquipSlotId = 'weapon' | 'armor' | 'amulet'

export interface BattleState {
  monsterId: string // 普通怪物 id；秘境战为 'lab'
  monsterHp: number
  style: StyleId
  roundTimer: number // 距下一回合的秒数
  firstHit: boolean // 暗器首回合加成
  labFloor?: number // 秘境战斗：当前挑战层数
  blessings?: string[] // 秘境战斗：本次爬塔已选祝福
}

export interface GameState {
  skills: Record<SkillId, SkillState>
  inventory: Record<string, number>
  active: { actionId: string; elapsed: number } | null
  battle: BattleState | null
  playerHp: number
  equipment: Record<EquipSlotId, EquipSlot | null>
  tasks: TaskState[]
  taskPoints: number
  lifetimeTaskPoints: number
  kills: number
  crafted: number
  labFloor: number      // 秘境：下一层待挑战
  highestFloor: number  // 秘境：生涯最高层（成就用，轮回保留）
  labShopBought: Record<string, number>
  labOffer: string[] | null // 秘境：待选择的三选一祝福
  styleManuals: Record<StyleId, number> // 武学秘籍：每流派已参悟层数（上限 5，每层伤害 +3%）
  unlockedAchievements: string[]
  rebirthPoints: number
  rebirths: number
  teaUntil: number
  atkBuffUntil: number
  defBuffUntil: number
  chat: ChatMsg[]
  notice: string // 顶部飘过的提示
  lastTick: number
  autoCraft: Record<string, { actionId: string; elapsed: number } | null> // 自动制造：skillId → 当前配方 + 累计时间
  autoCombat: { monsterId: string; style: StyleId } | null // 自动战斗：开启时自动打指定怪物
  daily: { date: string; quests: DailyQuest[] } | null // 每日悬赏：3 个轮换目标，跨天重置
  combatEvents: CombatEvent[] // 战斗动画事件（不持久化）
  gatherEvents: GatherEvent[] // 采集动画事件（不持久化）
  levelUpEvents: { skill: SkillId; level: number; time: number }[] // 升级庆祝事件（不持久化）
}

const LEGACY_SAVE_KEY = 'wuxia-idle-save-v4' // 旧单存档（v8 迁移来源，保留不删）
const LEGACY_MIGRATED_KEY = 'wuxia-idle-v5-migrated' // 旧档已迁移标记
const META_KEY = 'wuxia-idle-v5-meta' // 槽列表元数据
const SLOT_KEY_PREFIX = 'wuxia-idle-v5-slot-' // 每槽 GameState
const MAX_SLOTS = 5
const MAX_TASKS = 6
const ROUND_SEC = 2

/** 存档槽元信息（GameState 独立存槽 key，切槽只读写对应 key） */
export interface SlotMeta {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

const DEFAULT_SLOT_NAMES = ['侠客壹', '侠客贰', '侠客叁', '侠客肆', '侠客伍']
const slotKey = (id: string) => `${SLOT_KEY_PREFIX}${id}`

function freshState(): GameState {
  const skills = {} as Record<SkillId, SkillState>
  for (const s of SKILLS) skills[s.id] = { level: 1, xp: 0 }
  return {
    skills,
    inventory: { coin: 500, token: 0, tea: 1, labCoin: 0 },
    active: null,
    battle: null,
    playerHp: 65,
    equipment: { weapon: null, armor: null, amulet: null },
    tasks: [],
    taskPoints: 0,
    lifetimeTaskPoints: 0,
    kills: 0,
    crafted: 0,
    labFloor: 1,
    highestFloor: 0,
    labShopBought: {},
    labOffer: null,
    styleManuals: { sword: 0, fist: 0, hidden: 0, inner: 0 },
    unlockedAchievements: [],
    rebirthPoints: 0,
    rebirths: 0,
    teaUntil: 0,
    atkBuffUntil: 0,
    defBuffUntil: 0,
    chat: [],
    notice: '',
    lastTick: Date.now(),
    autoCraft: {},
    autoCombat: null,
    daily: null,
    combatEvents: [],
    gatherEvents: [],
    levelUpEvents: [],
  }
}

function now() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

let taskSeq = 1
function rollTask(levels: Record<SkillId, SkillState>): TaskState {
  const pool = TASK_TEMPLATES.filter(t => {
    const a = ACTIONS.find(x => x.id === t.actionId)!
    return levels[t.skill].level >= a.levelReq
  })
  const t = pool[Math.floor(Math.random() * pool.length)] ?? TASK_TEMPLATES[0]
  const count = t.min + Math.floor(Math.random() * (t.max - t.min))
  return {
    id: taskSeq++,
    skill: t.skill,
    actionId: t.actionId,
    item: t.item,
    count,
    progress: 0,
    rewardCoins: (count * (ITEMS[t.item]?.price ?? 10) * (0.8 + Math.random() * 0.6)) | 0,
    rewardTokens: 1 + Math.floor(Math.random() * 3),
  }
}

// ── 每日悬赏：每天 3 个轮换目标（决策点，跨天重置）────────────────────────────
const DAILY_COUNT = 3
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 生成 3 个每日悬赏：从玩家已解锁的动作 + 可战怪物中按等级加权抽取 */
function rollDaily(levels: Record<SkillId, SkillState>): DailyQuest[] {
  interface Pick { id: string; levelReq: number; item?: string; displayName: string }
  const actionPool: Pick[] = ACTIONS
    .filter(a => a.skill !== 'enhancing' && levels[a.skill].level >= a.levelReq)
    .map(a => ({ id: a.id, levelReq: a.levelReq, item: a.outputs[0].item, displayName: a.name }))
  const monsterPool: Pick[] = MONSTERS
    .filter(m => levels.attack.level >= m.levelReq)
    .map(m => ({ id: m.id, levelReq: m.levelReq, displayName: `${m.icon}${m.name}` }))
  const pool = [...actionPool, ...monsterPool]
  if (pool.length === 0) return []
  const quests: DailyQuest[] = []
  const used = new Set<string>()
  while (quests.length < DAILY_COUNT && used.size < pool.length) {
    const weights = pool.map(p => (used.has(p.id) ? 0 : 1 + p.levelReq * 2))
    const total = weights.reduce((s, w) => s + w, 0)
    let roll = Math.random() * total
    let pick = pool[0]
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i]
      if (roll <= 0) { pick = pool[i]; break }
    }
    if (used.has(pick.id)) continue
    used.add(pick.id)
    const count = 8 + Math.floor(Math.random() * 13) // 8~20
    const unitPrice = pick.item ? (ITEMS[pick.item]?.price ?? 10) : 20
    quests.push({
      actionId: pick.id,
      count,
      progress: 0,
      claimed: false,
      rewardCoins: (count * unitPrice * (0.8 + Math.random() * 0.6)) | 0,
      rewardTokens: Math.random() < 0.5 ? 1 : 0,
    })
  }
  return quests
}

// 战斗中的怪物数据（普通怪 or 秘境层怪）
export interface BattleMonster { name: string; icon: string; hp: number; atk: number; def: number }
export function battleMonster(b: BattleState): BattleMonster {
  if (b.labFloor != null) return labMonster(b.labFloor)
  const m = MONSTERS.find(x => x.id === b.monsterId)!
  return { name: m.name, icon: m.icon, hp: m.hp, atk: m.atk, def: m.def }
}

class GameStore {
  state: GameState
  private listeners = new Set<() => void>()
  /** 当前激活槽 id；null = 未选槽（显示选槽页） */
  activeSlotId: string | null = null
  /** 内存中的槽列表 */
  slots: SlotMeta[] = []

  constructor() {
    this.slots = this.readMeta()
    this.migrateLegacySave()
    this.slots = this.readMeta()
    const lastActive = localStorage.getItem(META_KEY) ? this.lastActiveIdFromMeta() : null
    if (this.slots.some(s => s.id === lastActive)) {
      this.activeSlotId = lastActive
      this.state = this.load(lastActive!)
    } else {
      this.state = freshState() // 未恢复：占位空档，App 显示选槽页
    }
    while (this.state.tasks.length < MAX_TASKS) this.state.tasks.push(rollTask(this.state.skills))
    this.state.playerHp = Math.min(this.state.playerHp, this.maxHp())
    this.applyOfflineProgress()
    setInterval(() => this.tick(), 100)
    setInterval(() => this.save(), 2000)
    window.addEventListener('beforeunload', () => this.save())
  }

  // ── 槽元数据（meta key 存 `${lastActiveId}\n` + JSON 槽列表）──
  private readMeta(): SlotMeta[] {
    try {
      const raw = localStorage.getItem(META_KEY)
      if (!raw) return []
      const lines = raw.split('\n')
      return JSON.parse(lines[lines.length - 1] || '[]') as SlotMeta[]
    } catch { return [] }
  }
  private writeMeta() {
    try {
      const raw = [this.activeSlotId ?? '', JSON.stringify(this.slots)].join('\n')
      localStorage.setItem(META_KEY, raw)
    } catch { /* ignore */ }
  }
  private lastActiveIdFromMeta(): string | null {
    try {
      const raw = localStorage.getItem(META_KEY)
      if (!raw) return null
      return raw.split('\n')[0] || null
    } catch { return null }
  }

  /** 旧单存档 → 槽 0 迁移（保留旧 key 不删） */
  private migrateLegacySave() {
    if (localStorage.getItem(LEGACY_MIGRATED_KEY)) return
    if (this.slots.length > 0) return
    const raw = localStorage.getItem(LEGACY_SAVE_KEY)
    if (!raw) return
    try {
      const id = Date.now().toString(36) + Math.floor(Math.random() * 36).toString(36)
      localStorage.setItem(slotKey(id), raw) // 原样搬迁
      this.slots = [{ id, name: DEFAULT_SLOT_NAMES[0], createdAt: Date.now(), updatedAt: Date.now() }]
      this.writeMeta()
      localStorage.setItem(LEGACY_MIGRATED_KEY, '1')
    } catch { /* 失败则保留旧存档原样，下次重试 */ }
  }

  private load(slotId: string): GameState {
    try {
      const raw = localStorage.getItem(slotKey(slotId))
      if (raw) {
        const parsed = JSON.parse(raw) as GameState
        const base = freshState()
        return {
          ...base,
          ...parsed,
          skills: { ...base.skills, ...parsed.skills },
          equipment: { ...base.equipment, ...parsed.equipment },
          labShopBought: { ...parsed.labShopBought },
          styleManuals: { ...base.styleManuals, ...parsed.styleManuals },
          unlockedAchievements: parsed.unlockedAchievements ?? [],
          autoCraft: parsed.autoCraft ?? {},
          autoCombat: parsed.autoCombat ?? null,
        }
      }
    } catch { /* ignore */ }
    return freshState()
  }

  save() {
    if (!this.activeSlotId) return // 未选槽不落盘
    try {
      localStorage.setItem(slotKey(this.activeSlotId), JSON.stringify(this.state))
      const meta = this.slots.find(s => s.id === this.activeSlotId)
      if (meta) {
        meta.updatedAt = Date.now()
        this.writeMeta()
      }
    } catch { /* ignore */ }
  }

  reset() {
    this.state = freshState()
    while (this.state.tasks.length < MAX_TASKS) this.state.tasks.push(rollTask(this.state.skills))
    this.save()
    this.emit()
  }

  // ── 槽操作 ───────────────────────────────────────────────────────────────
  listSlots(): SlotMeta[] { return this.slots }
  /** 选槽页信息卡数据 */
  slotDisplay(m: SlotMeta): { totalLevel: number; titleName: string; highestFloor: number; updatedAt: number } {
    const st = this.load(m.id)
    const tl = totalLevel(st)
    return {
      totalLevel: tl,
      titleName: titleFor(tl).name,
      highestFloor: st.highestFloor,
      updatedAt: m.updatedAt,
    }
  }

  /** 新建槽并进入 */
  createSlot(name: string): string {
    if (this.slots.length >= MAX_SLOTS) return ''
    const id = Date.now().toString(36) + Math.floor(Math.random() * 36).toString(36)
    const meta: SlotMeta = { id, name: name.trim() || DEFAULT_SLOT_NAMES[this.slots.length], createdAt: Date.now(), updatedAt: Date.now() }
    this.slots.push(meta)
    this.writeMeta()
    this.enterSlot(id)
    return id
  }

  /** 进入某个槽（加载其状态） */
  enterSlot(id: string) {
    if (!this.slots.some(s => s.id === id)) return
    this.activeSlotId = id
    this.state = this.load(id)
    this.state.combatEvents = []
    this.state.gatherEvents = []
    this.state.levelUpEvents = []
    while (this.state.tasks.length < MAX_TASKS) this.state.tasks.push(rollTask(this.state.skills))
    this.state.playerHp = Math.min(this.state.playerHp, this.maxHp())
    this.writeMeta()
    this.emit()
  }

  /** 退出当前槽回选槽页 */
  exitSlot() {
    this.save()
    this.activeSlotId = null
    this.writeMeta()
    this.emit()
  }

  /** 删除槽（防空、防删当前槽……由调用侧 confirm） */
  deleteSlot(id: string) {
    const idx = this.slots.findIndex(s => s.id === id)
    if (idx < 0) return
    try { localStorage.removeItem(slotKey(id)) } catch { /* ignore */ }
    this.slots.splice(idx, 1)
    if (this.activeSlotId === id) {
      this.activeSlotId = null
      this.state = freshState()
    }
    this.writeMeta()
    this.emit()
  }

  renameSlot(id: string, name: string) {
    const m = this.slots.find(s => s.id === id)
    if (!m) return
    m.name = name.trim() || m.name
    this.writeMeta()
    this.emit()
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  getSnapshot = () => this.state
  private emit() {
    this.state = { ...this.state }
    this.listeners.forEach(fn => fn())
  }

  // ── 加成汇总 ───────────────────────────────────────────────────────────────
  private achTotals() {
    let xpPct = 0, coinPct = 0, atkFlat = 0, defFlat = 0
    for (const id of this.state.unlockedAchievements) {
      const a = ACHIEVEMENTS.find(x => x.id === id)
      if (!a) continue
      xpPct += a.xpPct ?? 0
      coinPct += a.coinPct ?? 0
      atkFlat += a.atkFlat ?? 0
      defFlat += a.defFlat ?? 0
    }
    return { xpPct, coinPct, atkFlat, defFlat }
  }

  xpMult() {
    const ach = this.achTotals()
    const amulet = this.state.equipment.amulet
    const amXp = amulet ? (ITEMS[amulet.item].xpPct ?? 0) : 0
    let m = 1 + (this.state.rebirthPoints * REBIRTH_XP_PCT_PER_POINT + ach.xpPct + amXp) / 100
    m *= 1 + this.gearTotals().xpPct / 100
    if (Date.now() < this.state.teaUntil) m *= 2
    return m
  }

  coinMult() {
    const ach = this.achTotals()
    const amulet = this.state.equipment.amulet
    const amCoin = amulet ? (ITEMS[amulet.item].coinPct ?? 0) : 0
    return (1 + (this.state.rebirthPoints * REBIRTH_COIN_PCT_PER_POINT + ach.coinPct + amCoin) / 100)
      * (1 + this.gearTotals().coinPct / 100)
  }

  // ── 战斗属性 ───────────────────────────────────────────────────────────────
  // 秘境祝福汇总（仅秘境战斗中生效）
  blessingTotals() {
    const t = { atkPct: 0, defPct: 0, hpPct: 0, lifesteal: 0, crit: 0, pierce: 0, dodge: 0, labCoinPct: 0, coinPct: 0, xpPct: 0 }
    const b = this.state.battle
    if (!b || b.labFloor == null || !b.blessings) return t
    for (const id of b.blessings) {
      const bl = LAB_BLESSINGS.find(x => x.id === id)
      if (!bl) continue
      t.atkPct += bl.atkPct ?? 0
      t.defPct += bl.defPct ?? 0
      t.hpPct += bl.hpPct ?? 0
      t.lifesteal += bl.lifesteal ?? 0
      t.crit += bl.crit ?? 0
      t.pierce += bl.pierce ?? 0
      t.dodge += bl.dodge ?? 0
      t.labCoinPct += bl.labCoinPct ?? 0
      t.coinPct += bl.coinPct ?? 0
      t.xpPct += bl.xpPct ?? 0
    }
    return t
  }

  // ── 装备词缀汇总（三个装备位，含诅咒负值）──────────────────────────────────
  gearTotals() {
    const t = { atkPct: 0, defPct: 0, hpPct: 0, crit: 0, lifesteal: 0, pierce: 0, coinPct: 0, xpPct: 0 }
    for (const slot of ['weapon', 'armor', 'amulet'] as const) {
      const eq = this.state.equipment[slot]
      if (!eq?.affixes) continue
      for (const a of eq.affixes) {
        const def = AFFIXES.find(x => x.id === a.id)
        if (!def) continue
        t[def.stat] += a.value
      }
    }
    return t
  }

  maxHp() {
    const insight = this.state.labShopBought.hpInsight ?? 0
    const base = 50 + 15 * this.state.skills.hp.level + 15 * insight
    return Math.round(base * (1 + this.blessingTotals().hpPct / 100) * (1 + this.gearTotals().hpPct / 100))
  }
  playerAtk() {
    const ach = this.achTotals()
    const w = this.state.equipment.weapon
    const wBonus = w ? (ITEMS[w.item].atk ?? 0) + w.plus * 2 : 0
    const amulet = this.state.equipment.amulet
    const amAtk = amulet ? (ITEMS[amulet.item].atk ?? 0) : 0
    const styleLv = this.state.battle ? this.state.skills[this.state.battle.style].level : 0
    const base = 5 + 2 * this.state.skills.attack.level + wBonus + Math.floor(styleLv / 5)
      + (this.state.labShopBought.atkInsight ?? 0) + ach.atkFlat + amAtk
    return Math.round(base * (Date.now() < this.state.atkBuffUntil ? 1.25 : 1) * (1 + this.blessingTotals().atkPct / 100) * (1 + this.gearTotals().atkPct / 100))
  }
  playerDef() {
    const ach = this.achTotals()
    const a = this.state.equipment.armor
    const aBonus = a ? (ITEMS[a.item].def ?? 0) + a.plus * 1 : 0
    const amulet = this.state.equipment.amulet
    const amDef = amulet ? (ITEMS[amulet.item].def ?? 0) : 0
    const base = 2 + this.state.skills.defense.level + aBonus
      + (this.state.labShopBought.defInsight ?? 0) + ach.defFlat + amDef
    return Math.round(base * (Date.now() < this.state.defBuffUntil ? 1.25 : 1) * (1 + this.blessingTotals().defPct / 100) * (1 + this.gearTotals().defPct / 100))
  }
  styleDamagePct(style: StyleId) {
    const lv = this.state.skills[style].level
    return STYLES.find(s => s.id === style)!.abilities
      .filter(a => lv >= a.level)
      .reduce((sum, a) => sum + (a.level >= 60 ? 10 : 5), 0)
  }

  // ── 成就 ───────────────────────────────────────────────────────────────────
  achievementStats(): AchievementStats {
    return {
      maxSkillLevel: Math.max(...Object.values(this.state.skills).map(s => s.level)),
      totalLevel: totalLevel(this.state),
      kills: this.state.kills,
      coinsHeld: this.state.inventory.coin ?? 0,
      crafted: this.state.crafted,
      highestFloor: this.state.highestFloor,
      rebirths: this.state.rebirths,
    }
  }

  private checkAchievements() {
    const stats = this.achievementStats()
    let changed = false
    for (const a of ACHIEVEMENTS) {
      if (!this.state.unlockedAchievements.includes(a.id) && a.check(stats)) {
        this.state.unlockedAchievements.push(a.id)
        this.setNotice(`🏆 达成成就「${a.name}」：${a.bonus}`)
        changed = true
      }
    }
    return changed
  }

  // ── 离线结算 ───────────────────────────────────────────────────────────────
  private applyOfflineProgress() {
    const nowMs = Date.now()
    const dt = Math.min((nowMs - this.state.lastTick) / 1000, 8 * 3600)
    if (this.state.active && dt > 1) {
      const action = ACTIONS.find(a => a.id === this.state.active!.actionId)
      if (action) this.runCycles(action, dt, true)
      // 离线也自动制造（采集时间接驱动制造配方计时）
      if (!this.state.battle) this.processAutoCraft(dt)
    }
    // 离线不结算战斗（避免回来时已阵亡），但回复生命
    this.state.battle = null
    this.state.playerHp = this.maxHp()
    this.state.lastTick = nowMs
  }

  // ── 主循环 ─────────────────────────────────────────────────────────────────
  private tick() {
    const nowMs = Date.now()
    const dt = Math.min((nowMs - this.state.lastTick) / 1000, 5)
    this.state.lastTick = nowMs

    // 每日悬赏：跨天自动重置
    const today = todayStr()
    if (!this.state.daily || this.state.daily.date !== today) {
      this.state.daily = { date: today, quests: rollDaily(this.state.skills) }
    }

    if (this.state.active) {
      const action = ACTIONS.find(a => a.id === this.state.active!.actionId)
      if (action) this.runCycles(action, dt, false)
    }

    // 自动制造：采集时并行消耗材料进行制造，打通采集→制造链条
    if (this.state.active && !this.state.battle) {
      this.processAutoCraft(dt)
    }

    if (this.state.battle) {
      this.state.battle.roundTimer -= dt
      while (this.state.battle && this.state.battle.roundTimer <= 0) {
        this.state.battle.roundTimer += ROUND_SEC
        this.battleRound()
      }
    } else if (this.state.playerHp < this.maxHp()) {
      this.state.playerHp = Math.min(this.maxHp(), this.state.playerHp + this.maxHp() * 0.02 * dt)
    }

    // 自动战斗：闲置时自动打怪，自动装备/吃药/续战
    if (this.state.autoCombat && !this.state.active && !this.state.battle) {
      this.processAutoCombat()
    }

    // 清理过期动画事件（3 秒前）
    const cutoff = Date.now() - 3000
    this.state.combatEvents = this.state.combatEvents.filter(e => e.time > cutoff)
    this.state.gatherEvents = this.state.gatherEvents.filter(e => e.time > cutoff)
    this.state.levelUpEvents = this.state.levelUpEvents.filter(e => e.time > cutoff)

    this.checkAchievements()
    this.emit()
  }

  private runCycles(action: ActionDef, dt: number, offline: boolean) {
    if (!this.state.active) return
    const remaining = dt + this.state.active.elapsed
    let cycles = Math.floor(remaining / action.timeSec)
    this.state.active.elapsed = remaining - cycles * action.timeSec
    while (cycles > 0) {
      if (action.inputs && !this.canAfford(action.inputs)) {
        if (!offline) this.setNotice('原料不足，动作已停止')
        this.state.active = null
        return
      }
      this.completeCycle(action)
      cycles--
    }
  }

  private completeCycle(action: ActionDef) {
    const actionId = action.id
    if (action.inputs) for (const inp of action.inputs) {
      this.state.inventory[inp.item] = (this.state.inventory[inp.item] ?? 0) - inp.count
    }
    if (action.inputs) this.state.crafted++ // 制造类动作计入生涯制造数
    for (const out of action.outputs) {
      if (out.chance !== undefined && Math.random() > out.chance) continue
      this.addItem(out.item, out.count)
      for (const t of this.state.tasks) {
        if (t.item === out.item && t.progress < t.count) {
          t.progress = Math.min(t.count, t.progress + out.count)
        }
      }
    }
    // 每日悬赏：采集/制造类按动作 id 计数
    if (this.state.daily) {
      for (const q of this.state.daily.quests) {
        if (!q.claimed && q.progress < q.count && q.actionId === actionId) {
          q.progress = Math.min(q.count, q.progress + 1)
        }
      }
    }
    this.gainXp(action.skill, action.xp)
    // 采集动画事件：通知 UI 展示浮动物品
    for (const out of action.outputs) {
      if (out.chance !== undefined) continue // 跳过概率产出
      this.state.gatherEvents.push({ type: 'item', item: out.item, count: out.count, time: Date.now() })
    }
  }

  // ── 自动制造 ─────────────────────────────────────────────────────────────
  // 采集时后台并行消耗材料进行制造，打通采集→制造链条
  private findBestRecipe(skill: SkillId): ActionDef | null {
    const recipes = ACTIONS.filter(a => a.skill === skill && a.inputs && a.inputs.length > 0)
    if (recipes.length === 0) return null
    const skillLevel = this.state.skills[skill].level
    // 选最高等级的可制造配方（已解锁 + 材料充足），自动适配材料变化
    const unlocked = recipes.filter(a => a.levelReq <= skillLevel)
    const affordable = unlocked.filter(a => this.canAfford(a.inputs!))
    if (affordable.length > 0) {
      return affordable.reduce((best, a) => a.levelReq > best.levelReq ? a : best, affordable[0])
    }
    return null
  }

  toggleAutoCraft(skill: SkillId) {
    if (this.state.autoCraft[skill]) {
      this.state.autoCraft[skill] = null
      this.setNotice(`${SKILLS.find(s => s.id === skill)!.name} 自动制造已关闭`)
    } else {
      const recipe = this.findBestRecipe(skill)
      this.state.autoCraft[skill] = { actionId: recipe?.id ?? '', elapsed: 0 }
      this.setNotice(`${SKILLS.find(s => s.id === skill)!.name} 自动制造已开启${recipe ? ` → ${recipe.name}` : '（暂无可用配方）'}`)
    }
    this.emit()
  }

  private processAutoCraft(dt: number) {
    const craftSkills: SkillId[] = ['alchemy', 'smithing', 'cooking', 'tailoring', 'enhancing']
    for (const skill of craftSkills) {
      const ac = this.state.autoCraft[skill]
      if (!ac) continue
      // 每次 tick 重新评估最佳配方（材料可能刚被采集产出）
      const recipe = this.findBestRecipe(skill)
      if (!recipe) { ac.actionId = ''; ac.elapsed = 0; continue }
      ac.actionId = recipe.id
      ac.elapsed += dt
      while (ac.elapsed >= recipe.timeSec) {
        ac.elapsed -= recipe.timeSec
        if (!this.canAfford(recipe.inputs!)) { ac.elapsed = 0; break }
        this.completeCycle(recipe)
        // 重新评估配方（材料变了，可能触发更高阶配方）
        const next = this.findBestRecipe(skill)
        if (!next) { ac.actionId = ''; ac.elapsed = 0; break }
        ac.actionId = next.id
      }
    }
  }

  // ── 自动战斗 ─────────────────────────────────────────────────────────────
  // 闲置时自动打怪：自动装备/吃药/续战，打通制造→战斗链条
  toggleAutoCombat(monsterId: string, style: StyleId) {
    if (this.state.autoCombat?.monsterId === monsterId && this.state.autoCombat?.style === style) {
      this.state.autoCombat = null
      // 2026-09-13 修复:关闭自动战斗时同时撤下进行中的战斗(原行为:仅清标志,战斗继续)
      if (this.state.battle) this.stopBattle()
      this.setNotice('自动战斗已关闭,已撤离战斗')
    } else {
      const m = MONSTERS.find(x => x.id === monsterId)
      if (!m) return
      this.state.autoCombat = { monsterId, style }
      this.setNotice(`自动战斗已开启 → ${m.icon} ${m.name}`)
    }
    this.emit()
  }

  private processAutoCombat() {
    const ac = this.state.autoCombat
    if (!ac) return
    // 1) 自动装备最优武器、防具、饰品
    this.autoEquipBest()
    // 2) 自动使用 Buff（大力丸/铁布衫丹）
    this.autoBuff()
    // 3) 血量过低 → 自动吃最好的回血物品
    const hpPct = this.state.playerHp / this.maxHp()
    if (hpPct < 0.25) {
      this.autoHeal()
      return // 吃完药等下个 tick 再判断
    }
    // 4) 血量足够 → 开战
    if (hpPct >= 0.4) {
      const m = MONSTERS.find(x => x.id === ac.monsterId)
      if (!m) return
      if (this.state.skills[ac.style].level >= m.levelReq) {
        this.startBattle(ac.monsterId, ac.style)
      }
    }
  }

  private autoEquipBest() {
    // 武器：找背包里 ATK 最高的
    let bestWeapon: string | null = null
    let bestAtk = 0
    const curAtk = this.state.equipment.weapon ? (ITEMS[this.state.equipment.weapon.item].atk ?? 0) + this.state.equipment.weapon.plus * 2 : 0
    for (const [id, n] of Object.entries(this.state.inventory)) {
      if (n <= 0) continue
      const def = ITEMS[id]
      if (def?.category === 'weapon' && (def.atk ?? 0) > bestAtk) {
        bestAtk = def.atk ?? 0
        bestWeapon = id
      }
    }
    if (bestWeapon && bestAtk > curAtk) {
      if (this.state.equipment.weapon) this.addItem(this.state.equipment.weapon.item, 1)
      this.state.inventory[bestWeapon] -= 1
      this.state.equipment.weapon = { item: bestWeapon, plus: 0, affixes: rollAffixes(), fractures: 0 }
    }
    // 防具：找背包里 DEF 最高的
    let bestArmor: string | null = null
    let bestDef = 0
    const curDef = this.state.equipment.armor ? (ITEMS[this.state.equipment.armor.item].def ?? 0) + this.state.equipment.armor.plus * 1 : 0
    for (const [id, n] of Object.entries(this.state.inventory)) {
      if (n <= 0) continue
      const def = ITEMS[id]
      if (def?.category === 'armor' && (def.def ?? 0) > bestDef) {
        bestDef = def.def ?? 0
        bestArmor = id
      }
    }
    if (bestArmor && bestDef > curDef) {
      if (this.state.equipment.armor) this.addItem(this.state.equipment.armor.item, 1)
      this.state.inventory[bestArmor] -= 1
      this.state.equipment.armor = { item: bestArmor, plus: 0, affixes: rollAffixes(), fractures: 0 }
    }
    // 饰品：找背包里最好的（优先经验加成 > ATK > DEF > 铜钱）
    let bestAmulet: string | null = null
    let bestAmuletScore = 0
    const curAmulet = this.state.equipment.amulet
    const curAmuletId = curAmulet?.item
    for (const [id, n] of Object.entries(this.state.inventory)) {
      if (n <= 0 || id === curAmuletId) continue
      const def = ITEMS[id]
      if (def?.category !== 'amulet') continue
      const score = (def.xpPct ?? 0) * 10 + (def.atk ?? 0) * 2 + (def.def ?? 0) * 2 + (def.coinPct ?? 0)
      if (score > bestAmuletScore) { bestAmuletScore = score; bestAmulet = id }
    }
    if (bestAmulet) {
      if (curAmulet) this.addItem(curAmulet.item, 1)
      this.state.inventory[bestAmulet] -= 1
      this.state.equipment.amulet = { item: bestAmulet, plus: 0, affixes: rollAffixes(), fractures: 0 }
    }
  }

  private autoBuff() {
    const nowMs = Date.now()
    if (nowMs >= this.state.atkBuffUntil && (this.state.inventory.daliwan ?? 0) > 0) {
      this.state.inventory.daliwan -= 1
      this.state.atkBuffUntil = nowMs + 5 * 60 * 1000
    }
    if (nowMs >= this.state.defBuffUntil && (this.state.inventory.tiebushan ?? 0) > 0) {
      this.state.inventory.tiebushan -= 1
      this.state.defBuffUntil = nowMs + 5 * 60 * 1000
    }
  }

  private autoHeal() {
    // 找背包里最好的回血物品（食物/丹药），优先用小回复避免浪费大药
    const healingItems = Object.entries(this.state.inventory)
      .filter(([id, n]) => n > 0 && ITEMS[id]?.heal)
      .sort((a, b) => (ITEMS[a[0]].heal === -1 ? 99999 : ITEMS[a[0]].heal ?? 0) - (ITEMS[b[0]].heal === -1 ? 99999 : ITEMS[b[0]].heal ?? 0))
    if (healingItems.length === 0) return
    const deficit = this.maxHp() - this.state.playerHp
    // 选刚好够恢复的，别浪费
    let pick = healingItems[0][0]
    for (const [id] of healingItems) {
      const h = ITEMS[id].heal ?? 0
      if (h >= deficit || h === -1) { pick = id; break }
    }
    this.state.inventory[pick] -= 1
    const h = ITEMS[pick].heal ?? 0
    this.state.playerHp = h === -1 ? this.maxHp() : Math.min(this.maxHp(), this.state.playerHp + h)
  }

  // ── 战斗 ───────────────────────────────────────────────────────────────────
  startBattle(monsterId: string, style: StyleId) {
    const m = MONSTERS.find(x => x.id === monsterId)
    if (!m) return
    if (this.state.skills[style].level < m.levelReq) {
      this.setNotice(`${m.name} 需要 ${STYLES.find(x => x.id === style)?.name} Lv.${m.levelReq}`)
      return
    }
    if (this.state.playerHp <= this.maxHp() * 0.2) {
      this.setNotice('伤势过重，先打坐回气吧')
      return
    }
    this.state.active = null
    this.state.battle = { monsterId, monsterHp: m.hp, style, roundTimer: ROUND_SEC, firstHit: true }
    this.emit()
  }

  startLabBattle(style: StyleId) {
    if (this.state.playerHp <= this.maxHp() * 0.2) {
      this.setNotice('伤势过重，先打坐回气吧')
      return
    }
    this.state.active = null
    const floor = this.state.labFloor
    this.state.battle = { monsterId: 'lab', monsterHp: labMonster(floor).hp, style, roundTimer: ROUND_SEC, firstHit: true, labFloor: floor }
    this.emit()
  }

  stopBattle() {
    this.state.battle = null
    this.state.labOffer = null
    this.emit()
  }

  private battleRound() {
    const b = this.state.battle
    if (!b) return
    const m = battleMonster(b)
    const bt = b.labFloor != null ? this.blessingTotals() : null
    const gt = this.gearTotals()
    // 流派克制：对应弱点流派 +18% 伤害（秘境怪无克制）
    const weakStyle = b.labFloor == null ? (MONSTERS.find(x => x.id === b.monsterId)?.weak ?? null) : null
    const weakBonus = weakStyle === b.style ? 1.18 : 1
    // 玩家攻击：基础伤害
    let pierce = b.style === 'sword' && this.state.skills.sword.level >= 15 ? 0.3 : 0
    pierce = Math.min(0.9, pierce + gt.pierce / 100 + (bt ? bt.pierce / 100 : 0))
    let dmg = Math.max(1, (this.playerAtk() - m.def * 0.6 * (1 - pierce)))
    // 招式加成：前四招各 +5%，Lv.60/Lv.75 绝学各 +10%；秘籍每层 +3%
    dmg *= 1 + this.styleDamagePct(b.style) / 100
    dmg *= 1 + 0.03 * (this.state.styleManuals[b.style] ?? 0)
    // 流派克制乘区：弱点流派 +18%
    if (weakBonus > 1) dmg *= weakBonus
    // 暗器：首回合 +25%
    if (b.style === 'hidden' && b.firstHit) dmg *= 1.25
    // 暴击：剑法 10%，词缀/秘境祝福可叠加任意流派
    const critChance = (b.style === 'sword' ? 0.1 : 0) + gt.crit / 100 + (bt ? bt.crit / 100 : 0)
    const crit = Math.random() < critChance
    if (crit) dmg *= 1.8
    dmg = Math.max(1, Math.round(dmg * (0.85 + Math.random() * 0.3)))
    b.monsterHp -= dmg
    // 战斗动画事件
    this.state.combatEvents.push({ type: crit ? 'crit' : 'dmg', value: dmg, time: Date.now() })
    // 拳掌：15% 连击
    if (b.style === 'fist' && Math.random() < 0.15 && b.monsterHp > 0) {
      b.monsterHp -= dmg
      this.state.combatEvents.push({ type: 'dmg', value: dmg, time: Date.now() })
    }
    // 内功：回复 8% 伤害的生命
    if (b.style === 'inner') {
      this.state.playerHp = Math.min(this.maxHp(), this.state.playerHp + dmg * 0.08)
    }
    // 吸血：词缀（常驻）+ 秘境祝福
    const totalLeech = gt.lifesteal + (bt ? bt.lifesteal : 0)
    if (totalLeech > 0) {
      this.state.playerHp = Math.min(this.maxHp(), this.state.playerHp + dmg * totalLeech / 100)
    }
    b.firstHit = false
    if (b.monsterHp <= 0) {
      this.state.combatEvents.push({ type: 'kill', value: 0, time: Date.now() })
      if (b.labFloor != null) {
        this.onLabKill(b)
        return
      }
      this.onKill(b.monsterId, b.style)
      if (!this.state.battle) return
      this.state.battle.monsterHp = m.hp
      this.state.battle.firstHit = true
      return
    }
    // 怪物反击（秘境祝福：闪避）
    if (bt && bt.dodge > 0 && Math.random() < bt.dodge / 100) return
    const mdmg = Math.max(0, Math.round((m.atk - this.playerDef()) * (0.85 + Math.random() * 0.3)))
    this.state.playerHp -= mdmg
    this.state.combatEvents.push({ type: 'monsterDmg', value: mdmg, time: Date.now() })
    if (this.state.playerHp <= 0) {
      this.state.playerHp = 0
      this.state.battle = null
      this.state.labOffer = null
      this.setNotice('你被击倒了！伤势过重，打坐回气中…')
    }
  }

  private onKill(monsterId: string, style: StyleId) {
    const m = MONSTERS.find(x => x.id === monsterId)
    if (!m) return
    this.state.kills++
    // 每日悬赏：击杀类按怪物 id 计数
    if (this.state.daily) {
      for (const q of this.state.daily.quests) {
        if (!q.claimed && q.progress < q.count && q.actionId === monsterId) {
          q.progress = Math.min(q.count, q.progress + 1)
        }
      }
    }
    const drops: { item: string; count: number; time: number }[] = []
    for (const d of m.drops) {
      if (Math.random() > d.chance) continue
      let n = d.min + Math.floor(Math.random() * (d.max - d.min + 1))
      if (d.item === 'coin') n = Math.floor(n * this.coinMult())
      this.addItem(d.item, n)
      drops.push({ item: d.item, count: n, time: Date.now() })
      for (const t of this.state.tasks) {
        if (t.item === d.item && t.progress < t.count) t.progress = Math.min(t.count, t.progress + n)
      }
    }
    // 掉落事件：UI 播放战利品飞出特效
    for (const dp of drops) this.state.combatEvents.push({ type: 'drop', value: dp.count, item: dp.item, time: dp.time })
    const base = m.hp / 4
    this.gainXp(style, base * 0.4)
    this.gainXp('attack', base * 0.3)
    this.gainXp('defense', base * 0.2)
    this.gainXp('hp', base * 0.1)
  }

  private onLabKill(b: BattleState) {
    const floor = b.labFloor!
    const m = labMonster(floor)
    const bt = this.blessingTotals()
    this.state.kills++
    // 奖励：铜钱 + 秘境币（boss 层 ×3），boss 层 50% 掉宝箱；祝福可加成
    const t = Date.now()
    this.addItem('coin', Math.floor((20 + floor * 8) * this.coinMult() * (1 + bt.coinPct / 100)))
    this.addItem('labCoin', Math.floor(labCoinReward(floor) * (1 + bt.labCoinPct / 100)))
    // 掉落事件：秘境掉落也走战利品动画
    this.state.combatEvents.push({ type: 'drop', value: Math.floor((20 + floor * 8) * this.coinMult() * (1 + bt.coinPct / 100)), item: 'coin', time: t })
    this.state.combatEvents.push({ type: 'drop', value: Math.floor(labCoinReward(floor) * (1 + bt.labCoinPct / 100)), item: 'labCoin', time: t })
    if (floor % 5 === 0 && Math.random() < 0.5) {
      this.addItem('chest', 1)
      this.state.combatEvents.push({ type: 'drop', value: 1, item: 'chest', time: t })
    }
    const base = (m.hp / 4) * (1 + bt.xpPct / 100)
    this.gainXp(b.style, base * 0.4)
    this.gainXp('attack', base * 0.3)
    this.gainXp('defense', base * 0.2)
    this.gainXp('hp', base * 0.1)
    // 推进层数并自动挑战下一层
    this.state.highestFloor = Math.max(this.state.highestFloor, floor)
    this.state.labFloor = floor + 1
    b.labFloor = floor + 1
    b.monsterHp = labMonster(floor + 1).hp
    b.firstHit = true
    // 每 10 层：三选一祝福
    if (floor % 10 === 0) {
      const owned = new Set(b.blessings ?? [])
      const pool = LAB_BLESSINGS.filter(x => !owned.has(x.id))
      const offer: string[] = []
      while (offer.length < 3 && pool.length > 0) {
        const i = Math.floor(Math.random() * pool.length)
        offer.push(pool.splice(i, 1)[0].id)
      }
      if (offer.length > 0) {
        this.state.labOffer = offer
        this.setNotice(`✨ 第 ${floor} 层顿悟：三选一祝福降临！`)
      }
    }
  }

  chooseBlessing(id: string) {
    const b = this.state.battle
    if (!this.state.labOffer?.includes(id) || !b || b.labFloor == null) return
    b.blessings = [...(b.blessings ?? []), id]
    this.state.labOffer = null
    const bl = LAB_BLESSINGS.find(x => x.id === id)
    if (bl) this.setNotice(`获得祝福「${bl.name}」：${bl.desc}`)
    this.emit()
  }

  // ── 秘境商店 ───────────────────────────────────────────────────────────────
  labShopCost(id: string) {
    const item = LAB_SHOP.find(x => x.id === id)
    if (!item) return 0
    const bought = this.state.labShopBought[id] ?? 0
    return item.growth > 0 ? Math.floor(item.baseCost * Math.pow(item.growth, bought)) : item.baseCost
  }

  buyLabShop(id: string) {
    const item = LAB_SHOP.find(x => x.id === id)
    if (!item) return
    const bought = this.state.labShopBought[id] ?? 0
    if (item.growth === 0 && bought >= 1) {
      this.setNotice('此宝限购一件，已收入囊中')
      return
    }
    const cost = this.labShopCost(id)
    if ((this.state.inventory.labCoin ?? 0) < cost) {
      this.setNotice('秘境币不足')
      return
    }
    this.state.inventory.labCoin -= cost
    this.state.labShopBought[id] = bought + 1
    if (item.amulet) this.addItem(item.amulet, 1)
    this.setNotice(`换得 ${item.icon} ${item.name}！`)
    this.emit()
  }

  // ── 轮回 ───────────────────────────────────────────────────────────────────
  canRebirth() {
    return totalLevel(this.state) >= REBIRTH_REQ_LEVEL
  }

  rebirthGain() {
    return rebirthPointsGain(totalLevel(this.state))
  }

  rebirth() {
    if (!this.canRebirth()) return
    const gain = this.rebirthGain()
    const keep = {
      rebirthPoints: this.state.rebirthPoints + gain,
      rebirths: this.state.rebirths + 1,
      unlockedAchievements: this.state.unlockedAchievements,
      styleManuals: this.state.styleManuals,
      kills: this.state.kills,
      crafted: this.state.crafted,
      highestFloor: this.state.highestFloor,
      labShopBought: this.state.labShopBought,
      lifetimeTaskPoints: this.state.lifetimeTaskPoints,
      chat: this.state.chat,
    }
    this.state = { ...freshState(), ...keep }
    while (this.state.tasks.length < MAX_TASKS) this.state.tasks.push(rollTask(this.state.skills))
    this.save()
    this.setNotice(`🌀 轮回成功！获得 ${gain} 轮回点（经验 +${gain * REBIRTH_XP_PCT_PER_POINT}%，铜钱 +${gain * REBIRTH_COIN_PCT_PER_POINT}%）`)
    this.emit()
  }

  // ── 经验 / 物品 ─────────────────────────────────────────────────────────────
  gainXp(skill: SkillId, amount: number) {
    const s = this.state.skills[skill]
    s.xp += amount * this.xpMult()
    while (s.xp >= xpToNext(s.level)) {
      s.xp -= xpToNext(s.level)
      s.level++
      // 升级庆祝事件：UI 据此播放闪光/飘字
      this.state.levelUpEvents.push({ skill, level: s.level, time: Date.now() })
      this.setNotice(`✨ ${SKILLS.find(x => x.id === skill)?.name} 提升至 Lv.${s.level}！`)
    }
  }

  addItem(item: string, count: number) {
    this.state.inventory[item] = (this.state.inventory[item] ?? 0) + count
  }

  canAfford(inputs: { item: string; count: number }[]) {
    return inputs.every(i => (this.state.inventory[i.item] ?? 0) >= i.count)
  }

  setNotice(text: string) {
    this.state.notice = text
    setTimeout(() => {
      if (this.state.notice === text) {
        this.state.notice = ''
        this.emit()
      }
    }, 3000)
  }

  // ── 玩家操作 ───────────────────────────────────────────────────────────────
  startAction(actionId: string) {
    const action = ACTIONS.find(a => a.id === actionId)
    if (!action) return
    if (this.state.skills[action.skill].level < action.levelReq) return
    if (action.inputs && !this.canAfford(action.inputs)) {
      this.setNotice('原料不足')
      return
    }
    this.state.battle = null
    this.state.active = { actionId, elapsed: 0 }
    this.state.lastTick = Date.now()
    this.emit()
  }

  stopAction() {
    this.state.active = null
    this.emit()
  }

  sellItem(item: string, count: number) {
    const def = ITEMS[item]
    if (!def || def.category === 'currency') return
    const have = this.state.inventory[item] ?? 0
    const n = Math.min(have, count)
    if (n <= 0) return
    this.state.inventory[item] = have - n
    this.addItem('coin', Math.floor(def.price * 0.7) * n)
    this.emit()
  }

  // ── 分解炉：物品 → 铜钱（40% 损耗）+ 高价物品出玄晶 ────────────────────────
  salvageValue(item: string): { coins: number; essence: number } {
    const def = ITEMS[item]
    if (!def) return { coins: 0, essence: 0 }
    return {
      coins: Math.floor(def.price * 0.4),
      essence: def.price >= 200 ? 1 + Math.floor(def.price / 1000) : 0,
    }
  }

  salvageItem(item: string) {
    const def = ITEMS[item]
    if (!def || def.category === 'currency' || def.price <= 0) return
    if ((this.state.inventory[item] ?? 0) < 1) return
    const { coins, essence } = this.salvageValue(item)
    this.state.inventory[item] -= 1
    if (coins > 0) this.addItem('coin', coins)
    if (essence > 0) this.addItem('xuanjing', essence)
    this.setNotice(`分解 ${def.icon}${def.name} → 🪙${coins}${essence > 0 ? ` + 🔮玄晶×${essence}` : ''}`)
    this.emit()
  }

  buyItem(item: string, count: number) {
    const def = ITEMS[item]
    if (!def || def.price <= 0) return
    const cost = def.price * count
    if ((this.state.inventory.coin ?? 0) < cost) return
    this.state.inventory.coin -= cost
    this.addItem(item, count)
    this.emit()
  }

  eatItem(item: string) {
    const def = ITEMS[item]
    if (!def || (this.state.inventory[item] ?? 0) < 1) return
    if (def.manual) {
      const used = this.state.styleManuals[def.manual] ?? 0
      if (used >= 5) {
        this.setNotice('此流派秘籍已参悟圆满（5 层上限）')
        return
      }
      this.state.inventory[item] -= 1
      this.state.styleManuals[def.manual] = used + 1
      const styleName = STYLES.find(s => s.id === def.manual)?.name
      this.setNotice(`参悟${def.name}！${styleName}伤害 +3%（${used + 1}/5 层）`)
      this.emit()
      return
    }
    if (def.buff) {
      const nowMs = Date.now()
      const until = nowMs + 5 * 60 * 1000
      if (def.buff === 'atk') {
        if (nowMs < this.state.atkBuffUntil) { this.setNotice('大力丸效果仍在持续'); return }
        this.state.atkBuffUntil = until
      } else {
        if (nowMs < this.state.defBuffUntil) { this.setNotice('铁布衫丹效果仍在持续'); return }
        this.state.defBuffUntil = until
      }
      this.state.inventory[item] -= 1
      this.setNotice(`${def.name}：5 分钟内${def.buff === 'atk' ? '攻击' : '防御'} +25%`)
      this.emit()
      return
    }
    if (!def.heal) return
    if (this.state.playerHp >= this.maxHp()) return
    this.state.inventory[item] -= 1
    this.state.playerHp = def.heal === -1 ? this.maxHp() : Math.min(this.maxHp(), this.state.playerHp + def.heal)
    this.emit()
  }

  openChest() {
    if ((this.state.inventory.chest ?? 0) < 1) return
    this.state.inventory.chest -= 1
    const roll = Math.random()
    if (roll < 0.55) {
      const n = Math.floor((100 + Math.floor(Math.random() * 400)) * this.coinMult())
      this.addItem('coin', n)
      this.setNotice(`开箱获得 🪙${n} 铜钱！`)
    } else {
      const pool = ['lingzhi', 'silver', 'cypress', 'hide', 'bone', 'stone', 'juqi', 'fineStone', 'neidan']
      const idx = Math.min(pool.length - 1, Math.floor((roll - 0.55) / 0.45 * pool.length))
      const item = pool[Math.floor(Math.random() * (idx + 1))]
      this.addItem(item, 1)
      this.setNotice(`开箱获得 ${ITEMS[item].icon} ${ITEMS[item].name}！`)
    }
    this.emit()
  }

  equipItem(item: string) {
    const def = ITEMS[item]
    if (!def || (this.state.inventory[item] ?? 0) < 1) return
    if (def.category !== 'weapon' && def.category !== 'armor' && def.category !== 'amulet') return
    const slot: EquipSlotId = def.category === 'weapon' ? 'weapon' : def.category === 'armor' ? 'armor' : 'amulet'
    const prev = this.state.equipment[slot]
    this.state.inventory[item] -= 1
    if (prev) this.addItem(prev.item, 1) // 旧装备退回（强化与词缀不保留）
    this.state.equipment[slot] = { item, plus: 0, affixes: rollAffixes(), fractures: 0 } // 装备时凝聚随机词缀
    this.emit()
  }

  // 重铸词缀：玄晶 ×2，15% 概率留下裂痕；3 道裂痕后装备定型不可再铸
  rerollAffixes(slot: EquipSlotId) {
    const cur = this.state.equipment[slot]
    if (!cur) return
    if ((cur.fractures ?? 0) >= 3) {
      this.setNotice('此装备已布满裂痕，无法再次重铸')
      return
    }
    if ((this.state.inventory.xuanjing ?? 0) < 2) {
      this.setNotice('重铸需要 🔮 玄晶 ×2（分解珍品获得）')
      return
    }
    this.state.inventory.xuanjing -= 2
    cur.affixes = rollAffixes()
    if (Math.random() < 0.15) {
      cur.fractures = (cur.fractures ?? 0) + 1
      this.setNotice(`重铸完成，但装备出现一道裂痕（${cur.fractures}/3）！`)
    } else {
      this.setNotice('重铸完成，词缀已重新凝聚')
    }
    this.emit()
  }

  unequip(slot: EquipSlotId) {
    const cur = this.state.equipment[slot]
    if (!cur) return
    this.addItem(cur.item, 1)
    this.state.equipment[slot] = null
    this.emit()
  }

  enhance(slot: 'weapon' | 'armor') {
    const cur = this.state.equipment[slot]
    if (!cur) return
    if (cur.plus >= 20) {
      this.setNotice('已达强化上限 +20')
      return
    }
    const stoneItem = cur.plus < 5 ? 'stone' : cur.plus < 10 ? 'fineStone' : cur.plus < 15 ? 'meteorCrystal' : 'qiankunCrystal'
    if ((this.state.inventory[stoneItem] ?? 0) < 1) {
      this.setNotice(`需要${ITEMS[stoneItem].name}`)
      return
    }
    this.state.inventory[stoneItem] -= 1
    const rate = cur.plus < 5
      ? 0.95 - 0.08 * cur.plus
      : cur.plus < 10
        ? 0.6 - 0.05 * (cur.plus - 5)
        : cur.plus < 15
          ? 0.35 - 0.04 * (cur.plus - 10)
          : 0.2 - 0.03 * (cur.plus - 15)
    if (Math.random() < rate) {
      cur.plus += 1
      this.setNotice(`强化成功！${ITEMS[cur.item].name} +${cur.plus}`)
      this.gainXp('enhancing', 10 * cur.plus)
    } else {
      this.setNotice('强化失败，装备无恙')
    }
    this.emit()
  }

  drinkTea() {
    if ((this.state.inventory.tea ?? 0) < 1) return
    if (Date.now() < this.state.teaUntil) {
      this.setNotice('悟道茶效果仍在持续')
      return
    }
    this.state.inventory.tea -= 1
    this.state.teaUntil = Date.now() + 10 * 60 * 1000
    this.emit()
  }

  claimTask(taskId: number) {
    const t = this.state.tasks.find(x => x.id === taskId)
    if (!t || t.progress < t.count) return
    this.addItem('coin', Math.floor(t.rewardCoins * this.coinMult()))
    this.addItem('token', t.rewardTokens)
    this.state.taskPoints += 1
    this.state.lifetimeTaskPoints += 1
    this.state.tasks = this.state.tasks.map(x => (x.id === taskId ? rollTask(this.state.skills) : x))
    this.emit()
  }

  rerollTask(taskId: number) {
    if ((this.state.inventory.token ?? 0) < 1) {
      this.setNotice('需要 1 枚武林令')
      return
    }
    this.state.inventory.token -= 1
    this.state.tasks = this.state.tasks.map(x => (x.id === taskId ? rollTask(this.state.skills) : x))
    this.emit()
  }

  claimGift() {
    if (this.state.taskPoints < 50) return
    this.state.taskPoints -= 50
    this.addItem('coin', Math.floor(50000 * this.coinMult()))
    this.emit()
  }

  // ── 每日悬赏领取 ─────────────────────────────────────────────
  claimDaily(index: number) {
    const daily = this.state.daily
    if (!daily) return
    const q = daily.quests[index]
    if (!q || q.claimed || q.progress < q.count) return
    q.claimed = true
    this.addItem('coin', Math.floor(q.rewardCoins * this.coinMult()))
    if (q.rewardTokens > 0) this.addItem('token', q.rewardTokens)
    this.setNotice(`🎯 悬赏达成！🪙${Math.floor(q.rewardCoins * this.coinMult())}${q.rewardTokens > 0 ? ' 🎫×' + q.rewardTokens : ''}`)
    this.emit()
  }

  sendChat(channel: string, user: string, text: string) {
    this.state.chat = [...this.state.chat.slice(-80), { channel, user, text, time: now() }]
    this.emit()
  }
}

export const game = new GameStore()

// 调试入口：控制台可用 window.__game 查看/操作状态
;(window as unknown as { __game: GameStore }).__game = game

export function useGame(): GameState {
  return useSyncExternalStore(game.subscribe, game.getSnapshot)
}

/** 当前激活槽的名字（用于界面各处显示主角名） */
export function currentSlotName(): string {
  if (!game.activeSlotId) return 'xbei'
  return game.slots.find(s => s.id === game.activeSlotId)?.name || 'xbei'
}

export const totalLevel = (s: GameState) =>
  Object.values(s.skills).reduce((sum, sk) => sum + sk.level, 0)

export const marketValue = (s: GameState) =>
  Object.entries(s.inventory).reduce((sum, [id, n]) => {
    const def = ITEMS[id]
    return sum + (def && def.category !== 'currency' ? def.price * n : 0)
  }, 0)

// ─── 玩家战力分 ───────────────────────────────────────────────
export function playerPower(s: GameState): number {
  const atk = 5 + 2 * s.skills.attack.level + (s.equipment.weapon ? (ITEMS[s.equipment.weapon.item].atk ?? 0) + s.equipment.weapon.plus * 2 : 0)
  const hp = 50 + 15 * s.skills.hp.level + 15 * (s.labShopBought.hpInsight ?? 0)
  return Math.round(atk * 2 + hp)
}

// ─── 下一步建议（首页智能引导）───────────────────────────────────────────────
export interface Guide { icon: string; text: string; to: { type: string; [k: string]: unknown } }

export function nextGuides(s: GameState): Guide[] {
  const out: Guide[] = []
  // 1) 采集线：当前技能距离下一档动作还差几级
  const gatherSkills: SkillId[] = ['herbalism', 'mining', 'woodcutting', 'hunting', 'fishing']
  for (const g of gatherSkills) {
    const lv = s.skills[g].level
    const next = ACTIONS.filter(a => a.skill === g && a.levelReq > lv).sort((a, b) => a.levelReq - b.levelReq)[0]
    if (next && next.levelReq - lv <= 3) {
      out.push({
        icon: '⛏️', text: `${SKILLS.find(x => x.id === g)!.name} Lv.${lv} → ${next.levelReq} 解锁「${next.name}」`,
        to: { type: 'skill', skill: g },
      })
      break
    }
  }
  // 2) 秘境：饰品可入手但币不够 → 提示爬塔
  const pendingAmulet = LAB_SHOP.find(x => x.amulet && !(s.labShopBought[x.id] ?? 0))
  if (pendingAmulet) {
    const bought = s.labShopBought[pendingAmulet.id] ?? 0
    const cost = pendingAmulet.growth > 0
      ? Math.floor(pendingAmulet.baseCost * Math.pow(pendingAmulet.growth, bought))
      : pendingAmulet.baseCost
    if (cost > (s.inventory.labCoin ?? 0)) {
      out.push({
        icon: '🌀', text: `秘境币还差 ${cost - (s.inventory.labCoin ?? 0)} → 可换「${pendingAmulet.name}」`,
        to: { type: 'lab' },
      })
    }
  }
  // 3) 锻造线：临近高级武器配方（相差 ≤2 级）
  const smithLv = s.skills.smithing.level
  const nextWeapon = ACTIONS.filter(a => a.skill === 'smithing' && a.outputs.some(o => ITEMS[o.item]?.category === 'weapon') && a.levelReq > smithLv)
    .sort((a, b) => a.levelReq - b.levelReq)[0]
  if (nextWeapon && nextWeapon.levelReq - smithLv <= 2) {
    out.push({
      icon: '🔨', text: `锻造 Lv.${smithLv} → ${nextWeapon.levelReq} 可铸「${nextWeapon.name}」`,
      to: { type: 'skill', skill: 'smithing' },
    })
  }
  // 4) 轮回准备
  const tl = totalLevel(s)
  if (tl >= REBIRTH_REQ_LEVEL - 30 && tl < REBIRTH_REQ_LEVEL) {
    out.push({
      icon: '♾️', text: `总等级 ${tl}/${REBIRTH_REQ_LEVEL} → 轮回可获得 ${rebirthPointsGain(Math.max(tl, 300))} 轮回点`,
      to: { type: 'combat' },
    })
  }
  // 5) 总兜底：打当前最高怪练级
  if (out.length === 0) {
    const readable = MONSTERS.filter(m => s.skills.attack.level >= m.levelReq).slice(-1)[0]
    if (readable) {
      out.push({
        icon: '⚔️', text: `已有实力挑战「${readable.name}」，去江湖练练手吧`,
        to: { type: 'combat' },
      })
    }
  }
  return out.slice(0, 3)
}
