'use client'

import { useState } from 'react'

export function GuestPrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <span className="text-4xl block mb-2">{"\u26F3"}</span>
          <h2 className="text-xl font-bold text-white">Welcome to Sleft Golf</h2>
          <p className="text-gray-400 text-sm mt-1">What should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            required
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center text-lg"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Let&apos;s Play
          </button>
        </form>
      </div>
    </div>
  )
}
