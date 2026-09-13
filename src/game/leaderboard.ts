import { LEADERS } from './data'
import { game, playerPower, type GameState } from './engine'

// ─── 江湖英雄榜引擎(原生版,2026-09-13 自外壳层移植) ───────────────────────
// 设计:群侠各有独立增长曲线(有界 S 形),玩家从榜尾起步逐步超越;
//   genius 天骄 τ≈5d 早 plateau / grinder 苦修 τ≈22d 长爬 /
//   sleeper 隐士 logistic 突起 / ceiling 宗师 6-9×P0 τ≈30d 长期目标;
//   宿敌恒在玩家上一位,被超即换新人 → 永远有够得着的追赶目标;
//   每日 ±2% 确定性抖动让榜单每天有微小换位;排名历史日快照(≤90d)供 sparkline。
// 存储:`wuxia-lb-v1-<slotId>`(与外壳时代同键同格式,老进度无缝继承)。
export type LeaderBoardKey = 'power' | 'lab' | 'wealth'
export const LB_KEYS: LeaderBoardKey[] = ['power', 'lab', 'wealth']
export const LB_LABEL: Record<LeaderBoardKey, string> = { power: '江湖战力', lab: '秘境层数', wealth: '身家财富' }

export interface PlayerMetrics { power: number; lab: number; wealth: number }
export interface BoardEntry {
  name: string; icon: string; epithet: string; flavor: string
  value: number; isPlayer: boolean; rank: number
}
export interface RankEvent { type: 'overtake' | 'nemesis'; metric: LeaderBoardKey; name: string; rank: number }

type Arch = 'genius' | 'grinder' | 'sleeper' | 'ceiling'
interface Rival {
  id: number; name: string; icon: string; epithet: string; flavor: string
  arch: Arch
  base: Record<LeaderBoardKey, number>
  a: Record<LeaderBoardKey, number>
  tau: Record<LeaderBoardKey, number>
  kick: Record<LeaderBoardKey, number>
  t0: Record<LeaderBoardKey, number>
  epoch: number
}
interface BoardState {
  epoch: number
  rivals: Rival[]
  nemesisId: number | null
  history: { day: number; ranks: Record<LeaderBoardKey, number> }[]
  lastRanks: Record<LeaderBoardKey, number>
}

const DAY = 86400000
const keyOf = (slot: string) => `wuxia-lb-v1-${slot}`

function hash01(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967296
}
function logspace(lo: number, hi: number, n: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(lo * Math.pow(hi / lo, n === 1 ? 0 : i / (n - 1)))
  return out
}
const ARCH_PARAM: Record<Arch, { a: number; tau: number; kick: number }> = {
  genius: { a: 1.1, tau: 5, kick: 0 },
  grinder: { a: 2.2, tau: 22, kick: 0 },
  sleeper: { a: 0.5, tau: 8, kick: 2.2 },
  ceiling: { a: 0.8, tau: 30, kick: 0 },
}

export function metricsOf(s: GameState): PlayerMetrics {
  return { power: playerPower(s), lab: s.highestFloor, wealth: s.inventory.coin ?? 0 }
}

class LeaderboardEngine {
  state: BoardState | null = null
  slot: string | null = null

  load(slot: string): void {
    this.slot = slot
    try {
      const raw = localStorage.getItem(keyOf(slot))
      this.state = raw ? (JSON.parse(raw) as BoardState) : null
    } catch { this.state = null }
  }
  private save(): void {
    if (!this.state || !this.slot) return
    try { localStorage.setItem(keyOf(this.slot), JSON.stringify(this.state)) } catch { /* 满则忽略 */ }
  }

  /** 首次见到该存档时播种:玩家当前值作为 P0,保证起步于榜尾 */
  seed(P: PlayerMetrics, now: number): void {
    const slot = this.slot ?? 'x'
    const rnd = (salt: string) => hash01(slot + salt)
    const order = LEADERS.map((_, i) => i).sort((a, b) => rnd('ord' + a) - rnd('ord' + b))
    const archOf: Arch[] = [
      ...Array(2).fill('ceiling'), ...Array(5).fill('genius'),
      ...Array(9).fill('grinder'), ...Array(4).fill('sleeper'),
    ]
    const aboveP = logspace(1.15, 9, 17)
    const belowP = [0.35, 0.55, 0.8]
    const aboveL = logspace(1.2, 12, 17)
    const belowL = [0.4, 0.6, 0.85]
    const aboveW = logspace(1.2, 15, 17)
    const belowW = [0.3, 0.6, 0.85]
    const Pw = { power: Math.max(1, P.power), lab: Math.max(3, P.lab), wealth: Math.max(50, P.wealth) }
    const rivals: Rival[] = LEADERS.map((h, i) => {
      const pos = order.indexOf(i)
      const arch = archOf[pos]
      const slotAbove = pos >= 3 ? pos - 3 : 0
      const base: Record<LeaderBoardKey, number> = pos < 3
        ? { power: Pw.power * belowP[pos], lab: Pw.lab * belowL[pos], wealth: Pw.wealth * belowW[pos] }
        : { power: Pw.power * aboveP[slotAbove], lab: Pw.lab * aboveL[slotAbove], wealth: Pw.wealth * aboveW[slotAbove] }
      const p = ARCH_PARAM[arch]
      const mk = (k: 'a' | 'tau' | 'kick') => {
        const out = {} as Record<LeaderBoardKey, number>
        for (const m of LB_KEYS) {
          const f = 0.7 + 0.6 * rnd(`${i}:${m}:${k}`)
          out[m] = k === 'tau' ? p.tau * f : k === 'a' ? p.a * f : (arch === 'sleeper' ? p.kick * f : 0)
        }
        return out
      }
      return {
        id: i, name: h.name, icon: h.icon, epithet: h.epithet, flavor: h.flavor, arch,
        base, a: mk('a'), tau: mk('tau'), kick: mk('kick'),
        t0: { power: 10 + 14 * rnd(`${i}:t0p`), lab: 10 + 14 * rnd(`${i}:t0l`), wealth: 10 + 14 * rnd(`${i}:t0w`) },
        epoch: now,
      }
    })
    const monk = rivals.find(r => r.name === '扫地僧')
    if (monk) monk.base.lab = Math.max(...rivals.map(r => r.base.lab)) * 0.92
    const thief = rivals.find(r => r.name === '楚留香')
    if (thief) thief.base.wealth = Math.max(...rivals.map(r => r.base.wealth)) * 0.95
    const nemesis = rivals[order[3]]
    this.state = { epoch: now, rivals, nemesisId: nemesis.id, history: [], lastRanks: { power: 0, lab: 0, wealth: 0 } }
    const ranks = this.ranks(P, now)
    this.state.history.push({ day: 0, ranks })
    this.state.lastRanks = ranks
    this.save()
  }

  private dayIndex(now: number): number {
    return Math.floor((now - (this.state?.epoch ?? now)) / DAY)
  }
  rivalValue(r: Rival, m: LeaderBoardKey, now: number): number {
    const t = Math.max(0, (now - r.epoch) / DAY)
    const day = this.dayIndex(now)
    const growth = 1 + r.a[m] * (1 - Math.exp(-t / r.tau[m]))
    let v = r.base[m] * growth
    if (r.arch === 'sleeper') v += r.base[m] * r.kick[m] / (1 + Math.exp(-(t - r.t0[m]) / 4))
    v *= 1 + 0.02 * (hash01(`${r.id}:${m}:${day}`) * 2 - 1)
    return Math.max(1, Math.round(v))
  }
  standings(m: LeaderBoardKey, P: PlayerMetrics, now: number): BoardEntry[] {
    if (!this.state) return []
    const entries: BoardEntry[] = this.state.rivals.map(r => ({
      name: r.name, icon: r.icon, epithet: r.epithet, flavor: r.flavor,
      value: this.rivalValue(r, m, now), isPlayer: false, rank: 0,
    }))
    entries.push({ name: '本侠客', icon: '🥋', epithet: '玩家', flavor: '这是你!风雨江湖路,且行且珍惜。', value: Math.max(1, Math.round(P[m])), isPlayer: true, rank: 0 })
    entries.sort((a, b) => b.value - a.value)
    entries.forEach((e, i) => { e.rank = i + 1 })
    return entries
  }
  ranks(P: PlayerMetrics, now: number): Record<LeaderBoardKey, number> {
    const out = {} as Record<LeaderBoardKey, number>
    for (const m of LB_KEYS) out[m] = this.standings(m, P, now).find(e => e.isPlayer)?.rank ?? 1
    return out
  }
  nemesis(P: PlayerMetrics, now: number): { entry: BoardEntry; gap: number } | null {
    if (!this.state?.nemesisId) return null
    const st = this.state
    const r = st.rivals.find(rr => rr.id === st.nemesisId)
    if (!r) return null
    const list = this.standings('power', P, now)
    const nem = list.find(e => !e.isPlayer && e.name === r.name)
    const me = list.find(e => e.isPlayer)
    if (!nem || !me) return null
    return { entry: nem, gap: nem.value - me.value }
  }
  /** 轮询调用:补日快照、产出超越/宿敌事件 */
  tick(P: PlayerMetrics, now: number): RankEvent[] {
    if (!this.state) this.seed(P, now)
    const st = this.state!
    const day = this.dayIndex(now)
    const ranks = this.ranks(P, now)
    if (st.history.length === 0 || st.history[st.history.length - 1].day < day) {
      st.history.push({ day, ranks })
      if (st.history.length > 90) st.history.shift()
    }
    const events: RankEvent[] = []
    for (const m of LB_KEYS) {
      const prev = st.lastRanks[m]
      if (prev && ranks[m] < prev) {
        const passed = this.standings(m, P, now)[ranks[m]]
        if (passed && !passed.isPlayer) events.push({ type: 'overtake', metric: m, name: passed.name, rank: ranks[m] })
      }
    }
    if (st.nemesisId != null) {
      const list = this.standings('power', P, now)
      const me = list.find(e => e.isPlayer)!
      const nem = this.nemesis(P, now)
      if (nem && nem.entry.rank > me.rank) {
        const above = list[me.rank - 2]
        if (above && !above.isPlayer) {
          const r = st.rivals.find(rr => rr.name === above.name)!
          r.base.power = above.value; r.epoch = now; r.arch = 'grinder'
          for (const mm of LB_KEYS) { r.a[mm] = 0.7; r.tau[mm] = 12 }
          st.nemesisId = r.id
          events.push({ type: 'nemesis', metric: 'power', name: r.name, rank: above.rank })
        } else {
          st.nemesisId = null
        }
      }
    }
    st.lastRanks = ranks
    this.save()
    return events
  }
  history14(): { day: number; rank: number }[] {
    const h = this.state?.history ?? []
    return h.slice(-14).map(x => ({ day: x.day, rank: x.ranks.power }))
  }
}

export const leaderboard = new LeaderboardEngine()

/** App 挂载时启动:每秒与当前存档同步一次,超越/宿敌事件走游戏内 notice */
export function startLeaderboardSync(): () => void {
  const timer = window.setInterval(() => {
    const slot = game.activeSlotId
    const st = game.state
    if (slot == null || !st) return
    if (leaderboard.slot !== slot) leaderboard.load(slot)
    const P = metricsOf(st)
    for (const ev of leaderboard.tick(P, Date.now())) {
      if (ev.type === 'overtake') game.setNotice(`🏮 英雄榜:超越 ${ev.name},升至第 ${ev.rank} 位!`)
      else game.setNotice(`⚔️ 新宿敌出现:${ev.name} 就在你上一位,追上他!`)
    }
  }, 1000)
  return () => window.clearInterval(timer)
}
