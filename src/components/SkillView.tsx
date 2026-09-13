import { ITEMS, SKILLS, actionsBySkill, itemSource, itemUsage, xpToNext, type ActionDef, type SkillId } from '../game/data'
import { game, useGame } from '../game/engine'
import { HERO_SPRITE, SCENE_BG } from '../game/sprites'
import type { GatherEvent } from '../game/engine'
import type { View } from '../App'

/** 采集工具 emoji（按技能区分） */
const TOOL_EMOJI: Partial<Record<SkillId, string>> = {
  herbalism: '🌿', mining: '⛏️', woodcutting: '🪓', hunting: '🏹', fishing: '🎣',
}

/** 采集场景舞台：背景图 + 主角采集动画（仅采集系有场景） */
function SceneStage({ skill, busy }: { skill: SkillId; busy: boolean }) {
  const bg = SCENE_BG[skill]
  if (!bg) return null
  return (
    <div className="scene-stage mx-auto mb-4 max-w-4xl">
      <img src={bg} alt="" className="scene-bg" aria-hidden />
      <div className="scene-dust" />
      <div className="scene-dust d2" />
      <div className="scene-dust d3" />
      <img src={HERO_SPRITE} alt="侠客" className={`scene-hero ${busy ? 'busy' : 'idle'}`} />
      <span className="scene-tool" aria-hidden>{TOOL_EMOJI[skill] ?? '⚒️'}</span>
      {/* 采集状态提示 */}
      <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#c9a063]/40 bg-[#241d11]/80 px-4 py-1 text-center text-xs ink-text-gold">
        {busy ? '⚙️ 采集中…' : '🗒️ 点击下方卡片开工'}
      </div>
    </div>
  )
}

/** 动作悬停介绍：产出物的用途（配方反查）与直接价值 */
function actionTip(a: ActionDef): string {
  const lines: string[] = []
  for (const o of a.outputs) {
    const def = ITEMS[o.item]
    if (!def) continue
    const use = itemUsage(o.item)
    const self = def.heal ? `可食用回血${def.heal === -1 ? '（全恢复）' : def.heal}` : def.buff ? '战斗增益丹药（5 分钟）' : def.atk ? `可直接装备 ATK+${def.atk}` : def.def ? `可直接装备 DEF+${def.def}` : ''
    if (use.length > 0) {
      lines.push(`${def.icon}${def.name}：可做 ${use.slice(0, 3).map(u => `${SKILLS.find(s => s.id === u.skill)?.name}「${u.recipe}」`).join('、')}${use.length > 3 ? ` 等 ${use.length} 个配方` : ''}`)
    } else if (self) {
      lines.push(`${def.icon}${def.name}：${self}`)
    }
  }
  return lines.join('\n')
}

const CRAFT_SKILLS: SkillId[] = ['alchemy', 'smithing', 'cooking', 'tailoring', 'enhancing']

// ── 浮动物品（采集/制造产出，位置按事件时间确定性生成，避免重渲染抖动）────────
function FloatingItems({ events }: { events: GatherEvent[] }) {
  const items = events.slice(-8)
  if (items.length === 0) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {items.map((e, i) => {
        const def = ITEMS[e.item]
        if (!def) return null
        return (
          <div
            key={`${e.time}-${i}`}
            className="float-item"
            style={{
              left: `${25 + (i % 4) * 15 + ((e.time / 100) % 8)}%`,
              top: `${40 - (i % 3) * 8}%`,
            }}
          >
            {def.icon}×{e.count}
          </div>
        )
      })}
    </div>
  )
}

export default function SkillView({ skill, setView }: { skill: SkillId; setView?: (v: View) => void }) {
  const state = useGame()
  const def = SKILLS.find(s => s.id === skill)!
  const actions = actionsBySkill(skill)
  const st = state.skills[skill]
  const isCraft = CRAFT_SKILLS.includes(skill)
  const autoCraft = state.autoCraft[skill]

  return (
    <div className="relative flex-1 overflow-y-auto p-5">
      <FloatingItems events={state.gatherEvents} />

      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">{def.icon} {def.name}</h2>
      <div className="mb-1 text-center text-xs ink-text-dim">{def.desc}</div>
      <div className="mb-1 text-center text-[10px] ink-text-dim">当前境界 Lv.{st.level} · 点击卡片开工，再点停止</div>

      {/* 采集场景舞台（仅采集系） */}
      <SceneStage skill={skill} busy={!!state.active} />

      {/* 技能等级进度条 */}
      <div className="mx-auto mb-2 max-w-xs">
        <div className="ink-progress h-2 overflow-hidden rounded-full">
          <div
            className="hp-bar-smooth h-full rounded-full bg-gradient-to-r from-[#5a8a6a] to-[#7fb08a]"
            style={{ width: `${Math.min(100, (st.xp / xpToNext(st.level)) * 100)}%` }}
          />
        </div>
        <div className="mt-0.5 text-center text-[10px] ink-text-dim">
          {Math.floor(st.xp)} / {xpToNext(st.level)} XP → Lv.{st.level + 1}
        </div>
      </div>

      {isCraft && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={() => game.toggleAutoCraft(skill)}
            className={`ink-card rounded-full px-5 py-1.5 text-xs font-bold transition-colors ${
              autoCraft ? 'bg-[#c9a063]/20 ink-text-gold border border-[#c9a063]/50' : 'ink-text-dim hover:ink-text-paper'
            }`}
          >
            ⚙️ 自动制造：{autoCraft ? '🟢 开' : '⚫ 关'}
          </button>
        </div>
      )}

      {/* 动作卡片网格 */}
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {actions.map(a => {
          const locked = st.level < a.levelReq
          const active = state.active?.actionId === a.id
          const affordable = !a.inputs || a.inputs.every(i => (state.inventory[i.item] ?? 0) >= i.count)
          // 计算当前周期的进度
          const progress = active ? Math.min(100, ((a.timeSec - (state.active!.elapsed ?? 0)) / a.timeSec) * 100) : 0
          return (
            <button
              key={a.id}
              disabled={locked}
              onClick={() => (active ? game.stopAction() : game.startAction(a.id))}
              title={actionTip(a)}
              className={`ink-card relative flex flex-col items-center gap-1 rounded-md p-3 ${active ? 'active gather-active' : ''}`}
            >
              {active && <span className="absolute left-2 top-2 animate-spin text-xs ink-text-gold">⚙️</span>}
              <span className="text-3xl" style={locked ? { filter: 'grayscale(1)' } : undefined}>{a.icon}</span>
              <span className="text-xs ink-text-paper">{a.name}</span>
              {locked ? (
                <span className="text-[10px] ink-text-red">需要{def.name} Lv.{a.levelReq}</span>
              ) : (
                <span className="text-[10px] ink-text-dim">{a.timeSec}s · {a.xp} 经验</span>
              )}
              {a.inputs && (
                <>
                  <span className={`text-[10px] ${affordable ? 'ink-text-dim' : 'ink-text-red'}`}>
                    耗 {a.inputs.map(i => `${ITEMS[i.item].icon}×${i.count}`).join(' ')}
                  </span>
                  {/* 原料不足：提示缺什么、去哪凑 */}
                  {!affordable && setView && (
                    <span className="flex flex-wrap items-center justify-center gap-1 text-[10px] ink-text-jade">
                      {a.inputs.filter(i => (state.inventory[i.item] ?? 0) < i.count).map(i => {
                        const src = itemSource(i.item)
                        return src ? (
                          <button
                            key={i.item}
                            onClick={e => { e.stopPropagation(); setView({ type: 'skill', skill: src.skill }) }}
                            className="rounded border border-[#5a8a6a]/40 bg-[#35573f]/20 px-1.5 py-0.5 hover:bg-[#35573f]/40"
                            title={src.name}
                          >
                            缺<span className="mx-0.5 font-bold">{ITEMS[i.item].icon}{ITEMS[i.item].name}</span>→去{SKILLS.find(s => s.id === src.skill)?.name}
                          </button>
                        ) : (
                          <span key={i.item} className="ink-text-red">缺 {ITEMS[i.item].icon}{ITEMS[i.item].name}</span>
                        )
                      })}
                    </span>
                  )}
                </>
              )}
              <span className="text-[10px] ink-text-jade">
                得 {a.outputs.map(o => `${ITEMS[o.item].icon}×${o.count}${o.chance !== undefined ? `(${Math.round(o.chance * 100)}%)` : ''}`).join(' ')}
              </span>
              {/* 进度条（仅当前运行中的动作显示） */}
              {active && (
                <div className="mt-1 w-full">
                  <div className="ink-progress h-1.5 overflow-hidden rounded-full">
                    <div
                      className="progress-fill h-full rounded-full bg-gradient-to-r from-[#c9a063] to-[#e8d08f]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 消耗品 */}
      <div className="mt-8">
        <div className="mb-2 text-center text-xs ink-text-dim">— 消耗品 —</div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => game.drinkTea()}
            disabled={(state.inventory.tea ?? 0) < 1}
            className="ink-card flex h-16 w-16 flex-col items-center justify-center rounded-md text-xs ink-text-paper"
            title="悟道茶：10 分钟内全部经验 ×2"
          >
            <span className="text-xl">🍵</span>
            <span>×{state.inventory.tea ?? 0}</span>
          </button>
        </div>
      </div>
    </div>
  )
}