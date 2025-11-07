import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetail, { loadProjectDetail, type ProjectDetailData } from '../components/ProjectDetail';

export default function ProjectPage() {
  const { slug = '' } = useParams();
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await loadProjectDetail(slug);
        setData(res);
      } finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return <div className="p-6 opacity-70">Loading…</div>;
  if (!data) return <div className="p-6 opacity-70">Not found.</div>;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="mx-auto max-w-5xl">
        <ProjectDetail data={data} variant="page" />
      </div>
    </div>
  );
}
