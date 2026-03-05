'use client'

import { GolfCalendar } from '@/components/golf-calendar'
import { DailyDadJoke } from '@/components/daily-dad-joke'

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Golf Calendar</h1>
          <p className="text-gray-500 mt-1">
            See who&apos;s playing when and where. Schedule your rounds and find playing partners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar takes 2/3 */}
          <div className="lg:col-span-2">
            <GolfCalendar />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DailyDadJoke variant="card" />

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-600">Planned round</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-600">Currently playing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="font-semibold text-emerald-800 text-sm mb-2">Tips</h3>
              <ul className="space-y-1.5 text-xs text-emerald-700">
                <li>Click any day to see who&apos;s playing</li>
                <li>Hover over a day and click + to schedule</li>
                <li>Weather shows automatically for planned rounds</li>
                <li>All public rounds are visible to everyone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
