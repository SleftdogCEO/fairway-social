'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Round, Profile, Course } from '@/lib/types'
import { Trophy, Medal, TrendingDown, Calendar } from 'lucide-react'
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns'

type RoundWithJoins = Round & { profiles?: Profile; courses?: Course }

type LeaderboardEntry = {
  profile: Profile
  bestScore: number
  courseName: string
  roundsPlayed: number
}

type TimePeriod = 'today' | 'week' | 'month'

export default function LeaderboardPage() {
  const supabase = createClient()

  const [rounds, setRounds] = useState<RoundWithJoins[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<TimePeriod>('today')

  useEffect(() => {
    fetchRounds()
  }, [period])

  async function fetchRounds() {
    setLoading(true)

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(now)
        break
    }

    const { data, error } = await supabase
      .from('rounds')
      .select('*, profiles(*), courses(*)')
      .eq('status', 'completed')
      .not('score', 'is', null)
      .gte('created_at', startDate.toISOString())
      .order('score', { ascending: true })

    if (error) {
      console.error('Error fetching rounds:', error)
    } else {
      setRounds(data || [])
    }
    setLoading(false)
  }

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const byUser: Record<string, {
      profile: Profile
      bestScore: number
      bestCourseName: string
      roundsPlayed: number
    }> = {}

    rounds.forEach(round => {
      if (!round.profiles || round.score === null || round.score === undefined) return

      const userId = round.user_id
      if (!byUser[userId]) {
        byUser[userId] = {
          profile: round.profiles,
          bestScore: round.score,
          bestCourseName: round.courses?.name || 'Unknown',
          roundsPlayed: 1,
        }
      } else {
        byUser[userId].roundsPlayed++
        if (round.score < byUser[userId].bestScore) {
          byUser[userId].bestScore = round.score
          byUser[userId].bestCourseName = round.courses?.name || 'Unknown'
        }
      }
    })

    return Object.values(byUser)
      .sort((a, b) => a.bestScore - b.bestScore)
      .map(entry => ({
        profile: entry.profile,
        bestScore: entry.bestScore,
        courseName: entry.bestCourseName,
        roundsPlayed: entry.roundsPlayed,
      }))
  }, [rounds])

  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'

  function getRankStyle(rank: number) {
    if (rank === 0) return { bg: 'bg-amber-900/20', border: 'border-amber-800', badge: 'bg-amber-400', text: 'text-amber-400' }
    if (rank === 1) return { bg: 'bg-dark-800/80', border: 'border-dark-700', badge: 'bg-gray-400', text: 'text-gray-300' }
    if (rank === 2) return { bg: 'bg-orange-900/20', border: 'border-orange-800', badge: 'bg-orange-400', text: 'text-orange-400' }
    return { bg: 'bg-dark-800', border: 'border-dark-700', badge: 'bg-dark-700', text: 'text-gray-500' }
  }

  function getRankIcon(rank: number) {
    if (rank === 0) return <Trophy className="w-5 h-5 text-amber-500" />
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-400" />
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-emerald-600" />
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-400 text-sm mb-6">See who is posting the best scores</p>

        {/* Period Tabs */}
        <div className="flex bg-dark-800 rounded-xl shadow-sm border border-dark-700 p-1 mb-8">
          {[
            { key: 'today' as TimePeriod, label: 'Today', icon: Calendar },
            { key: 'week' as TimePeriod, label: 'This Week', icon: Calendar },
            { key: 'month' as TimePeriod, label: 'This Month', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                period === tab.key
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500 shadow-sm'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="bg-dark-800 rounded-2xl shadow-sm border border-dark-700 p-4 animate-pulse flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-dark-700" />
                <div className="w-10 h-10 rounded-full bg-dark-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-dark-700 rounded" />
                  <div className="h-3 w-24 bg-dark-700 rounded" />
                </div>
                <div className="h-6 w-12 bg-dark-700 rounded" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              No completed rounds
            </h3>
            <p className="text-gray-400 text-sm">
              No scores have been posted {periodLabel.toLowerCase()}. Get out and play!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium (if available) */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {/* 2nd Place */}
                <div className="bg-dark-800 rounded-2xl shadow-sm border-2 border-dark-700 p-4 text-center mt-6">
                  <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-2 overflow-hidden ring-2 ring-gray-500 ring-offset-2 ring-offset-dark-800">
                    {leaderboard[1].profile.avatar_url ? (
                      <img
                        src={leaderboard[1].profile.avatar_url}
                        alt={leaderboard[1].profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-300 font-bold">
                        {leaderboard[1].profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <Medal className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="font-semibold text-white text-sm truncate">
                    {leaderboard[1].profile.full_name}
                  </p>
                  <p className="text-2xl font-bold text-gray-300 mt-1">
                    {leaderboard[1].bestScore}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{leaderboard[1].courseName}</p>
                </div>

                {/* 1st Place */}
                <div className="bg-dark-800 rounded-2xl shadow-md border-2 border-amber-500 p-4 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    #1
                  </div>
                  <div className="w-16 h-16 rounded-full bg-amber-900/30 flex items-center justify-center mx-auto mb-2 overflow-hidden ring-2 ring-amber-400 ring-offset-2 ring-offset-dark-800">
                    {leaderboard[0].profile.avatar_url ? (
                      <img
                        src={leaderboard[0].profile.avatar_url}
                        alt={leaderboard[0].profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-700 font-bold text-lg">
                        {leaderboard[0].profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="font-semibold text-white text-sm truncate">
                    {leaderboard[0].profile.full_name}
                  </p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">
                    {leaderboard[0].bestScore}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{leaderboard[0].courseName}</p>
                </div>

                {/* 3rd Place */}
                <div className="bg-dark-800 rounded-2xl shadow-sm border-2 border-orange-800 p-4 text-center mt-6">
                  <div className="w-14 h-14 rounded-full bg-orange-900/30 flex items-center justify-center mx-auto mb-2 overflow-hidden ring-2 ring-orange-400 ring-offset-2 ring-offset-dark-800">
                    {leaderboard[2].profile.avatar_url ? (
                      <img
                        src={leaderboard[2].profile.avatar_url}
                        alt={leaderboard[2].profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-orange-700 font-bold">
                        {leaderboard[2].profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <Medal className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="font-semibold text-white text-sm truncate">
                    {leaderboard[2].profile.full_name}
                  </p>
                  <p className="text-2xl font-bold text-gray-300 mt-1">
                    {leaderboard[2].bestScore}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{leaderboard[2].courseName}</p>
                </div>
              </div>
            )}

            {/* Full Leaderboard List */}
            <div className="bg-dark-800 rounded-2xl shadow-sm border border-dark-700 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-dark-700 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2 text-center">Best</div>
                <div className="col-span-2 text-center">Handicap</div>
                <div className="col-span-2 text-center">Rounds</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-dark-700">
                {leaderboard.map((entry, index) => {
                  const style = getRankStyle(index)
                  return (
                    <div
                      key={entry.profile.id}
                      className={`grid grid-cols-12 gap-2 items-center px-5 py-3 ${
                        index < 3 ? style.bg : 'hover:bg-dark-700'
                      } transition-colors`}
                    >
                      <div className="col-span-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? `${style.badge} text-white` : 'bg-dark-700 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {entry.profile.avatar_url ? (
                            <img
                              src={entry.profile.avatar_url}
                              alt={entry.profile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-emerald-700 font-semibold text-sm">
                              {entry.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {entry.profile.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{entry.courseName}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`text-base font-bold ${
                          index === 0 ? 'text-emerald-400' : 'text-gray-200'
                        }`}>
                          {entry.bestScore}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-400">
                          {entry.profile.handicap !== null ? entry.profile.handicap : '--'}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-400">
                          {entry.roundsPlayed}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
