import { useState } from 'react'
import { ITEMS, MARKET_BUYABLE, fmt } from '../game/data'
import { game, useGame } from '../game/engine'

export default function MarketView() {
  const state = useGame()
  const [tab, setTab] = useState<'sell' | 'buy' | 'salvage'>('sell')
  const sellable = Object.values(ITEMS).filter(d => d.category !== 'currency' && (state.inventory[d.id] ?? 0) > 0)
  const buyable = MARKET_BUYABLE.map(id => ITEMS[id])
  const salvageable = Object.values(ITEMS).filter(d =>
    d.category !== 'currency' && d.category !== 'special' && d.price > 0 && (state.inventory[d.id] ?? 0) > 0,
  )

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">🏪 集市</h2>
      <div className="mb-4 text-center text-sm ink-text-gold">🪙 {fmt(state.inventory.coin ?? 0)} 铜钱</div>

      <div className="mb-4 flex justify-center gap-2">
        {(['sell', 'buy', 'salvage'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-4 py-1 text-sm ${tab === t ? 'ink-btn' : 'ink-card ink-text-dim'}`}
          >
            {t === 'sell' ? '出售（七折回收）' : t === 'buy' ? '购买原料' : '分解炉'}
          </button>
        ))}
      </div>

      {tab === 'salvage' && (
        <div className="mx-auto mb-3 max-w-4xl text-center text-xs ink-text-dim">
          分解返还 40% 市价的铜钱；市价 ≥200 的珍品额外炼出 🔮 玄晶（每 1000 市价 +1）
        </div>
      )}

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {(tab === 'sell' ? sellable : tab === 'buy' ? buyable : salvageable).map(d => {
          const have = state.inventory[d.id] ?? 0
          const sv = tab === 'salvage' ? game.salvageValue(d.id) : null
          return (
            <div key={d.id} className="ink-card flex flex-col items-center gap-1.5 rounded-md p-3">
              <span className="text-3xl">{d.icon}</span>
              <span className="text-sm ink-text-paper">{d.name}</span>
              <span className="text-xs ink-text-dim">
                {tab === 'sell' && `持有 ${fmt(have)} · 🪙${Math.floor(d.price * 0.7)}/个`}
                {tab === 'buy' && `🪙${d.price}/个`}
                {tab === 'salvage' && sv && `持有 ${fmt(have)} · 🪙${sv.coins}${sv.essence > 0 ? ` + 🔮×${sv.essence}` : ''}/个`}
              </span>
              <div className="flex gap-1.5">
                {tab === 'sell' && (
                  <>
                    <button onClick={() => game.sellItem(d.id, 1)} className="ink-btn rounded px-2.5 py-0.5 text-xs">卖 1</button>
                    <button onClick={() => game.sellItem(d.id, 10)} className="ink-btn rounded px-2.5 py-0.5 text-xs">卖 10</button>
                    <button onClick={() => game.sellItem(d.id, have)} className="ink-btn rounded px-2.5 py-0.5 text-xs">全卖</button>
                  </>
                )}
                {tab === 'buy' && (
                  <>
                    <button onClick={() => game.buyItem(d.id, 1)} className="ink-btn-green rounded px-2.5 py-0.5 text-xs">买 1</button>
                    <button onClick={() => game.buyItem(d.id, 10)} className="ink-btn-green rounded px-2.5 py-0.5 text-xs">买 10</button>
                  </>
                )}
                {tab === 'salvage' && (
                  <>
                    <button onClick={() => game.salvageItem(d.id)} className="ink-btn rounded px-2.5 py-0.5 text-xs">分解 1</button>
                    <button
                      onClick={() => { for (let i = 0; i < Math.min(have, 10); i++) game.salvageItem(d.id) }}
                      className="ink-btn rounded px-2.5 py-0.5 text-xs"
                    >
                      分解 10
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
        {tab === 'sell' && sellable.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm ink-text-dim">行囊空空，先去采集或打怪吧</div>
        )}
        {tab === 'salvage' && salvageable.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm ink-text-dim">没有可分解的物品</div>
        )}
      </div>
      {tab === 'buy' && (
        <div className="mt-4 text-center text-xs ink-text-dim">集市只出售基础物资，珍稀材料需自行采集或讨伐怪物</div>
      )}
    </div>
  )
}
