import { useEffect, useRef, useState } from 'react';
import { listGallery, type GalleryItem } from '../data/gallery';
import { createPortal } from 'react-dom';

export default function GameGallery() {
  const [g3d, setG3d] = useState<GalleryItem[]>([]);
  const [g2d, setG2d] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [lightbox, setLightbox] = useState<{ url: string; alt: string | null } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomMode, setZoomMode] = useState<'contain' | 'actual'>('contain');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const panning = useRef<{ active: boolean; sx: number; sy: number }>({ active: false, sx: 0, sy: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [a, b] = await Promise.all([
          listGallery({ persona: 'game', section: '3d' }),
          listGallery({ persona: 'game', section: '2d' }),
        ]);
        setG3d(a);
        setG2d(b);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openLightbox(url: string, alt: string | null) {
    setScale(1); setOffset({ x: 0, y: 0 }); setZoomMode('contain');
    setLightbox({ url, alt });
  }

  return (
    <div className="space-y-10">
      <GallerySection title="3D Models" items={g3d} loading={loading} onOpen={openLightbox} />
      <GallerySection title="2D Character Concepts" items={g2d} loading={loading} onOpen={openLightbox} />

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
              src={lightbox.url}
              alt={lightbox.alt ?? ''}
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
    </div>
  );
}

function GallerySection({ title, items, loading, onOpen }: { title: string; items: GalleryItem[]; loading: boolean; onOpen: (url: string, alt: string | null) => void; }) {
  const cBorder = 'rgb(var(--border))';
  const cText   = 'rgb(var(--fg))';
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-semibold text-accent">{title}</h2>
      {loading ? (
        <div className="opacity-70 mt-2">Loading…</div>
      ) : (
        <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map(it => (
            <div key={it.id} className="relative border rounded overflow-hidden" style={{ borderColor: cBorder }}>
              {it.url ? (
                <img src={it.url} alt={it.alt ?? ''} className="w-full h-40 object-cover cursor-zoom-in" loading="lazy" onClick={() => onOpen(it.url!, it.alt ?? null)} />
              ) : (
                <div className="w-full h-40 grid place-items-center text-sm opacity-70" style={{ color: cText }}>Loading…</div>
              )}
            </div>
          ))}
          {!items.length && (
            <div className="col-span-full text-sm opacity-70">No media yet.</div>
          )}
        </div>
      )}
    </section>
  );
}
