import React, { useCallback } from 'react';

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let id = '';
      if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
      else if (u.searchParams.get('v')) id = u.searchParams.get('v') as string;
      else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
      if (id.includes('?')) id = id.split('?')[0];
      const src = `https://www.youtube.com/embed/${id}`;
      return `<div class="md-embed"><iframe src="${src}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (!id) return null;
      const src = `https://player.vimeo.com/video/${id}`;
      return `<div class="md-embed"><iframe src="${src}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
  } catch {}
  return null;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkify(text: string) {
  return text.replace(/(https?:\/\/[^\s)]+)(?=[\s)|]|$)/g, (m) => `<a href="${m}" target="_blank" rel="noreferrer">${m}</a>`);
}

function render(value: string): string {
  if (!value) return '';
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { out.push(''); i++; continue; }

    // Headings by leading # or ===/--- underline or ALLCAPS line
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length;
      out.push(`<h${level}>${escapeHtml(m[2])}</h${level}>`);
      i++; continue;
    }
    if (i+1 < lines.length && /^\s*(=){3,}\s*$/.test(lines[i+1])) { out.push(`<h1>${escapeHtml(line.trim())}</h1>`); i+=2; continue; }
    if (i+1 < lines.length && /^\s*(-){3,}\s*$/.test(lines[i+1])) { out.push(`<h2>${escapeHtml(line.trim())}</h2>`); i+=2; continue; }

    // Bare URL -> embed or image or paragraph with link
    const trimmed = line.trim();
    try {
      const u = new URL(trimmed);
      if (/^https?:/.test(u.protocol)) {
        const em = toEmbed(trimmed);
        if (em) { out.push(em); i++; continue; }
        if (isImageUrl(trimmed)) { out.push(`<p><img src="${trimmed}" alt="" loading="lazy" /></p>`); i++; continue; }
      }
    } catch {}

    // Paragraph: escape + linkify, keep manual breaks within block
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i])) { buf.push(lines[i]); i++; }
    const html = linkify(escapeHtml(buf.join('\n'))).replace(/\n/g, '<br/>' );
    out.push(`<p>${html}</p>`);
  }
  return out.join('\n');
}

export default function Prose({ value, onImageClick }: { value: string; onImageClick?: (src: string, alt?: string) => void }) {
  const html = render(value);
  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t && t.tagName === 'IMG') {
      const img = t as HTMLImageElement;
      onImageClick?.(img.src, img.alt);
    }
  }, [onImageClick]);
  return (
    <div className="prose-lite text-sm leading-7" style={{ color: 'rgb(var(--sub))' }} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
