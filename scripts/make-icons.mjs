// Renders public/icons/icon.svg into the PNG sizes the web manifest and
// iOS home screen need. Run once after changing the SVG:
//   node scripts/make-icons.mjs
// It uses sharp, which Next.js already installs for image optimization.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const icons = path.join(here, '..', 'public', 'icons');
const svg = path.join(icons, 'icon.svg');

for (const size of [192, 512]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(path.join(icons, `icon-${size}.png`));
  console.log(`icon-${size}.png written`);
}
