import { z } from 'zod';
import { supabase } from '../lib/supabase';

export const TimelinePersona = z.enum(['cyber','soft','game','art']);
export type TimelinePersona = z.infer<typeof TimelinePersona>;

export const TimelineCTA = z.object({ label: z.string(), href: z.string().url().or(z.string()) });

export const TimelineDTO = z.object({
  id: z.string().uuid().optional(),
  persona: TimelinePersona,
  kind: z.enum(['work','edu','cert','project','future']).default('work'),
  start: z.string(),
  date: z.string(),
  title: z.string(),
  org: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bullets: z.array(z.string()).default([]),
  cta: z.array(TimelineCTA).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Timeline = z.infer<typeof TimelineDTO>;

export async function listTimeline(opts: { persona?: TimelinePersona }) {
  let q = supabase.from('timeline_items').select('*').order('start', { ascending: false });
  if (opts.persona) q = q.eq('persona', opts.persona);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r: any) => TimelineDTO.parse(r)) as Timeline[];
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
