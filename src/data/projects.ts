import { z } from "zod";
import { supabase } from "../lib/supabase";

export const Metric = z.object({ label: z.string(), value: z.string() });
export const ProjectLink = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});
export const Star = z.object({
  situation: z.string().optional().nullable(),
  task: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
});
export const MediaItem = z.object({
  kind: z.enum(["image","video"]).default("image"),
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  provider: z.enum(["youtube","vimeo","file"]).optional().nullable(),
});
export const ProjectDTO = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2),
  title: z.string().min(2),
  hero_title: z.string().optional().nullable(),
  short_desc: z.string().min(4),
  long_desc: z.string().optional(),
  narrative_md: z.string().optional().nullable(),
  metrics: z.array(Metric).default([]),
  tags: z.array(z.string()).default([]),
  kicker: z.string().optional().nullable(),
  persona: z.enum(["cyber","soft","game","art"]),
  featured: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  star_json: Star.optional().nullable(),
  media_json: z.array(MediaItem).optional().nullable(),
  project_images: z.array(z.any()).optional(),
  links: z.array(ProjectLink).nullish().default([]),
});
export type Project = z.infer<typeof ProjectDTO>;

export const ProjectImage = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  storage_path: z.string(),
  alt: z.string().optional().default(""),
  sort: z.number().int().nonnegative().default(0),
});
export type ProjectImageT = z.infer<typeof ProjectImage>;

// Schema for inserting/updating a project (omit relation fields)
export const ProjectUpsertDTO = ProjectDTO.omit({ project_images: true });

export async function listProjects(opts?: { persona?: Project["persona"]; tag?: string; featured?: boolean }) {
  let q = supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (opts?.persona) q = q.eq("persona", opts.persona);
  if (opts?.featured) q = q.eq("featured", true);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  // Fetch images separately to avoid relationship dependency
  const ids = rows.map(r => r.id).filter(Boolean);
  let imagesByProject: Record<string, any[]> = {};
  if (ids.length) {
    const { data: imgs, error: imgErr } = await supabase
      .from("project_images")
      .select("*")
      .in("project_id", ids);
    if (imgErr) throw imgErr;
    for (const im of imgs ?? []) {
      if (!imagesByProject[im.project_id]) imagesByProject[im.project_id] = [];
      imagesByProject[im.project_id].push(im);
    }
  }
  const withImgs = rows.map(r => ({ ...r, project_images: imagesByProject[r.id] ?? [] }));
  // Client-side tag filter (RLS keeps it simple):
  const filtered = opts?.tag ? withImgs.filter(p => (p.tags ?? []).includes(opts.tag!)) : withImgs;
  return filtered.map(p => ProjectDTO.parse(p)) as Project[];
}

export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  const p = data as any;
  const { data: imgs, error: imgErr } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", p.id);
  if (imgErr) throw imgErr;
  return ProjectDTO.parse({ ...p, project_images: imgs ?? [] });
}

export async function upsertProject(input: Project) {
  // Remove relation-only fields before sending to PostgREST
  const { project_images, ...rest } = input as any;
  const valid = ProjectUpsertDTO.parse(rest);
  const baseCols = [
    "id","slug","title","short_desc","long_desc","narrative_md","metrics","tags","persona","featured","created_at","updated_at","hero_title","kicker","links","star_json","media_json"
  ].join(",");
  const { data, error } = await supabase
    .from("projects")
    .upsert(valid)
    .select(baseCols)
    .single();
  if (error) throw error;
  return ProjectDTO.parse(data);
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function addProjectImage(img: ProjectImageT) {
  const valid = ProjectImage.parse(img);
  const { data, error } = await supabase.from("project_images").insert(valid).select().single();
  if (error) throw error;
  return data;
}

export async function removeProjectImage(id: string) {
  const { error } = await supabase.from("project_images").delete().eq("id", id);
  if (error) throw error;
}

export async function getSignedImageUrl(storagePath: string, expires = 3600) {
  const { data, error } = await supabase.storage.from("project-media").createSignedUrl(storagePath, expires);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadImage(path: string, file: File) {
  const { error } = await supabase.storage.from("project-media").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
}
