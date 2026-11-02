// The opt-in "Time's up" notification (v2.1 F-06). Only when the person
// turned it on, the browser granted permission and Tide is hidden. Android
// Chrome needs a service worker's showNotification; Tide doesn't register
// one yet, so elsewhere a plain Notification does it.
export async function notifyTimesUp(title: string, body: string): Promise<void> {
  await notify(title, body);
}

// Shared with the hidden-tab refocus nudge (F-07). Same tag, so a nudge and
// a "Time's up" never stack up as two separate notifications.
export async function notify(title: string, body: string): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const registration = await navigator.serviceWorker?.getRegistration?.().catch(() => undefined);
  if (registration) {
    await registration.showNotification(title, { body, tag: 'tide-focus' });
    return;
  }
  const n = new Notification(title, { body, tag: 'tide-focus' });
  // The outcome question is already open on the Focus screen.
  n.onclick = () => {
    window.focus();
    n.close();
  };
}
