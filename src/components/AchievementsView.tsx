import { ACHIEVEMENTS } from '../game/data'
import { game, useGame } from '../game/engine'

const GROUPS: { title: string; ids: string[] }[] = [
  { title: '🌱 技能境界', ids: ['sk10', 'sk20', 'sk30', 'sk40', 'sk50', 'sk60'] },
  { title: '🏯 江湖声望', ids: ['tl50', 'tl150', 'tl300', 'tl500', 'tl800'] },
  { title: '⚔️ 战斗', ids: ['kill100', 'kill1k', 'kill10k', 'kill100k'] },
  { title: '💰 财富', ids: ['rich10k', 'rich1m', 'rich100m'] },
  { title: '🔨 制造', ids: ['craft100', 'craft2k', 'craft20k'] },
  { title: '🌀 秘境', ids: ['lab10', 'lab30', 'lab60', 'lab100'] },
  { title: '♾️ 轮回', ids: ['re1', 're3', 're7'] },
]

export default function AchievementsView() {
  const state = useGame()
  const unlocked = new Set(state.unlockedAchievements)
  const total = ACHIEVEMENTS.length

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">🏆 武林成就</h2>
      <p className="mb-4 text-center text-xs ink-text-dim">
        已达成 {unlocked.size} / {total} · 达成即永久生效，轮回不灭
      </p>

      <div className="mx-auto max-w-2xl space-y-4">
        {GROUPS.map(g => (
          <div key={g.title} className="ink-panel rounded-md p-4">
            <div className="mb-2 text-sm ink-text-gold">{g.title}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.ids.map(id => {
                const a = ACHIEVEMENTS.find(x => x.id === id)!
                const done = unlocked.has(id)
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 ${done ? 'ink-card active' : 'ink-card opacity-45'}`}
                    title={done ? `已达成 · ${a.bonus}` : '未达成'}
                  >
                    <span className="text-xl">{done ? a.icon : '🔒'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs ink-text-paper">{a.name}</div>
                      <div className="text-[10px] ink-text-dim">{a.desc}</div>
                    </div>
                    <span className={`whitespace-nowrap text-[10px] ${done ? 'ink-text-jade' : 'ink-text-dim'}`}>
                      {a.bonus}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-4 max-w-2xl text-center text-[10px] ink-text-dim">
        当前轮回点 {game.state.rebirthPoints} · 经验加成 ×{game.xpMult().toFixed(2)} · 铜钱加成 ×{game.coinMult().toFixed(2)}
      </div>
    </div>
  )
}
