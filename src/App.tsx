import { useEffect, useState } from 'react'
import Header from './components/Header'
import IconRail from './components/IconRail'
import SkillStrip from './components/SkillStrip'
import HomeView from './components/HomeView'
import SkillView from './components/SkillView'
import TasksView from './components/TasksView'
import MarketView from './components/MarketView'
import CombatView from './components/CombatView'
import LabyrinthView from './components/LabyrinthView'
import LeaderboardView from './components/LeaderboardView'
import AchievementsView from './components/AchievementsView'
import CelebrateBanner from './components/CelebrateBanner'
import SlotSelectView from './components/SlotSelectView'
import Inventory from './components/Inventory'
import Chat from './components/Chat'
import { game, useGame } from './game/engine'
import { startLeaderboardSync } from './game/leaderboard'
import type { SkillId } from './game/data'

export type View =
  | { type: 'home' }
  | { type: 'skill'; skill: SkillId }
  | { type: 'tasks' }
  | { type: 'market' }
  | { type: 'combat' }
  | { type: 'lab' }
  | { type: 'leaderboard' }
  | { type: 'achievements' }
  | { type: 'placeholder'; name: string }

export default function App() {
  useGame() // 订阅：activeSlotId / state 变化时重渲染
  const [view, setView] = useState<View>({ type: 'home' })
  useEffect(() => startLeaderboardSync(), []) // 英雄榜每秒同步 + 超越/宿敌事件通知

  // 未选槽 → 选槽页
  if (game.activeSlotId == null) {
    return <SlotSelectView />
  }

  return (
    <div className="ink-bg flex h-screen w-screen flex-col overflow-hidden ink-text-paper">
      {/* 全站庆祝横幅（成就/名号/5 级突破） */}
      <CelebrateBanner />
      {/* 顶部题名栏 */}
      <Header />

      <div className="flex min-h-0 flex-1">
        {/* 左侧图标导航轨 */}
        <IconRail view={view} setView={setView} />

        {/* 中央区域 */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 横向技能条 */}
          <SkillStrip view={view} setView={setView} />

          {view.type === 'home' && <HomeView setView={setView} />}
          {view.type === 'skill' && <SkillView skill={view.skill} setView={setView} />}
          {view.type === 'tasks' && <TasksView setView={setView} />}
          {view.type === 'market' && <MarketView />}
          {view.type === 'combat' && <CombatView />}
          {view.type === 'lab' && <LabyrinthView />}
          {view.type === 'leaderboard' && <LeaderboardView />}
          {view.type === 'achievements' && <AchievementsView />}
          {view.type === 'placeholder' && (
            <div className="flex flex-1 items-center justify-center">
              <div className="ink-panel rounded-md p-10 text-center">
                <div className="mb-3 text-4xl">🚧</div>
                <div className="font-brush text-2xl ink-text-gold">{view.name}</div>
                <div className="mt-2 text-sm ink-text-dim">此地尚未开放，侠客请回吧</div>
              </div>
            </div>
          )}

          <Chat />
        </div>

        {/* 右侧行囊 */}
        <div className="hidden w-72 lg:block">
          <Inventory />
        </div>
      </div>
    </div>
  )
}
