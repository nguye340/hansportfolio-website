import { useEffect, useRef, useState } from 'react';

type Props = {
  images: { url: string; alt: string | null }[];
  heroTitle?: string | null;
  autoMs?: number;
};

export default function ProjectGallery({
  images,
  heroTitle,
  autoMs = 3500,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (hover || images.length <= 1) return;
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, autoMs);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [hover, images.length, autoMs]);

  function next() { setIdx((i) => (i + 1) % images.length); }
  function prev() { setIdx((i) => (i - 1 + images.length) % images.length); }

  const pct = images.length > 1 ? ((idx + 1) / images.length) * 100 : 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black/20"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* slide */}
      <div className="aspect-[16/9] relative">
        <img
          src={images[idx]?.url}
          alt={images[idx]?.alt ?? ''}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {/* gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        {/* edge tint on hover (accent-aware) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity"
          style={{
            opacity: hover ? 1 : 0,
            background:
              'linear-gradient(90deg, rgb(var(--accent)/.12) 0%, transparent 20%, transparent 80%, rgb(var(--accent)/.12) 100%)',
          }}
        />
        {heroTitle && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
              {heroTitle}
            </h2>
          </div>
        )}
        {/* chevrons */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={prev}
              className="group absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full backdrop-blur-md border z-10"
              style={{ borderColor: 'rgb(var(--border))', background: 'rgb(0 0 0 / .25)' }}
            >
              <div
                className="mx-auto h-4 w-4 rotate-180"
                style={{
                  mask: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M9.5 5l7 7-7 7\' stroke=\'white\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") no-repeat center / contain',
                  background: 'white',
                  opacity: 0.9,
                }}
              />
            </button>
            <button
              aria-label="Next"
              onClick={next}
              className="group absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full backdrop-blur-md border z-10"
              style={{ borderColor: 'rgb(var(--border))', background: 'rgb(0 0 0 / .25)' }}
            >
              <div
                className="mx-auto h-4 w-4"
                style={{
                  mask: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M9.5 5l7 7-7 7\' stroke=\'white\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") no-repeat center / contain',
                  background: 'white',
                  opacity: 0.9,
                }}
              />
            </button>
          </>
        )}
      </div>

      {/* progress rail */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: 'rgb(var(--accent))' }}
          />
        </div>
      )}
    </div>
  );
}
