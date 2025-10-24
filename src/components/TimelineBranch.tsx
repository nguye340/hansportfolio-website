import { useEffect, useRef, useState } from "react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { motion, useInView } from "framer-motion";
import { Calendar, Briefcase, GraduationCap, Award } from "lucide-react";
import "react-vertical-timeline-component/style.min.css";

type Row = { role: string; where: string; when: string; points: string[] };

export default function ExperienceAnime({
  summaryYears,
  rows,
}: {
  summaryYears: [number, number];
  rows: Row[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(tlRef, { once: true, margin: "-120px" });

  // line geometry (px, relative to timeline container)
  const [lineLeft, setLineLeft] = useState(0);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  // find icon column and compute line rect
  useEffect(() => {
    if (!tlRef.current) return;

    const measure = () => {
      const container = tlRef.current!;
      // icons are added by the library AFTER render
      const icons = container.querySelectorAll<HTMLElement>(".vertical-timeline-element-icon");
      if (icons.length === 0) return;

      const hostRect = container.getBoundingClientRect();
      const first = icons[0].getBoundingClientRect();
      const last  = icons[icons.length - 1].getBoundingClientRect();

      const iconCenterX = icons[0].offsetLeft + icons[0].offsetWidth / 2;
      const top = first.top - hostRect.top + first.height / 2;
      const height = (last.top - first.top) + last.height / 2;

      setLineLeft(iconCenterX);
      setLineTop(top);
      setLineHeight(height);
    };

    // measure now and on resize
    const ro = new ResizeObserver(measure);
    ro.observe(tlRef.current);
    // run twice to be safe with StrictMode double render + images/fonts
    requestAnimationFrame(measure);
    setTimeout(measure, 50);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [rows]);

  const getIcon = (i: number) => {
    const icons = [Briefcase, Calendar, GraduationCap, Award];
    const Icon = icons[i % icons.length];
    return <Icon size={20} />;
  };

  const [start, end] = summaryYears;

  return (
    <section ref={root} className="mt-10">
      <h2 className="text-xl md:text-2xl font-semibold" style={{ color: "rgb(var(--accent))" }}>
        Experience
      </h2>

      {/* Summary */}
      <div
        className="mt-3 rounded-2xl border p-4"
        style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--border))" }}
      >
        <div className="text-sm" style={{ color: "rgb(var(--sub))" }}>
          Summary {start}–{end}
        </div>
        <div className="mt-2 h-2 rounded-full" style={{ background: "rgb(var(--border))" }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ background: "rgb(var(--accent))", width: "100%" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div ref={tlRef} className="mt-8 relative">
        {/* Hide library spine; we draw our own */}
        <style>{`.vertical-timeline::before{ background: transparent !important; }`}</style>

        {/* animated accent line aligned to icon column */}
        <motion.div
          className="absolute w-[3px] -translate-x-1/2"
          style={{
            left: lineLeft,
            top: lineTop,
            background: "rgb(var(--accent))",
            borderRadius: 2,
            boxShadow: "0 0 12px rgb(var(--accent) / .45)",
            zIndex: 1, // under icons (icons have their own z-index)
          }}
          initial={{ height: 0 }}
          animate={isInView ? { height: lineHeight } : { height: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        <VerticalTimeline className="accented-timeline" lineColor="rgb(var(--accent))" animate={false}>
          {rows.map((r, i) => (
            <VerticalTimelineElement
              key={i}
              contentStyle={{
                background: "rgb(var(--surface))",
                border: "1px solid rgb(var(--border))",
                borderRadius: "1rem",
                color: "rgb(var(--fg))",
                boxShadow: "0 6px 28px rgba(0,0,0,.28)",
              }}
              contentArrowStyle={{ borderRight: "7px solid rgb(var(--surface))" }}
              date={r.when}
              dateClassName="timeline-date"
              iconStyle={{
                background: 'transparent',
                border: `2px solid rgb(var(--accent))`,
                boxShadow: `0 0 0 6px rgb(var(--accent) / .15), 0 0 18px rgb(var(--accent) / .45)`,
                color: `rgb(var(--accent))`,
              }}
              icon={<div className="timeline-icon">{getIcon(i)}</div>}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05, duration: 0.45, ease: "easeOut" }}
              >
                <h3 className="font-semibold text-base md:text-lg" style={{ color: "rgb(var(--fg))" }}>
                  {r.role}
                </h3>
                <h4 className="text-xs md:text-sm mt-1" style={{ color: "rgb(var(--sub))" }}>
                  {r.where}
                </h4>
                <ul className="mt-2 text-sm pl-5 space-y-1">
                  {r.points.map((pt, j) => (
                    <li key={j} className="list-disc">{pt}</li>
                  ))}
                </ul>
              </motion.div>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
}
