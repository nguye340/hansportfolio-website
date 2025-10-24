import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

type Row = { role: string; where: string; when: string; points: string[] };

export default function ExperienceTimeline({ items }: { items: Row[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom 20%", scrub: 0.4 },
      });
      tl.from(".tl-pin",  { scale: 0, opacity: 0, stagger: 0.08, duration: 0.3 })
        .from(".tl-card", { y: 24, opacity: 0, stagger: 0.12, duration: 0.45 }, "<");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="mt-8">
      <h2 className="text-xl md:text-2xl font-semibold">Experience</h2>
      <div className="relative mt-3">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-700" />
        <div className="space-y-4 pl-10">
          {items.map((r, i) => (
            <div key={i} className="tl-card rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center gap-3">
                <span className="tl-pin h-2.5 w-2.5 rounded-full bg-indigo-400" />
                <div className="font-medium">{r.role}</div>
                <div className="ml-auto text-sm text-neutral-400">{r.when}</div>
              </div>
              <div className="text-sm text-neutral-300">{r.where}</div>
              <ul className="mt-2 text-sm list-disc pl-5 text-neutral-300">
                {r.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
