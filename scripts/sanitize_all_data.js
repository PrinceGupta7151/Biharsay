const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ARTICLES_JSON_PATH = path.join(DATA_DIR, 'articles.json');
const SEED_STORIES_PATH = path.join(DATA_DIR, 'seedStories.ts');

function cleanContent(rawContent) {
  if (!rawContent) return '';
  let html = rawContent;

  // 1. Remove all data-start, data-end, data-section-id, data-turn-id and data-* attributes
  html = html.replace(/\s*data-[a-z\-]+="[^"]*"/gi, '');
  html = html.replace(/\s*data-[a-z\-]+='[^']*'/gi, '');

  // 2. Remove inline class and style attributes
  html = html.replace(/\s*class="[^"]*"/gi, '');
  html = html.replace(/\s*style="[^"]*"/gi, '');

  // 3. Convert markdown headers (## Header, ### Header) to HTML <h2> / <h3>
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // 4. Clean up self-closing br tags
  html = html.replace(/<br\s*\/?>/gi, '<br />');

  // 5. Wrap plain text paragraphs if no HTML wrapper tags are present
  if (!/<(p|h1|h2|h3|h4|ul|ol|blockquote)/i.test(html)) {
    const paras = html.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    html = paras.map(p => `<p>${p}</p>`).join('\n');
  }

  return html.trim();
}

// 1. Sanitize articles.json if exists
if (fs.existsSync(ARTICLES_JSON_PATH)) {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_JSON_PATH, 'utf-8'));
  let cleanedCount = 0;
  articles.forEach(art => {
    if (art.content) {
      const clean = cleanContent(art.content);
      if (clean !== art.content) {
        art.content = clean;
        cleanedCount++;
      }
    }
  });
  fs.writeFileSync(ARTICLES_JSON_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`[CLEANED] Cleaned ${cleanedCount} articles in articles.json.`);
}

// 2. Rebuild seedStories.ts
if (fs.existsSync(ARTICLES_JSON_PATH)) {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_JSON_PATH, 'utf-8'));
  const header = `// Automatically generated from legacy WordPress migration with 100% locally hosted assets
import { CategoryInfo, Story } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'culture-heritage',
    name: 'Culture & Heritage',
    subtitle: 'Stories, festivals, crafts and everyday cultural resurgence across Bihar.',
    dotClass: 'culture',
    color: '#0E3E73',
  },
  {
    slug: 'education-social',
    name: 'Education & Social',
    subtitle: "Academics, results, youth empowerment, and the state's social progress.",
    dotClass: 'edu',
    color: '#4A7AAE',
  },
  {
    slug: 'entrepreneurship-startups',
    name: 'Entrepreneurship & Startups',
    subtitle: 'Founders, innovators and grassroots enterprises scaling from Bihar to the world.',
    dotClass: 'startup',
    color: '#1D6FD8',
  },
  {
    slug: 'industry-innovation',
    name: 'Industry & Innovation',
    subtitle: 'Manufacturing, tech corridors, infrastructure and green momentum.',
    dotClass: 'industry',
    color: '#7FA8D6',
  },
  {
    slug: 'sports',
    name: 'Sports',
    subtitle: "Athletes, state academies and Bihar's historic rise on the national & global stage.",
    dotClass: 'sports',
    color: '#092C54',
  },
  {
    slug: 'investments-economic',
    name: 'Investments & Economic',
    subtitle: 'Financial growth, policy reforms and private investment momentum in Bihar.',
    dotClass: 'startup',
    color: '#16A34A',
  }
];

`;

  const cleanStories = articles.map(art => {
    let cleanId = art.id || 'article-2025';
    try { cleanId = decodeURIComponent(cleanId); } catch (e) {}
    cleanId = cleanId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return {
      id: cleanId,
      title: art.title || cleanId,
      summary: art.summary || art.metaDescription || '',
      content: cleanContent(art.content || ''),
      categorySlug: art.categorySlug || 'education-social',
      categoryName: art.category || 'Education & Social',
      publishedDate: art.publishedDate ? art.publishedDate.split('T')[0] : '2025-12-01',
      readingTimeMinutes: Math.ceil((art.wordCount || 500) / 200),
      imageUrl: art.featuredImage || '/legacy-images/Bihar-Say-Website-3.png',
      authorName: art.author || 'Bihar Say | Amrita',
      isHero: false,
      isTrending: true,
      isEditorPick: false,
      likesCount: 15,
      viewsCount: 420
    };
  });

  const fileContent = `${header}export const INITIAL_STORIES: Story[] = ${JSON.stringify(cleanStories, null, 2)};\n`;
  fs.writeFileSync(SEED_STORIES_PATH, fileContent, 'utf-8');
  console.log(`[SUCCESS] Updated seedStories.ts with ${cleanStories.length} clean stories.`);
}
