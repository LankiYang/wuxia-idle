import { SKILLS, xpToNext } from '../game/data'
import { useGame } from '../game/engine'
import type { View } from '../App'

export default function SkillStrip({ view, setView }: { view: View; setView: (v: View) => void }) {
  const state = useGame()
  return (
    <div className="ink-panel flex gap-1.5 overflow-x-auto border-b px-3 py-2">
      {SKILLS.map(s => {
        const st = state.skills[s.id]
        const pct = Math.min(100, (st.xp / xpToNext(st.level)) * 100)
        const isCombat = s.group === 'combat'
        const active = isCombat ? view.type === 'combat' : view.type === 'skill' && view.skill === s.id
        // 升级动画：最近一次升级该技能的事件时间作为重挂载 key
        const lastUp = state.levelUpEvents.filter(e => e.skill === s.id).slice(-1)[0]
        return (
          <button
            key={s.id}
            onClick={() => setView(isCombat ? { type: 'combat' } : { type: 'skill', skill: s.id })}
            title={`${s.name} Lv.${st.level}`}
            className={`flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-sm px-1 py-1.5 transition-colors ${
              active ? 'ink-card active' : 'hover:bg-white/5'
            }`}
          >
            <span className="text-lg leading-none">{s.icon}</span>
            <span className="text-[10px] ink-text-paper">{s.name} <span key={lastUp ? `lvl-${lastUp.time}` : ''} className={`ink-text-gold ${lastUp ? 'skill-level-up' : ''}`}>{st.level}</span></span>
            <span className="ink-progress block h-1 w-full overflow-hidden rounded-full">
              <span
                className={`block h-full rounded-full ${isCombat ? 'bg-[#d4504a]' : 'bg-[#c9a063]'}`}
                style={{ width: `${pct}%` }}
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}
