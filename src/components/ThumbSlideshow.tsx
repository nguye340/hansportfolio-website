import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
};

export default function ThumbSlideshow({
  images,
  intervalMs = 3000,
  className,
  autoplay = true,
  showControls = true,
}: Props) {
  const imgs = useMemo(() => images.filter(Boolean), [images]);
  const [i, setI] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const visible = useRef<boolean>(true);
  const reduceMotion = useRef<boolean>(false);

  const clamp = useCallback(
    (n: number) => (imgs.length ? (n + imgs.length) % imgs.length : 0),
    [imgs.length]
  );

  const next = useCallback(() => setI((v) => clamp(v + 1)), [clamp]);
  const prev = useCallback(() => setI((v) => clamp(v - 1)), [clamp]);
  const goTo = useCallback((idx: number) => setI(clamp(idx)), [clamp]);

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!autoplay || reduceMotion.current || imgs.length < 2 || timer.current) return;
    timer.current = window.setInterval(next, intervalMs);
  }, [autoplay, imgs.length, intervalMs, next]);

  // Visibility & intersection management
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!wrap.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        document.hidden || !entry.isIntersecting ? stop() : start();
      },
      { threshold: 0.2 }
    );
    io.observe(wrap.current);

    const onVis = () => (document.hidden || !visible.current ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [start, stop]);

  // ---------- Touch/Pointer swipe ----------
  useEffect(() => {
    const el = wrap.current;
    if (!el || imgs.length < 2) return;

    let active = false;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let isHorizontal = false;

    const THRESHOLD = 40; // px to qualify as a swipe
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      active = true;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;
      isHorizontal = false;
      stop(); // pause autoplay while dragging
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!active) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      if (!isHorizontal) {
        // decide intent once: treat as swipe only if horizontal dominance
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          isHorizontal = Math.abs(dx) > Math.abs(dy);
        }
      }
      if (isHorizontal) {
        // prevent the page from trying to horizontally scroll
        e.preventDefault();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!active) return;
      active = false;

      if (isHorizontal && Math.abs(dx) > THRESHOLD) {
        dx < 0 ? next() : prev();
      }
      // resume autoplay if allowed and still visible
      if (!document.hidden && visible.current) start();

      try { el.releasePointerCapture?.(e.pointerId); } catch {}
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });
    el.addEventListener("pointerleave", onPointerUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove as any);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, [imgs.length, next, prev, start, stop]);

  if (!imgs.length) return null;

  return (
    <div
      ref={wrap}
      className={`relative overflow-hidden rounded-lg aspect-video touch-pan-y ${className || ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Project imagery"
      onMouseEnter={stop}
      onMouseLeave={start}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      {/* slides (opacity cross-fade) */}
      {imgs.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500
                      ${i === idx ? "opacity-100" : "opacity-0"}`}
          style={{ willChange: "opacity", filter: "saturate(0.95) contrast(1.05)" }}
        />
      ))}

      {/* gradient for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.45)] to-transparent" />

      {/* controls */}
      {showControls && imgs.length > 1 && (
        <>
          {/* Edge zones – no visible button chrome; the image itself tints */}
          <button
            type="button"
            className="slide-edge slide-edge--left"
            aria-label="Previous image"
            onClick={prev}
          />
          <button
            type="button"
            className="slide-edge slide-edge--right"
            aria-label="Next image"
            onClick={next}
          />

          {/* Thin progress bar (more obvious than dots, still minimal) */}
          <div
            className="slide-progress"
            style={{ ["--n" as any]: String(imgs.length), ["--i" as any]: String(i) }}
            aria-hidden
          >
            <div className="slide-progress__fill" />
          </div>
        </>
      )}
    </div>
  );
}
