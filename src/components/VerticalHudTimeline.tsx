import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Timeline as TimelineItem } from '../data/timeline';
import { createPortal } from 'react-dom';

// Tiny icon set (no extra deps)
const Icon = ({ kind }: { kind: TimelineItem['kind'] }) => {
  const s = { width: 18, height: 18, color: 'rgb(var(--accent))' } as const;
  if (kind === 'edu')    return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>;
  if (kind === 'cert')   return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2Z" stroke="currentColor" strokeWidth="1.6"/></svg>;
  if (kind === 'future') return <svg {...s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6"/></svg>;
  // work / project
  return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M4 8h16v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z" stroke="currentColor" strokeWidth="1.6"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6"/></svg>;
};

type Props = { items?: TimelineItem[] };

export default function VerticalHudTimeline({ items = [] }: Props) {
  const KIND_ORDER: TimelineItem['kind'][] = ['project','work','edu','cert','future'];
  const KIND_LABEL: Record<TimelineItem['kind'], string> = {
    work: 'Work',
    edu: 'Education',
    cert: 'Certification',
    project: 'Projects',
    future: 'Future',
  };
  const grouped = useMemo(() => {
    const map: Record<TimelineItem['kind'], TimelineItem[]> = {
      work: [], edu: [], cert: [], project: [], future: []
    };
    for (const it of items) map[it.kind].push(it);
    for (const k of KIND_ORDER) map[k].sort((a, b) => a.start.localeCompare(b.start)).reverse();
    return KIND_ORDER.map(k => [k, map[k]] as const).filter(([, arr]) => arr.length);
  }, [items]);

  const cAccent   = 'rgb(var(--accent))';
  const cPanel    = 'color-mix(in oklab, rgb(var(--surface)) 85%, rgb(var(--accent)) 15% / 10%)';
  const cBorder   = 'rgb(var(--border))';
  const cText     = 'rgb(var(--fg))';
  const glow      = '0 0 0 1px rgba(255,255,255,.02) inset, 0 6px 28px rgba(0,0,0,.28)';

  const [lightbox, setLightbox] = useState<{ url: string; alt: string | null } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomMode, setZoomMode] = useState<'contain' | 'actual'>('contain');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const panning = useRef<{ active: boolean; sx: number; sy: number }>({ active: false, sx: 0, sy: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function openLightbox(url: string, alt: string | null) {
    setScale(1); setOffset({ x: 0, y: 0 }); setZoomMode('contain');
    setLightbox({ url, alt });
  }

  return (
    <>
    <div className="relative max-w-4xl mx-auto">
      {/* Central timeline line */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{
          background: `linear-gradient(to bottom, ${cAccent} 0%, ${cAccent}75 40%, ${cAccent}55 100%)`,
          boxShadow: `0 0 10px ${cAccent}35`
        }}
      />
      {/* Quick nav chips */}
      <div className="relative mb-6 flex flex-wrap gap-3 pl-20">
        {grouped.map(([k]) => (
          <a 
            key={k} 
            href={`#tl-${k}`} 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:scale-105 ${
              k === 'edu' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' :
              k === 'work' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' :
              k === 'cert' ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' :
              k === 'project' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' :
              'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
            }`}
            style={{
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span className="relative z-10">
              {KIND_LABEL[k]}
            </span>
          </a>
        ))}
      </div>

      <div className="relative">
        {grouped.map(([kind, list]) => (
          <section key={kind} id={`tl-${kind}`} className="relative mb-10">
            <div className="pl-20 mb-3">
              <h4 className="text-lg font-semibold" style={{ color: cText }}>{KIND_LABEL[kind]}</h4>
            </div>
            {list.map((t, i) => {
              const condensed = t.kind === 'cert' || t.kind === 'edu';
              const firstBullet = t.bullets?.[0];
              const restBullets = (t.bullets ?? []).slice(1);
              return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="relative pl-20 mb-12 last:mb-0 group"
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
                    {!condensed && t.location && (
                      <p className="text-xs md:text-sm mb-3 opacity-70" style={{ color: 'rgb(var(--sub))' }}>
                        {t.location}
                      </p>
                    )}
                    {condensed ? (
                      firstBullet ? (
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cAccent }} />
                            <span>{firstBullet}</span>
                          </li>
                        </ul>
                      ) : null
                    ) : (
                      t.bullets?.length ? (
                        <ul className="space-y-2 text-sm">
                          {t.bullets.map((b, j) => (
                            <li key={j} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cAccent }} />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null
                    )}
                    {/* Attachments */}
                    {Array.isArray((t as any).attachments_json) && (t as any).attachments_json.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(t as any).attachments_json.map((a: any) => {
                          const href = a.url ?? a._url ?? a.storage_path;
                          const isPdf = (a?.kind === 'pdf') || /\.pdf($|\?)/i.test(String(href));
                          return (
                            <div key={a.storage_path} className="relative border rounded overflow-hidden">
                              {!isPdf ? (
                                <img
                                  src={href}
                                  alt={a.alt ?? ''}
                                  className="w-full h-28 object-cover cursor-zoom-in"
                                  loading="lazy"
                                  onClick={() => openLightbox(href, a.alt ?? null)}
                                />
                              ) : (
                                <a href={href} target="_blank" rel="noreferrer" className="block p-3 text-sm underline">
                                  {a.alt || 'View PDF'}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {condensed && (
                      <div className="hidden group-hover:block group-focus-within:block mt-3">
                        {t.location && (
                          <p className="text-xs md:text-sm mb-3 opacity-70" style={{ color: 'rgb(var(--sub))' }}>
                            {t.location}
                          </p>
                        )}
                        {restBullets.length ? (
                          <ul className="space-y-2 text-sm">
                            {restBullets.map((b, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cAccent }} />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    )}
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
            );})}
          </section>
        ))}
      </div>
    </div>
    {lightbox && createPortal(
      <div className="fixed inset-0 z-[999]" aria-modal="true" role="dialog">
        <div className="absolute inset-0 bg-black/85" onClick={() => setLightbox(null)} />
        <div className="fixed left-0 right-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-40" />
        <div className="pointer-events-auto fixed right-4 top-4 flex gap-2 z-50">
          <button onClick={() => { setZoomMode(m => m==='contain' ? 'actual' : 'contain'); setScale(1); setOffset({x:0,y:0}); }} className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,.35)' }}>{zoomMode==='contain' ? '100%' : 'Fit'}</button>
          <button onClick={() => setScale(s => Math.min(6, s * 1.25))} className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,.35)' }}>+</button>
          <button onClick={() => setScale(s => Math.max(0.2, s / 1.25))} className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,.35)' }}>−</button>
          <button onClick={() => setLightbox(null)} aria-label="Close image" className="h-12 w-12 grid place-items-center rounded-full border text-white/95 bg-white/10 backdrop-blur hover:bg-white/20 shadow-lg" style={{ borderColor: 'rgba(255,255,255,.3)' }}>✕</button>
        </div>
        <div
          ref={boxRef}
          className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] h-[92vh] grid place-items-center overflow-hidden z-10"
          onWheel={(e) => { e.preventDefault(); const k = e.deltaY > 0 ? 0.9 : 1.1; setScale(s => Math.max(0.2, Math.min(6, s * k))); }}
          onMouseDown={(e) => { panning.current = { active: true, sx: e.clientX - offset.x, sy: e.clientY - offset.y }; }}
          onMouseMove={(e) => { if (!panning.current.active) return; setOffset({ x: e.clientX - panning.current.sx, y: e.clientY - panning.current.sy }); }}
          onMouseUp={() => { panning.current.active = false; }}
          onMouseLeave={() => { panning.current.active = false; }}
          onDoubleClick={() => { setZoomMode(m => m==='contain' ? 'actual' : 'contain'); setScale(1); setOffset({x:0,y:0}); }}
        >
          <img
            src={lightbox!.url}
            alt={lightbox!.alt ?? ''}
            style={{
              maxWidth: zoomMode === 'contain' ? '90vw' : 'none',
              maxHeight: zoomMode === 'contain' ? '85vh' : 'none',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: 'transform 0.02s linear',
            }}
            className="select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>, document.body)
    }
  </>
  );
}
