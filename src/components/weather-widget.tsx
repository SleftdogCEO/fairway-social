'use client'

import { useState, useEffect } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import type { GolfWeather, HourlyForecast } from '@/lib/weather'

const WEATHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-rain': CloudRain,
  'cloud-drizzle': CloudDrizzle,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
  snowflake: Snowflake,
}

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = WEATHER_ICONS[icon] || Cloud
  return <Icon className={className} />
}

function GolfScoreBadge({ score }: { score: number }) {
  let color: string
  let label: string

  if (score >= 9) { color = 'bg-emerald-500'; label = 'Perfect' }
  else if (score >= 7) { color = 'bg-green-500'; label = 'Great' }
  else if (score >= 5) { color = 'bg-yellow-500'; label = 'Fair' }
  else if (score >= 3) { color = 'bg-orange-500'; label = 'Rough' }
  else { color = 'bg-red-500'; label = 'Stay In' }

  return (
    <div className="flex items-center gap-2">
      <div className={`${color} text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-sm`}>
        {score}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Golf Score</p>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
      </div>
    </div>
  )
}

function HourlyRow({ hour }: { hour: HourlyForecast }) {
  const time = new Date(hour.time)
  const displayTime = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })

  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-16">{displayTime}</span>
      <div className="flex items-center gap-1.5">
        <WeatherIcon icon={hour.icon} className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-800 w-12">{hour.temperature}°F</span>
      </div>
      <div className="flex items-center gap-1">
        <Droplets className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs text-gray-500 w-8">{hour.precipitation}%</span>
      </div>
      <div className="flex items-center gap-1">
        <Wind className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500 w-12">{hour.windSpeed} mph</span>
      </div>
    </div>
  )
}

type WeatherWidgetProps = {
  lat?: number
  lng?: number
  location?: string
  courseName?: string
  variant?: 'full' | 'compact' | 'inline'
}

export function WeatherWidget({ lat, lng, location, courseName, variant = 'full' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<GolfWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHourly, setShowHourly] = useState(false)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = lat && lng
        ? `lat=${lat}&lng=${lng}`
        : `location=${encodeURIComponent(location || '')}`
      const res = await fetch(`/api/weather?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch weather')
      }
      const data = await res.json()
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lat || lng || location) {
      fetchWeather()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, location])

  if (!lat && !lng && !location) return null

  if (loading) {
    return (
      <div className={`${variant === 'inline' ? 'inline-flex items-center gap-2' : 'rounded-xl border border-gray-200 bg-white p-4'}`}>
        <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading weather...</span>
      </div>
    )
  }

  if (error || !weather) {
    return null // Silently fail for weather
  }

  // Inline variant - just temp and icon
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm text-gray-500">
        <WeatherIcon icon={weather.current.icon} className="w-4 h-4" />
        <span>{weather.current.temperature}°F</span>
        <span className="text-gray-300">|</span>
        <Wind className="w-3.5 h-3.5" />
        <span>{weather.current.windSpeed} mph</span>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon icon={weather.current.icon} className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{weather.current.temperature}°F</p>
              <p className="text-xs text-gray-500">{weather.current.description}</p>
            </div>
          </div>
          <GolfScoreBadge score={weather.golfScore} />
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">{weather.recommendation}</p>
      </div>
    )
  }

  // Full variant
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {courseName && (
              <>
                <MapPin className="w-4 h-4" />
                <span className="font-medium text-sm">{courseName}</span>
                <span className="text-white/50">|</span>
              </>
            )}
            <span className="text-sm text-white/80">Course Conditions</span>
          </div>
          <button onClick={fetchWeather} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current conditions */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <WeatherIcon icon={weather.current.icon} className="w-14 h-14 text-sky-500" />
            <div>
              <p className="text-4xl font-bold text-gray-900">{weather.current.temperature}°F</p>
              <p className="text-sm text-gray-500">
                Feels like {weather.current.feelsLike}°F &middot; {weather.current.description}
              </p>
            </div>
          </div>
          <GolfScoreBadge score={weather.golfScore} />
        </div>

        {/* Recommendation */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">&#9971; Golf Forecast:</span> {weather.recommendation}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Wind className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Wind</p>
              <p className="text-sm font-semibold text-gray-800">
                {weather.current.windSpeed} mph {weather.current.windDirection}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-semibold text-gray-800">{weather.current.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs text-gray-500">UV Index</p>
              <p className="text-sm font-semibold text-gray-800">{weather.current.uvIndex}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Visibility</p>
              <p className="text-sm font-semibold text-gray-800">{weather.current.visibility} km</p>
            </div>
          </div>
        </div>

        {/* Hourly forecast toggle */}
        <button
          onClick={() => setShowHourly(!showHourly)}
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium w-full justify-center py-2 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          {showHourly ? (
            <>
              <ChevronUp className="w-4 h-4" /> Hide hourly forecast
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Show hourly forecast
            </>
          )}
        </button>

        {showHourly && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            {weather.hourly.map((hour, i) => (
              <HourlyRow key={i} hour={hour} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
