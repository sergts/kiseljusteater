// Performances are not part of the build: the server's afisha sync writes /data/events.json
// and the browser loads it. Local dev (astro dev) uses src/dev/events.sample.json instead.
import type { Locale } from './i18n';

export type EventStatus = 'on_sale' | 'sold_out' | 'cancelled';

export interface TheatreEvent {
  id: string;
  piletikeskusEventId: string;
  playSlug: string | null;
  title: { et: string; ru: string; en?: string };
  datetime: string;
  venue: { et: string; ru: string; en?: string };
  ticketUrl: string;
  ticketUrlEn?: string;
  status: EventStatus;
}

const EVENTS_URL = '/data/events.json';
const TIME_ZONE = 'Europe/Tallinn';
// Keep showing a performance for a while after it starts (latecomers, same-evening visitors).
const GRACE_MS = 2 * 60 * 60 * 1000;

let pending: Promise<TheatreEvent[]> | null = null;
let requestedAt = 0;
// With page transitions the script stays alive between pages, so refetch once the data is a few minutes old.
const MAX_AGE_MS = 5 * 60 * 1000;

/** Upcoming events, sorted by date. Fetched once and shared by all islands on a page. */
export function loadEvents(): Promise<TheatreEvent[]> {
  if (pending && Date.now() - requestedAt > MAX_AGE_MS) pending = null;
  if (!pending) {
    requestedAt = Date.now();
    pending = fetchEvents().catch((err) => {
      pending = null; // allow a retry on the next call
      throw err;
    });
  }
  return pending;
}

async function fetchEvents(): Promise<TheatreEvent[]> {
  let raw: { events?: TheatreEvent[] };
  if (import.meta.env.DEV) {
    raw = (await import('../dev/events.sample.json')).default as { events: TheatreEvent[] };
  } else {
    const res = await fetch(EVENTS_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`events.json: HTTP ${res.status}`);
    raw = await res.json();
  }
  const cutoff = Date.now() - GRACE_MS;
  return (raw.events ?? [])
    .filter((e) => Date.parse(e.datetime) >= cutoff)
    .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
}

const intlLocale = (lang: Locale) => ({ et: 'et-EE', ru: 'ru-RU', en: 'en-GB' })[lang];

/**
 * True when the performance is at the theatre's own hall. Sviby writes it "Kiseljus TEATER" (sometimes with ", Lootsi 8"),
 * and the English feed sometimes returns the street instead, so the Estonian name is the reliable one.
 * The afisha only names a venue when it is somewhere else.
 */
export const isHomeVenue = (venue: { et: string }): boolean => /^\s*kiseljus\b/i.test(venue.et);

/** A localised event text; falls back to Estonian when the language is missing. */
export const eventText = (value: { et: string; ru: string; en?: string }, lang: Locale): string => value[lang] || value.et;

/** Date parts in the theatre's time zone, independent of the visitor's clock settings. */
export function eventDate(iso: string, lang: Locale) {
  const d = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  return {
    monthKey: `${parts.year}-${parts.month}`,
    dayMonth: `${parts.day}.${parts.month}`,
    date: `${parts.day}.${parts.month}.${parts.year}`,
    time: `${parts.hour}:${parts.minute}`,
    weekday: new Intl.DateTimeFormat(intlLocale(lang), { timeZone: TIME_ZONE, weekday: 'short' }).format(d).toUpperCase(),
  };
}

export function monthTitle(monthKey: string, lang: Locale): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 15))
    .toLocaleDateString(intlLocale(lang), { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase();
}
