// The six companions (v2 spec 8.1): who they are, their four color
// variants, where accessories sit on each body, and what each one does when
// idle, during a focus block and before a switch. These are original
// characters drawn for Tide. All the colors live here (and in palette.ts),
// so the drawings in components/companion only ever use these values.

export type CompanionSpecies = 'otter' | 'axolotl' | 'capybara' | 'gecko' | 'jellyfish' | 'hermit_crab';
export const SPECIES: CompanionSpecies[] = ['otter', 'axolotl', 'capybara', 'gecko', 'jellyfish', 'hermit_crab'];

export type Expression =
  | 'idle'
  | 'happy'
  | 'curious'
  | 'listening'
  | 'thinking'
  | 'soft'
  | 'calm'
  | 'proud'
  | 'focused'
  | 'breathing'
  | 'packing'
  | 'sleepy'
  | 'sleeping'
  | 'waving';
export const EXPRESSIONS: Expression[] = [
  'idle', 'happy', 'curious', 'listening', 'thinking', 'soft', 'calm', 'proud', 'focused', 'breathing', 'packing', 'sleepy', 'sleeping', 'waving',
];

export type Reaction = 'hop' | 'wiggle' | 'lean' | 'wave' | 'spin' | 'shellSwap' | 'pulseBurst' | 'special';

export interface VariantColors {
  id: string;
  main: string;
  shade: string;
  light: string;
  accent: string;
  blush: string;
}

// Where an accessory sits: the point, how big it is drawn, and a tilt.
export interface Attachment {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
}

export interface SpeciesInfo {
  id: CompanionSpecies;
  defaultName: string;
  variants: [VariantColors, VariantColors, VariantColors, VariantColors];
  attach: { head: Attachment; face: Attachment; neck: Attachment; back: Attachment };
  // Size of the drawn eyes, so glasses and the like fit.
  sound: `chirp-${CompanionSpecies}`;
}

const v = (id: string, main: string, shade: string, light: string, accent: string, blush: string): VariantColors => ({ id, main, shade, light, accent, blush });

export const COMPANIONS: Record<CompanionSpecies, SpeciesInfo> = {
  otter: {
    id: 'otter',
    defaultName: 'Pebble',
    variants: [
      v('chestnut', '#8B5E3C', '#74492C', '#E9D2B4', '#9AA0A6', '#E59A86'),
      v('seaGrey', '#6B7F8C', '#566976', '#DDE5EA', '#9AA0A6', '#E5A49A'),
      v('cocoa', '#5E4033', '#4A3127', '#D9C2AA', '#9AA0A6', '#D99582'),
      v('honey', '#B07A3E', '#966431', '#F2DEC1', '#9AA0A6', '#E8A08A'),
    ],
    attach: {
      head: { x: 100, y: 36, scale: 0.95 },
      face: { x: 100, y: 74, scale: 0.8 },
      neck: { x: 100, y: 118, scale: 0.9 },
      back: { x: 100, y: 128, scale: 1 },
    },
    sound: 'chirp-otter',
  },
  axolotl: {
    id: 'axolotl',
    defaultName: 'Lolo',
    variants: [
      v('pink', '#F6B3C8', '#E796AF', '#FCDCE6', '#E9799E', '#F28AA8'),
      v('wildOlive', '#7C8C63', '#68784F', '#B7C49E', '#566343', '#C98F7E'),
      v('gold', '#F2C66B', '#DDAE52', '#F8E0A6', '#E09A3A', '#EE9A72'),
      v('lavender', '#C9B6EE', '#B29CDD', '#E5DCF7', '#9D84D6', '#E79BC0'),
    ],
    attach: {
      head: { x: 100, y: 38, scale: 1.05 },
      face: { x: 100, y: 86, scale: 1.25 },
      neck: { x: 100, y: 128, scale: 0.8 },
      back: { x: 100, y: 140, scale: 0.85 },
    },
    sound: 'chirp-axolotl',
  },
  capybara: {
    id: 'capybara',
    defaultName: 'Capi',
    variants: [
      v('classic', '#A8774D', '#8E6340', '#D2AE88', '#E6A23A', '#D98E78'),
      v('sandy', '#C49A6C', '#A98258', '#E3C7A4', '#E6A23A', '#DD957C'),
      v('dark', '#7A5638', '#64452C', '#B08A66', '#E6A23A', '#C98670'),
      v('cream', '#D8BC94', '#BFA27A', '#EFDDC2', '#E6A23A', '#E39F86'),
    ],
    attach: {
      head: { x: 100, y: 44, scale: 0.95 },
      face: { x: 100, y: 72, scale: 0.85 },
      neck: { x: 100, y: 120, scale: 1 },
      back: { x: 100, y: 132, scale: 1.05 },
    },
    sound: 'chirp-capybara',
  },
  gecko: {
    id: 'gecko',
    defaultName: 'Zip',
    variants: [
      v('sunny', '#F2C35B', '#D9AA45', '#F8DE9C', '#8A6A3A', '#F09A7A'),
      v('mint', '#9ADBB5', '#7FC49C', '#C9EED8', '#4E9A73', '#EE9E9A'),
      v('sky', '#9CC8F0', '#7FB0DD', '#CBE2F7', '#4F7FB8', '#EBA0B2'),
      v('coral', '#F29A6B', '#DB8256', '#F8C7A8', '#B85A35', '#EE8F8F'),
    ],
    attach: {
      head: { x: 100, y: 32, scale: 0.92 },
      face: { x: 100, y: 70, scale: 0.85 },
      neck: { x: 100, y: 112, scale: 0.8 },
      back: { x: 100, y: 132, scale: 0.85 },
    },
    sound: 'chirp-gecko',
  },
  jellyfish: {
    id: 'jellyfish',
    defaultName: 'Luma',
    variants: [
      v('moon', '#CFE3FF', '#AFCBF2', '#EAF3FF', '#9FC2F0', '#F5B8CF'),
      v('rose', '#FFC9E3', '#F2A9CC', '#FFE6F2', '#F09BC4', '#F59BBE'),
      v('mint', '#C6F5E3', '#A3E3CA', '#E6FCF4', '#8FDCC0', '#F2B4C4'),
      v('violet', '#DCCBFF', '#C4AEF2', '#EFE7FF', '#B79CF0', '#F2B0D2'),
    ],
    attach: {
      head: { x: 100, y: 30, scale: 1 },
      face: { x: 100, y: 76, scale: 0.75 },
      neck: { x: 100, y: 102, scale: 1 },
      back: { x: 100, y: 70, scale: 0.9 },
    },
    sound: 'chirp-jellyfish',
  },
  hermit_crab: {
    id: 'hermit_crab',
    defaultName: 'Shelby',
    variants: [
      v('coral', '#F29E86', '#D9826B', '#F8C6B6', '#E9775A', '#F2A08C'),
      v('seaGlass', '#8FD3C8', '#72BAAF', '#C2EAE3', '#E9775A', '#F2A08C'),
      v('sand', '#E8C99A', '#CFAF80', '#F4E2C6', '#E9775A', '#F2A08C'),
      v('plum', '#B38BC9', '#9A72B1', '#D7C1E3', '#E9775A', '#F2A08C'),
    ],
    attach: {
      head: { x: 66, y: 96, scale: 0.6, rotate: -6 },
      face: { x: 66, y: 86, scale: 0.6 },
      neck: { x: 66, y: 134, scale: 0.65 },
      back: { x: 120, y: 92, scale: 0.9 },
    },
    sound: 'chirp-hermit_crab',
  },
};

export function variantFor(species: CompanionSpecies, variantId: string): VariantColors {
  const variants = COMPANIONS[species].variants;
  return variants.find((x) => x.id === variantId) ?? variants[0];
}

export const ACCESSORIES = [
  'none', 'scarf', 'beanie', 'glasses', 'headphones', 'backpack', 'flowerCrown', 'bowTie', 'starClip', 'rainHat', 'bandana', 'sunHat',
] as const;
export type AccessoryId = (typeof ACCESSORIES)[number];

// Where each accessory attaches.
export const ACCESSORY_SLOT: Record<Exclude<AccessoryId, 'none'>, 'head' | 'face' | 'neck' | 'back'> = {
  scarf: 'neck',
  beanie: 'head',
  glasses: 'face',
  headphones: 'head',
  backpack: 'back',
  flowerCrown: 'head',
  bowTie: 'neck',
  starClip: 'head',
  rainHat: 'head',
  bandana: 'neck',
  sunHat: 'head',
};

export type Placement =
  | 'today'
  | 'checkin'
  | 'unstick'
  | 'focus'
  | 'bridge'
  | 'toolkit'
  | 'patterns'
  | 'shore'
  | 'wrap'
  | 'celebrations'
  | 'toasts'
  | 'empty'
  | 'support';
export const PLACEMENTS: Placement[] = [
  'today', 'checkin', 'unstick', 'focus', 'bridge', 'toolkit', 'patterns', 'shore', 'wrap', 'celebrations', 'toasts', 'empty', 'support',
];

export const SIZES = { sm: 56, md: 88, lg: 128, xl: 180 } as const;
export type CompanionSize = keyof typeof SIZES;
