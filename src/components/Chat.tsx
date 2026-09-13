import { useEffect, useRef, useState } from 'react'
import { CHAT_CHANNELS, FAKE_CHAT } from '../game/data'
import { game, useGame } from '../game/engine'

export default function Chat() {
  const state = useGame()
  const [channel, setChannel] = useState('江湖')
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const m = FAKE_CHAT[Math.floor(Math.random() * FAKE_CHAT.length)]
      game.sendChat(m.channel, m.user, m.text)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const messages = state.chat.filter(m => m.channel === channel).slice(-40)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = () => {
    const text = input.trim()
    if (!text) return
    game.sendChat(channel, 'xbei', text)
    setInput('')
  }

  return (
    <div className="ink-panel flex flex-col border-t">
      <div className="flex items-center gap-1 px-2 pt-1.5">
        {CHAT_CHANNELS.map(c => (
          <button
            key={c}
            onClick={() => { setChannel(c); setCollapsed(false) }}
            className={`rounded-t px-2.5 py-1 text-xs ${
              channel === c && !collapsed ? 'bg-[#c9a063]/15 ink-text-gold' : 'ink-text-dim hover:bg-white/5'
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto px-2 text-xs ink-text-dim hover:ink-text-gold"
          title={collapsed ? '展开' : '收起'}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="h-32 overflow-y-auto px-3 py-1.5 text-xs leading-5">
            {messages.length === 0 && (
              <div className="ink-text-dim">提示：欢迎来到「{channel}」频道，江湖儿女，随便聊聊。</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className="ink-text-paper">
                <span className="ink-text-dim">[{m.time}]</span>{' '}
                <span className={m.user === 'xbei' ? 'ink-text-gold' : 'ink-text-red'}>{m.user}</span>：{m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 px-3 pb-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="说点什么…"
              className="ink-input flex-1 rounded px-2 py-1 text-xs"
            />
            <button onClick={send} className="ink-btn rounded px-4 py-1 text-xs">
              发送
            </button>
          </div>
        </>
      )}
    </div>
  )
}
