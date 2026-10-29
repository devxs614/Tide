// Class-name merging for components (the shadcn/ui convention): `cn` joins
// conditional classes and resolves Tailwind conflicts, so a component can
// take a className override without fighting its defaults.
// It has to be told about Tide's own type scale and radii. Without that it
// sees `text-h2` and `text-ink` as two colors and silently drops the size,
// which shrank every sheet title to body text.
import { createCn } from 'cn/config';

export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['caption', 'body', 'lead', 'h3', 'h2', 'h1', 'display'] }],
      rounded: [{ rounded: ['card', 'input'] }],
      'rounded-t': [{ 'rounded-t': ['card'] }],
      shadow: [{ shadow: ['sheet'] }],
    },
  },
});
