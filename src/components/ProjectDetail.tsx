import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getProjectBySlug, type Project } from '../data/projects';
import { getSignedUrls } from '../lib/media';
import Prose from './Prose';
import Markdown from './Markdown';

export type ProjectDetailData = Project & {
  signedImages: { url: string; alt: string | null }[];
};

export async function loadProjectDetail(slug: string): Promise<ProjectDetailData | null> {
  try {
    const p = await getProjectBySlug(slug);
    const imgs = (p.project_images ?? []).sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
    let signedImages: { url: string; alt: string | null }[] = [];
    if (imgs.length) {
      const paths = imgs.map((i: any) => i.storage_path);
      const signed = await getSignedUrls(paths, 3600);
      const map = new Map(signed.map(s => [s.path, s.url]));
      signedImages = imgs
        .map((i: any) => ({ url: map.get(i.storage_path) || '', alt: i.alt || p.title }))
        .filter(im => im.url);
    }
    if (!signedImages.length) {
      signedImages = [{ url: '/placeholders/project-dark.svg', alt: p.title }];
    }
    return { ...p, signedImages } as ProjectDetailData;
  } catch {
    return null;
  }
}

function usePersistedTab(key: string, initial: string) {
  const [v, setV] = useState<string>(() => {
    try {
      return localStorage.getItem(key) || initial;
    } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, v); } catch {} }, [key, v]);
  return [v, setV] as const;
}

export default function ProjectDetail({ data, variant: _variant }: { data: ProjectDetailData; variant: 'page' | 'modal' }) {
  const [tab, setTab] = usePersistedTab(`proj:${data.slug}:tab`, 'star');

  const metric = data.metrics?.[0];
  const cAccent = 'rgb(var(--accent))';
  const cBorder = 'rgb(var(--border))';
  const cSub = 'rgb(var(--sub))';
  const [lightbox, setLightbox] = useState<{ src: string; alt?: string } | null>(null);
  const [zoomMode, setZoomMode] = useState<'contain'|'actual'>('contain');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const panning = useRef<{active: boolean; sx: number; sy: number}>({ active: false, sx: 0, sy: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const videos = (data.media_json ?? []).filter((m: any) => m?.kind === 'video') as any[];
  function toEmbedUrl(url: string, provider?: string | null) {
    try {
      const u = new URL(url);
      if (provider === 'youtube' || u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        let id = '';
        if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
        else if (u.searchParams.get('v')) id = u.searchParams.get('v') as string;
        else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (provider === 'vimeo' || u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean).pop();
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
    } catch {}
    return url;
  }

  const hero = (
    <div className="sticky top-0 z-10 bg-[rgb(var(--surface))]/85 backdrop-blur border-b" style={{ borderColor: cBorder }}>
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <h1 className="text-xl md:text-2xl font-semibold">{data.title}</h1>
          {data.kicker && (
            <span className="ml-auto text-xs px-3 py-1 rounded-full" style={{ color: cAccent, background: 'rgb(var(--accent) / .12)' }}>{data.kicker}</span>
          )}
        </div>
        <div className="mt-2 text-sm" style={{ color: cSub }}>{data.short_desc}</div>
        {(metric?.label || metric?.value) && (
          <div className="mt-2 text-sm">
            <span className="opacity-75">{metric?.label ? `${metric.label.replace(/:?$/, ':')}` : ''}</span>{' '}
            <span className="font-semibold">{metric?.value ?? ''}</span>
          </div>
        )}
        {!!(data.tags?.length) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tags.map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full text-xs border" style={{ borderColor: cBorder }}>{t}</span>
            ))}
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: cBorder }}>
          <button onClick={() => setTab('star')} className={`px-3 py-1.5 rounded-md text-sm ${tab==='star' ? 'bg-[rgb(var(--accent))] text-black' : ''}`}>Impact</button>
          <button onClick={() => setTab('story')} className={`px-3 py-1.5 rounded-md text-sm ${tab==='story' ? 'bg-[rgb(var(--accent))] text-black' : ''}`}>Story</button>
          <button onClick={() => setTab('media')} className={`px-3 py-1.5 rounded-md text-sm ${tab==='media' ? 'bg-[rgb(var(--accent))] text-black' : ''}`}>Media</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh]">
      {hero}
      <div className="p-4 md:p-5">
        {tab === 'star' && (
          <div className="space-y-4">
            {data.star_json && (data.star_json.situation || data.star_json.task || data.star_json.action || data.star_json.result) ? (
              <div className="grid gap-4">
                {data.star_json.situation && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: cAccent }}>Situation</h3>
                    <div className="mt-2">
                      <Prose value={data.star_json.situation} onImageClick={(src, alt) => setLightbox({ src, alt })} />
                    </div>
                  </section>
                )}
                {data.star_json.task && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: cAccent }}>Task</h3>
                    <div className="mt-2">
                      <Prose value={data.star_json.task} onImageClick={(src, alt) => setLightbox({ src, alt })} />
                    </div>
                  </section>
                )}
                {data.star_json.action && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: cAccent }}>Action</h3>
                    <div className="mt-2">
                      <Prose value={data.star_json.action} onImageClick={(src, alt) => setLightbox({ src, alt })} />
                    </div>
                  </section>
                )}
                {data.star_json.result && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: cAccent }}>Result</h3>
                    <div className="mt-2">
                      <Prose value={data.star_json.result} onImageClick={(src, alt) => setLightbox({ src, alt })} />
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold">Impact Highlights</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm" style={{ color: cSub }}>
                  {data.metrics?.length ? (
                    data.metrics.map((m, i) => (
                      <li key={i}><span className="opacity-80">{m.label?.replace(/:?$/, ':')}</span> <span className="font-medium text-[rgb(var(--fg))]">{m.value}</span></li>
                    ))
                  ) : (
                    <li>No metrics yet.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'story' && (
          <div className="max-w-none text-sm">
            <Markdown value={(data.narrative_md || data.long_desc || '')} onImageClick={(src, alt) => setLightbox({ src, alt })} />
          </div>
        )}

        {tab === 'media' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((v, i) => (
              <div key={`v-${i}`} className="rounded-lg overflow-hidden border aspect-video bg-black" style={{ borderColor: cBorder }}>
                {v.provider === 'file' ? (
                  <video controls className="w-full h-full">
                    <source src={v.url} />
                  </video>
                ) : (
                  <iframe
                    src={toEmbedUrl(v.url, v.provider)}
                    title={v.alt || `video-${i}`}
                    className="w-full h-full"
                    loading={i>0? 'lazy':'eager'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            ))}
            {data.signedImages.map((im, idx) => (
              <div key={`i-${idx}`} className="rounded-lg overflow-hidden border" style={{ borderColor: cBorder }}>
                <img onClick={() => setLightbox({ src: im.url, alt: im.alt ?? undefined })} src={im.url} alt={im.alt ?? ''} className="w-full h-auto object-cover cursor-zoom-in" loading={idx>0? 'lazy':'eager'} />
              </div>
            ))}
          </div>
        )}

        {!!(data.links?.length) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {data.links!.map(l => (
              <a key={l.href+l.label} href={l.href} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: cBorder }}>{l.label}<span className="ml-1 opacity-60">↗</span></a>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox for zooming images */}
      {lightbox && createPortal(
        <div className="fixed inset-0 z-[999]" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/85" onClick={() => setLightbox(null)} />
          <div className="relative h-full w-full pointer-events-none select-none">
            {/* subtle top gradient for button legibility */}
            <div className="fixed left-0 right-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-40 pointer-events-none" />
            <div className="pointer-events-auto fixed right-4 top-4 flex gap-2 z-50">
              <button
                onClick={() => { setZoomMode(m => m==='contain' ? 'actual' : 'contain'); setScale(1); setOffset({x:0,y:0}); }}
                className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10"
                style={{ borderColor: cBorder }}
              >{zoomMode==='contain' ? '100%' : 'Fit'}</button>
              <button
                onClick={() => setScale(s => Math.min(6, s * 1.25))}
                className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10"
                style={{ borderColor: cBorder }}
              >+</button>
              <button
                onClick={() => setScale(s => Math.max(0.2, s / 1.25))}
                className="h-9 px-3 rounded-md border text-white/90 hover:bg-white/10"
                style={{ borderColor: cBorder }}
              >−</button>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close image"
                className="h-12 w-12 grid place-items-center rounded-full border text-white/95 bg-white/10 backdrop-blur hover:bg-white/20 shadow-lg z-50"
                style={{ borderColor: 'rgba(255,255,255,.3)' }}
              >✕</button>
            </div>
            <div
              ref={boxRef}
              className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] h-[92vh] grid place-items-center overflow-hidden z-10"
              onWheel={(e) => { e.preventDefault(); const k = e.deltaY > 0 ? 0.9 : 1.1; setScale(s => Math.max(0.2, Math.min(6, s * k))); }}
              onMouseDown={(e) => { panning.current = { active: true, sx: e.clientX - offset.x, sy: e.clientY - offset.y }; }}
              onMouseMove={(e) => { if (!panning.current.active) return; setOffset({ x: e.clientX - panning.current.sx, y: e.clientY - panning.current.sy }); }}
              onMouseUp={() => { panning.current.active = false; }}
              onMouseLeave={() => { panning.current.active = false; }}
              onDoubleClick={() => { setScale(s => s !== 1 ? 1 : 2); }}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt ?? ''}
                className={`rounded-lg ${zoomMode==='contain' ? 'max-w-full max-h-full' : ''}`}
                style={{
                  maxWidth: zoomMode==='actual' ? 'none' : undefined,
                  maxHeight: zoomMode==='actual' ? 'none' : undefined,
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: panning.current.active ? 'none' : 'transform 80ms ease-out',
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
