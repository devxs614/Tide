// The words around the companions that aren't lines (v2 spec 8, Appendix
// B): species and color names, accessories, places, the Companion Studio,
// the About texts and the screen-reader descriptions. Kept apart from the
// lines in companions.ts so the top bar and empty states stay light. Same
// rules: kind, plain, no guilt.
import type { AccessoryId, CompanionSpecies, Placement } from '@/lib/companion/registry';

export const COMPANION_ABOUT: Record<CompanionSpecies, string> = {
  otter:
    "Sea otters often float together and hold onto each other so they don't drift apart. Pebble likes company, and keeps a favorite pebble close.",
  axolotl:
    "Axolotls come from the canals of Xochimilco in Mexico. They're famous for regrowing what they lose. Lolo thinks starting over is always allowed.",
  capybara:
    'Capybaras are known for being calm and getting along with almost everyone. Capi never hurries, and thinks rest counts.',
  gecko: 'Geckos can climb walls thanks to the tiny pads on their toes. Zip believes in small, sticky steps.',
  jellyfish: "Jellyfish drift with the current and some even glow. Luma speaks softly and doesn't need many words.",
  hermit_crab:
    "Hermit crabs move into new shells as they grow. It's a big change every time. Shelby knows switching is hard, and does it anyway.",
};

export const COMPANION_COPY = {
  species: {
    otter: { kind: 'Otter', personality: 'Warm, social and playful' },
    axolotl: { kind: 'Axolotl', personality: 'Curious, gentle and hopeful' },
    capybara: { kind: 'Capybara', personality: 'Calm, steady and unbothered' },
    gecko: { kind: 'Gecko', personality: 'Upbeat and practical, one small step at a time' },
    jellyfish: { kind: 'Jellyfish', personality: 'Quiet and soft, with few words' },
    hermit_crab: { kind: 'Hermit crab', personality: 'Shy, thoughtful and careful' },
  } satisfies Record<CompanionSpecies, { kind: string; personality: string }>,
  none: { name: 'No companion', personality: 'Just me and the waves.' },
  variants: {
    chestnut: 'Chestnut', seaGrey: 'Sea grey', cocoa: 'Cocoa', honey: 'Honey',
    pink: 'Pink', wildOlive: 'Wild olive', gold: 'Gold', lavender: 'Lavender',
    classic: 'Classic', sandy: 'Sandy', dark: 'Dark', cream: 'Cream',
    sunny: 'Sunny', mint: 'Mint', sky: 'Sky', coral: 'Coral',
    moon: 'Moon', rose: 'Rose', violet: 'Violet', seaGlass: 'Sea glass', sand: 'Sand', plum: 'Plum',
  } as Record<string, string>,
  accessories: {
    none: 'None', scarf: 'Scarf', beanie: 'Beanie', glasses: 'Round glasses', headphones: 'Headphones', backpack: 'Backpack',
    flowerCrown: 'Flower crown', bowTie: 'Bow tie', starClip: 'Star clip', rainHat: 'Rain hat', bandana: 'Bandana', sunHat: 'Tiny sun hat',
  } satisfies Record<AccessoryId, string>,
  placements: {
    today: 'Today', checkin: 'Check-in', unstick: 'Unstick', focus: 'Focus', bridge: 'Bridge', toolkit: 'Toolkit exercises',
    patterns: 'Patterns', shore: 'Shore', wrap: 'Close the day', celebrations: 'Celebrations', toasts: 'Little messages',
    empty: 'Empty screens', support: 'Talk to a person page',
  } satisfies Record<Placement, string>,
  sizes: { sm: 'Small', md: 'Medium', lg: 'Large' },
  talkativeness: {
    quiet: { name: 'Quiet', description: 'Only when you tap them, and during breathing' },
    some: { name: 'Some', description: 'Key moments only' },
    chatty: { name: 'Chatty', description: 'Also a tip now and then' },
  },
  faceStyle: { label: 'Face', dots: 'Dots', none: 'No face' },
  mirrorState: 'Glow follows my check-in',
  studio: {
    title: 'Your companion',
    tabs: { look: 'Look', personality: 'Personality', where: 'Where it appears', voice: 'Voice' },
    species: 'Companion',
    color: 'Color',
    accessory: 'Accessory',
    size: 'Size',
    talkativeness: 'How much they talk',
    hearLine: 'Hear a line',
    tryBreath: 'Try a breath together',
    breathDone: 'Nice. That was one full breath.',
    about: 'About',
    editName: 'Rename',
    nameLabel: 'Name',
    useDefaultName: 'Use default name',
    nameHelp: 'Up to 16 letters, spaces, hyphens or apostrophes.',
    nameErrors: {
      empty: 'Give them a name, or use the default one.',
      long: 'That one is a little long. Up to 16 characters fit.',
      chars: 'Letters, spaces, hyphens and apostrophes work here.',
    },
    saveName: 'Save name',
    backLabel: 'Back to where you were',
    speciesHelp: 'Pick one, or none. You can change this anytime.',
    exampleLine: 'For example: "{line}"',
    whereHelp: 'Turn off any place you would rather keep quiet. Your companion never appears on the crisis screen.',
    voiceCurrent: 'Their own voice',
    breathCount: '{phase} · {count}',
    breathHint: 'Four counts in, four to hold, four out, four to hold.',
    changedSpecies: 'Companion changed.',
    changedName: 'Name changed.',
    tapHint: 'Tap them to say hi.',
    noneHint: 'No companion. You can choose one anytime.',
    voiceUnavailable: "Companion voices need natural voices, which aren't set up here.",
    companionVoice: 'Companion voice',
  },
  settings: {
    title: 'Companion',
    open: 'Open the companion studio',
    none: 'No companion right now.',
    notChosen: 'You have not picked a companion yet.',
  },
  openStudio: '{name}. Open the companion studio',
  // Screen-reader names, so the drawing is never just a picture.
  alt: '{name} the {kind}, looking {expression}',
  expressionWords: {
    idle: 'relaxed', happy: 'happy', curious: 'curious', listening: 'attentive', thinking: 'thoughtful', soft: 'gentle',
    calm: 'calm', proud: 'proud', focused: 'focused', breathing: 'like it is breathing slowly', packing: 'ready to go',
    sleepy: 'sleepy', sleeping: 'asleep', waving: 'like it is waving',
  },
} as const;
