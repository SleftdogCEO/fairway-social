'use client'

import { createClient } from '@/lib/supabase/client'

const GUEST_KEY = 'fairway_guest_id'
const GUEST_NAME_KEY = 'fairway_guest_name'

export function getGuestId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_KEY)
}

export function getGuestName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_NAME_KEY)
}

export async function createOrGetGuest(name: string): Promise<string> {
  const existingId = getGuestId()
  const supabase = createClient()

  if (existingId) {
    // Update name if changed
    const currentName = getGuestName()
    if (currentName !== name) {
      await supabase
        .from('profiles')
        .update({ full_name: name })
        .eq('id', existingId)
      localStorage.setItem(GUEST_NAME_KEY, name)
    }
    return existingId
  }

  // Create a new guest profile
  const guestId = crypto.randomUUID()

  const { error } = await supabase.from('profiles').insert({
    id: guestId,
    full_name: name,
    username: name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
    is_public: true,
  })

  if (!error) {
    localStorage.setItem(GUEST_KEY, guestId)
    localStorage.setItem(GUEST_NAME_KEY, name)
  }

  return guestId
}

export function clearGuest() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_KEY)
  localStorage.removeItem(GUEST_NAME_KEY)
}
