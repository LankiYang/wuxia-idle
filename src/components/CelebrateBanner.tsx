import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS, SKILLS, TITLES, titleFor } from '../game/data'
import { useGame, totalLevel } from '../game/engine'

// ── 全站庆祝横幅：成就达成 / 名号晋升时滑入 ──────────────────────────────
interface Banner { key: number; text: string; icon: string }

export default function CelebrateBanner() {
  const state = useGame()
  const [banner, setBanner] = useState<Banner | null>(null)
  const keyRef = useRef(0)
  const prevAchCount = useRef(state.unlockedAchievements.length)
  const prevTitleIdx = useRef(-1)
  const prevLvlUpCount = useRef(state.levelUpEvents.length)

  useEffect(() => {
    // 成就达成检测
    if (state.unlockedAchievements.length > prevAchCount.current) {
      const newly = ACHIEVEMENTS
        .filter(a => state.unlockedAchievements.includes(a.id))
        .slice(prevAchCount.current)[0]
      if (newly) {
        setBanner({ key: ++keyRef.current, text: `成就达成「${newly.name}」· ${newly.bonus}`, icon: '🏆' })
      }
    }
    prevAchCount.current = state.unlockedAchievements.length

    // 名号晋升检测
    const tl = totalLevel(state)
    const title = titleFor(tl)
    const titleIdx = TITLES.findIndex(t => t.name === title.name)
    if (prevTitleIdx.current >= 0 && titleIdx > prevTitleIdx.current) {
      setBanner({ key: ++keyRef.current, text: `晋升名号「${title.name}」`, icon: title.icon })
    }
    prevTitleIdx.current = titleIdx

    // 单技能升级检测（合并到横幅，避免与 notice 重复时无视觉）
    if (state.levelUpEvents.length > prevLvlUpCount.current) {
      const ev = state.levelUpEvents[state.levelUpEvents.length - 1]
      if (ev) {
        // 技能等级隔 5 级才升横幅，普通升级走技能条闪光即可
        if (ev.level % 5 === 0) {
          const sname = SKILLS.find(s => s.id === ev.skill)?.name ?? ev.skill
          setBanner({ key: ++keyRef.current, text: `${title.name} · ${sname} 突破 Lv.${ev.level}！`, icon: '✨' })
        }
      }
    }
    prevLvlUpCount.current = state.levelUpEvents.length
  }, [state])

  if (!banner) return null
  return (
    <div key={banner.key} className="celebrate-banner" onAnimationEnd={() => setBanner(null)}>
      <div className="banner-glow">{banner.icon} {banner.text}</div>
    </div>
  )
}