import { NextRequest, NextResponse } from 'next/server'
import { getGolfWeather, geocodeLocation } from '@/lib/weather'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const location = searchParams.get('location')

  let coords: { lat: number; lng: number } | null = null

  if (lat && lng) {
    coords = { lat: parseFloat(lat), lng: parseFloat(lng) }
  } else if (location) {
    const geo = await geocodeLocation(location)
    if (!geo) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
    coords = { lat: geo.lat, lng: geo.lng }
  } else {
    return NextResponse.json({ error: 'Provide lat/lng or location query' }, { status: 400 })
  }

  const weather = await getGolfWeather(coords.lat, coords.lng)
  if (!weather) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }

  return NextResponse.json(weather)
}
