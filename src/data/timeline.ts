import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/media';

export const TimelinePersona = z.enum(['cyber','soft','game','art']);
export type TimelinePersona = z.infer<typeof TimelinePersona>;

export const TimelineCTA = z.object({ label: z.string(), href: z.string().url().or(z.string()) });

export const TimelineAttachment = z.object({
  kind: z.enum(['image','pdf']).default('image'),
  storage_path: z.string(),
  alt: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
});

export const TimelineDTO = z.object({
  id: z.string().uuid().optional(),
  persona: TimelinePersona,
  personas: z.array(TimelinePersona).nullish().default([]),
  kind: z.enum(['work','edu','cert','project','future']).default('work'),
  start: z.string(),
  date: z.string(),
  title: z.string(),
  org: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bullets: z.array(z.string()).default([]),
  cta: z.array(TimelineCTA).default([]),
  attachments_json: z.array(TimelineAttachment).optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Timeline = z.infer<typeof TimelineDTO>;

export async function listTimeline(opts: { persona?: TimelinePersona }) {
  let q = supabase.from('timeline_items').select('*').order('start', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const personaFiltered = opts.persona
    ? rows.filter(r => r?.persona === opts.persona || (Array.isArray(r?.personas) && r.personas.includes(opts.persona)))
    : rows;
  // Batch sign all attachment paths across items for efficiency
  const paths = Array.from(new Set(
    personaFiltered.flatMap(r => (r.attachments_json ?? []).map((a: any) => a?.storage_path).filter(Boolean))
  ));
  let urlMap = new Map<string, string>();
  if (paths.length) {
    try {
      const signed = await getSignedUrls(paths as string[], 3600);
      urlMap = new Map(signed.map(s => [s.path, s.url] as [string, string]));
    } catch {}
  }
  const augmented = personaFiltered.map(r => {
    const atts = (r.attachments_json ?? []).map((a: any) => ({
      kind: a?.kind || 'image',
      storage_path: a?.storage_path,
      alt: a?.alt ?? null,
      url: urlMap.get(a?.storage_path ?? '') ?? null,
    }));
    return { ...r, attachments_json: atts };
  });
  return augmented.map((r: any) => TimelineDTO.parse(r)) as Timeline[];
}

export async function upsertTimelineItem(input: Timeline) {
  const valid = TimelineDTO.parse(input);
  const { data, error } = await supabase.from('timeline_items').upsert(valid).select('*').single();
  if (error) throw error;
  return TimelineDTO.parse(data);
}

export async function deleteTimelineItem(id: string) {
  const { error } = await supabase.from('timeline_items').delete().eq('id', id);
  if (error) throw error;
}
