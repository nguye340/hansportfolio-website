import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectDetail, { loadProjectDetail, type ProjectDetailData } from './ProjectDetail';

export default function ProjectModal() {
  const { slug = '' } = useParams();
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dlgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setData(await loadProjectDetail(slug)); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    // focus trap start
    setTimeout(() => dlgRef.current?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  function close() { navigate(-1); }

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/70" onClick={close} />
      <div className="relative h-full w-full pointer-events-none">
        <div
          ref={dlgRef}
          tabIndex={-1}
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-[min(1000px,95vw)] rounded-2xl border bg-[rgb(var(--surface))] text-[rgb(var(--fg))] shadow-2xl overflow-hidden"
          style={{ borderColor: 'rgb(var(--border))' }}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-2 right-2 z-10 h-9 w-9 grid place-items-center rounded-full border hover:bg-white/10"
            style={{ borderColor: 'rgb(var(--border))' }}
          >
            ✕
          </button>
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="p-6 opacity-70">Loading…</div>
            ) : !data ? (
              <div className="p-6 opacity-70">Not found.</div>
            ) : (
              <ProjectDetail data={data} variant="modal" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
