import { useState } from 'react'
import { HERO_SPRITE } from '../game/sprites'
import { game, useGame, type SlotMeta } from '../game/engine'

// ── 选槽页：5 个存档槽，信息卡展示，可新建/进入/删除 ─────────────────────────
export default function SlotSelectView() {
  const state = useGame() // 触发订阅，activeSlotId 变化时重渲染
  const slots = game.listSlots()
  const [editing, setEditing] = useState<number | null>(null) // 正在输入名字的槽下标
  const [name, setName] = useState('')
  void state

  const create = (idx: number) => {
    if (editing === idx && name.trim()) {
      game.createSlot(name.trim())
      setEditing(null)
      setName('')
    } else {
      setEditing(idx)
      setName('')
    }
  }

  return (
    <div className="ink-bg flex h-screen w-screen flex-col items-center justify-center overflow-hidden p-6 ink-text-paper">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="ink-seal flex h-12 w-12 items-center justify-center rounded-sm font-brush text-2xl">侠</div>
          <h1 className="font-brush text-5xl leading-none ink-text-gold">武林闲侠传</h1>
        </div>
        <p className="mt-3 text-sm ink-text-dim">选择你的江湖 · 共 5 个存档位</p>
      </div>

      {/* 槽位网格 */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => {
          const meta = slots[i]
          return meta
            ? <OccupiedSlot key={meta.id} meta={meta} />
            : (
              <button key={i} onClick={() => create(i)}
                className="ink-card group flex min-h-44 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#c9a063]/25 p-4 transition-all hover:border-[#c9a063]/60 hover:bg-[#2a2113]/60">
                {editing === i ? (
                  <input
                    autoFocus
                    value={name}
                    placeholder="名号？"
                    maxLength={8}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') create(i) }}
                    onClick={e => e.stopPropagation()}
                    className="w-full rounded border border-[#c9a063]/40 bg-[#241d11] px-2 py-1 text-center text-sm text-[#e8dfc9] outline-none"
                  />
                ) : (
                  <>
                    <span className="text-4xl opacity-50 transition-opacity group-hover:opacity-100">+</span>
                    <span className="text-sm ink-text-dim group-hover:ink-text-paper">开创江湖</span>
                  </>
                )}
              </button>
            )
        })}
      </div>

      <div className="mt-8 text-[10px] ink-text-dim">武侠放置 · v8 多存档 · 进度存于本地浏览器</div>
    </div>
  )
}

function OccupiedSlot({ meta }: { meta: SlotMeta }) {
  const [deleting, setDeleting] = useState(false)
  const display = game.slotDisplay(meta)
  const time = new Date(meta.updatedAt)
  const timeStr = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

  return (
    <div className="ink-card flex min-h-44 flex-col rounded-md p-4 transition-transform hover:scale-[1.02]">
      {/* 头像 + 名字 */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#3a4a43] to-[#1c2825]">
          <img src={HERO_SPRITE} alt="" className="h-11 w-11 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-brush text-lg ink-text-paper">{meta.name}</div>
          <div className="text-[10px] ink-text-dim">{timeStr}</div>
        </div>
      </div>

      {/* 信息行 */}
      <div className="mt-3 flex-1 space-y-1 text-[10px] ink-text-dim">
        <div>总等级 <span className="ink-text-gold">{display.totalLevel}</span> · {display.titleName}</div>
        <div>秘境最高 <span className="ink-text-gold">{display.highestFloor}</span> 层</div>
      </div>

      {/* 操作 */}
      <div className="mt-3 flex items-center gap-1.5">
        <button onClick={() => game.enterSlot(meta.id)} className="ink-btn flex-1 rounded px-2 py-1.5 text-xs">进入江湖</button>
        {deleting ? (
          <>
            <button onClick={() => { game.deleteSlot(meta.id); setDeleting(false) }} className="ink-btn-red rounded px-2 py-1.5 text-xs">确认删</button>
            <button onClick={() => setDeleting(false)} className="ink-card rounded px-2 py-1.5 text-xs ink-text-dim">取消</button>
          </>
        ) : (
          <button onClick={() => setDeleting(true)} className="rounded px-2 py-1.5 text-xs opacity-50 hover:opacity-100 hover:bg-white/5" title="删除此存档">🗑️</button>
        )}
      </div>
    </div>
  )
}