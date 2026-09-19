const fs = require('fs');
const path = require('path');

const srcArticlesPath = path.join(__dirname, '..', 'src', 'data', 'articles.json');
const destArticlesPath = path.join(__dirname, '..', 'data', 'articles.json');

let raw = '';
if (fs.existsSync(srcArticlesPath)) {
  raw = fs.readFileSync(srcArticlesPath, 'utf8').replace(/^\uFEFF/, '');
} else if (fs.existsSync(destArticlesPath)) {
  raw = fs.readFileSync(destArticlesPath, 'utf8').replace(/^\uFEFF/, '');
}

const articles = JSON.parse(raw);
if (!Array.isArray(articles) || articles.length === 0) {
  console.error('[ERROR] articles.json is empty or invalid. Refusing to overwrite seedStories.ts!');
  process.exit(1);
}

// Ensure data/articles.json is synced with src/data/articles.json
fs.writeFileSync(destArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

const categoriesBlock = `import { Story, CategoryMeta } from '@/types';

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

`;

const ts = categoriesBlock + `export const INITIAL_STORIES: Story[] = ${JSON.stringify(articles, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'data', 'seedStories.ts'), ts, 'utf8');
console.log(`Done. Wrote ${articles.length} stories to seedStories.ts and data/articles.json (CATEGORIES preserved)`);

