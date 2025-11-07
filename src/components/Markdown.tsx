import React, { useCallback } from 'react';

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function processInline(text: string) {
  let t = escapeHtml(text);
  // images ![alt](url) with special handling for video providers and non-image links
  t = t.replace(/!\s*\[([^\]]*)\]\(\s*([^\)]+?)\s*\)/g, (_m, alt, url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        let id = '';
        if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
        else if (u.searchParams.get('v')) id = u.searchParams.get('v') as string;
        else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        const src = `https://www.youtube.com/embed/${id}`;
        return `<div class=\"md-embed\"><iframe src=\"${src}\" loading=\"lazy\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe></div>`;
      }
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean).pop();
        if (id) {
          const src = `https://player.vimeo.com/video/${id}`;
          return `<div class=\"md-embed\"><iframe src=\"${src}\" loading=\"lazy\" allow=\"autoplay; fullscreen; picture-in-picture\" allowfullscreen></iframe></div>`;
        }
      }
    } catch {}
    // if not a typical image extension, fallback to link
    if (!/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url)) {
      return `<a href=\"${url}\" target=\"_blank\" rel=\"noreferrer\">${alt || url}</a>`;
    }
    return `<img src=\"${url}\" alt=\"${alt}\" loading=\"lazy\" />`;
  });
  // links [label](url)
  t = t.replace(/\[\s*([^\]]+?)\s*\]\(\s*([^\)]+?)\s*\)/g, (_m, label, url) => {
    return `<a href=\"${url}\" target=\"_blank\" rel=\"noreferrer\">${label}</a>`;
  });
  // bold **text**
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // inline code `code`
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}

function renderMarkdown(md: string): string {
  if (!md) return '';
  const input = md.replace(/\r\n?/g, '\n');
  const lines = input.split('\n');
  let i = 0;
  const out: string[] = [];

  function embedForUrl(url: string): string | null {
    try {
      const u = new URL(url);
      // YouTube
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        let id = '';
        if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
        else if (u.searchParams.get('v')) id = u.searchParams.get('v') as string;
        else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        const src = `https://www.youtube.com/embed/${id}`;
        return `<div class="md-embed"><iframe src="${src}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }
      // Vimeo
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean).pop();
        if (!id) return null;
        const src = `https://player.vimeo.com/video/${id}`;
        return `<div class="md-embed"><iframe src="${src}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      }
    } catch {}
    return null;
  }

  function renderParagraph(buf: string[]) {
    if (!buf.length) return;
    const text = buf.join('\n');
    out.push(`<p>${processInline(text).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`);
  }

  while (i < lines.length) {
    const line = lines[i];
    // blank line -> paragraph break
    if (!line.trim()) { i++; out.push(''); continue; }

    // headings
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length;
      out.push(`<h${level}>${processInline(m[2])}</h${level}>`);
      i++;
      continue;
    }

    // fenced code (```)
    if (/^```/.test(line)) {
      // optional language capture not used
      /* const fence = line.match(/^```(.*)$/)?.[1] ?? '' */
      i++;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(escapeHtml(lines[i++])); }
      if (i < lines.length) i++; // skip closing fence
      out.push(`<pre><code>${buf.join('\n')}</code></pre>`);
      continue;
    }

    // unordered list
    if (/^\s*[-*+–—]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+–—]\s+/.test(lines[i])) {
        const txt = lines[i].replace(/^\s*[-*+–—]\s+/, '');
        items.push(`<li>${processInline(txt)}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const txt = lines[i].replace(/^\s*\d+\.\s+/, '');
        items.push(`<li>${processInline(txt)}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // auto-embed if line is a bare URL
    const trimmed = line.trim();
    try {
      const utest = new URL(trimmed);
      if (/^https?:/.test(utest.protocol)) {
        const em = embedForUrl(trimmed);
        if (em) { out.push(em); i++; continue; }
      }
    } catch {}

    // paragraph (collect until blank or block)
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i]) && !/^```/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    renderParagraph(buf);
  }

  return out.join('\n');
}

export default function Markdown({ value, onImageClick }: { value: string; onImageClick?: (src: string, alt?: string) => void }) {
  const html = renderMarkdown(value ?? '');

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t && t.tagName === 'IMG') {
      const img = t as HTMLImageElement;
      onImageClick?.(img.src, img.alt);
    }
  }, [onImageClick]);

  return (
    <div
      className="markdown text-sm leading-6"
      style={{ color: 'rgb(var(--sub))' }}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
