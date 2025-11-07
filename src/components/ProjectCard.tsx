import ProjectGallery from './ProjectGallery';
import type { ProjectVM } from '../lib/projects';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ProjectCard({ p }: { p: ProjectVM }) {
  const navigate = useNavigate();
  const location = useLocation();
  function open() {
    navigate(`/projects/${p.slug}` as any, { state: { backgroundLocation: location } });
  }
  return (
    <article
      className="rounded-3xl border bg-[rgb(var(--card))/60] backdrop-blur-md cursor-pointer"
      style={{ borderColor: 'rgb(var(--border))', boxShadow: '0 10px 40px rgba(0,0,0,.35)' }}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
    >
      <div className="p-4 md:p-5">
        <ProjectGallery images={p.images} heroTitle={p.heroTitle} />

        <div className="mt-4 flex items-start gap-3">
          <h3 className="text-2xl font-semibold">{p.title}</h3>

          {p.kicker && (
            <span
              className="ml-auto text-xs px-3 py-1 rounded-full"
              style={{ color: 'rgb(var(--accent))', background: 'rgb(var(--accent) / .12)' }}
            >
              {p.kicker}
            </span>
          )}
        </div>

        <p className="mt-2 text-[15px] text-[rgb(var(--sub))]">{p.summary}</p>

        {/* tech chips */}
        {!!(p.tech_tags?.length) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tech_tags!.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={{ borderColor: 'rgb(var(--border))', background: 'rgb(255 255 255 / .03)' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* metric */}
        {(p.metric_label || p.metric_value) && (
          <div className="mt-3 text-sm">
            <span className="opacity-75">
              {p.metric_label ? `${p.metric_label.replace(/:?$/, ':')}` : ''}
            </span>{' '}
            <span className="font-semibold">{p.metric_value ?? ''}</span>
          </div>
        )}

        {/* links */}
        {!!(p.links?.length) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {p.links!.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border hover:opacity-90"
                style={{ borderColor: 'rgb(var(--border))' }}
                onClick={(e) => e.stopPropagation()}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
