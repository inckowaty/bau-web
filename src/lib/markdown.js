// src/lib/markdown.js
// Prosty, bezpieczny Markdown dla pól tekstowych z CMS.
// Obsługuje: "## " i "### " nagłówki, akapity (pusta linia), listy "- ",
// **pogrubienie** i [link](/adres). Cały tekst jest escapowany – HTML z CMS nie przechodzi.

const escapeHtml = s =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const ok = /^(\/|#|https?:\/\/|mailto:|tel:)/.test(href);
    return ok ? `<a href="${href}">${label}</a>` : label;
  });
  return s;
}

export function renderMarkdown(src) {
  if (!src) return '';
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = [];

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`);
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      flushPara(); flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) { flushPara(); list.push(li[1]); continue; }

    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return out.join('\n');
}

// czysty tekst (do JSON-LD i liczenia słów)
export function markdownToText(src) {
  if (!src) return '';
  return src
    .replace(/^#{2,3}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// FAQ z CMS: bloki rozdzielone pustą linią, pierwsza linia = pytanie, reszta = odpowiedź.
// Prefiksy "F:", "Q:", "P:" i "A:", "O:" są opcjonalne i zostaną usunięte.
export function parseFaq(raw) {
  if (!raw) return [];
  return raw
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const [first, ...rest] = block.split('\n');
      const q = first.replace(/^(F|Q|P)\s*:\s*/i, '').trim();
      const a = rest.join(' ').replace(/^(A|O)\s*:\s*/i, '').trim();
      return { q, a };
    })
    .filter(item => item.q && item.a);
}
