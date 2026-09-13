import { ITEMS, SKILLS, fmt } from '../game/data'
import { game, useGame } from '../game/engine'
import type { View } from '../App'

export default function TasksView({ setView }: { setView: (v: View) => void }) {
  const state = useGame()
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">📜 门派任务</h2>
      <div className="mb-4 text-center text-xs ink-text-dim">累计江湖声望 {state.lifetimeTaskPoints} · 收集对应物品即可推进</div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* 礼物卡 */}
        <div className="ink-panel flex flex-col items-center justify-center gap-3 rounded-md p-5">
          <span className="text-sm ink-text-paper">🎁 掌门贺礼</span>
          <span className="text-xs ink-text-dim">{Math.min(state.taskPoints, 50)} / 50 声望</span>
          <div className="ink-progress h-2 w-full overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8a6d3b] to-[#c9a063]" style={{ width: `${Math.min(100, (state.taskPoints / 50) * 100)}%` }} />
          </div>
          <button
            disabled={state.taskPoints < 50}
            onClick={() => game.claimGift()}
            className="ink-btn rounded px-6 py-1.5 text-sm"
          >
            领取 🪙50K
          </button>
        </div>

        {state.tasks.map(t => {
          const item = ITEMS[t.item]
          const skill = SKILLS.find(s => s.id === t.skill)!
          const done = t.progress >= t.count
          return (
            <div key={t.id} className={`ink-card flex flex-col gap-2 rounded-md p-4 ${done ? 'active' : ''}`}>
              <div className="flex items-center gap-2 text-sm ink-text-paper">
                <span>{skill.icon}</span>
                <span>{skill.name} · {item.name}</span>
                {done && <span className="ml-auto text-[10px] ink-text-jade">可交付</span>}
              </div>
              <div className="text-xs ink-text-dim">进度 {t.progress} / {t.count}</div>
              <div className="ink-progress h-1.5 overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${done ? 'bg-[#5a8a6a]' : 'bg-[#c9a063]'}`} style={{ width: `${(t.progress / t.count) * 100}%` }} />
              </div>
              <div className="flex items-center gap-3 text-xs ink-text-dim">
                <span>酬劳</span>
                <span className="ink-text-gold">🪙 {fmt(t.rewardCoins)}</span>
                <span className="ink-text-jade">🎫 {t.rewardTokens}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => game.rerollTask(t.id)}
                  disabled={(state.inventory.token ?? 0) < 1}
                  className="ink-btn rounded px-3 py-1 text-xs"
                  title="消耗 1 枚武林令"
                >
                  🗑 刷新
                </button>
                {done ? (
                  <button
                    onClick={() => game.claimTask(t.id)}
                    className="ink-btn-green ml-auto rounded px-5 py-1 text-xs"
                  >
                    交付
                  </button>
                ) : (
                  <button
                    onClick={() => setView({ type: 'skill', skill: t.skill })}
                    className="ink-btn ml-auto rounded px-5 py-1 text-xs"
                  >
                    前往
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
