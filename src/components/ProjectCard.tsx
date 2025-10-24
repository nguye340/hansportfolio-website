import { motion } from "framer-motion";
import type { Project } from "../data/projects";
import ThumbSlideshow from "./ThumbSlideshow";

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      className="glass-card group h-full"
    >
      <div className="glass-inner h-full p-4 flex flex-col">
        {p.thumb && (
          <div className="mb-3">
            <ThumbSlideshow 
              images={Array.isArray(p.thumb) ? p.thumb : [p.thumb]} 
              intervalMs={4000}
              className="shadow-[0_0_12px_rgba(var(--accent),0.25)]"
              autoplay={Array.isArray(p.thumb) && p.thumb.length > 1}
              showControls={Array.isArray(p.thumb) && p.thumb.length > 1}
            />
          </div>
        )}
        <header className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{p.title}</h3>
          {p.highlight && (
            <span 
              className="text-xs px-2 py-1 rounded-xl"
              style={{ 
                background: "color-mix(in oklab, rgb(var(--surface)) 60%, rgb(var(--accent)) 40%)" 
              }}
            >
              {p.highlight}
            </span>
          )}
        </header>

        <p className="mt-2 text-sm flex-grow" style={{ color: "rgb(var(--fg))", opacity: 0.85 }}>
          {p.summary}
        </p>

        {p.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs rounded-xl px-2 py-1 border"
                style={{
                  borderColor: "rgb(var(--border))",
                  background: "color-mix(in oklab, rgb(var(--surface)) 80%, rgb(var(--accent)) 20%)"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {p.metrics?.length ? (
          <div className="mt-3 flex gap-3 text-xs">
            {p.metrics.map((metric, index) => (
              <div
                key={`${metric.label}-${index}`}
                className="rounded-xl px-2 py-1"
                style={{ background: "rgba(0,0,0,.08)" }}
              >
                <span style={{ color: "rgb(var(--sub))" }}>{metric.label}:</span>{" "}
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {p.links?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.links.map((link, index) => (
              <a
                key={`${link.href}-${index}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-xs"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
