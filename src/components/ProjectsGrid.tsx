import { useEffect, useState } from "react";
import { fetchProjectsVM, type ProjectVM } from "../lib/projects";
import type { Project } from "../data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectsGrid({ persona }: { persona: Project["persona"] }) {
  const [items, setItems] = useState<ProjectVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchProjectsVM(persona);
        setItems(res);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [persona]);

  if (loading) return <div className="opacity-60">Loading projects…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {items.map((p) => (
        <ProjectCard key={p.id} p={p} />
      ))}
    </div>
  );
}
