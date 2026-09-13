import { ACTIONS, fmt, titleFor } from '../game/data'
import { battleMonster, game, useGame, totalLevel } from '../game/engine'

export default function Header() {
  const state = useGame()
  const action = state.active ? ACTIONS.find(a => a.id === state.active!.actionId) : null
  const monster = state.battle ? battleMonster(state.battle) : null
  const pct = action && state.active ? Math.min(100, (state.active.elapsed / action.timeSec) * 100) : 0
  const remain = action && state.active ? Math.max(0, action.timeSec - state.active.elapsed) : 0
  const teaLeft = Math.max(0, state.teaUntil - state.lastTick)
  const atkLeft = Math.max(0, state.atkBuffUntil - state.lastTick)
  const defLeft = Math.max(0, state.defBuffUntil - state.lastTick)
  const tl = totalLevel(state)
  const title = titleFor(tl)
  const slotName = game.activeSlotId ? (game.listSlots().find(s => s.id === game.activeSlotId)?.name ?? 'xbei') : 'xbei'

  return (
    <header className="ink-panel relative z-40 flex h-16 items-center gap-4 border-b px-4">
      {/* 题名 */}
      <div className="flex items-center gap-3">
        <div className="ink-seal flex h-11 w-11 items-center justify-center rounded-sm font-brush text-2xl">侠</div>
        <div>
          <div className="font-brush text-2xl leading-none ink-text-gold">武林闲侠传</div>
          <div className="mt-0.5 text-[10px] ink-text-dim">在线侠客 36,240 · 闲云野鹤版</div>
        </div>
      </div>

      {/* 当前行动 */}
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
        {action ? (
          <>
            <span className="text-2xl">{action.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex justify-between text-xs">
                <span className="ink-text-paper">{action.name}</span>
                <span className="ink-text-dim">{remain.toFixed(1)}s</span>
              </div>
              <div className="ink-progress h-2.5 overflow-hidden rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8a6d3b] to-[#c9a063] transition-[width] duration-100" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <button onClick={() => game.stopAction()} className="ink-btn-red rounded px-3 py-1 text-xs">停止</button>
          </>
        ) : monster && state.battle ? (
          <>
            <span className="text-2xl">{monster.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex justify-between text-xs">
                <span className="ink-text-red">激战 · {monster.name}</span>
                <span className="ink-text-dim">{Math.max(0, Math.ceil(state.battle.monsterHp))} / {monster.hp}</span>
              </div>
              <div className="ink-progress h-2.5 overflow-hidden rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#722a26] to-[#d4504a] transition-all" style={{ width: `${Math.max(0, (state.battle.monsterHp / monster.hp) * 100)}%` }} />
              </div>
            </div>
            <button onClick={() => game.stopBattle()} className="ink-btn-red rounded px-3 py-1 text-xs">撤退</button>
          </>
        ) : (
          <span className="text-xs ink-text-dim">行走江湖，选个营生开始吧…</span>
        )}
      </div>

      {/* Buff */}
      <div className="flex items-center gap-1.5">
        {teaLeft > 0 && <Buff icon="🍵" label={`${Math.ceil(teaLeft / 60000)}m`} tip="悟道茶：经验 ×2" />}
        {atkLeft > 0 && <Buff icon="🔥" label={`${Math.ceil(atkLeft / 60000)}m`} tip="大力丸：攻击 +25%" />}
        {defLeft > 0 && <Buff icon="🛡️" label={`${Math.ceil(defLeft / 60000)}m`} tip="铁布衫丹：防御 +25%" />}
      </div>

      {/* 货币 */}
      <div className="flex items-center gap-3 text-xs">
        <span className="ink-text-gold" title="铜钱">🪙 {fmt(state.inventory.coin ?? 0)}</span>
        <span className="ink-text-jade" title="武林令">🎫 {state.inventory.token ?? 0}</span>
        {(state.inventory.labCoin ?? 0) > 0 && <span className="ink-text-paper" title="秘境币">🪷 {fmt(state.inventory.labCoin)}</span>}
      </div>

      {/* 角色 */}
      <div className="flex items-center gap-2.5 border-l pl-4 ink-divider">
        <div className="text-right">
          <div className="text-sm ink-text-paper">{title.icon} {title.name} <span className="ink-text-jade">· {slotName}</span></div>
          <div className="text-[10px] ink-text-dim">总等级 {tl} · 击杀 {state.kills}</div>
        </div>
        <div className="ink-card flex h-10 w-10 items-center justify-center rounded-sm text-xl">🥋</div>
        <button onClick={() => game.exitSlot()} title="切换角色（返回选档页）"
          className="rounded-sm px-1.5 py-1 text-xs opacity-50 hover:bg-white/5 hover:opacity-100">👥</button>
      </div>

      {/* 通知 */}
      {state.notice && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded border border-[#c9a063]/50 bg-[#2a2113] px-4 py-2 text-sm ink-text-gold shadow-xl">
          {state.notice}
        </div>
      )}
    </header>
  )
}

function Buff({ icon, label, tip }: { icon: string; label: string; tip: string }) {
  return (
    <div className="ink-card flex h-10 w-10 flex-col items-center justify-center rounded-sm text-[9px] ink-text-jade" title={tip}>
      <span className="text-sm leading-none">{icon}</span>
      {label}
    </div>
  )
}
