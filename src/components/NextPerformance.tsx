import React from 'react';
import { eventDate, eventText } from '../utils/events';
import { tr, useTranslations, type Locale } from '../utils/i18n';
import { TicketAction } from './EventRow';
import { useEvents } from './useEvents';

/** Hero card: the first performance that still has tickets (sold-out dates are skipped). */
export const NextPerformance: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = useTranslations(lang);
  const state = useEvents();

  if (state.status === 'loading') {
    return <div className="hidden lg:block min-h-[16rem] border border-zinc-800 bg-zinc-950/60 animate-pulse" aria-hidden="true" />;
  }
  if (state.status === 'error') return null;

  const next = state.events.find((e) => e.status === 'on_sale');
  if (!next) return null;

  const { dayMonth, weekday, time } = eventDate(next.datetime, lang);
  const title = eventText(next.title, lang);

  return (
    <aside className="border border-zinc-700 bg-zinc-950/80 backdrop-blur p-6 text-white">
      <p className="font-mono text-xs uppercase tracking-widest text-red-400 mb-5">
        {tr(lang, 'Lähim vaba etendus', 'Ближайший спектакль с билетами', 'Next available performance')}
      </p>
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-5xl font-bold tracking-tight">{dayMonth}</span>
        <span className="font-mono text-sm text-zinc-400">
          {weekday} · {time}
        </span>
      </div>
      <p className="mt-5 text-xl font-black uppercase tracking-tight leading-tight">
        {next.playSlug ? (
          <a href={`/${lang}/plays/${next.playSlug}/`} className="hover:text-red-400 transition-colors">
            {title}
          </a>
        ) : (
          title
        )}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">{eventText(next.venue, lang)}</p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <TicketAction event={next} lang={lang} />
        <a href={`/${lang}/afisha/`} className="font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white py-2">
          {t.home.viewAllAfisha}
        </a>
      </div>
    </aside>
  );
};

export default NextPerformance;
