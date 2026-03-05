'use client'

import { useState, useRef, useEffect } from 'react'
import { GOLF_REACTIONS, type GolfReaction } from '@/lib/golf-reactions'

type ReactionCount = {
  emoji: string
  label: string
  count: number
  reacted: boolean
}

type Props = {
  reactions: ReactionCount[]
  onReact: (reaction: GolfReaction) => void
  onRemoveReaction: (emoji: string) => void
}

export function GolfReactionPicker({ reactions, onReact, onRemoveReaction }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const activeReactions = reactions.filter((r) => r.count > 0)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing reactions */}
      {activeReactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => (r.reacted ? onRemoveReaction(r.emoji) : onReact({ emoji: r.emoji, label: r.label }))}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all hover:scale-105 ${
            r.reacted
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
          title={r.label}
        >
          <span className="text-base">{r.emoji}</span>
          <span className="font-medium text-xs">{r.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
          title="Add reaction"
        >
          <span className="text-base">+</span>
          <span className="text-xs">React</span>
        </button>

        {/* Picker popup */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-72 animate-in fade-in">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Golf Reactions
            </p>
            <div className="grid grid-cols-4 gap-1">
              {GOLF_REACTIONS.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => {
                    onReact(reaction)
                    setShowPicker(false)
                  }}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-emerald-50 transition-colors group"
                  title={reaction.label}
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {reaction.emoji}
                  </span>
                  <span className="text-[10px] text-gray-500 group-hover:text-emerald-700 leading-tight text-center">
                    {reaction.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Quick reaction bar for sending reactions to someone (like "Nice Shot Eli!")
export function QuickReactionBar({ recipientName, onSend }: { recipientName: string; onSend: (reaction: GolfReaction) => void }) {
  const [sent, setSent] = useState<string | null>(null)

  const handleSend = (reaction: GolfReaction) => {
    onSend(reaction)
    setSent(reaction.emoji)
    setTimeout(() => setSent(null), 2000)
  }

  const quickReactions = GOLF_REACTIONS.slice(0, 6)

  return (
    <div className="flex items-center gap-1.5">
      {quickReactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleSend(r)}
          className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
            sent === r.emoji
              ? 'bg-emerald-100 ring-2 ring-emerald-400 scale-125'
              : 'hover:bg-gray-100'
          }`}
          title={`Send "${r.label}" to ${recipientName}`}
        >
          <span className="text-lg">{r.emoji}</span>
        </button>
      ))}
      {sent && (
        <span className="text-xs text-emerald-600 font-medium animate-pulse ml-1">
          Sent!
        </span>
      )}
    </div>
  )
}
