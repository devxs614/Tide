// "How this screen works" (v2 spec 17.8): a few plain sentences per screen,
// opened from the menu, with read-aloud. Moved out of en.ts in v2.1: the
// sheet loads only when someone opens it, so Today shouldn't download its
// words (the 300 KB first-load budget). Same rules as en.ts.
export const screenHelpCopy = {
  title: 'How this screen works',
  shortcutsHint: 'On a keyboard, press ? to see the shortcuts.',
  screens: {
    today: {
      name: 'Today',
      body: [
        'Today shows your current state, the plan for today and what is coming up next.',
        'Check in with the round button at the bottom. Tide uses what you tell it to suggest a lighter or fuller day; you always choose.',
        'Nothing here counts against you. Anything unfinished can move to another day.',
      ],
    },
    tasks: {
      name: 'Tasks',
      body: [
        'Your tasks sit in four groups: Not started, In progress, Stuck and Done.',
        "Stuck is information, not failure. Choose I'm stuck on a task to get one small first step.",
        'Focus starts a short timer for one task, with your companion working next to you if you have one.',
      ],
    },
    toolkit: {
      name: 'Toolkit',
      body: [
        'Short strategies for different states: settling down, getting started, and focusing.',
        'Each one says how long it takes. You can stop any time, and you can say whether it helped.',
      ],
    },
    patterns: {
      name: 'Patterns',
      body: [
        'Patterns are links Tide noticed in your own check-ins, like a strategy that often helped in one state.',
        'Each pattern shows its evidence. If one is not true for you, choose Not true for me and it goes away.',
      ],
    },
    shore: {
      name: 'Your Shore',
      body: [
        'Things you do leave something on your shore: a shell for a finished task, sea glass for a switch you got through, driftwood for a closed day.',
        'Choose any item to see when it washed up and why. Nothing ever disappears from your shore.',
      ],
    },
    proof: {
      name: 'Proof log',
      body: [
        'Things you did, kept here for the days that feel heavy.',
        'Wins collect as you finish tasks, get through switches and try strategies. You can add your own, too.',
      ],
    },
    settings: {
      name: 'Settings',
      body: [
        'Every change applies at once; there is no Save button.',
        'Search for a setting by name, or try a preset. Each page has Reset this section if you want its defaults back.',
      ],
    },
    support: {
      name: 'Talk to a person',
      body: [
        'This page keeps the people you can reach: people you trust, support at your school and crisis lines.',
        'Tide never contacts anyone for you. You copy a message and send it yourself, when you want to.',
      ],
    },
  },
};
