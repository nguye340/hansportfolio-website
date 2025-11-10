import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Timeline } from '../data/timeline';
import { upsertTimelineItem } from '../data/timeline';
import { supabase } from '../lib/supabase';

type FormValues = Timeline & {
  bullets_input: string;
  cta_input: string;
};

function toFormValues(t: Partial<Timeline>): any {
  return {
    id: t.id,
    persona: (t.persona ?? 'cyber') as Timeline['persona'],
    kind: (t.kind ?? 'work') as Timeline['kind'],
    start: t.start ?? '',
    date: t.date ?? '',
    title: t.title ?? '',
    org: t.org ?? '',
    location: t.location ?? '',
    bullets_input: (t.bullets ?? []).join('\n'),
    cta_input: (t.cta ?? []).map(c => `${c.label} | ${c.href}`).join('\n'),
  } as FormValues;
}

export default function TimelineEditor({ item, onClose }: { item: Partial<Timeline>; onClose: (changed: boolean) => void }) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ defaultValues: toFormValues(item) });
  const [attachments, setAttachments] = useState<any[]>(item.attachments_json ?? []);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  useEffect(() => { reset(toFormValues(item)); }, [item, reset]);
  useEffect(() => { setAttachments(item.attachments_json ?? []); }, [item?.id]);

  useEffect(() => {
    (async () => {
      const paths = attachments.map(a => a.storage_path).filter(Boolean);
      if (!paths.length) { setSignedMap({}); return; }
      const { data, error } = await supabase.storage.from('project-media').createSignedUrls(paths, 3600);
      if (error) return;
      const m: Record<string, string> = {};
      for (const d of data) {
        const p = d.path as string | null;
        if (p) m[p] = d.signedUrl;
      }
      setSignedMap(m);
    })();
  }, [attachments]);

  async function onSubmit(v: FormValues) {
    const bullets = (v.bullets_input ?? '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const cta = (v.cta_input ?? '')
      .split(/\r?\n/)
      .map(line => {
        const [label, href] = line.split('|').map(s => s?.trim());
        if (!label || !href) return null;
        return { label, href };
      })
      .filter((x): x is { label: string; href: string } => Boolean(x));

    // Sanitize additional personas: unique, exclude primary
    const extra = Array.isArray((v as any).personas) ? ((v as any).personas as string[]) : [];
    const personas = Array.from(new Set(extra.filter((p) => p && p !== v.persona))) as any;

    const payload: Timeline = {
      id: v.id,
      persona: v.persona,
      personas,
      kind: v.kind,
      start: v.start,
      date: v.date,
      title: v.title,
      org: v.org || undefined,
      location: v.location || undefined,
      bullets,
      cta,
      attachments_json: attachments,
    } as Timeline;

    await upsertTimelineItem(payload);
    onClose(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!item.id) { alert('Save the timeline item first to get an ID.'); return; }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const kind: 'image' | 'pdf' = ext === 'pdf' ? 'pdf' : 'image';
    const path = `timeline/${item.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('project-media').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert('Upload failed'); return; }
    setAttachments(prev => [...prev, { kind, storage_path: path, alt: file.name }]);
    e.currentTarget.value = '';
  }

  async function removeAttachment(path: string) {
    if (!confirm('Remove attachment?')) return;
    const { error } = await supabase.storage.from('project-media').remove([path]);
    if (error) { alert('Remove failed'); return; }
    setAttachments(prev => prev.filter(a => a.storage_path !== path));
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm grid place-items-center z-50 p-4">
      <div className="w-[min(800px,95vw)] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgb(var(--border))]">
          <h3 className="text-xl font-semibold text-[rgb(var(--fg))]">{item?.id ? 'Edit Timeline' : 'New Timeline'}</h3>
          <button
            className="ml-auto px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg))] transition"
            onClick={() => onClose(false)}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Persona</span>
            <select className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('persona')}>
              <option value="cyber">Cyber</option>
              <option value="soft">Software</option>
              <option value="game">Game</option>
              <option value="art">Art</option>
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Also show under</span>
            <div className="grid grid-cols-2 gap-2 text-[rgb(var(--fg))]">
              <label className="inline-flex items-center gap-2"><input type="checkbox" value="cyber" defaultChecked={(item.personas ?? []).includes('cyber' as any)} {...register('personas' as any)} className="accent-[rgb(var(--accent))]" /><span>Cyber</span></label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" value="soft" defaultChecked={(item.personas ?? []).includes('soft' as any)} {...register('personas' as any)} className="accent-[rgb(var(--accent))]" /><span>Software</span></label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" value="game" defaultChecked={(item.personas ?? []).includes('game' as any)} {...register('personas' as any)} className="accent-[rgb(var(--accent))]" /><span>Game</span></label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" value="art" defaultChecked={(item.personas ?? []).includes('art' as any)} {...register('personas' as any)} className="accent-[rgb(var(--accent))]" /><span>Art</span></label>
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Kind</span>
            <select className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('kind')}>
              <option value="work">Work</option>
              <option value="edu">Education</option>
              <option value="cert">Certification</option>
              <option value="project">Project</option>
              <option value="future">Future</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Start (YYYY-MM)</span>
            <input className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('start')} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Date (display)</span>
            <input className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('date')} />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Title</span>
            <input className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('title')} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Org</span>
            <input className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('org')} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Location</span>
            <input className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" {...register('location')} />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Bullets (one per line)</span>
            <textarea className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" rows={4} {...register('bullets_input')} />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">CTA Links (Label | URL per line)</span>
            <textarea className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))]" rows={3} {...register('cta_input')} />
          </label>

          <div className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--fg))]">Attachments (images/PDF)</span>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*,.pdf" onChange={handleUpload} disabled={!item.id} />
              {!item.id && <span className="text-xs opacity-70">Save first to enable uploads</span>}
            </div>
            {!!attachments.length && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {attachments.map(a => (
                  <div key={a.storage_path} className="relative group border rounded p-2">
                    {(() => {
                      const href = signedMap[a.storage_path] || '';
                      const isPdf = (a?.kind === 'pdf') || /\.pdf($|\?)/i.test(String(a?.storage_path ?? ''));
                      return !isPdf ? (
                        <img src={href} alt={a.alt ?? ''} className="w-full h-28 object-cover rounded" loading="lazy" />
                      ) : (
                        <a href={href || '#'} target="_blank" rel="noreferrer" className="text-sm underline">
                          {a.alt || 'View PDF'}
                        </a>
                      );
                    })()}
                    <button type="button" onClick={() => removeAttachment(a.storage_path)} className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-black/70 border border-red-500 text-red-300 opacity-0 group-hover:opacity-100 transition">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 pt-4 border-t border-[rgb(var(--border))]">
            <button disabled={formState.isSubmitting} className="px-6 py-2 rounded-lg bg-[rgb(var(--accent))] text-white font-medium disabled:opacity-50">
              {formState.isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
