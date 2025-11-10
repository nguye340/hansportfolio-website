import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { listProjects, deleteProject } from "../data/projects";
import type { Project } from "../data/projects";
import ProjectEditor from "./ProjectEditor";
import ProjectImagesPanel from "./ProjectImagesPanel";
import { listTimeline, deleteTimelineItem, type Timeline } from "../data/timeline";
import GalleryPanel from "./GalleryPanel";
import TimelineEditor from "./TimelineEditor";

type EditableProject = Project & { project_images?: { storage_path: string }[] };

export default function AdminPanel() {
  const [tab, setTab] = useState<"projects" | "timeline" | "gallery">("projects");
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<EditableProject | null>(null);
  const [managingImages, setManagingImages] = useState<string | null>(null);
  const [persona, setPersona] = useState<Project["persona"] | "all">("all");

  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [editingTimeline, setEditingTimeline] = useState<Partial<Timeline> | null>(null);

  async function refresh() {
    const data = await listProjects(persona === "all" ? undefined : { persona });
    setItems(data as any);
    const t = await listTimeline({ persona: persona === "all" ? undefined : (persona as any) });
    setTimeline(t);
  }

  useEffect(() => { refresh(); }, [persona]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center gap-3 pb-4 border-b border-[rgb(var(--border))]">
          <h2 className="text-2xl font-bold text-[rgb(var(--fg))]">Admin</h2>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded border ${tab === 'projects' ? 'bg-[rgb(var(--accent))] text-black' : 'text-[rgb(var(--fg))]'}`}
              style={{ borderColor: 'rgb(var(--border))' }}
              onClick={() => setTab('projects')}
            >Projects</button>
            <button
              className={`px-3 py-1.5 rounded border ${tab === 'timeline' ? 'bg-[rgb(var(--accent))] text-black' : 'text-[rgb(var(--fg))]'}`}
              style={{ borderColor: 'rgb(var(--border))' }}
              onClick={() => setTab('timeline')}
            >Timeline</button>
            <button
              className={`px-3 py-1.5 rounded border ${tab === 'gallery' ? 'bg-[rgb(var(--accent))] text-black' : 'text-[rgb(var(--fg))]'}`}
              style={{ borderColor: 'rgb(var(--border))' }}
              onClick={() => setTab('gallery')}
            >Gallery</button>
          </div>
          <select 
            className="border border-[rgb(var(--border))] rounded px-3 py-2 bg-[rgb(var(--surface))] text-[rgb(var(--fg))]" 
            value={persona} 
            onChange={e => setPersona(e.target.value as any)}
          >
            <option value="all">All personas</option>
            <option value="cyber">Cyber</option>
            <option value="soft">Software</option>
            <option value="game">Game</option>
            <option value="art">Art</option>
          </select>
          {tab === 'projects' ? (
            <button
              className="ml-auto px-4 py-2 rounded-lg bg-[rgb(var(--accent))] text-white font-medium hover:opacity-90 transition"
              onClick={() =>
                setEditing({ slug: "", title: "", short_desc: "", persona: "cyber", personas: [], metrics: [], tags: [], featured: false, links: [] } as any)
              }
            >
              + New Project
            </button>
          ) : tab === 'timeline' ? (
            <button
              className="ml-auto px-4 py-2 rounded-lg bg-[rgb(var(--accent))] text-white font-medium hover:opacity-90 transition"
              onClick={() => setEditingTimeline({ persona: (persona === 'all' ? 'cyber' : (persona as any)), kind: 'work', start: '', date: '', title: '' } as any)}
            >
              + New Timeline Item
            </button>
          ) : (
            <div className="ml-auto text-sm opacity-70">Manage game galleries below</div>
          )}

      {editingTimeline && (
        <TimelineEditor
          item={editingTimeline}
          onClose={async (changed) => {
            setEditingTimeline(null);
            if (changed) await refresh();
          }}
        />
      )}
          <button 
            className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface))] transition" 
            onClick={() => supabase.auth.signOut()}
          >
            Logout
          </button>
        </header>

        {tab === 'projects' ? (
          <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <table className="w-full text-sm">
              <thead className="text-left border-b border-[rgb(var(--border))]">
                <tr className="text-[rgb(var(--sub))]">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Persona</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[rgb(var(--sub))]">
                      No projects yet. Click "+ New Project" to add one.
                    </td>
                  </tr>
                ) : (
                  items.map(p => (
                    <tr key={p.id} className="border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition">
                      <td className="px-4 py-3 text-[rgb(var(--fg))]">{p.title}</td>
                      <td className="px-4 py-3 text-[rgb(var(--fg))]">
                        <span className="px-2 py-1 rounded-full text-xs bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
                          {[p.persona, ...((p as any).personas ?? [])].join(', ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--sub))]">{(p.tags ?? []).join(", ")}</td>
                      <td className="px-4 py-3 text-[rgb(var(--sub))] text-xs">{new Date(p.updated_at ?? p.created_at!).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          className="px-3 py-1 rounded border border-[rgb(var(--border))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg))] transition" 
                          onClick={() => setEditing(p)}
                        >
                          Edit
                        </button>
                        <button 
                          className="px-3 py-1 rounded border border-[rgb(var(--border))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg))] transition" 
                          onClick={() => setManagingImages(p.id!)}
                        >
                          🖼️ Images
                        </button>
                        <button 
                          className="px-3 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500/10 transition" 
                          onClick={async () => { if (confirm("Delete project?")) { await deleteProject(p.id!); await refresh(); } }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : tab === 'timeline' ? (
          <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <table className="w-full text-sm">
              <thead className="text-left border-b border-[rgb(var(--border))]">
                <tr className="text-[rgb(var(--sub))]">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Persona</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Org</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {timeline.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[rgb(var(--sub))]">
                      No timeline items yet. Click "+ New Timeline Item" to add one.
                    </td>
                  </tr>
                ) : (
                  timeline.map(t => (
                    <tr key={t.id} className="border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition">
                      <td className="px-4 py-3 text-[rgb(var(--fg))]">{t.title}</td>
                      <td className="px-4 py-3 text-[rgb(var(--fg))]">{t.persona}</td>
                      <td className="px-4 py-3 text-[rgb(var(--sub))]">{t.date}</td>
                      <td className="px-4 py-3 text-[rgb(var(--sub))]">{t.org ?? ''}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          className="px-3 py-1 rounded border border-[rgb(var(--border))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg))] transition" 
                          onClick={() => setEditingTimeline(t)}
                        >
                          Edit
                        </button>
                        <button 
                          className="px-3 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500/10 transition" 
                          onClick={async () => { if (confirm("Delete timeline item?")) { await deleteTimelineItem(t.id!); await refresh(); } }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <GalleryPanel persona={'game'} />
          </div>
        )}
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          onClose={async (changed) => {
            setEditing(null);
            if (changed) await refresh();
          }}
        />
      )}

      {managingImages && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm grid place-items-center z-50 p-4 overflow-y-auto">
          <div className="w-[min(1200px,95vw)] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-2xl max-h-[90vh] overflow-y-auto">
            <ProjectImagesPanel
              projectId={managingImages}
              onClose={() => {
                setManagingImages(null);
                refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
