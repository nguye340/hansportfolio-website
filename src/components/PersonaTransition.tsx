import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PersonaTransition({ persona }: { persona: string }) {
  const overlay = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!overlay.current) return;
  const el = overlay.current;
  
  gsap.set(el, { clipPath: "circle(0% at 50% 50%)", display: "block", opacity: 1 });

  const tl = gsap.timeline();
  tl.to(el, {
    clipPath: "circle(140% at 50% 50%)",
    duration: 0.45,
    ease: "power3.out",
    backgroundColor: "rgb(var(--accent))",
  })
    .to(el, { opacity: 0, duration: 0.25, ease: "power2.in" })
    .set(el, { display: "none" });

  // Fix: Wrap the kill() call in a block to not return its value
  return () => {
    tl.kill();
  };
}, [persona]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ background: "rgb(var(--accent))", display: "none" }}
    />
  );
}
