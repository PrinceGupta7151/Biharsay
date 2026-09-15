const fs = require('fs');
const path = require('path');

function normalizeTitle(str) {
  return (str || '')
    .toLowerCase()
    .replace(/₹|%e2%82%b9/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function deduplicateDataset() {
  const jsonPath = path.join(__dirname, '..', 'data', 'articles.json');
  const seedPath = path.join(__dirname, '..', 'data', 'seedStories.ts');

  if (!fs.existsSync(jsonPath)) return;

  const rawArticles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('Original articles.json count:', rawArticles.length);

  // 1. Deduplicate articles.json by normalized title
  const uniqueArticlesMap = new Map();
  rawArticles.forEach((art) => {
    const key = normalizeTitle(art.title || art.id);
    if (!uniqueArticlesMap.has(key)) {
      uniqueArticlesMap.set(key, art);
    }
  });

  const cleanArticles = Array.from(uniqueArticlesMap.values());
  console.log('Deduplicated articles.json count:', cleanArticles.length);

  fs.writeFileSync(jsonPath, JSON.stringify(cleanArticles, null, 2), 'utf8');
  console.log('[DEDUPLICATED] data/articles.json');

  // 2. Rebuild seedStories.ts cleanly with unique stories
  const uniqueStories = cleanArticles.map(a => ({
    id: a.id || 'article-' + Math.random().toString(36).substring(2, 7),
    title: a.title,
    summary: a.summary || '',
    content: a.content || '',
    categorySlug: a.categorySlug || 'investments-economic',
    categoryName: a.categoryName || a.category || 'Investments & Economic',
    publishedDate: a.publishedDate || a.date || '2025-11-07',
    readingTimeMinutes: a.readingTimeMinutes || 4,
    imageUrl: a.imageUrl || a.featuredImage || '/legacy-images/Bihar-Say-Website-3.png',
    authorName: a.authorName || a.author || 'Bihar Say Desk',
    isHero: false,
    isTrending: true,
    isEditorPick: true,
    likesCount: a.likes || 45,
    viewsCount: a.views || 890
  }));

  const tsContent = `import { Story, CategoryMeta } from '@/types';

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Culture & Heritage',
    slug: 'culture-heritage',
    tagline: 'Art, traditions, history & stories shaping Bihar identity.',
    iconName: 'Landmark',
    accentColor: '#D97706',
  },
  {
    name: 'Education & Social',
    slug: 'education-social',
    tagline: 'Scholarships, exams, student wins & community progress.',
    iconName: 'GraduationCap',
    accentColor: '#2563EB',
  },
  {
    name: 'Entrepreneurship & Startups',
    slug: 'entrepreneurship-startups',
    tagline: 'Local founders, agritech, MSMEs & innovation stories.',
    iconName: 'Rocket',
    accentColor: '#059669',
  },
  {
    name: 'Industry & Innovation',
    slug: 'industry-innovation',
    tagline: 'Factories, infrastructure, tech parks & manufacturing.',
    iconName: 'Factory',
    accentColor: '#7C3AED',
  },
  {
    name: 'Sports',
    slug: 'sports',
    tagline: 'Tournaments, local champions, stadiums & athletic talent.',
    iconName: 'Trophy',
    accentColor: '#DC2626',
  },
  {
    name: 'Investments & Economic',
    slug: 'investments-economic',
    tagline: 'Economy, infrastructure projects, policy & trade corridors.',
    iconName: 'TrendingUp',
    accentColor: '#0284C7',
  },
];

export const INITIAL_STORIES: Story[] = ${JSON.stringify(uniqueStories, null, 2)};
`;

  fs.writeFileSync(seedPath, tsContent, 'utf8');
  console.log('[SUCCESS] Rebuilt seedStories.ts cleanly with', uniqueStories.length, 'unique stories.');
}

deduplicateDataset();
