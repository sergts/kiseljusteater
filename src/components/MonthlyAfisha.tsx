import React, { useEffect, useMemo, useRef, useState } from 'react';
import { eventDate, eventText, monthTitle, type TheatreEvent } from '../utils/events';
import { useTranslations, type Locale } from '../utils/i18n';
import { EventRow, EventsMessage, EventsSkeleton } from './EventRow';
import { useEvents } from './useEvents';

export interface PlayRef {
  slug: string;
  title: string;
}

/** Events that are not linked to a play are grouped by their title. */
const keyOf = (e: TheatreEvent) => e.playSlug ?? `title:${e.title.et}`;

/**
 * The whole schedule in one list: a heading per month, filters by production and availability,
 * and a month bar that stays under the header and jumps to a month (it does not hide the other months).
 * The filters are kept in the address (?play=…&available=1), so a filtered view can be shared.
 */
export const MonthlyAfisha: React.FC<{ lang: Locale; plays: PlayRef[] }> = ({ lang, plays }) => {
  const t = useTranslations(lang);
  const state = useEvents();
  const [play, setPlay] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [activeMonth, setActiveMonth] = useState('');
  const addressRead = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setPlay(q.get('play') ?? '');
    setOnlyAvailable(q.get('available') === '1');
    addressRead.current = true;
  }, []);

  useEffect(() => {
    if (!addressRead.current) return;
    const q = new URLSearchParams(window.location.search);
    if (play) q.set('play', play); else q.delete('play');
    if (onlyAvailable) q.set('available', '1'); else q.delete('available');
    const qs = q.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
  }, [play, onlyAvailable]);

  const options = useMemo(() => {
    const found = new Map<string, { key: string; label: string; count: number }>();
    if (state.status === 'ready') {
      for (const e of state.events) {
        const key = keyOf(e);
        const entry = found.get(key) ?? { key, label: plays.find((p) => p.slug === e.playSlug)?.title ?? eventText(e.title, lang), count: 0 };
        entry.count += 1;
        found.set(key, entry);
      }
    }
    return [...found.values()];
  }, [state, plays, lang]);

  // A shared link may name a production that no longer has dates.
  useEffect(() => {
    if (state.status === 'ready' && play && !options.some((o) => o.key === play)) setPlay('');
  }, [state, options, play]);

  const grouped = useMemo(() => {
    const groups: Record<string, TheatreEvent[]> = {};
    if (state.status === 'ready') {
      for (const ev of state.events) {
        if (play && keyOf(ev) !== play) continue;
        if (onlyAvailable && ev.status !== 'on_sale') continue;
        (groups[eventDate(ev.datetime, lang).monthKey] ??= []).push(ev);
      }
    }
    return groups;
  }, [state, lang, play, onlyAvailable]);
  const months = Object.keys(grouped).sort();

  // Highlight the month that is currently under the month bar.
  useEffect(() => {
    if (months.length === 0) return;
    const sections = document.querySelectorAll<HTMLElement>('[data-month]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveMonth((entry.target as HTMLElement).dataset.month ?? '');
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [months.join(',')]);

  if (state.status === 'loading') {
    return (
      <div>
        <p className="sr-only">{t.afisha.loading}</p>
        <EventsSkeleton rows={4} />
      </div>
    );
  }
  if (state.status === 'error') {
    return <EventsMessage tone="error">{t.afisha.unavailable}</EventsMessage>;
  }
  if (state.events.length === 0) {
    return <EventsMessage>{t.afisha.empty}</EventsMessage>;
  }

  const chip = (selected: boolean) =>
    `shrink-0 min-h-[2.75rem] max-w-[18rem] truncate px-4 text-xs font-mono uppercase tracking-widest border transition-colors ${
      selected ? 'bg-red-600 border-red-600 text-white font-bold' : 'bg-white border-zinc-300 text-black hover:border-black'
    }`;

  const jumpTo = (month: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMonth(month);
    document.getElementById(`month-${month}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t.afisha.filterLabel} className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap pb-1">
          <button type="button" aria-pressed={play === ''} onClick={() => setPlay('')} className={chip(play === '')}>
            {t.afisha.all}
          </button>
          {options.map((o) => (
            <button key={o.key} type="button" aria-pressed={play === o.key} title={o.label} onClick={() => setPlay(play === o.key ? '' : o.key)} className={chip(play === o.key)}>
              {o.label} <span className="opacity-70">({o.count})</span>
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-3 min-h-[2.75rem] font-mono text-xs uppercase tracking-widest cursor-pointer select-none">
          <input type="checkbox" className="h-5 w-5 accent-red-600" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          {t.afisha.onlyAvailable}
        </label>
      </div>

      {months.length === 0 ? (
        <div className="py-12 text-center">
          <EventsMessage>{t.afisha.noMatches}</EventsMessage>
          <button type="button" onClick={() => { setPlay(''); setOnlyAvailable(false); }} className="mt-4 min-h-[2.75rem] px-5 bg-black hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest transition-colors">
            {t.afisha.resetFilters}
          </button>
        </div>
      ) : (
        <>
          {/* Month bar: stays under the header, jumps to a month */}
          <nav
            aria-label={t.afisha.jumpLabel}
            className="sticky z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 mb-8 bg-white/95 backdrop-blur border-b border-zinc-200 transition-[top] duration-300"
            style={{ top: 'var(--header-offset, 5rem)' }}
          >
            <div className="flex gap-1 overflow-x-auto">
              {months.map((m) => (
                <a
                  key={m}
                  href={`#month-${m}`}
                  onClick={jumpTo(m)}
                  aria-current={m === (activeMonth || months[0]) ? 'true' : undefined}
                  className={`shrink-0 inline-flex items-center min-h-[2.75rem] px-4 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${
                    m === (activeMonth || months[0]) ? 'border-red-600 text-red-600 font-bold' : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  {monthTitle(m, lang)}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {months.map((month) => (
              <section key={month} data-month={month} aria-labelledby={`month-${month}`}>
                <h2 id={`month-${month}`} style={{ scrollMarginTop: 'calc(var(--header-offset, 5rem) + 4rem)' }} className="mb-3 text-sm font-mono font-bold uppercase tracking-widest text-red-600">
                  {monthTitle(month, lang)}
                </h2>
                <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
                  {grouped[month].map((ev) => (
                    <EventRow key={ev.id} event={ev} lang={lang} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyAfisha;
