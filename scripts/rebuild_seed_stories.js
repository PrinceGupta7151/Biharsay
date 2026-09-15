const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const COMPLETE_JSON_PATH = path.join(DATA_DIR, 'articles.json');
const SEED_STORIES_PATH = path.join(DATA_DIR, 'seedStories.ts');

const scrapedArticles = JSON.parse(fs.readFileSync(COMPLETE_JSON_PATH, 'utf-8'));
console.log(`[REBUILD] Loaded ${scrapedArticles.length} scraped articles.`);

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

const cleanStories = scrapedArticles.map(art => {
  let cleanId = art.id || 'article-2025';
  try { cleanId = decodeURIComponent(cleanId); } catch (e) {}
  cleanId = cleanId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    id: cleanId,
    title: art.title || cleanId,
    summary: art.summary || art.metaDescription || '',
    content: art.content || '',
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
console.log(`[SUCCESS] Rebuilt ${SEED_STORIES_PATH} cleanly with ${cleanStories.length} stories.`);
