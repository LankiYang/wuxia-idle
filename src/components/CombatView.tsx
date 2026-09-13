import { AFFIXES, ITEMS, MONSTERS, REBIRTH_REQ_LEVEL, STYLES, ZONES, affixDesc } from '../game/data'
import { battleMonster, currentSlotName, game, totalLevel, useGame } from '../game/engine'
import { MONSTER_SPRITE } from '../game/sprites'
import BattleStage from './BattleStage'

// ── 自动战斗横幅 ──────────────────────────────────────────────
function AutoCombatBanner() {
  const state = useGame()
  const ac = state.autoCombat
  if (!ac) return null
  const m = MONSTERS.find(x => x.id === ac.monsterId)
  const s = STYLES.find(x => x.id === ac.style)
  if (!m || !s) return null
  return (
    <div className="mx-auto mb-4 max-w-2xl rounded-md border border-[#d4504a]/60 bg-[#2a1512]/90 p-3 text-center">
      <span className="text-sm ink-text-gold">
        🤖 自动战斗 → {m.icon} {m.name} · {s.icon} {s.name}
      </span>
      <button onClick={() => game.toggleAutoCombat(ac.monsterId, ac.style)} className="ml-3 ink-btn-red rounded px-3 py-0.5 text-xs">
        停止
      </button>
    </div>
  )
}

// ── 主视图 ────────────────────────────────────────────────────
export default function CombatView() {
  const state = useGame()
  const maxHp = game.maxHp()
  const atk = game.playerAtk()
  const def = game.playerDef()
  const battle = state.battle
  const monster = battle ? battleMonster(battle) : null
  const injured = state.playerHp <= maxHp * 0.2 && !battle

  const healItems = Object.values(ITEMS).filter(d => (d.heal || d.buff) && (state.inventory[d.id] ?? 0) > 0)

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-4 text-center font-brush text-3xl ink-text-red">⚔️ 闯荡江湖</h2>
      <AutoCombatBanner />

      {/* ── 战斗舞台 / 角色状态 ── */}
      {battle && monster ? (
        <BattleStage />
      ) : (
        <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="ink-text-paper">{currentSlotName()}</span>
            <span className="text-xs ink-text-dim">⚔️ {atk} 🛡️ {def} 击杀 {state.kills}</span>
          </div>
          <div className="ink-progress h-3.5 overflow-hidden rounded-full">
            <div className={`hp-bar-smooth h-full rounded-full ${state.playerHp < maxHp * 0.3 ? 'bg-gradient-to-r from-[#722a26] to-[#d4504a]' : 'bg-gradient-to-r from-[#35573f] to-[#5a8a6a]'}`}
              style={{ width: `${(state.playerHp / maxHp) * 100}%` }} />
          </div>
          <div className="mt-1 text-right text-[10px] ink-text-dim">气血 {Math.ceil(state.playerHp)} / {maxHp}</div>

          {injured && (
            <div className="mt-2 rounded-md border border-[#c9a063]/40 bg-[#2a2113]/80 p-2 text-center text-xs ink-text-gold">
              🧘 身受重伤，打坐回气中…
            </div>
          )}
        </div>
      )}

      {/* ── 装备栏 ── */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
        <div className="mb-2 text-xs ink-text-dim">🎒 装备</div>
        <div className="flex items-center gap-2">
          {(['weapon', 'armor', 'amulet'] as const).map(slot => {
            const eq = state.equipment[slot]
            const SLOT_META = {
              weapon: { icon: '🗡️', empty: '无武器' },
              armor: { icon: '🛡️', empty: '无防具' },
              amulet: { icon: '📿', empty: '无饰品' },
            }[slot]
            return (
              <div key={slot} className="ink-card flex flex-1 items-center gap-2 rounded-md px-3 py-2">
                <span className="text-xl">{eq ? ITEMS[eq.item].icon : SLOT_META.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs ink-text-paper">
                    {eq ? `${ITEMS[eq.item].name}${eq.plus > 0 ? ` +${eq.plus}` : ''}` : SLOT_META.empty}
                  </div>
                  {eq && slot === 'weapon' && <div className="text-[10px] ink-text-dim">ATK +{(ITEMS[eq.item].atk ?? 0) + eq.plus * 2}</div>}
                  {eq && slot === 'armor' && <div className="text-[10px] ink-text-dim">DEF +{(ITEMS[eq.item].def ?? 0) + eq.plus}</div>}
                  {eq && (
                    <div className="mt-1 space-y-0.5">
                      {(eq.affixes ?? []).map((affix, index) => {
                        const cursed = AFFIXES.find(a => a.id === affix.id)?.curse
                        return <div key={`${affix.id}-${index}`} className={`text-[9px] leading-tight ${cursed ? 'ink-text-red' : 'ink-text-jade'}`}>{cursed ? '💀' : '✦'} {affixDesc(affix)}</div>
                      })}
                      {(eq.fractures ?? 0) > 0 && <div className="text-[9px] leading-tight ink-text-red">裂痕 {eq.fractures}/3</div>}
                    </div>
                  )}
                </div>
                {eq && (
                  <div className="flex gap-1">
                    {slot !== 'amulet' && <button onClick={() => game.enhance(slot)} className="ink-btn rounded px-2 py-0.5 text-[10px]">强化</button>}
                    <button onClick={() => game.rerollAffixes(slot)} className="ink-btn rounded px-2 py-0.5 text-[10px]" title="玄晶×2 重铸词缀">重铸</button>
                    <button onClick={() => game.unequip(slot)} className="ink-btn-red rounded px-2 py-0.5 text-[10px]">卸</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 药品食物 ── */}
      {healItems.length > 0 && (
        <div className="mx-auto mb-4 flex max-w-2xl flex-wrap items-center gap-1.5">
          <span className="text-[10px] ink-text-dim">药品：</span>
          {healItems.map(d => (
            <button key={d.id} onClick={() => game.eatItem(d.id)} className="ink-card flex items-center gap-1 rounded px-2 py-1 text-xs ink-text-paper"
              title={d.buff ? `5分钟${d.buff === 'atk' ? '攻击' : '防御'}+25%` : d.heal === -1 ? '全恢复' : `回血${d.heal}`}>
              {d.icon}×{state.inventory[d.id]}
            </button>
          ))}
        </div>
      )}

      {/* ── 武学 ── */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
        <div className="mb-2 text-xs ink-text-gold">📖 武学流派</div>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map(s => {
            const lv = state.skills[s.id].level
            return (
              <div key={s.id} className="rounded border border-[#c9a063]/15 p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="ink-text-paper">{s.icon} {s.name} <span className="ink-text-gold">Lv.{lv}</span></span>
                  {(state.styleManuals[s.id] ?? 0) > 0 && <span className="text-[10px] ink-text-jade">📜{state.styleManuals[s.id]}/5</span>}
                </div>
                <div className="text-[10px] ink-text-jade">{s.signature}</div>
                <div className="mt-1 space-y-0">
                  {s.abilities.map(a => (
                    <div key={a.name} className={`text-[10px] ${lv >= a.level ? 'ink-text-gold' : 'ink-text-dim opacity-50'}`}>
                      {lv >= a.level ? '◆' : '◇'} {a.name} (Lv.{a.level})
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 怪物列表 ── */}
      {ZONES.map(zone => (
        <div key={zone} className="mx-auto mb-5 max-w-2xl">
          <div className="mb-2 font-brush text-lg ink-text-gold">📍 {zone}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MONSTERS.filter(m => m.zone === zone).map(m => {
              return (
                <div key={m.id} className={`ink-card rounded-md p-3 ${battle?.monsterId === m.id ? 'active' : ''}`}>
                  <div className="mb-1 flex items-center justify-between">
                    {MONSTER_SPRITE[m.id]
                      ? <span className="flex items-center gap-1.5 ink-text-paper text-lg"><img src={MONSTER_SPRITE[m.id]} alt={m.name} className="inline-block h-8 w-8 object-contain" /> {m.name}</span>
                      : <span className="ink-text-paper text-lg">{m.icon} {m.name}</span>
                    }
                    {m.weak && (
                      <span className="rounded bg-[#35573f]/40 px-1.5 py-0.5 text-[9px] ink-text-jade" title={`用${STYLES.find(s => s.id === m.weak)?.name}克制 +18% 伤害`}>
                        克 {STYLES.find(s => s.id === m.weak)?.icon}
                      </span>
                    )}
                    <span className="text-[10px] ink-text-dim">推荐 Lv.{m.levelReq}</span>
                  </div>
                  <div className="mb-1 text-[10px] ink-text-dim">HP {m.hp} · ATK {m.atk} · DEF {m.def}</div>
                  <div className="mb-2 text-[10px] ink-text-dim">掉落 {m.drops.map(d => `${ITEMS[d.item].icon}${d.chance < 1 ? `${Math.round(d.chance * 100)}%` : ''}`).join(' ')}</div>
                  <div className="flex flex-wrap gap-1">
                    {STYLES.map(s => (
                      <button key={s.id} disabled={!!battle || injured || state.skills[s.id].level < m.levelReq} onClick={() => game.startBattle(m.id, s.id)}
                        className="ink-btn rounded px-2 py-0.5 text-[11px]" title={state.skills[s.id].level < m.levelReq ? `${s.name}需要 Lv.${m.levelReq}` : `以${s.name}出战`}>
                        {s.icon} {s.name}
                      </button>
                    ))}
                    {STYLES.map(s => {
                      const isAuto = state.autoCombat?.monsterId === m.id && state.autoCombat?.style === s.id
                      return (
                        <button key={`a-${s.id}`} disabled={injured || state.skills[s.id].level < m.levelReq || (!!battle && !isAuto)} onClick={() => game.toggleAutoCombat(m.id, s.id)}
                          className={`rounded px-2 py-0.5 text-[11px] ${isAuto ? 'bg-[#d4504a]/80 text-white' : 'ink-card ink-text-dim hover:ink-text-paper'}`}>
                          🤖{isAuto ? ' 自动中' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ── 轮回 ── */}
      {(() => {
        const tl = totalLevel(state)
        const can = game.canRebirth()
        const gain = game.rebirthGain()
        return (
          <div className="ink-panel mx-auto mb-6 max-w-2xl rounded-md p-4 text-center">
            <div className="font-brush text-xl ink-text-gold">♾️ 涅槃轮回</div>
            <div className="mt-1 text-[11px] ink-text-dim">
              总等级 {tl} / {REBIRTH_REQ_LEVEL} · 已轮回 {state.rebirths} 次 · 轮回点 {state.rebirthPoints}（每点：经验+5% 铜钱+3%）
            </div>
            <button disabled={!can} onClick={() => { if (confirm(`确定轮回？将获得 ${gain} 轮回点，进度清零！`)) game.rebirth() }}
              className={`mt-2 rounded px-6 py-1.5 text-sm ${can ? 'ink-btn' : 'ink-btn-red opacity-40'}`}>
              {can ? `🌀 涅槃轮回（+${gain} 轮回点）` : `总等级 ${REBIRTH_REQ_LEVEL} 方可轮回`}
            </button>
          </div>
        )
      })()}
    </div>
  )
}
