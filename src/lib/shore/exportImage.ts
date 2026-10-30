// "Save as image" for Your Shore (v2 spec 13.9): copy the scene, write the
// real colors in place of the theme's CSS variables (an image has no
// stylesheet), leave out the companion and any words, draw it at twice the
// size and download it. Only "Include my name" adds any text.
const PAINT = ['fill', 'stroke', 'stop-color', 'opacity'] as const;

export async function exportShoreImage(svg: SVGSVGElement, name: string | null, dateKey: string): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const live = svg.querySelectorAll<SVGElement>('*');
  const copies = clone.querySelectorAll<SVGElement>('*');
  live.forEach((el, i) => {
    const style = getComputedStyle(el);
    for (const prop of PAINT) copies[i].style.setProperty(prop, style.getPropertyValue(prop));
    copies[i].style.removeProperty('animation');
  });
  clone.querySelectorAll('[data-export-skip], foreignObject, text').forEach((el) => el.remove());
  const width = 390;
  const height = 560;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (name) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(width / 2));
    label.setAttribute('y', String(height - 18));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'sans-serif');
    label.setAttribute('font-size', '18');
    label.setAttribute('font-weight', '700');
    label.style.fill = getComputedStyle(document.documentElement).getPropertyValue('--ink');
    label.textContent = name;
    clone.appendChild(label);
  }
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, width, height);
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = `my-tide-shore-${dateKey}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    URL.revokeObjectURL(url);
  }
}
