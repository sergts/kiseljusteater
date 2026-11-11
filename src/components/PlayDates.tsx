import React from 'react';
import { eventDate } from '../utils/events';
import { useTranslations, type Locale } from '../utils/i18n';
import { TicketAction } from './EventRow';
import { useEvents } from './useEvents';

/**
 * Upcoming performances of one play.
 * variant "list": full rows with ticket buttons (play page); "chips": up to 3 dates (play cards).
 */
export const PlayDates: React.FC<{ lang: Locale; playSlug: string; variant: 'list' | 'chips' }> = ({ lang, playSlug, variant }) => {
  const t = useTranslations(lang);
  const state = useEvents();

  if (state.status === 'loading') {
    return variant === 'chips'
      ? <div className="h-6 w-48 bg-zinc-100 animate-pulse" aria-hidden="true" />
      : <div className="py-6 h-16 bg-zinc-50 animate-pulse" aria-hidden="true" />;
  }
  if (state.status === 'error') {
    return <p className={`font-mono text-zinc-500 ${variant === 'chips' ? 'text-xs' : 'py-6 text-sm px-2'}`}>{t.afisha.unavailable}</p>;
  }

  const events = state.events.filter((e) => e.playSlug === playSlug);

  if (variant === 'chips') {
    const shown = events.filter((e) => e.status !== 'cancelled');
    if (shown.length === 0) return <p className="text-xs font-mono text-zinc-400">{t.plays.noUpcoming}</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {shown.slice(0, 3).map((e) => (
          <span key={e.id} className="inline-block bg-zinc-100 text-zinc-800 text-xs font-mono px-2.5 py-1">
            {eventDate(e.datetime, lang).date}
          </span>
        ))}
        {shown.length > 3 && (
          <span className="text-xs font-mono text-zinc-400 self-center">
            +{shown.length - 3} {t.plays.more}
          </span>
        )}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="py-6 font-mono text-sm text-zinc-500 px-2">{t.plays.noUpcoming}</p>;
  }
  return (
    <>
      {events.map((e) => {
        const d = eventDate(e.datetime, lang);
        return (
          <div key={e.id} className={`py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 transition-colors px-2 ${e.status === 'cancelled' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-lg text-black">{d.date}</span>
              <span className="text-xs font-mono text-zinc-500">{d.weekday} {d.time}</span>
            </div>
            <span className="text-xs font-mono text-zinc-600">{e.venue[lang]}</span>
            <div>
              <TicketAction event={e} lang={lang} compact />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default PlayDates;
