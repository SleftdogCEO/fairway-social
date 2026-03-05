export type WeatherData = {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: string
  description: string
  icon: string
  precipitation: number
  uvIndex: number
  visibility: number
}

export type HourlyForecast = {
  time: string
  temperature: number
  precipitation: number
  windSpeed: number
  description: string
  icon: string
}

export type GolfWeather = {
  current: WeatherData
  hourly: HourlyForecast[]
  golfScore: number // 1-10, how good conditions are for golf
  recommendation: string
}

const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

function getWindDirection(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16
  return WIND_DIRECTIONS[index]
}

// WMO Weather interpretation codes to descriptions and icons
function interpretWeatherCode(code: number): { description: string; icon: string } {
  const map: Record<number, { description: string; icon: string }> = {
    0: { description: 'Clear sky', icon: 'sun' },
    1: { description: 'Mainly clear', icon: 'sun' },
    2: { description: 'Partly cloudy', icon: 'cloud-sun' },
    3: { description: 'Overcast', icon: 'cloud' },
    45: { description: 'Foggy', icon: 'cloud-fog' },
    48: { description: 'Depositing rime fog', icon: 'cloud-fog' },
    51: { description: 'Light drizzle', icon: 'cloud-drizzle' },
    53: { description: 'Moderate drizzle', icon: 'cloud-drizzle' },
    55: { description: 'Dense drizzle', icon: 'cloud-drizzle' },
    61: { description: 'Slight rain', icon: 'cloud-rain' },
    63: { description: 'Moderate rain', icon: 'cloud-rain' },
    65: { description: 'Heavy rain', icon: 'cloud-rain' },
    71: { description: 'Slight snow', icon: 'snowflake' },
    73: { description: 'Moderate snow', icon: 'snowflake' },
    75: { description: 'Heavy snow', icon: 'snowflake' },
    80: { description: 'Slight rain showers', icon: 'cloud-rain' },
    81: { description: 'Moderate rain showers', icon: 'cloud-rain' },
    82: { description: 'Violent rain showers', icon: 'cloud-rain' },
    85: { description: 'Slight snow showers', icon: 'snowflake' },
    86: { description: 'Heavy snow showers', icon: 'snowflake' },
    95: { description: 'Thunderstorm', icon: 'cloud-lightning' },
    96: { description: 'Thunderstorm with slight hail', icon: 'cloud-lightning' },
    99: { description: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' },
  }
  return map[code] || { description: 'Unknown', icon: 'cloud' }
}

function calculateGolfScore(weather: WeatherData): { score: number; recommendation: string } {
  let score = 10

  // Temperature (ideal: 65-80F / 18-27C)
  if (weather.temperature < 5) score -= 4
  else if (weather.temperature < 10) score -= 3
  else if (weather.temperature < 15) score -= 1
  else if (weather.temperature > 35) score -= 3
  else if (weather.temperature > 30) score -= 1

  // Wind (ideal: < 10mph / 16kmh)
  if (weather.windSpeed > 40) score -= 4
  else if (weather.windSpeed > 30) score -= 3
  else if (weather.windSpeed > 20) score -= 2
  else if (weather.windSpeed > 15) score -= 1

  // Precipitation
  if (weather.precipitation > 5) score -= 4
  else if (weather.precipitation > 2) score -= 3
  else if (weather.precipitation > 0.5) score -= 2
  else if (weather.precipitation > 0) score -= 1

  // UV Index
  if (weather.uvIndex > 10) score -= 1

  // Humidity
  if (weather.humidity > 90) score -= 1

  score = Math.max(1, Math.min(10, score))

  let recommendation: string
  if (score >= 9) recommendation = "Perfect golf weather! Get out there!"
  else if (score >= 7) recommendation = "Great conditions for a round."
  else if (score >= 5) recommendation = "Playable, but bring layers or rain gear."
  else if (score >= 3) recommendation = "Tough conditions. Hit the range instead?"
  else recommendation = "Stay in the clubhouse. This is a hot cocoa day."

  return { score, recommendation }
}

// Uses Open-Meteo API (free, no API key needed)
export async function getGolfWeather(lat: number, lng: number): Promise<GolfWeather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1`

    const res = await fetch(url, { next: { revalidate: 1800 } }) // cache 30 min
    if (!res.ok) return null

    const data = await res.json()

    const weatherInfo = interpretWeatherCode(data.current.weather_code)

    const current: WeatherData = {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: getWindDirection(data.current.wind_direction_10m),
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      precipitation: data.current.precipitation,
      uvIndex: Math.round(data.current.uv_index),
      visibility: Math.round((data.current.visibility || 10000) / 1000),
    }

    const hourly: HourlyForecast[] = data.hourly.time.slice(0, 12).map((time: string, i: number) => {
      const hourWeather = interpretWeatherCode(data.hourly.weather_code[i])
      return {
        time,
        temperature: Math.round(data.hourly.temperature_2m[i]),
        precipitation: data.hourly.precipitation_probability[i],
        windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
        description: hourWeather.description,
        icon: hourWeather.icon,
      }
    })

    const { score, recommendation } = calculateGolfScore(current)

    return { current, hourly, golfScore: score, recommendation }
  } catch {
    return null
  }
}

// Geocode a city/state string to lat/lng using Open-Meteo's geocoding
export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.results?.length) return null
    const r = data.results[0]
    return { lat: r.latitude, lng: r.longitude, name: `${r.name}, ${r.admin1 || r.country}` }
  } catch {
    return null
  }
}
