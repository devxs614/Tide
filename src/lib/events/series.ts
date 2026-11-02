// Weekly series for events (v2.1 spec 8.5). The seed and anything made
// before v2.1 are separate weekly rows; events with the same title, kind,
// start time and length become one series, whatever weekdays they fall on
// (Physics on Mon/Wed/Fri at 9:00 is one series). That's what lets "delete
// all Physics events" work on data made before v2.1. A lone event stays
// on its own.
import type { CalendarEvent, EventSeries } from '../types';
import { toISODate } from '../time';

const hhmm = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// FNV-1a: short, stable ids from the key, the same on every device.
function hash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function seriesKey(e: CalendarEvent): string {
  return `${e.title}|${e.kind}|${hhmm(e.start)}|${Math.round((e.end - e.start) / 60000)}`;
}

export function groupEventsIntoSeries(events: CalendarEvent[]): { series: EventSeries[]; assignments: Map<string, string> } {
  const groups = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    if (e.seriesId) continue;
    const key = seriesKey(e);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  const series: EventSeries[] = [];
  const assignments = new Map<string, string>();
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => a.start - b.start);
    const days = [...new Set(sorted.map((e) => new Date(e.start).getDay()))].sort((a, b) => a - b);
    const id = `s-${hash(key)}-${days.join('')}`;
    const first = sorted[0];
    series.push({
      id,
      title: first.title,
      kind: first.kind,
      days,
      startHHMM: hhmm(first.start),
      endHHMM: hhmm(first.end),
      place: first.place,
      prep: first.prep,
      until: toISODate(sorted[sorted.length - 1].start),
    });
    for (const e of sorted) assignments.set(e.id, id);
  }
  return { series, assignments };
}

// The events with their series ids filled in, and the series rows to store.
export function withSeries(events: CalendarEvent[]): { events: CalendarEvent[]; series: EventSeries[] } {
  const { series, assignments } = groupEventsIntoSeries(events);
  return { events: events.map((e) => (assignments.has(e.id) ? { ...e, seriesId: assignments.get(e.id) } : e)), series };
}
