import React, { useMemo } from 'react';
import { eventDate, monthTitle, type TheatreEvent } from '../utils/events';
import { useTranslations, type Locale } from '../utils/i18n';
import { EventRow, EventsMessage, EventsSkeleton } from './EventRow';
import { useEvents } from './useEvents';

/** The whole schedule in one list, with a heading per month. */
export const MonthlyAfisha: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = useTranslations(lang);
  const state = useEvents();

  const grouped = useMemo(() => {
    const groups: Record<string, TheatreEvent[]> = {};
    if (state.status === 'ready') {
      for (const ev of state.events) {
        (groups[eventDate(ev.datetime, lang).monthKey] ??= []).push(ev);
      }
    }
    return groups;
  }, [state, lang]);

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

  const months = Object.keys(grouped).sort();
  if (months.length === 0) {
    return <EventsMessage>{t.afisha.empty}</EventsMessage>;
  }

  return (
    <div className="w-full space-y-12">
      {months.map((month) => (
        <section key={month} aria-labelledby={`month-${month}`}>
          <h2 id={`month-${month}`} className="mb-3 text-sm font-mono font-bold uppercase tracking-widest text-red-600">
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
  );
};

export default MonthlyAfisha;
