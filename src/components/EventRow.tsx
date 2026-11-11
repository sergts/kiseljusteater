import React from 'react';
import { eventDate, type TheatreEvent } from '../utils/events';
import { useTranslations, type Locale } from '../utils/i18n';

export const TicketAction: React.FC<{ event: TheatreEvent; lang: Locale; compact?: boolean }> = ({ event, lang, compact }) => {
  const t = useTranslations(lang);
  if (event.status === 'on_sale' && event.ticketUrl) {
    return (
      <a
        href={event.ticketUrl}
        target="_blank"
        rel="noreferrer"
        className={`inline-block bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors ${compact ? 'px-5 py-2' : 'px-6 py-2.5'}`}
      >
        {compact ? t.plays.buyTicket : t.afisha.buy}
      </a>
    );
  }
  return (
    <span className="inline-block border border-red-600 text-red-600 px-4 py-2 text-xs font-mono uppercase tracking-widest">
      {event.status === 'cancelled' ? t.afisha.cancelled : t.afisha.soldOut}
    </span>
  );
};

/** One performance row as used on the afisha and the home page. */
export const EventRow: React.FC<{ event: TheatreEvent; lang: Locale }> = ({ event, lang }) => {
  const { dayMonth, time, weekday } = eventDate(event.datetime, lang);
  const title = event.title[lang];
  return (
    <div className={`py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/75 transition-colors px-2 ${event.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-6 min-w-[200px]">
        <span className="text-2xl font-bold font-mono tracking-tight">{dayMonth}</span>
        <div className="text-xs font-mono text-zinc-500">
          <span className="text-red-600 font-semibold">{weekday}</span>
          <br />
          {time}
        </div>
      </div>

      <div className="flex-1">
        {event.playSlug ? (
          <a href={`/${lang}/plays/${event.playSlug}`} className="text-xl font-bold uppercase tracking-tight hover:text-red-600 transition-colors">
            {title}
          </a>
        ) : (
          <span className="text-xl font-bold uppercase tracking-tight">{title}</span>
        )}
        <p className="text-zinc-500 text-xs font-mono mt-1">{event.venue[lang]}</p>
      </div>

      <div className="min-w-[160px] text-left md:text-right">
        <TicketAction event={event} lang={lang} />
      </div>
    </div>
  );
};

export const EventsMessage: React.FC<{ children: React.ReactNode; tone?: 'muted' | 'error' }> = ({ children, tone = 'muted' }) => (
  <div className={`py-12 text-center font-mono text-sm border border-dashed ${tone === 'error' ? 'text-red-700 border-red-300' : 'text-zinc-500 border-zinc-300'}`}>
    {children}
  </div>
);

export const EventsSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200" aria-hidden="true">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="py-6 px-2 flex items-center gap-6 animate-pulse">
        <div className="h-7 w-20 bg-zinc-100" />
        <div className="h-6 flex-1 max-w-sm bg-zinc-100" />
      </div>
    ))}
  </div>
);
