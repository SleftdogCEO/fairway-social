export type GolfReaction = {
  emoji: string
  label: string
  sound?: string
}

export const GOLF_REACTIONS: GolfReaction[] = [
  { emoji: '🏌️', label: 'Nice Shot!' },
  { emoji: '🦅', label: 'Eagle!' },
  { emoji: '🐦', label: 'Birdie!' },
  { emoji: '🕳️', label: 'Ace!' },
  { emoji: '🔥', label: 'On Fire!' },
  { emoji: '💧', label: 'In the Drink!' },
  { emoji: '🌲', label: 'In the Trees!' },
  { emoji: '⛳', label: 'Pin High!' },
  { emoji: '🏆', label: 'Champion!' },
  { emoji: '🔄', label: 'Mulligan!' },
  { emoji: '🍺', label: '19th Hole!' },
  { emoji: '⚠️', label: 'FORE!' },
  { emoji: '🤏', label: 'So Close!' },
  { emoji: '💀', label: 'Skulled It!' },
  { emoji: '🏖️', label: 'Beach Time!' },
  { emoji: '👏', label: 'Great Round!' },
]
