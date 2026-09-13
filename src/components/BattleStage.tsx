// ─── 通用战斗舞台（普通战斗 + 秘境爬塔共用）───
// 从 CombatView 提取：含角色精灵、血条、VS、伤害数字、暴击、死亡、掉落特效
import { ITEMS, MONSTERS, STYLES } from '../game/data'
import { battleMonster, currentSlotName, game, useGame } from '../game/engine'
import { HERO_SPRITE, MONSTER_SPRITE, labMonsterSprite, SCENE_BG } from '../game/sprites'
import '../combat-anim.css'

export default function BattleStage({ variant = 'combat' }: { variant?: 'combat' | 'lab' }) {
  const state = useGame()
  const b = state.battle
  const events = state.combatEvents
  if (!b) return null

  const m = battleMonster(b)
  const maxHp = game.maxHp()
  const monsterHpPct = Math.max(0, (b.monsterHp / m.hp) * 100)
  const playerHpPct = (state.playerHp / maxHp) * 100
  const style = STYLES.find(s => s.id === b.style)!

  // 精灵图：普通怪按 monsterId 查表，秘境怪按层数计算
  const monsterSpriteUrl = b.labFloor != null
    ? labMonsterSprite(b.labFloor)
    : MONSTER_SPRITE[b.monsterId] ?? null

  // 秘境背景：秘境战斗叠加专属氛围背景
  const labBg = b.labFloor != null ? SCENE_BG.lab : null

  // 动画由事件时间戳派生：key 变化触发元素重挂载，CSS 动画随之重播（无需本地 state）
  const atkEvents = events.filter(e => e.type === 'dmg' || e.type === 'crit')
  const matkEvents = events.filter(e => e.type === 'monsterDmg')
  const killEvents = events.filter(e => e.type === 'kill')
  const dropEvents = events.filter(e => e.type === 'drop')
  const critEvents = events.filter(e => e.type === 'crit')
  const lastAtk = atkEvents[atkEvents.length - 1]
  const lastMAtk = matkEvents[matkEvents.length - 1]
  const lastKill = killEvents[killEvents.length - 1]
  const lastCrit = critEvents[critEvents.length - 1]
  const recentDrops = dropEvents.slice(-5).reverse()

  // 玩家：最近一次相关事件决定攻击 or 受击动画
  const playerKey = Math.max(lastAtk?.time ?? 0, lastMAtk?.time ?? 0)
  const playerAnim = playerKey === 0 ? '' : (lastMAtk?.time ?? 0) > (lastAtk?.time ?? 0) ? 'player-hit' : 'player-attack'
  // 怪物：受击 or 击杀（死亡+登场连播）；同毫秒的击杀优先
  const monsterKey = Math.max(lastAtk?.time ?? 0, lastKill?.time ?? 0)
  const monsterAnim = monsterKey === 0 ? '' : (lastKill?.time ?? 0) >= (lastAtk?.time ?? 0) ? 'monster-death-spawn' : 'monster-hit'

  return (
    <div className={`combat-stage mx-auto mb-4 max-w-2xl p-4 ${b.labFloor != null ? 'lab-stage' : ''}`}>
      {/* 秘境氛围背景 */}
      {labBg && (
        <img src={labBg} alt="" aria-hidden className="lab-stage-bg" />
      )}
      <div className="combat-round-label">每 2 秒交锋 · 下一回合 {Math.max(0, b.roundTimer).toFixed(1)}s
        {b.labFloor != null && <span className="ml-2 ink-text-gold">🌀 秘境 {b.labFloor} 层</span>}
      </div>

      {/* 浮动伤害数字 */}
      {events.filter(e => e.type === 'dmg' || e.type === 'crit' || e.type === 'monsterDmg').slice(-6).map((e, i) => (
        <div
          key={`${e.time}-${i}`}
          className={`dmg-num ${e.type === 'crit' ? 'crit' : ''}`}
          style={{
            left: e.type === 'monsterDmg' ? '15%' : `${55 + ((e.time / 100) % 25)}%`,
            top: `${30 + ((e.time / 37) % 20)}%`,
            color: e.type === 'monsterDmg' ? '#d4655e' : e.type === 'crit' ? '#ffcc00' : '#fff',
          }}
        >
          {e.type === 'monsterDmg' ? `-${e.value}` : e.type === 'crit' ? `${e.value}!!` : `-${e.value}`}
        </div>
      ))}

      {/* 暴击 slash（每次暴击重播） */}
      {lastCrit && (
        <div key={`${lastCrit.time}-${lastCrit.value}`} className="slash-mark" style={{ left: '55%', top: '25%' }}>⚡</div>
      )}

      {/* 战利品掉落（击杀后飞出） */}
      {recentDrops.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-end gap-2">
          {recentDrops.map((e, i) => {
            if (!e.item) return null
            const def = ITEMS[e.item]
            if (!def) return null
            const hue = e.item === 'coin' ? '#ffd980' : def.price >= 500 ? '#ff9d5c' : def.price >= 200 ? '#c9a063' : '#eee3c8'
            return (
              <div key={`${e.time}-${e.item}-${i}`} className="drop-bounce text-center" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${hue}66)` }}>{def.icon}</div>
                <div className="text-[9px]" style={{ color: hue }}>{def.name}</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* 玩家侧 */}
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div key={`p-${playerKey}`} className={`sprite-char sprite-player ${playerAnim}`}>
            <div className="portrait-frame player-portrait" aria-label="侠客人物">
              <img src={HERO_SPRITE} alt="侠客" className="portrait-sprite" />
              <span className="portrait-rune">{style.icon}</span>
            </div>
          </div>
          <span className="sprite-label mt-1">{currentSlotName()} · {style.name}</span>
          <div className="mt-1 w-full max-w-[120px]">
            <div className="hp-bar-player">
              <div className="fill" style={{ width: `${playerHpPct}%` }} />
            </div>
            <div className="mt-0.5 text-center text-[9px] ink-text-dim">
              {Math.ceil(state.playerHp)} / {maxHp}
            </div>
          </div>
          <div className="mt-0.5 text-[9px] ink-text-dim">
            ⚔{game.playerAtk()} 🛡{game.playerDef()}
          </div>
        </div>

        {/* VS */}
        <div className="vs-divider shrink-0">⚡</div>

        {/* 怪物侧 */}
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div key={`m-${monsterKey}`} className={`sprite-char sprite-monster ${monsterAnim}`}>
            <div className="portrait-frame monster-portrait" aria-label={`${m.name} 敌人`}>
              <span className="monster-aura" />
              {monsterSpriteUrl
                ? <img src={monsterSpriteUrl} alt={m.name} className="portrait-sprite" />
                : <span className="portrait-silhouette">{m.icon}</span>
              }
            </div>
          </div>
          <span className="sprite-label mt-1">{m.name}</span>
          <div className="mt-1 w-full max-w-[120px]">
            <div className="hp-bar-monster">
              <div className="fill" style={{ width: `${monsterHpPct}%` }} />
            </div>
            <div className="mt-0.5 text-center text-[9px] ink-text-dim">
              {Math.max(0, Math.ceil(b.monsterHp))} / {m.hp}
            </div>
          </div>
          <div className="mt-0.5 text-[9px] ink-text-dim">
            ⚔{m.atk} 🛡{m.def}
          </div>
        </div>
      </div>

      {/* 战斗信息 */}
      <div className="mt-3 flex items-center justify-between text-[10px] ink-text-dim">
        <span>流派：{STYLES.find(s => s.id === b.style)?.icon} {STYLES.find(s => s.id === b.style)?.name}
          {monsterSpriteUrl && b.labFloor == null && MONSTERS.find(x => x.id === b.monsterId)?.weak === b.style && (
            <span className="ml-1 rounded bg-[#35573f]/40 px-1.5 py-0.5 text-[9px] ink-text-jade">克制 +18%</span>
          )}
        </span>
        <button onClick={() => game.stopBattle()} className="ink-btn-red rounded px-3 py-0.5 text-[10px]">
          {variant === 'lab' ? '撤离秘境' : '撤退'}
        </button>
      </div>
    </div>
  )
}
