import { ACTIONS, ITEMS, MONSTERS, TITLES, titleFor } from '../game/data'
import { currentSlotName, game, nextGuides, playerPower, totalLevel, useGame, type Guide } from '../game/engine'
import { leaderboard, metricsOf } from '../game/leaderboard'
import { HERO_SPRITE } from '../game/sprites'
import type { View } from '../App'

// ── 数字格式化（复用 data.fmt 逻辑避免重复引入）──
function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 10_000) return (n / 1000).toFixed(0) + 'K'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return Math.floor(n).toString()
}

/** 14 天排名 sparkline:单序列折线,Y 轴反向(第 1 名在顶),端点标记+首尾直标,逐点 title 提示 */
function RankSparkline({ hist, boardSize }: { hist: { day: number; rank: number }[]; boardSize: number }) {
  const W = 220, H = 56, PAD = 6
  if (hist.length < 2) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="排名趋势(数据收集中)">
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize={10}>趋势收集中…明日再看</text>
      </svg>
    )
  }
  const n = hist.length
  const x = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2)
  const y = (rank: number) => PAD + ((rank - 1) / Math.max(1, boardSize - 1)) * (H - PAD * 2)
  const pts = hist.map((h, i) => `${x(i).toFixed(1)},${y(h.rank).toFixed(1)}`).join(' ')
  const first = hist[0], last = hist[n - 1]
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`近14天战力排名趋势,从第${first.rank}位到第${last.rank}位`}>
      <line x1={PAD} y1={y(1)} x2={W - PAD} y2={y(1)} stroke="#ffffff" strokeOpacity={0.08} strokeDasharray="3 3" />
      <polyline points={pts} fill="none" stroke="#b8860b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(last.rank)} r={3.5} fill="#b8860b" />
      <text x={PAD} y={10} fill="#94a3b8" fontSize={9}>#{first.rank}</text>
      <text x={W - PAD} y={Math.max(10, y(last.rank) - 6)} textAnchor="end" fill="#c9a063" fontSize={10} fontWeight={700}>#{last.rank}</text>
      {hist.map((h, i) => (
        <circle key={h.day} cx={x(i)} cy={y(h.rank)} r={8} fill="transparent">
          <title>{`第 ${h.day + 1} 天 · 第 ${h.rank} 位`}</title>
        </circle>
      ))}
    </svg>
  )
}

/** 悬赏目标描述：动作 or 怪物 */
function dailyDesc(actionId: string): { icon: string; name: string; type: string } {
  const action = ACTIONS.find(a => a.id === actionId)
  if (action) {
    const item = ITEMS[action.outputs[0].item]
    return { icon: item?.icon ?? action.icon, name: action.name, type: action.skill === 'hunting' || action.skill === 'fishing' || action.skill === 'herbalism' || action.skill === 'mining' || action.skill === 'woodcutting' ? '采集' : '制造' }
  }
  const m = MONSTERS.find(x => x.id === actionId)
  if (m) return { icon: m.icon, name: m.name, type: '击杀' }
  return { icon: '❓', name: actionId, type: '' }
}

export default function HomeView({ setView }: { setView: (v: View) => void }) {
  const state = useGame()
  const tl = totalLevel(state)
  const title = titleFor(tl)
  const maxHp = game.maxHp()
  const atk = game.playerAtk()
  const def = game.playerDef()
  const guides = nextGuides(state)
  const power = playerPower(state)
  // 原生英雄榜:真实名次(增长曲线榜,非镜像)
  const lbReady = game.activeSlotId != null
  if (lbReady && leaderboard.slot !== game.activeSlotId) leaderboard.load(game.activeSlotId!)
  const lbP = metricsOf(state)
  const lbNow = Date.now()
  const lbRanks = lbReady ? leaderboard.ranks(lbP, lbNow) : null
  const lbHist = leaderboard.history14()
  const lbNem = lbReady ? leaderboard.nemesis(lbP, lbNow) : null
  const lbTop3 = lbReady ? leaderboard.standings('power', lbP, lbNow).slice(0, 3) : []
  const lbPrev = lbHist.length > 1 ? lbHist[lbHist.length - 2].rank : (lbRanks?.power ?? 0)
  const lbDelta = (lbRanks ? lbPrev - lbRanks.power : 0)
  const daily = state.daily

  // 四条成长线：采集 / 制造 / 战斗 / 秘境·轮回
  const gatherAvg = (['herbalism', 'mining', 'woodcutting', 'hunting', 'fishing'] as const)
    .reduce((s, id) => s + state.skills[id].level, 0) / 5
  const craftAvg = (['alchemy', 'smithing', 'cooking', 'tailoring', 'enhancing'] as const)
    .reduce((s, id) => s + state.skills[id].level, 0) / 5
  const combatAvg = (['attack', 'defense', 'hp'] as const)
    .reduce((s, id) => s + state.skills[id].level, 0) / 3

  const Lines = [
    { icon: '⛏️', label: '采集', pct: Math.min(100, gatherAvg / 60 * 100), detail: `${gatherAvg.toFixed(0)} 级均` },
    { icon: '🔨', label: '制造', pct: Math.min(100, craftAvg / 60 * 100), detail: `${craftAvg.toFixed(0)} 级均` },
    { icon: '⚔️', label: '战斗', pct: Math.min(100, combatAvg / 60 * 100), detail: `${combatAvg.toFixed(0)} 级均` },
    { icon: '🌀', label: '秘境', pct: Math.min(100, state.highestFloor / 100 * 100), detail: `Lv.${state.highestFloor} · 轮回 ${state.rebirths} 次` },
  ]

  const go = (to: Guide['to']) => {
    if (to.type === 'skill') setView({ type: 'skill', skill: to.skill as never })
    else if (to.type === 'lab') setView({ type: 'lab' })
    else if (to.type === 'combat') setView({ type: 'combat' })
    else if (to.type === 'market') setView({ type: 'market' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* ── 侠客缘起：身份卡 ── */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl overflow-hidden rounded-md">
        <div className="flex items-center gap-5 p-4">
          {/* 立绘 */}
          <div className="relative h-36 w-28 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9a063]/25 to-transparent blur-sm" />
            <img
              src={HERO_SPRITE}
              alt="侠客立绘"
              className="hero-float relative h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="title-badge-pulse absolute -left-1 top-1 rounded bg-[#d4504a]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">Lv.{tl}</span>
          </div>
          {/* 信息 */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-xs ink-text-jade">{title.icon}</span>
              <h2 className="truncate font-brush text-3xl leading-none ink-text-gold">{title.name} · {currentSlotName()}</h2>
            </div>
            <div className="text-[11px] ink-text-dim">下一名号：{tl < 1200 ? nextTitleHint(tl) : '已达传说之巅'}</div>

            {/* 属性四格 */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="气血" value={fmt(maxHp)} icon="❤️" />
              <Stat label="攻击" value={fmt(atk)} icon="⚔️" />
              <Stat label="防御" value={fmt(def)} icon="🛡️" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="ink-text-gold">江湖战力 {fmt(power)}</span>
              <span className="ink-card rounded px-2 py-0.5 text-[10px] ink-text-jade">
                🏮 江湖第 {lbRanks?.power ?? '—'} 位
                {lbDelta > 0 ? <span className="ml-1 text-[#34d399]">↑{lbDelta}</span> : lbDelta < 0 ? <span className="ml-1 text-[#f87171]">↓{-lbDelta}</span> : null}
              </span>
              <button onClick={() => setView({ type: 'leaderboard' })} className="ink-btn rounded px-2 py-0.5 text-[10px]">英雄榜</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 江湖英雄榜面板:名次趋势 + 宿敌 + 三甲 ── */}
      {lbRanks && (
        <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[150px] flex-1">
              <div className="text-[11px] ink-text-dim">🏮 江湖英雄榜 · 战力</div>
              <div className="text-xl font-bold ink-text-gold">
                第 {lbRanks.power} 位
                <span className="ml-1 text-[11px] font-normal">
                  {lbDelta > 0 ? <span className="text-[#34d399]">↑{lbDelta}</span> : lbDelta < 0 ? <span className="text-[#f87171]">↓{-lbDelta}</span> : <span className="ink-text-dim">—</span>}
                </span>
                <span className="ml-1 text-[10px] font-normal ink-text-dim">/ 共 {lbTop3.length ? 21 : 0} 人</span>
              </div>
              <div className="mt-0.5 text-[10px] ink-text-dim">秘境 第 {lbRanks.lab} 位 · 财富 第 {lbRanks.wealth} 位</div>
            </div>
            <RankSparkline hist={lbHist} boardSize={21} />
          </div>
          <div className="mt-1.5 text-[11px] ink-text-paper">
            {lbNem
              ? lbNem.gap > 0
                ? <>⚔️ 宿敌 {lbNem.entry.icon} <b className="ink-text-gold">{lbNem.entry.name}</b> 就在上一位,还差 <b className="ink-text-gold">{fmt(lbNem.gap)}</b> 战力——追上他!</>
                : <>⚔️ 宿敌 {lbNem.entry.icon} <b className="ink-text-gold">{lbNem.entry.name}</b> 已被你踩在身后,寻找下一个目标…</>
              : <>👑 天下无敌——英雄榜上再无人在你之上。</>}
          </div>
          <div className="mt-1.5 flex gap-4 text-[10px] ink-text-dim">
            {lbTop3.map((e, i) => (
              <span key={e.name}>{['🥇', '🥈', ''][i]} {e.icon} {e.name} <span className="ink-text-gold">{fmt(e.value)}</span></span>
            ))}
          </div>
        </div>
      )}

      {/* ── 今日行侠：每日悬赏 ── */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs ink-text-gold">📌 今日行侠 <span className="ink-text-dim">（每日重置）</span></span>
          {daily && <span className="text-[10px] ink-text-dim">{daily.date}</span>}
        </div>
        <div className="space-y-2">
          {(daily?.quests ?? []).map((q, i) => {
            const d = dailyDesc(q.actionId)
            const done = q.progress >= q.count
            const claimed = q.claimed
            return (
              <div key={i} className={`ink-card flex items-center gap-3 rounded-md px-3 py-2 ${claimed ? 'opacity-40' : done ? 'border-[#5a8a6a]/60' : ''}`}>
                <span className="text-xl">{d.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs ink-text-paper">
                    {d.type}「{d.name}」<span className="ink-text-dim">×{q.count}</span>
                    {claimed && <span className="ml-2 text-[10px] ink-text-jade">已领取 ✓</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="ink-progress h-1.5 flex-1 overflow-hidden rounded-full">
                      <div className={`h-full rounded-full ${done ? 'bg-gradient-to-r from-[#3f7348] to-[#5a8a6a]' : 'bg-gradient-to-r from-[#8a6d3b] to-[#c9a063]'}`} style={{ width: `${Math.min(100, q.progress / q.count * 100)}%` }} />
                    </div>
                    <span className="text-[10px] ink-text-dim">{Math.min(q.progress, q.count)}/{q.count}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right text-[10px] ink-text-dim">
                  <div>🪙{fmt(q.rewardCoins)}</div>
                  {q.rewardTokens > 0 && <div>🎫×{q.rewardTokens}</div>}
                </div>
                <button
                  disabled={!done || claimed}
                  onClick={() => game.claimDaily(i)}
                  className={`rounded px-3 py-1 text-xs ${claimed ? 'ink-text-dim' : done ? 'ink-btn !bg-[#35573f] !text-white' : 'ink-card ink-text-dim'}`}
                >
                  {claimed ? '已领' : done ? '领取' : `${Math.max(0, q.count - q.progress)}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 四条成长线 ── */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
        <div className="mb-2 text-xs ink-text-gold">🗺️ 成长之路</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Lines.map(l => (
            <button key={l.label} onClick={() => {
              if (l.label === '采集') setView({ type: 'skill', skill: 'herbalism' })
              else if (l.label === '制造') setView({ type: 'skill', skill: 'smithing' })
              else if (l.label === '战斗') setView({ type: 'combat' })
              else setView({ type: 'lab' })
            }} className="ink-card rounded-md px-3 py-2 text-left transition-transform hover:scale-[1.01]">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="ink-text-paper">{l.icon} {l.label}</span>
                <span className="text-[10px] ink-text-dim">{l.detail}</span>
              </div>
              <div className="ink-progress h-2 overflow-hidden rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8a6d3b] to-[#c9a063] transition-all" style={{ width: `${l.pct}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 下一步建议 ── */}
      {guides.length > 0 && (
        <div className="ink-panel mx-auto mb-6 max-w-2xl rounded-md p-4">
          <div className="mb-2 text-xs ink-text-gold">🧭 下一步</div>
          <div className="space-y-1.5">
            {guides.map((g, i) => (
              <button key={i} onClick={() => go(g.to)}
                className="flex w-full items-center gap-2 rounded-md border border-[#c9a063]/15 px-3 py-2 text-left text-xs ink-text-paper transition-colors hover:bg-white/5">
                <span>{g.icon}</span>
                <span className="flex-1">{g.text}</span>
                <span className="ink-text-dim">前往 →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="ink-card rounded-md px-2 py-1.5">
      <div className="text-[9px] ink-text-dim">{icon} {label}</div>
      <div className="text-sm font-bold ink-text-paper">{value}</div>
    </div>
  )
}

function nextTitleHint(tl: number): string {
  const next = TITLES.find(t => t.minTotalLevel > tl)
  if (!next) return '已达传说之巅'
  return `总等级 ${next.minTotalLevel} 达成「${next.name}」`
}