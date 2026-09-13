import { game } from '../game/engine'
import type { View } from '../App'

const NAV: { icon: string; label: string; view: View }[] = [
  { icon: '🏠', label: '侠客行', view: { type: 'home' } },
  { icon: '🏪', label: '集市', view: { type: 'market' } },
  { icon: '📜', label: '门派任务', view: { type: 'tasks' } },
  { icon: '⚔️', label: '闯荡江湖', view: { type: 'combat' } },
  { icon: '🌀', label: '秘境', view: { type: 'lab' } },
  { icon: '🏮', label: '江湖英雄榜', view: { type: 'leaderboard' } },
  { icon: '🏆', label: '成就', view: { type: 'achievements' } },
]

function sameView(a: View, b: View) {
  if (a.type !== b.type) return false
  if (a.type === 'placeholder' && b.type === 'placeholder') return a.name === b.name
  return true
}

export default function IconRail({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <nav className="ink-panel flex w-16 flex-col items-center gap-1.5 border-r py-3">
      {NAV.map(n => (
        <button
          key={n.label}
          onClick={() => setView(n.view)}
          title={n.label}
          className={`group relative flex h-11 w-11 items-center justify-center rounded-sm text-xl transition-all ${
            sameView(view, n.view) ? 'ink-card active' : 'hover:bg-white/5'
          }`}
        >
          {n.icon}
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded border border-[#c9a063]/30 bg-[#241d11] px-2 py-1 text-xs ink-text-paper opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {n.label}
          </span>
        </button>
      ))}
      <div className="mt-auto">
        <button
          onClick={() => { if (confirm('确定要散功重修？所有进度将清空！')) game.reset() }}
          title="散功重修（重置存档）"
          className="flex h-11 w-11 items-center justify-center rounded-sm text-lg opacity-50 hover:bg-white/5 hover:opacity-100"
        >
          🗑️
        </button>
      </div>
    </nav>
  )
}
