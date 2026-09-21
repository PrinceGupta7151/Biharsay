/**
 * Utilities for cleaning and parsing rich content pasted from Microsoft Word,
 * Google Docs, and plain text with bullet points.
 */

/**
 * Clean and normalize rich HTML pasted from Microsoft Word or Google Docs.
 * - Strips Word XML, comments, and proprietary mso-* styles.
 * - Converts Word list paragraphs (MsoListParagraph) into proper <ul>/<ol> lists.
 * - Converts Word headings into <h1>, <h2>, <h3>.
 * - Preserves bold, italic, underline, blockquotes, paragraphs, and safe font-family.
 */
export function cleanWordHtml(html: string): string {
  if (!html) return '';

  let clean = html;

  // 1. Remove Word conditional comments, XML blocks, style blocks, meta and link tags
  clean = clean.replace(/<!--[\s\S]*?-->/gi, '');
  clean = clean.replace(/<xml[\s\S]*?<\/xml>/gi, '');
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<meta[\s\S]*?>/gi, '');
  clean = clean.replace(/<link[\s\S]*?>/gi, '');
  clean = clean.replace(/<!\[if\s+!supportLists\]>([\s\S]*?)<!\[endif\]>/gi, '$1');

  // 2. Normalize Word list paragraphs (class="MsoListParagraph" or style with mso-list)
  // Word creates lists as:
  // <p class="MsoListParagraph...">...<span style="mso-list:Ignore">·<span ...></span></span>Item text</p>
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoListParagraph[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
    const isNumbered = /mso-list:Ignore[^>]*>\s*\d+[\.\)]/i.test(inner) || /^\s*\d+[\.\)]/.test(inner.replace(/<[^>]+>/g, '').trim());
    let itemContent = inner
      .replace(/<span[^>]*style=["'][^"']*mso-list:\s*Ignore[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/^[\s·•\-\–\*\u2022\u00b7\u25aa\u25cf\u25cb\u2013\u2014]+/, '')
      .trim();
    itemContent = itemContent.replace(/^\d+[\.\)]\s*/, '').trim();
    return `<li data-list-type="${isNumbered ? 'ol' : 'ul'}">${itemContent}</li>`;
  });

  // Group adjacent <li> tags into <ol> or <ul>
  clean = clean.replace(/(<li data-list-type="ol">[\s\S]*?<\/li>\s*)+/gi, (match) => {
    return `<ol>\n  ${match.replace(/ data-list-type="ol"/g, '')}\n</ol>\n`;
  });
  clean = clean.replace(/(<li(?: data-list-type="ul")?>[\s\S]*?<\/li>\s*)+/gi, (match) => {
    return `<ul>\n  ${match.replace(/ data-list-type="ul"/g, '')}\n</ul>\n`;
  });

  // 3. Convert Word Headings
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoTitle[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, '<h1>$1</h1>');
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoSubtitle[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, '<h2>$1</h2>');
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoHeading1[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, '<h1>$1</h1>');
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoHeading2[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, '<h2>$1</h2>');
  clean = clean.replace(/<p[^>]*class=["']?[^"'>]*MsoHeading3[^"'>]*["']?[^>]*>([\s\S]*?)<\/p>/gi, '<h3>$1</h3>');

  // 4. Clean styles: keep only font-family, font-weight, font-style, text-decoration
  clean = clean.replace(/style=["']([^"']*)["']/gi, (match, styleStr) => {
    const rules = styleStr.split(';').map((r: string) => r.trim()).filter(Boolean);
    const keptRules: string[] = [];
    for (const rule of rules) {
      const [prop, val] = rule.split(':').map((s: string) => s.trim());
      if (!prop || !val) continue;
      const lowerProp = prop.toLowerCase();
      if (lowerProp === 'font-family') {
        const cleanFont = val.replace(/['"]/g, '').split(',')[0].trim();
        keptRules.push(`font-family: '${cleanFont}', sans-serif`);
      } else if (lowerProp === 'font-weight' && (val === 'bold' || parseInt(val, 10) >= 600)) {
        keptRules.push('font-weight: bold');
      } else if (lowerProp === 'font-style' && val === 'italic') {
        keptRules.push('font-style: italic');
      } else if (lowerProp === 'text-decoration' && val.includes('underline')) {
        keptRules.push('text-decoration: underline');
      }
    }
    return keptRules.length > 0 ? `style="${keptRules.join('; ')}"` : '';
  });

  // 5. Clean up useless classes
  clean = clean.replace(/\s*class=["'][^"']*["']/gi, '');

  // 6. Unwrap redundant spans that have no attributes
  clean = clean.replace(/<span>([\s\S]*?)<\/span>/gi, '$1');
  clean = clean.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');

  // 7. Clean up empty tags
  clean = clean.replace(/<(p|span|div|b|i|u|strong|em)[^>]*>\s*<\/\1>/gi, '');

  return clean.trim();
}

/**
 * Convert plain text containing bullet markers (•, -, *, 1.) and paragraphs
 * into structured semantic HTML (<p>, <ul>, <ol>).
 */
export function convertPlainTextToHtml(text: string): string {
  if (!text) return '';

  const lines = text.split(/\r\n|\r|\n/);
  const blocks: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const pText = currentParagraph.join('<br />').trim();
      if (pText) {
        blocks.push(`<p>${pText}</p>`);
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      const tag = currentList.type;
      const itemsHtml = currentList.items.map((item) => `  <li>${item}</li>`).join('\n');
      blocks.push(`<${tag}>\n${itemsHtml}\n</${tag}>`);
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if line is empty (paragraph break)
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    // Check if line is a bullet point: •, -, *, –, 🔹
    const bulletMatch = trimmed.match(/^[•\-\*\–🔹]\s*(.*)$/);
    // Check if line is a numbered list: 1., 2), etc.
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s*(.*)$/);

    if (bulletMatch) {
      flushParagraph();
      if (currentList && currentList.type !== 'ul') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numberMatch) {
      flushParagraph();
      if (currentList && currentList.type !== 'ol') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberMatch[2]);
    } else {
      flushList();
      currentParagraph.push(trimmed);
    }
  }

  flushList();
  flushParagraph();

  return blocks.join('\n');
}
