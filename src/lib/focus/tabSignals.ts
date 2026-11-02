// What the browser tab shows when a focus block ends while Tide is hidden
// (v2.1 F-06): "Time's up · Tide", alternating with the task's name every
// two seconds (not at motion Off), and a favicon with a dot. Both go back
// the moment the page is visible again.
const DONE_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1f6f78"/><circle cx="16" cy="16" r="6" fill="#ffffff"/></svg>',
)}`;

let saved: { title: string; icons: Array<[HTMLLinkElement, string | null]>; added?: HTMLLinkElement } | null = null;
let flipper: number | null = null;

export function showTimesUpInTab(label: string, task: string, alternate: boolean): void {
  if (saved) return;
  const icons = [...document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')];
  // The attribute as written (often relative), so putting it back is exact.
  saved = { title: document.title, icons: icons.map((l) => [l, l.getAttribute('href')]) };
  if (icons.length === 0) {
    const link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
    saved.added = link;
    icons.push(link);
  }
  for (const link of icons) link.href = DONE_ICON;
  document.title = label;
  if (alternate) {
    let showTask = false;
    flipper = window.setInterval(() => {
      showTask = !showTask;
      document.title = showTask ? task : label;
    }, 2000);
  }
}

export function revertTab(): void {
  if (flipper !== null) window.clearInterval(flipper);
  flipper = null;
  if (!saved) return;
  document.title = saved.title;
  for (const [link, href] of saved.icons) {
    if (href === null) link.removeAttribute('href');
    else link.setAttribute('href', href);
  }
  saved.added?.remove();
  saved = null;
}

export const DONE_FAVICON = DONE_ICON;
