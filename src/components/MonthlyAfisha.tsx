import React, { useMemo, useState } from 'react';
import { eventDate, monthTitle, type TheatreEvent } from '../utils/events';
import { useTranslations, type Locale } from '../utils/i18n';
import { EventRow, EventsMessage, EventsSkeleton } from './EventRow';
import { useEvents } from './useEvents';

export const MonthlyAfisha: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = useTranslations(lang);
  const state = useEvents();
  const [selected, setSelected] = useState<string | null>(null);

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
  const activeMonth = selected && grouped[selected] ? selected : months[0];

  return (
    <div className="w-full">
      {/* Month Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-4">
        {months.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelected(m)}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
              m === activeMonth
                ? 'bg-red-600 text-white font-bold'
                : 'bg-white text-black border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {monthTitle(m, lang)}
          </button>
        ))}
      </div>

      {/* Selected Month Schedule Rows */}
      <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
        {grouped[activeMonth].map((ev) => (
          <EventRow key={ev.id} event={ev} lang={lang} />
        ))}
      </div>
    </div>
  );
};

export default MonthlyAfisha;
