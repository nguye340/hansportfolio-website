import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/media';

export const GalleryPersona = z.enum(['cyber','soft','game','art']);
export type GalleryPersona = z.infer<typeof GalleryPersona>;

export const GallerySection = z.enum(['3d','2d']);
export type GallerySection = z.infer<typeof GallerySection>;

export const GalleryItemDTO = z.object({
  id: z.string().uuid().optional(),
  persona: GalleryPersona,
  section: GallerySection,
  storage_path: z.string(),
  alt: z.string().optional().nullable(),
  sort: z.number().int().nonnegative().default(0),
  created_at: z.string().optional(),
  url: z.string().optional().nullable(),
});
export type GalleryItem = z.infer<typeof GalleryItemDTO>;

export async function listGallery(opts: { persona?: GalleryPersona; section?: GallerySection }) {
  let q = supabase.from('gallery_items').select('*').order('sort', { ascending: true }).order('created_at', { ascending: false });
  if (opts.persona) q = q.eq('persona', opts.persona);
  if (opts.section) q = q.eq('section', opts.section);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const paths = rows.map(r => r.storage_path).filter(Boolean);
  let urlMap = new Map<string, string>();
  if (paths.length) {
    const signed = await getSignedUrls(paths, 3600);
    urlMap = new Map(signed.map(s => [s.path, s.url] as [string, string]));
  }
  return rows.map(r => GalleryItemDTO.parse({ ...r, url: urlMap.get(r.storage_path) }));
}

export async function insertGalleryItem(input: Omit<GalleryItem, 'id' | 'url' | 'created_at'>) {
  const { data, error } = await supabase.from('gallery_items').insert(input).select('*').single();
  if (error) throw error;
  return GalleryItemDTO.parse(data);
}

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw error;
}

export async function updateGalleryItem(id: string, patch: Partial<Pick<GalleryItem, 'alt' | 'sort' | 'section'>>) {
  const { data, error } = await supabase.from('gallery_items').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return GalleryItemDTO.parse(data);
}
