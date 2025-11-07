import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Timeline as TimelineItem } from '../data/timeline';

// Tiny icon set (no extra deps)
const Icon = ({ kind }: { kind: TimelineItem['kind'] }) => {
  const s = { width: 18, height: 18, color: 'rgb(var(--accent))' } as const;
  if (kind === 'edu')    return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="m3 7 9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6"/><path d="M21 10v5" stroke="currentColor" strokeWidth="1.6"/></svg>;
  if (kind === 'cert')   return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2Z" stroke="currentColor" strokeWidth="1.6"/></svg>;
  if (kind === 'future') return <svg {...s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6"/></svg>;
  // work / project
  return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M4 8h16v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z" stroke="currentColor" strokeWidth="1.6"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6"/></svg>;
};

type Props = { items?: TimelineItem[] };

export default function VerticalHudTimeline({ items = [] }: Props) {
  const data = useMemo(() =>
    [...items].sort((a, b) => a.start.localeCompare(b.start)).reverse(),
    [items]
  );

  const cAccent   = 'rgb(var(--accent))';
  const cPanel    = 'color-mix(in oklab, rgb(var(--surface)) 85%, rgb(var(--accent)) 15% / 10%)';
  const cBorder   = 'rgb(var(--border))';
  const cText     = 'rgb(var(--fg))';
  const glow      = '0 0 0 1px rgba(255,255,255,.02) inset, 0 6px 28px rgba(0,0,0,.28)';

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Central timeline line */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{
          background: `linear-gradient(to bottom, ${cAccent} 0%, ${cAccent}75 40%, ${cAccent}55 100%)`,
          boxShadow: `0 0 10px ${cAccent}35`
        }}
      />

      <div className="relative">
        {data.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative pl-20 mb-12 last:mb-0"
          >
            {/* Icon on the rail */}
            <div className="absolute left-8 -translate-x-1/2 top-3 z-10">
              <div
                className="relative w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: cAccent,
                  color: cAccent,
                  background: 'transparent'
                }}
                aria-hidden
              >
                {/* bring the line visually through the icon */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-[-18px] bottom-[-18px] w-0.5"
                  style={{
                    background: `linear-gradient(to bottom, ${cAccent} 0%, ${cAccent}70 50%, ${cAccent}50 100%)`
                  }}
                />
                <Icon kind={t.kind} />
              </div>
            </div>

            {/* Content card */}
            <motion.div whileHover={{ scale: 1.02 }} className="flex-1 min-w-0">
              <div
                className="rounded-xl border p-4 md:p-6 backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
                style={{ background: cPanel, borderColor: cBorder, boxShadow: glow, color: cText }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-base md:text-lg font-semibold leading-tight">
                    {t.title}{t.org ? <span className="opacity-80"> — {t.org}</span> : null}
                  </h3>
                  <span className="text-sm opacity-70" style={{ color: 'rgb(var(--sub))' }}>
                    {t.date}
                  </span>
                </div>
                {t.location && (
                  <p className="text-xs md:text-sm mb-3 opacity-70" style={{ color: 'rgb(var(--sub))' }}>
                    {t.location}
                  </p>
                )}
                {t.bullets?.length ? (
                  <ul className="space-y-2 text-sm">
                    {t.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cAccent }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {!!t.cta?.length && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {t.cta.map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors"
                        style={{ borderColor: cBorder, background: 'transparent', color: cText }}
                      >
                        {c.label}
                        <span className="text-xs opacity-70">↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
