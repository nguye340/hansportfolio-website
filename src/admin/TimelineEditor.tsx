import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Timeline } from '../data/timeline';
import { upsertTimelineItem } from '../data/timeline';

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

  useEffect(() => { reset(toFormValues(item)); }, [item, reset]);

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

    const payload: Timeline = {
      id: v.id,
      persona: v.persona,
      kind: v.kind,
      start: v.start,
      date: v.date,
      title: v.title,
      org: v.org || undefined,
      location: v.location || undefined,
      bullets,
      cta,
    } as Timeline;

    await upsertTimelineItem(payload);
    onClose(true);
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
