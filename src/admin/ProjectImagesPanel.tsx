import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSignedUrls, uploadImageForProject, deleteImageAtPath } from '../lib/media';

type ImgRow = { id: string; storage_path: string; alt: string | null; sort: number | null };
type Props = { projectId: string; onClose?: () => void };

export default function ProjectImagesPanel({ projectId, onClose }: Props) {
  const [rows, setRows] = useState<ImgRow[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('project_images')
        .select('id, storage_path, alt, sort')
        .eq('project_id', projectId)
        .order('sort', { ascending: true });
      if (error) { setError(error.message); return; }
      const list = (data ?? []) as ImgRow[];
      setRows(list);
      
      // sign URLs
      if (list.length > 0) {
        const paths = list.map(i => i.storage_path).filter(Boolean);
        console.log('Signing URLs for paths:', paths);
        const signedArr = await getSignedUrls(paths, 3600);
        console.log('Signed URLs:', signedArr);
        const map: Record<string,string> = {};
        for (const s of signedArr) {
          if (s.path) map[s.path] = s.url;
        }
        setSigned(map);
      }
    } catch (e: any) {
      console.error('Load error:', e);
      setError(e.message ?? 'Failed to load images');
    }
  }

  useEffect(() => { load(); }, [projectId]);

  async function onUpload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const ordBase = rows.length ? Math.max(...rows.map(r => r.sort ?? 0)) + 1 : 0;
      let next = ordBase;
      for (const file of Array.from(files)) {
        const path = await uploadImageForProject(projectId, file);
        const { error } = await supabase.from('project_images').insert({
          project_id: projectId,
          storage_path: path,
          alt: file.name,
          sort: next++,
        });
        if (error) throw error;
      }
      await load();
    } catch (e:any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = rows.findIndex(r => r.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= rows.length) return;
    const a = rows[idx], b = rows[swap];
    const aOrd = a.sort ?? idx, bOrd = b.sort ?? swap;
    setRows(prev => {
      const copy = [...prev];
      copy[idx] = { ...b, sort: aOrd };
      copy[swap] = { ...a, sort: bOrd };
      return copy;
    });
    // persist
    await supabase.from('project_images').update({ sort: bOrd }).eq('id', a.id);
    await supabase.from('project_images').update({ sort: aOrd }).eq('id', b.id);
    await load();
  }

  async function setCover(id: string) {
    setBusy(true);
    try {
      await supabase.from('project_images').update({ sort: 0 }).eq('id', id);
      const others = rows.filter(r => r.id !== id);
      for (const r of others) {
        await supabase.from('project_images')
          .update({ sort: (r.sort ?? 0) + 1 })
          .eq('id', r.id);
      }
      await load();
    } finally { setBusy(false); }
  }

  async function onDelete(row: ImgRow) {
    if (!confirm('Delete this image?')) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.from('project_images').delete().eq('id', row.id);
      if (error) throw error;
      await deleteImageAtPath(row.storage_path);
      await load();
    } catch (e:any) {
      setError(e.message ?? 'Delete failed');
    } finally { setBusy(false); }
  }

  async function saveAlt(row: ImgRow, alt: string) {
    await supabase.from('project_images').update({ alt }).eq('id', row.id);
    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, alt } : r)));
  }

  return (
    <div className="p-4 sm:p-6 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgb(var(--border))]">
        <h3 className="text-lg font-semibold">Project Images</h3>
        {onClose && (
          <button 
            className="ml-auto px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] transition" 
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>

      {error && <div className="mb-3 text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</div>}

      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgb(var(--border))] cursor-pointer hover:bg-[rgb(var(--surface))] transition"
             style={{ background: 'rgb(var(--surface) / 0.5)' }}>
        <input type="file" multiple accept="image/*" className="hidden" onChange={e => onUpload(e.target.files)} disabled={busy} />
        <span>{busy ? 'Uploading…' : '📤 Upload images'}</span>
      </label>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-xl border overflow-hidden bg-[rgb(var(--surface))]/60"
               style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="aspect-[16/10] relative bg-neutral-800">
              {signed[r.storage_path] ? (
                <img
                  src={signed[r.storage_path]}
                  alt={r.alt ?? ''}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', r.storage_path);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm opacity-50">
                  Loading...
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium"
                   style={{ background: 'rgb(var(--accent) / .2)', color: 'rgb(var(--accent))' }}>
                #{r.sort ?? i}
              </div>
              <div className="absolute bottom-2 left-2 text-xs opacity-70 bg-black/50 px-2 py-1 rounded">
                {r.storage_path.split('/').pop()}
              </div>
            </div>

            <div className="p-3 space-y-2">
              <input
                defaultValue={r.alt ?? ''}
                onBlur={e => saveAlt(r, e.currentTarget.value)}
                placeholder="Alt text"
                className="w-full bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-md px-2 py-1 text-sm text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              />

              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-sm rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition disabled:opacity-30"
                  onClick={() => move(r.id, -1)}
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="px-2 py-1 text-sm rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition disabled:opacity-30"
                  onClick={() => move(r.id, +1)}
                  disabled={i === rows.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  className="ml-auto px-2 py-1 text-sm rounded-md border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] transition"
                  onClick={() => setCover(r.id)}
                  title="Set as cover image"
                >
                  ⭐ Cover
                </button>
                <button
                  className="px-2 py-1 text-sm rounded-md border border-red-500 text-red-400 hover:bg-red-500/10 transition"
                  onClick={() => onDelete(r)}
                  title="Delete image"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
        {!rows.length && (
          <div className="p-6 rounded-xl border text-sm opacity-70 col-span-full text-center"
               style={{ borderColor: 'rgb(var(--border))' }}>
            No images yet. Use "Upload images" to add some.
          </div>
        )}
      </div>
    </div>
  );
}
