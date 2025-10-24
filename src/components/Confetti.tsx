import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Confetti({ fire }: { fire: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fire || !root.current) return;
    const container = root.current;
    
    // Clear any existing confetti
    container.innerHTML = "";

    const N = 32; // Number of confetti pieces
    const els: HTMLDivElement[] = [];
    
    // Create confetti pieces
    for (let i = 0; i < N; i++) {
      const d = document.createElement("div");
      d.className = "pointer-events-none absolute h-1 w-3 rounded";
      d.style.background = "rgb(var(--accent))";
      d.style.left = "50%";
      d.style.top = "50%";
      container.appendChild(d);
      els.push(d);
    }

    // Animate confetti
    const tl = gsap.timeline({ 
      onComplete: () => {
        // Clean up after animation completes
        if (container) container.innerHTML = "";
      } 
    });
    
    tl.to(els, {
      x: () => gsap.utils.random(-600, 600),
      y: () => gsap.utils.random(-400, 400),
      rotate: () => gsap.utils.random(-180, 180),
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.01
    });

    // Clean up animation on unmount
    return () => {
      tl.kill();
      if (container) container.innerHTML = "";
    };
  }, [fire]);

  return (
    <div 
      ref={root} 
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
    />
  );
}
