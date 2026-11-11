import React, { useState } from 'react';

export interface Performance {
  id: string;
  datetime: string;
  playSlug: string;
  playTitle: { et: string; ru: string };
  venue: { et: string; ru: string };
  ticketUrl: string;
  isSoldOut: boolean;
}

export const MonthlyAfisha: React.FC<{ events: Performance[]; lang: 'et' | 'ru' }> = ({ events, lang }) => {
  const grouped = events.reduce((acc, ev) => {
    const key = ev.datetime.substring(0, 7); // "YYYY-MM"
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, Performance[]>);

  const months = Object.keys(grouped).sort();
  const [activeMonth, setActiveMonth] = useState<string>(months[0] || '');

  const formatMonthTitle = (key: string) => {
    const [year, month] = key.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'et-EE', { month: 'short', year: 'numeric' }).toUpperCase();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      dayMonth: `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weekday: d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'et-EE', { weekday: 'short' }).toUpperCase()
    };
  };

  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center font-mono text-sm text-zinc-500 border border-dashed border-zinc-300">
        {lang === 'ru' ? 'В расписании пока нет запланированных спектаклей.' : 'Hetkel kavas etendusi ei ole.'}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Month Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-4">
        {months.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMonth(m)}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
              m === activeMonth
                ? 'bg-red-600 text-white font-bold'
                : 'bg-white text-black border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {formatMonthTitle(m)}
          </button>
        ))}
      </div>

      {/* Selected Month Schedule Rows */}
      {activeMonth && grouped[activeMonth] && (
        <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
          {grouped[activeMonth].map((ev) => {
            const { dayMonth, time, weekday } = formatDate(ev.datetime);
            return (
              <div key={ev.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/75 transition-colors px-2">
                <div className="flex items-center gap-6 min-w-[200px]">
                  <span className="text-2xl font-bold font-mono tracking-tight">{dayMonth}</span>
                  <div className="text-xs font-mono text-zinc-500">
                    <span className="text-red-600 font-semibold">{weekday}</span>
                    <br />
                    {time}
                  </div>
                </div>

                <div className="flex-1">
                  <a href={`/${lang}/plays/${ev.playSlug}`} className="text-xl font-bold uppercase tracking-tight hover:text-red-600 transition-colors">
                    {ev.playTitle[lang]}
                  </a>
                  <p className="text-zinc-500 text-xs font-mono mt-1">{ev.venue[lang]}</p>
                </div>

                <div className="min-w-[160px] text-left md:text-right">
                  {ev.isSoldOut ? (
                    <span className="inline-block border border-red-600 text-red-600 px-4 py-2 text-xs font-mono uppercase tracking-widest">
                      {lang === 'ru' ? 'Продано' : 'Välja müüdud'}
                    </span>
                  ) : (
                    <a
                      href={ev.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-colors"
                    >
                      {lang === 'ru' ? 'Купить билет' : 'Osta pilet'}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthlyAfisha;
