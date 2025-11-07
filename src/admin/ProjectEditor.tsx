import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addProjectImage, uploadImage, getSignedImageUrl, removeProjectImage, upsertProject } from "../data/projects";
import type { Project } from "../data/projects";

type FormValues = Project & {
  tags_input: string;
  metric_label_input: string;
  metric_value_input: string;
  links_input: string;
  media_videos_input?: string;
};

function toFormValues(project: Project): FormValues {
  return {
    ...project,
    narrative_md: project.narrative_md ?? "",
    star_json: project.star_json ?? ({} as any),
    tags_input: (project.tags ?? []).join(", "),
    metric_label_input: project.metrics?.[0]?.label ?? "",
    metric_value_input: project.metrics?.[0]?.value ?? "",
    links_input: (project.links ?? [])
      .map((l) => `${l.label} | ${l.href}`)
      .join("\n"),
    media_videos_input: (project.media_json ?? [])
      .filter((m: any) => m?.kind === 'video')
      .map((m: any) => m.alt ? `${m.url} | ${m.alt}` : m.url)
      .join("\n"),
  } as any;
}

export default function ProjectEditor({ project, onClose }: { project: Project; onClose: (changed: boolean) => void; }) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: toFormValues(project) as any,
  });
  const [images, setImages] = useState<any[]>(project?.project_images ?? []);

  useEffect(() => reset(toFormValues(project)), [project, reset]);

  // Sign URLs for existing images when opening the editor
  useEffect(() => {
    (async () => {
      if (!images?.length) return;
      const missing = images.filter((i: any) => !i._url && i.storage_path);
      if (!missing.length) return;
      const signed = await Promise.all(
        images.map(async (i: any) =>
          i._url || !i.storage_path ? i : { ...i, _url: await getSignedImageUrl(i.storage_path) }
        )
      );
      setImages(signed);
    })();
  }, [project.id]);

  async function onSubmit(values: FormValues) {
    const {
      tags_input = "",
      metric_label_input = "",
      metric_value_input = "",
      links_input = "",
      media_videos_input,
      ...rest
    } = values;

    const tags = tags_input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const metrics = (metric_label_input || metric_value_input)
      ? [{ label: metric_label_input.trim(), value: metric_value_input.trim() }]
      : [];

    const links = links_input
      .split(/\r?\n/)
      .map((line) => {
        const [label, href] = line.split("|").map((part) => part?.trim());
        if (!label || !href) return null;
        return { label, href };
      })
      .filter((x): x is { label: string; href: string } => Boolean(x));

    // Parse video media links (YouTube/Vimeo/direct). Format: "URL | Optional label"
    const videos = (media_videos_input ?? '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [urlRaw, altRaw] = line.split('|').map(s => s?.trim()).filter(Boolean) as string[];
        const url = urlRaw;
        if (!url) return null;
        let provider: 'youtube' | 'vimeo' | 'file' = 'file';
        try {
          const u = new URL(url);
          if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) provider = 'youtube';
          else if (u.hostname.includes('vimeo.com')) provider = 'vimeo';
        } catch {}
        return { kind: 'video', url, alt: altRaw || undefined, provider } as any;
      })
      .filter(Boolean) as any[];

    // Keep any non-video items in existing media_json (future-proof)
    const others = (project.media_json ?? []).filter((m: any) => m?.kind !== 'video');
    const media_json = [...others, ...videos];

    const payload: Project = {
      ...project,
      ...rest,
      tags,
      metrics,
      links,
      media_json,
    };

    await upsertProject(payload);
    onClose(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!project.slug) { alert("Save project first (need slug)."); return; }
    const path = `${project.slug}/${Date.now()}-${file.name}`;
    await uploadImage(path, file);
    // create row
    const inserted = await addProjectImage({ project_id: project.id!, storage_path: path, alt: file.name, sort: images.length });
    const url = await getSignedImageUrl(path);
    setImages(prev => [...prev, { ...inserted, _url: url }]);
  }

  async function remove(id: string) {
    if (!confirm("Remove image?")) return;
    await removeProjectImage(id);
    setImages(prev => prev.filter(x => x.id !== id));
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm grid place-items-center z-50 p-4">
      <div className="w-[min(900px,95vw)] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgb(var(--border))]">
          <h3 className="text-xl font-semibold text-[rgb(var(--fg))]">{project.id ? "Edit Project" : "New Project"}</h3>
          <button 
            className="ml-auto px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg))] transition" 
            onClick={() => onClose(false)}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Slug</span>
            <input 
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" 
              {...register("slug")} 
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Persona</span>
            <select 
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" 
              {...register("persona")}
            >
              <option value="cyber">Cyber</option>
              <option value="soft">Software</option>
              <option value="game">Game</option>
              <option value="art">Art</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Title</span>
            <input 
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" 
              {...register("title")} 
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Hero title (overlay)</span>
            <input
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              placeholder="PhishNClick Simulator"
              {...register("hero_title")}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Badge / kicker</span>
            <input
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              placeholder="Cut risky clicks in pilot"
              {...register("kicker")}
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Short description</span>
            <textarea 
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" 
              rows={2} 
              {...register("short_desc")} 
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Long description</span>
            <textarea 
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" 
              rows={4} 
              {...register("long_desc")} 
            />
          </label>

          {/* STAR fields */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">STAR • Situation</span>
              <textarea
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                rows={2}
                placeholder="Context and constraints"
                {...register("star_json.situation")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">STAR • Task</span>
              <textarea
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                rows={2}
                placeholder="Your objective"
                {...register("star_json.task")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">STAR • Action</span>
              <textarea
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                rows={3}
                placeholder="What you did"
                {...register("star_json.action")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">STAR • Result</span>
              <textarea
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                rows={3}
                placeholder="Impact, quantified when possible"
                {...register("star_json.result")}
              />
            </label>
          </div>

          {/* Narrative Markdown */}
          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Narrative (Markdown)</span>
            <textarea
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              rows={8}
              placeholder={"# Case Study\n\n![diagram](https://...)\n\n- Decision A\n- Tradeoff B"}
              {...register("narrative_md")}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Tags (comma-separated)</span>
            <input
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              placeholder="MERN, GoPhish, Docker, AWS ECS"
              {...register("tags_input")}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">Metric label</span>
              <input
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                placeholder="click-through"
                {...register("metric_label_input")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[rgb(var(--fg))]">Metric value</span>
              <input
                className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                placeholder="-30%"
                {...register("metric_value_input")}
              />
            </label>
          </div>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Links (one per line as "Label | URL")</span>
            <textarea
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              rows={3}
              placeholder={`Repo | https://github.com/...\nCase study | https://example.com/...`}
              {...register("links_input")}
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Videos (YouTube/Vimeo/file — one per line as "URL | Optional label")</span>
            <textarea
              className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              rows={3}
              placeholder={`https://youtu.be/VIDEO_ID | Trailer\nhttps://vimeo.com/123456 | Demo`}
              {...register("media_videos_input")}
            />
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="scale-125 accent-[rgb(var(--accent))]" defaultChecked={project.featured} {...register("featured")} />
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Featured</span>
          </label>

          <div className="md:col-span-2 pt-4 border-t border-[rgb(var(--border))]">
            <button 
              disabled={formState.isSubmitting} 
              className="px-6 py-2 rounded-lg bg-[rgb(var(--accent))] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {formState.isSubmitting ? "Saving…" : "Save Project"}
            </button>
          </div>
        </form>

        {/* Images */}
        {project.id && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-semibold">Images</h4>
              <input type="file" accept="image/*" onChange={handleUpload} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img: any) => (
                <div key={img.id} className="relative group">
                  {img._url ? (
                    <img src={img._url} alt={img.alt ?? ''} className="w-full h-28 object-cover rounded border" />
                  ) : (
                    <div className="w-full h-28 grid place-items-center rounded border text-xs opacity-60">
                      No preview
                    </div>
                  )}
                  <button className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-black/70 border border-red-500 text-red-300 opacity-0 group-hover:opacity-100 transition" onClick={() => remove(img.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
