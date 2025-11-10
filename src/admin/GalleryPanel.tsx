import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { GalleryItem } from '../data/gallery';
import { listGallery, insertGalleryItem, deleteGalleryItem, updateGalleryItem, type GallerySection } from '../data/gallery';

export default function GalleryPanel({ persona = 'game' as const }: { persona?: 'cyber' | 'soft' | 'game' | 'art' }) {
  const [section, setSection] = useState<GallerySection>('3d');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const list = await listGallery({ persona, section });
      setItems(list);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load gallery');
    }
  }

  useEffect(() => { refresh(); }, [persona, section]);

  async function onUpload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const ordBase = items.length ? Math.max(...items.map(r => r.sort ?? 0)) + 1 : 0;
      let next = ordBase;
      for (const file of Array.from(files)) {
        const path = `gallery/${persona}/${section}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('project-media').upload(path, file, { upsert: false, cacheControl: '3600', contentType: file.type });
        if (error) throw error;
        await insertGalleryItem({ persona, section, storage_path: path, alt: file.name, sort: next++ });
      }
      await refresh();
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally { setBusy(false); }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex(r => r.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const a = items[idx], b = items[swap];
    const aOrd = a.sort ?? idx, bOrd = b.sort ?? swap;
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...b, sort: aOrd } as any;
      copy[swap] = { ...a, sort: bOrd } as any;
      return copy;
    });
    await updateGalleryItem(a.id!, { sort: bOrd });
    await updateGalleryItem(b.id!, { sort: aOrd });
    await refresh();
  }

  async function onDelete(row: GalleryItem) {
    if (!confirm('Delete this media?')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteGalleryItem(row.id!);
      await supabase.storage.from('project-media').remove([row.storage_path]);
      await refresh();
    } catch (e:any) {
      setError(e.message ?? 'Delete failed');
    } finally { setBusy(false); }
  }

  async function saveAlt(row: GalleryItem, alt: string) {
    await updateGalleryItem(row.id!, { alt });
    setItems(prev => prev.map(r => (r.id === row.id ? { ...r, alt } : r)));
  }

  return (
    <div className="p-4 sm:p-6 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgb(var(--border))]">
        <h3 className="text-lg font-semibold">Game Persona Gallery</h3>
        <select className="px-3 py-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--surface))]" value={section} onChange={e => setSection(e.target.value as GallerySection)}>
          <option value="3d">3D Models</option>
          <option value="2d">2D Character Concepts</option>
        </select>
        <label className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgb(var(--border))] cursor-pointer hover:bg-[rgb(var(--surface))] transition">
          <input type="file" multiple accept="image/*,image/gif,.gif" className="hidden" onChange={e => onUpload(e.target.files)} disabled={busy} />
          <span>{busy ? 'Uploading…' : '📤 Upload Images/GIFs'}</span>
        </label>
      </div>

      {error && <div className="mb-3 text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => (
          <div key={r.id} className="rounded-xl border overflow-hidden bg-[rgb(var(--surface))]/60" style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="aspect-[16/10] relative bg-neutral-800">
              {r.url ? (
                <img src={r.url} alt={r.alt ?? ''} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm opacity-50">Loading…</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgb(var(--accent) / .2)', color: 'rgb(var(--accent))' }}>#{r.sort ?? i}</div>
              <div className="absolute bottom-2 left-2 text-xs opacity-70 bg-black/50 px-2 py-1 rounded">{r.storage_path.split('/').pop()}</div>
            </div>
            <div className="p-3 space-y-2">
              <input defaultValue={r.alt ?? ''} onBlur={e => saveAlt(r, e.currentTarget.value)} placeholder="Alt text" className="w-full bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-md px-2 py-1 text-sm text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" />
              <div className="flex gap-2">
                <button className="px-2 py-1 text-sm rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition disabled:opacity-30" onClick={() => move(r.id!, -1)} disabled={i === 0} title="Move up">↑</button>
                <button className="px-2 py-1 text-sm rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition disabled:opacity-30" onClick={() => move(r.id!, +1)} disabled={i === items.length - 1} title="Move down">↓</button>
                <button className="ml-auto px-2 py-1 text-sm rounded-md border border-red-500 text-red-400 hover:bg-red-500/10 transition" onClick={() => onDelete(r)} title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="p-6 rounded-xl border text-sm opacity-70 col-span-full text-center" style={{ borderColor: 'rgb(var(--border))' }}>
            No media yet. Use "Upload images/GIFs" to add some.
          </div>
        )}
      </div>
    </div>
  );
}
