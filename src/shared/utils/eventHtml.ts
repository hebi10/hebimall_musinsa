const BLOCKED_CONTENT_TAG_PATTERN = /<(script|style|iframe|object|embed|form)\b[\s\S]*?<\/\1>/gi;
const HTML_TAG_PATTERN = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'a',
]);

export function sanitizeEventHtml(content: string): string {
  return content
    .replace(BLOCKED_CONTENT_TAG_PATTERN, '')
    .replace(HTML_TAG_PATTERN, (tag, tagName: string) => {
      const normalizedTag = tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(normalizedTag)) {
        return '';
      }

      if (tag.startsWith('</')) {
        return `</${normalizedTag}>`;
      }

      if (normalizedTag !== 'a') {
        return normalizedTag === 'br' ? '<br>' : `<${normalizedTag}>`;
      }

      const href = extractSafeHref(tag);
      return href ? `<a href="${href}">` : '<a>';
    });
}

function extractSafeHref(tag: string): string | null {
  const hrefMatch = tag.match(/\shref\s*=\s*(["'])(.*?)\1/i);
  if (!hrefMatch) return null;

  const href = hrefMatch[2].trim();
  if (!href || /^(javascript|data|vbscript):/i.test(href)) {
    return null;
  }

  return escapeAttribute(href);
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
