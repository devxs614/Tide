// Colors for the things on the shore (v2 spec 13.4). The fills are fixed, so
// a scallop is always a scallop. The outline follows the theme (dark on
// light sand, light on dark sand), which keeps every item at least 3:1
// against its sand (tested).
export const ITEM_OUTLINE = { onLight: '#5A3A2E', onDark: '#FFF4E0' } as const;

export const ITEM_COLORS = {
  shell: { light: '#F6D6C8', medium: '#EBA98F', deep: '#C9735A' },
  pebble: { grey: '#A7A9AC', slate: '#6E7C87', warm: '#B79E8A' },
  seaGlass: { blue: '#8EC9E8', green: '#9FD9B5' },
  starfish: { move: '#F29A4A', calm: '#6FA8DC', connect: '#F28CB1', create: '#F2C84B', think: '#A98BD9' },
  sandDollar: '#F3EBDD',
  wood: '#A9825E',
  bottle: { green: '#7FB89A', blue: '#7FA8D1', clear: '#DCEBEE' },
  cork: '#B98A5A',
  pearl: '#FFFFFF',
  pearlShine: '#E9DCF2',
  paper: '#FFF8E8',
} as const;
