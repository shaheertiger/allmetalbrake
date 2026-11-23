import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/** Render a markdown block to HTML. Internal links stay as-is; external links open safely. */
export function md(src: string | undefined): string {
  if (!src) return '';
  const html = marked.parse(src, { async: false }) as string;
  return html
    .replace(/<a href="(https?:\/\/(?:www\.)?amazon\.com[^"]*)"/g, '<a href="$1" target="_blank" rel="sponsored nofollow noopener"')
    .replace(/<a href="(https?:\/\/(?!(?:www\.)?amazon\.com)[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
}

/** Render inline markdown (no wrapping <p>). */
export function mdInline(src: string | undefined): string {
  if (!src) return '';
  return marked.parseInline(src, { async: false }) as string;
}

/** Plain text (for schema/meta). */
export function plain(src: string | undefined): string {
  if (!src) return '';
  return src
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
