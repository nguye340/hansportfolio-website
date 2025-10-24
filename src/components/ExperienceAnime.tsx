import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = createTimeline({
      duration: 650,
    });

    tl.label("start")
      .add(root.current.querySelector(".sum-rail")!, { 
        opacity: [0, 1], 
        translateY: [-8, 0],
        easing: 'easeOutQuad'
      }, 0)
      .add(root.current.querySelector(".sum-fill")!, { 
        scaleX: [0, 1], 
        transformOrigin: "0% 50%",
        easing: 'easeOutQuad'
      }, "<+=150");

    // Animate the timeline line to draw through all elements
    const lineElement = root.current.querySelector('.timeline-line');
    if (lineElement) {
      console.log('Animating timeline line');
      tl.add(lineElement, {
        height: ['0%', '100%'],
        easing: 'easeOutQuad'
      }, "<+=300");
    }

    // Stagger in timeline elements
    const elements = root.current.querySelectorAll(".vertical-timeline-element");
    tl.add(elements, { 
      opacity: [0, 1], 
      scale: [0.8, 1],
      delay: (_, i) => i * 150 
    }, "<+=200");

    return () => { /* anime's timeline GC handled when elements unmount */ };
  }, [rows, summaryYears]);

  const getIcon = (index: number) => {
    const icons = [Briefcase, Calendar, GraduationCap, Award];
    const IconComponent = icons[index % icons.length];
    return <IconComponent size={20} />;
  };

  const [start, end] = summaryYears;
  return (
    <section ref={root} className="mt-10">
      <h2 className="text-xl md:text-2xl font-semibold" style={{ color: "rgb(var(--accent))" }}>Experience</h2>

      {/* Summary bar */}
      <motion.div 
        className="mt-3 rounded-2xl border p-4"
        style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--border))" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-sm" style={{ color: "rgb(var(--sub))" }}>Summary {start}–{end}</div>
        <div className="sum-rail mt-2 h-2 rounded-full" style={{ background: "rgb(var(--border))" }}>
          <div className="sum-fill h-2 rounded-full" style={{ background: "rgb(var(--accent))", width: "100%", transform: "scaleX(0)" }} />
        </div>
      </motion.div>

      {/* Timeline */}
      <div ref={timelineRef} className="mt-8 relative">
        <VerticalTimeline lineColor="transparent" animate={false}>
          {rows.map((r, i) => (
            <VerticalTimelineElement
              key={i}
              className="vertical-timeline-element--work"
              contentStyle={{
                background: "rgb(var(--surface))",
                border: "1px solid rgb(var(--border))",
                borderRadius: "1rem",
                color: "rgb(var(--fg))"
              }}
              contentArrowStyle={{ borderRight: "7px solid rgb(var(--surface))" }}
              date={r.when}
              dateClassName="timeline-date"
              iconStyle={{
                background: "rgb(var(--accent))",
                color: "rgb(var(--bg))"
              }}
              icon={<div className="timeline-icon">{getIcon(i)}</div>}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <h3 className="font-medium" style={{ color: "rgb(var(--fg))" }}>{r.role}</h3>
                <h4 className="text-sm mt-1" style={{ color: "rgb(var(--sub))" }}>{r.where}</h4>
                <ul className="mt-2 text-sm list-disc pl-5" style={{ color: "rgb(var(--fg))" }}>
                  {r.points.map((pt, j) => (<li key={j}>{pt}</li>))}
                </ul>
              </motion.div>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
        {/* Single animated line running through all icons */}
        <div 
          className="timeline-line absolute left-1/2 top-0 w-1 bg-blue-500 transform -translate-x-1/2 z-50"
          style={{ 
            background: "rgb(var(--accent))",
            height: '0%',
            borderRadius: '2px',
            boxShadow: '0 0 4px rgba(var(--accent), 0.5)'
          }}
        />
      </div>
    </section>
  );
}