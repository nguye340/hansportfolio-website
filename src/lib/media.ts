import { supabase } from "./supabase";

export async function getSignedUrls(paths: string[], seconds = 3600) {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage
    .from('project-media')
    .createSignedUrls(paths, seconds);
  if (error) throw error;
  // map back to path for easier lookup
  return data.map(d => ({ path: d.path, url: d.signedUrl }));
}

export async function uploadImageForProject(projectId: string, file: File) {
  const path = `projects/${projectId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('project-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteImageAtPath(path: string) {
  const { error } = await supabase.storage.from('project-media').remove([path]);
  if (error) throw error;
}
