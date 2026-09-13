import { useState } from 'react'
import { AFFIXES, ITEMS, SKILLS, STYLES, affixDesc, fmt, itemUsage, type ItemCategory } from '../game/data'
import { game, useGame, marketValue } from '../game/engine'

const TABS = ['行囊', '装备', '招式', '宅邸', '配置'] as const

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  currency: '货币',
  food: '食物',
  pill: '丹药',
  material: '材料',
  weapon: '武器',
  armor: '防具',
  amulet: '饰品',
  stone: '强化材料',
  manual: '秘籍',
  special: '奇珍',
}

const CATEGORY_ORDER: ItemCategory[] = ['currency', 'food', 'pill', 'material', 'weapon', 'armor', 'amulet', 'stone', 'manual', 'special']

function ItemCell({ id, count }: { id: string; count: number }) {
  const def = ITEMS[id]
  if (!def) return null
  const usable = !!def.heal || !!def.buff || !!def.manual || id === 'chest'
  const equippable = def.category === 'weapon' || def.category === 'armor' || def.category === 'amulet'
  const usage = itemUsage(id) // 用途：被哪些配方消耗
  const title = `${def.name} · 🪙${def.price}${def.heal ? ` · 回血${def.heal === -1 ? '全部' : def.heal}` : ''}${def.buff ? ' · 战斗增益 5 分钟' : ''}${def.atk ? ` · ATK+${def.atk}` : ''}${def.def ? ` · DEF+${def.def}` : ''}${def.manual ? ' · 点击参悟：流派伤害 +3%（上限 5 层）' : ''}${id === 'chest' ? ' · 点击开箱' : ''}${usable && id !== 'chest' && !def.manual ? ' · 点击使用' : ''}${equippable ? ' · 点击装备' : ''}${usage.length ? '\n用途：' + usage.map(u => `[${SKILLS.find(s => s.id === u.skill)?.name ?? ''}]${u.recipe} → ${u.outputs}`).join('\n      ') : ''}`
  return (
    <button
      onClick={() => {
        if (id === 'chest') game.openChest()
        else if (usable) game.eatItem(id)
        else if (equippable) game.equipItem(id)
      }}
      className={`ink-card relative flex h-14 w-14 flex-col items-center justify-center rounded-md ${usable || equippable ? '' : 'cursor-default'}`}
      title={title}
    >
      <span className="text-2xl">{def.icon}</span>
      <span className="absolute bottom-0.5 right-1 text-[10px] ink-text-paper">{fmt(count)}</span>
    </button>
  )
}

function EquipmentTab() {
  const state = useGame()
  const slots = [
    ['weapon', '武器', '🗡️'],
    ['armor', '防具', '🛡️'],
    ['amulet', '饰品', '📿'],
  ] as const
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="mb-2 text-[10px] ink-text-dim">装备上的词缀会叠加生效，卸下后词缀消散</div>
      <div className="space-y-2">
        {slots.map(([slot, label, icon]) => {
          const eq = state.equipment[slot]
          const def = eq ? ITEMS[eq.item] : null
          return (
            <div key={slot} className="ink-card rounded-md p-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{def?.icon ?? icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs ink-text-paper">{def ? `${def.name}${eq!.plus ? ` +${eq!.plus}` : ''}` : `未装备${label}`}</div>
                  <div className="text-[10px] ink-text-dim">{def?.atk ? `ATK +${def.atk + (eq?.plus ?? 0) * 2}` : def?.def ? `DEF +${def.def + (eq?.plus ?? 0)}` : '等待秘境饰品'}</div>
                </div>
                {eq && <button onClick={() => game.unequip(slot)} className="ink-btn-red rounded px-2 py-0.5 text-[10px]">卸下</button>}
              </div>
              {eq?.affixes && (
                <div className="mt-1 space-y-0.5 border-t border-[#c9a063]/15 pt-1">
                  {eq.affixes.map((affix, index) => {
                    const cursed = AFFIXES.find(a => a.id === affix.id)?.curse
                    return <div key={`${affix.id}-${index}`} className={`text-[9px] ${cursed ? 'ink-text-red' : 'ink-text-jade'}`}>{cursed ? '💀' : '✦'} {affixDesc(affix)}</div>
                  })}
                  {(eq.fractures ?? 0) > 0 && <div className="text-[9px] ink-text-red">裂痕 {eq.fractures}/3</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StylesTab() {
  const state = useGame()
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="space-y-2">
        {STYLES.map(style => (
          <div key={style.id} className="ink-card rounded-md p-2">
            <div className="flex items-center justify-between text-xs ink-text-paper"><span>{style.icon} {style.name}</span><span className="ink-text-gold">Lv.{state.skills[style.id].level}</span></div>
            <div className="mt-1 text-[10px] ink-text-jade">{style.signature}</div>
            <div className="mt-1 space-y-0.5">
              {style.abilities.map(a => <div key={a.name} className={`text-[9px] ${state.skills[style.id].level >= a.level ? 'ink-text-gold' : 'ink-text-dim opacity-50'}`}>{state.skills[style.id].level >= a.level ? '◆' : '◇'} {a.name} · {a.desc}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileTab() {
  const state = useGame()
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="ink-card rounded-md p-3 text-xs">
        <div className="mb-2 ink-text-gold">🏯 侠客宅邸</div>
        <div className="space-y-1.5 ink-text-dim">
          <div className="flex justify-between"><span>总等级</span><span className="ink-text-paper">{Object.values(state.skills).reduce((sum, skill) => sum + skill.level, 0)}</span></div>
          <div className="flex justify-between"><span>生涯击杀</span><span className="ink-text-paper">{fmt(state.kills)}</span></div>
          <div className="flex justify-between"><span>累计制造</span><span className="ink-text-paper">{fmt(state.crafted)}</span></div>
          <div className="flex justify-between"><span>秘境最高</span><span className="ink-text-paper">{state.highestFloor} 层</span></div>
          <div className="flex justify-between"><span>轮回次数</span><span className="ink-text-paper">{state.rebirths}</span></div>
        </div>
      </div>
    </div>
  )
}

function ConfigTab() {
  const state = useGame()
  const autoCraftCount = Object.values(state.autoCraft).filter(Boolean).length
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="ink-card rounded-md p-3 text-xs">
        <div className="mb-2 ink-text-gold">⚙️ 放置配置</div>
        <div className="space-y-1.5 ink-text-dim">
          <div className="flex justify-between"><span>自动制造</span><span className={autoCraftCount ? 'ink-text-jade' : 'ink-text-dim'}>{autoCraftCount} 项运行中</span></div>
          <div className="flex justify-between"><span>自动战斗</span><span className={state.autoCombat ? 'ink-text-jade' : 'ink-text-dim'}>{state.autoCombat ? '已开启' : '未开启'}</span></div>
          <div className="mt-2 border-t border-[#c9a063]/15 pt-2 text-[10px]">自动制造可在各制造技能页开启，自动战斗可在江湖页选择目标。</div>
        </div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const state = useGame()
  const [tab, setTab] = useState<(typeof TABS)[number]>('行囊')
  const [filter, setFilter] = useState('')

  const groups = CATEGORY_ORDER.map(cat => ({
    cat,
    items: Object.entries(state.inventory).filter(([id, n]) => {
      const def = ITEMS[id]
      return def && def.category === cat && n > 0 && (!filter || def.name.includes(filter))
    }),
  })).filter(g => g.items.length > 0)

  return (
    <div className="ink-panel flex h-full flex-col border-l">
      <div className="flex border-b ink-divider">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-1 py-2 text-[11px] ${tab === t ? 'bg-[#c9a063]/15 ink-text-gold' : 'ink-text-dim hover:bg-white/5'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '装备' ? <EquipmentTab /> : tab === '招式' ? <StylesTab /> : tab === '宅邸' ? <ProfileTab /> : tab === '配置' ? <ConfigTab /> : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="筛选物品"
              className="ink-input w-full rounded px-2 py-1 text-xs"
            />
            <span className="whitespace-nowrap text-[10px] ink-text-dim">总值 {fmt(marketValue(state))}</span>
          </div>
          {groups.map(g => (
            <div key={g.cat} className="mt-3">
              <div className="mb-1.5 text-xs ink-text-gold">{CATEGORY_LABEL[g.cat]}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map(([id, n]) => <ItemCell key={id} id={id} count={n} />)}
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="mt-8 text-center text-xs ink-text-dim">空空如也</div>}
        </div>
      )}
    </div>
  )
}
