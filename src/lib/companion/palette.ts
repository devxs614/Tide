// Fixed colors in the companions' world that don't change with a theme:
// eyes (always near-black with a white highlight, v2 spec 8.3), noses, the
// grey pebble, and accessories that have their own colors.
export const PALETTE = {
  eye: '#1D1A1F',
  highlight: '#FFFFFF',
  tongue: '#F08A9B',
  pebble: '#A7ADB3',
  pebbleShade: '#8C9298',
  crabBody: '#E9775A',
  crabShade: '#CF5F45',
  book: '#7C9CD6',
  page: '#FFFDF6',
  tea: '#C98A5A',
  cup: '#FFFFFF',
  citrus: '#F5B83D',
  pencil: '#F2C14E',
  suitcase: '#B97A4E',
  rainHat: '#F2C14E',
  rainHatShade: '#D6A32F',
  star: '#F5C443',
  flowers: ['#F59BBE', '#FFFFFF', '#F5C443'],
  nightcap: '#7C8FD6',
  water: '#6CC4C9',
} as const;
