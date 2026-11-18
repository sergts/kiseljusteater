import React from 'react';
import { useTranslations, type Locale } from '../utils/i18n';
import { EventRow, EventsMessage, EventsSkeleton } from './EventRow';
import { useEvents } from './useEvents';

/** The next few performances that still have tickets, for the home page (sold-out and cancelled dates are left out). */
export const UpcomingEvents: React.FC<{ lang: Locale; limit?: number }> = ({ lang, limit = 4 }) => {
  const t = useTranslations(lang);
  const state = useEvents();

  if (state.status === 'loading') return <EventsSkeleton rows={limit} />;
  if (state.status === 'error') return <EventsMessage tone="error">{t.afisha.unavailable}</EventsMessage>;

  const events = state.events.filter((e) => e.status === 'on_sale').slice(0, limit);
  if (events.length === 0) {
    return <EventsMessage>{state.events.length > 0 ? t.afisha.noAvailable : t.afisha.empty}</EventsMessage>;
  }

  return (
    <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
      {events.map((ev) => (
        <EventRow key={ev.id} event={ev} lang={lang} />
      ))}
    </div>
  );
};

export default UpcomingEvents;
