import { useState } from 'react'
import { fmt as dataFmt } from '../game/data'
import { game, useGame } from '../game/engine'
import { leaderboard, LB_KEYS, LB_LABEL, metricsOf, type LeaderBoardKey } from '../game/leaderboard'

// 江湖英雄榜(原生增长曲线版,2026-09-13):
// 群侠各有独立成长曲线,玩家自榜尾攀升;宿敌(恒在上一位)高亮;存储 wuxia-lb-v1-<slot>
export default function LeaderboardView() {
  useGame()
  const [tab, setTab] = useState<LeaderBoardKey>('power')
  const st = game.state
  if (!st || game.activeSlotId == null) return null
  if (leaderboard.slot !== game.activeSlotId) leaderboard.load(game.activeSlotId)
  const P = metricsOf(st)
  const now = Date.now()
  const entries = leaderboard.standings(tab, P, now)
  const nem = leaderboard.nemesis(P, now)
  const playerRank = entries.find(e => e.isPlayer)?.rank ?? 0
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const fmt = (key: LeaderBoardKey, v: number) => (key === 'lab' ? `${v} 层` : dataFmt(v))

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">🏮 江湖英雄榜</h2>
      <p className="mb-4 text-center text-xs ink-text-dim">
        群侠每日精进,逆水行舟 · 本侠客现居 <span className="ink-text-gold">第 {playerRank} 位</span>
      </p>

      {/* 榜单切换 */}
      <div className="mx-auto mb-4 flex max-w-2xl gap-1.5">
        {LB_KEYS.map(k => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs transition-colors ${tab === k ? 'ink-card active border-[#c9a063]/40 text-[#c9a063]' : 'ink-card ink-text-dim hover:text-[#e8dfc9]'}`}
          >
            {{ power: '⚔️', lab: '🌀', wealth: '🪙' }[k]} {LB_LABEL[k]}
          </button>
        ))}
      </div>

      {/* 三甲 */}
      <div className="mx-auto mb-4 grid max-w-2xl grid-cols-3 gap-2">
        {top3.map((e, i) => (
          <div key={e.name} className={`ink-card relative overflow-hidden rounded-md p-3 text-center ${i === 0 ? 'border-[#c9a063]/60 bg-[#241d11]/90' : ''}`}>
            {i === 0 && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8a6d3b] via-[#e8c464] to-[#8a6d3b]" />}
            <div className="text-2xl">{i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'} {e.icon}</div>
            <div className="mt-1 truncate text-xs ink-text-paper">{e.epithet} · {e.name}</div>
            <div className="text-[10px] ink-text-gold">{fmt(tab, e.value)}</div>
          </div>
        ))}
      </div>

      {/* 其余名次（4 名起，含玩家与宿敌高亮） */}
      <div className="ink-panel mx-auto mb-6 max-w-2xl rounded-md p-3">
        <div className="space-y-1">
          {rest.map(e => {
            const isNem = nem != null && e.name === nem.entry.name
            return (
              <div
                key={e.name}
                className={`group flex items-center gap-3 rounded-md px-3 py-1.5 ${e.isPlayer ? 'border border-[#c9a063]/60 bg-[#2a2113]/60' : isNem ? 'border border-[#d4504a]/40 bg-[#d4504a]/10' : 'hover:bg-white/5'}`}
                title={e.flavor}
              >
                <span className={`w-7 text-center text-xs ${e.isPlayer ? 'ink-text-gold' : 'ink-text-dim'}`}>{e.rank}</span>
                <span className="text-lg">{e.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs ink-text-paper">
                    {e.epithet} · {e.name}
                    {e.isPlayer && <span className="ml-2 rounded bg-[#c9a063]/30 px-1.5 py-0.5 text-[9px] ink-text-gold">本侠客</span>}
                    {isNem && <span className="ml-2 rounded bg-[#d4504a]/30 px-1.5 py-0.5 text-[9px] text-[#ff9d94]">宿敌 · 就在上一位</span>}
                  </div>
                  <div className="truncate text-[10px] ink-text-dim opacity-0 transition-opacity group-hover:opacity-100">{e.flavor}</div>
                </div>
                <div className="text-xs ink-text-gold">{fmt(tab, e.value)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 宿敌提示带 */}
      <div className="mx-auto mb-2 flex max-w-2xl items-center gap-3 rounded-md border border-[#c9a063]/15 bg-[#241d11]/40 p-3">
        <span className="text-2xl">{nem ? nem.entry.icon : '👑'}</span>
        <div className="flex-1 text-[10px] ink-text-dim">
          {nem ? (
            <>
              <div className="text-xs ink-text-paper">宿敌:{nem.entry.epithet} · {nem.entry.name} 就在你上一位</div>
              <div className="mt-0.5">还差 {fmt('power', Math.max(0, nem.gap))} 战力——追上去,江湖就会记住你的名字。</div>
            </>
          ) : (
            <>
              <div className="text-xs ink-text-paper">天下无敌——英雄榜上再无人在你之上。</div>
              <div className="mt-0.5">武林之路漫漫,守住第一比登上第一更难。</div>
            </>
          )}
        </div>
        <span className="text-xs ink-text-gold">第 {playerRank} 位</span>
      </div>
    </div>
  )
}
