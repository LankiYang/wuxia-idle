import { LAB_BLESSINGS, LAB_SHOP, STYLES, fmt, labCoinReward, labMonster } from '../game/data'
import { game, useGame } from '../game/engine'
import { labMonsterSprite } from '../game/sprites'
import BattleStage from './BattleStage'

export default function LabyrinthView() {
  const state = useGame()
  const battle = state.battle
  const inLab = battle?.labFloor != null
  const floor = state.labFloor
  const next = labMonster(floor)
  const injured = state.playerHp <= game.maxHp() * 0.2

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <h2 className="mb-1 text-center font-brush text-3xl ink-text-gold">🌀 秘境爬塔</h2>
      <p className="mb-4 text-center text-xs ink-text-dim">
        层层递进，永无止境 · 每 5 层镇守魔君 · 秘境币可换永久心得与饰品
      </p>

      {/* 层数状态 */}
      <div className="ink-panel mx-auto mb-5 max-w-2xl rounded-md p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="ink-text-paper">🪷 秘境币 <span className="ink-text-gold">{fmt(state.inventory.labCoin ?? 0)}</span></span>
          <span className="text-xs ink-text-dim">生涯最高 {state.highestFloor} 层</span>
        </div>

        {/* 当前战斗 or 下一层预览 */}
        {inLab && battle ? (
          <div className="mt-3">
            <BattleStage variant="lab" />
            {/* 已选祝福徽章 */}
            {(battle.blessings?.length ?? 0) > 0 && (
              <div className="mb-3 flex flex-wrap justify-center gap-1.5">
                {battle.blessings!.map(id => {
                  const bl = LAB_BLESSINGS.find(x => x.id === id)
                  return bl ? (
                    <span key={id} className="ink-card rounded px-1.5 py-0.5 text-[10px] ink-text-jade" title={bl.desc}>
                      {bl.icon} {bl.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="ink-card mt-3 rounded-md p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-lg">
                <img src={labMonsterSprite(floor)} alt={next.name} className="inline-block h-8 w-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                <span className="ink-text-paper">{next.name}</span>
              </span>
              {next.isBoss && <span className="rounded bg-[#722a26]/60 px-2 py-0.5 text-[10px] ink-text-red">魔君镇守</span>}
            </div>
            <div className="mb-1 text-[10px] ink-text-dim">HP {fmt(next.hp)} · ATK {next.atk} · DEF {next.def}</div>
            <div className="mb-3 text-[10px] ink-text-dim">
              首通奖励 🪷{labCoinReward(floor)} 秘境币 · 🪙{fmt(20 + floor * 8)} 铜钱{next.isBoss ? ' · 50% 掉宝箱' : ''}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  disabled={!!battle || injured}
                  onClick={() => game.startLabBattle(s.id)}
                  className="ink-btn rounded px-2 py-0.5 text-[11px]"
                  title={`以${s.name}出战（Lv.${state.skills[s.id].level}）`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
            {injured && <div className="mt-2 text-[10px] ink-text-red">🧘 身受重伤，打坐回气中…</div>}
          </div>
        )}
      </div>

      {/* 三选一祝福 */}
      {state.labOffer && inLab && (
        <div className="mx-auto mb-5 max-w-2xl rounded-md border border-[#c9a063]/50 bg-[#2a2113]/90 p-4">
          <div className="mb-2 text-center text-sm ink-text-gold">✨ 秘境顿悟 · 三选一祝福（本次爬塔生效）</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {state.labOffer.map(id => {
              const bl = LAB_BLESSINGS.find(x => x.id === id)!
              return (
                <button
                  key={id}
                  onClick={() => game.chooseBlessing(id)}
                  className="ink-card rounded-md p-3 text-center transition-transform hover:scale-[1.03]"
                >
                  <div className="text-2xl">{bl.icon}</div>
                  <div className="mt-1 text-xs ink-text-paper">{bl.name}</div>
                  <div className="mt-0.5 text-[10px] ink-text-dim">{bl.desc}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 秘境商店 */}
      <div className="ink-panel mx-auto mb-6 max-w-2xl rounded-md p-4">
        <div className="mb-2 text-sm ink-text-gold">🏮 秘境商店 <span className="text-[10px] ink-text-dim">心得永久生效 · 饰品限购一件</span></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LAB_SHOP.map(item => {
            const bought = state.labShopBought[item.id] ?? 0
            const cost = game.labShopCost(item.id)
            const soldOut = item.growth === 0 && bought >= 1
            return (
              <div key={item.id} className="ink-card flex items-center gap-2 rounded-md px-3 py-2">
                <span className="text-xl">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs ink-text-paper">
                    {item.name}{bought > 0 && item.growth > 0 ? <span className="ink-text-gold"> ×{bought}</span> : ''}
                  </div>
                  <div className="text-[10px] ink-text-dim">{item.desc}</div>
                </div>
                <button
                  disabled={soldOut}
                  onClick={() => game.buyLabShop(item.id)}
                  className={`rounded px-2 py-1 text-[10px] ${soldOut ? 'ink-btn-red opacity-50' : 'ink-btn'}`}
                >
                  {soldOut ? '已购得' : `🪷${cost}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
