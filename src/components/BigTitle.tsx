import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

export default function BigTitle({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    if (!ref.current) return;
    const spans = Array.from(ref.current.querySelectorAll<HTMLSpanElement>(".lt"));
    gsap.set(spans, { yPercent: 120, rotate: 6, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
    tl.to(spans, {
      yPercent: 0,
      rotate: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.015,
    });
    
    return () => {
      tl.kill();
    };
  }, [text]);

  return (
    <div ref={ref} className="select-none leading-none tracking-tight">
      {letters.map((ch, i) => (
        <span 
          key={i} 
          className="lt inline-block will-change-transform"
          style={{ 
            color: "rgb(var(--accent))", 
            fontWeight: 800, 
            fontSize: "clamp(32px, 8vw, 96px)" 
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </div>
  );
}
