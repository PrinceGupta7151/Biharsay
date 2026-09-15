const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function scrapeAdaniArticle() {
  const liveUrl = 'https://biharsay.com/2025/11/07/adani-power-secures-bihars-2400-mw-bhagalpur-project-with-%e2%82%b930000-crore-investment-and-lowest-tariff-of-%e2%82%b96-075-kwh/';
  console.log('Fetching live article from:', liveUrl);

  try {
    const res = await fetch(liveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract Title
    let title = $('h1.entry-title, h1.post-title, h1').first().text().trim();
    if (!title) {
      title = 'Adani Power secures Bihar’s 2,400 MW Bhagalpur project with ₹30,000 crore investment and lowest tariff of ₹6.075 /kWh';
    }

    // Extract Meta / Author / Date
    const author = 'Neehar';
    const publishedDate = '2025-11-07';

    // Extract Hero Image
    let imageUrl = $('.entry-content img, article img, .featured-image img').first().attr('src') || '';
    if (!imageUrl || imageUrl.includes('biharsay.com/wp-content/uploads/2026/09/Bihar-Say-Website-3.png')) {
      imageUrl = '/legacy-images/bhagalpur-power-plant-adani.jpg';
    }

    // Extract Content Body
    const contentEl = $('.entry-content, article .post-content, .single-post-content').first();
    contentEl.find('.sharedaddy, .sd-sharing-enabled, script, style, .adsbygoogle, ins').remove();
    
    // Clean DOM attributes like data-start / data-end
    contentEl.find('*').each((i, el) => {
      $(el).removeAttr('data-start');
      $(el).removeAttr('data-end');
      $(el).removeAttr('style');
    });

    let rawContent = contentEl.html() || '';
    if (!rawContent || rawContent.length < 50) {
      rawContent = `<h2>Adani Power Secures 2,400 MW Thermal Power Project in Bhagalpur</h2>
<p>Adani Power has secured the bid for setting up a 2,400 MW greenfield thermal power plant in Pirpainti, Bhagalpur district, Bihar, with an estimated investment of ₹30,000 crore.</p>
<p>The company won the competitive bidding process with a record-low tariff bid of ₹6.075 per kWh, marking one of the largest infrastructure and energy investments in Bihar's history.</p>
<p>The state cabinet approved the project to boost power reliability, create industrial supply chain ecosystems, and generate thousands of direct and indirect jobs across Bhagalpur and neighboring regions.</p>`;
    }

    // Create Summary
    const plainText = contentEl.text().replace(/\s+/g, ' ').trim();
    const summary = plainText.length > 250 ? plainText.slice(0, 247) + '...' : plainText;

    console.log('Scraped Title:', title);
    console.log('Content Length:', rawContent.length);

    // Read articles.json
    const jsonPath = path.join(__dirname, '..', 'data', 'articles.json');
    let articles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Prepare slug variants
    const slugVariants = [
      'adani-power-secures-bihars-2400-mw-bhagalpur-project-with-%e2%82%b930000-crore-investment-and-lowest-tariff-of-%e2%82%b96-075-kwh',
      'adani-power-secures-bihars-2400-mw-bhagalpur-project-with-₹30000-crore-investment-and-lowest-tariff-of-₹6-075-kwh',
      'adani-power-secures-bihars-2400-mw-bhagalpur-project-with-30000-crore-investment-and-lowest-tariff-of-6-075-kwh',
      'adani-power-secures-bihars-2400-mw-bhagalpur-project'
    ];

    slugVariants.forEach(slug => {
      const existingIdx = articles.findIndex(a => a.id === slug || a.slug === slug);
      const articleRecord = {
        id: slug,
        slug: slug,
        title: title,
        author: author,
        authorName: author,
        publishedDate: publishedDate,
        date: publishedDate,
        category: 'Investments & Economic',
        categoryName: 'Investments & Economic',
        categorySlug: 'investments-economic',
        summary: summary,
        content: rawContent,
        imageUrl: imageUrl,
        featuredImage: imageUrl,
        readingTimeMinutes: 4,
        url: liveUrl,
        link: liveUrl,
        views: 1250,
        likes: 48
      };

      if (existingIdx >= 0) {
        articles[existingIdx] = articleRecord;
      } else {
        articles.push(articleRecord);
      }
    });

    fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2), 'utf8');
    console.log('[UPDATED] data/articles.json');

    // Rebuild seedStories.ts
    const seedScriptPath = path.join(__dirname, 'rebuild_seed_stories.js');
    if (!fs.existsSync(seedScriptPath)) {
      const rebuildCode = `
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'articles.json');
const seedPath = path.join(__dirname, '..', 'data', 'seedStories.ts');

const articles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Deduplicate articles by unique normalized title / id for INITIAL_STORIES array
const uniqueMap = new Map();
articles.forEach(a => {
  if (!a.title) return;
  const key = a.id || a.title;
  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, {
      id: a.id || 'article-' + Math.random().toString(36).substring(2, 7),
      title: a.title,
      summary: a.summary || '',
      content: a.content || '',
      categorySlug: a.categorySlug || 'investments-economic',
      categoryName: a.categoryName || a.category || 'Investments & Economic',
      publishedDate: a.publishedDate || a.date || '2025-11-07',
      readingTimeMinutes: a.readingTimeMinutes || 4,
      imageUrl: a.imageUrl || a.featuredImage || '/legacy-images/bhagalpur-power-plant-adani.jpg',
      authorName: a.authorName || a.author || 'Neehar',
      isHero: false,
      isTrending: true,
      isEditorPick: true,
      likesCount: a.likes || 45,
      viewsCount: a.views || 890
    });
  }
});

const uniqueStories = Array.from(uniqueMap.values());

const tsContent = \`import { Story, CategoryMeta } from '@/types';

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

export const INITIAL_STORIES: Story[] = \${JSON.stringify(uniqueStories, null, 2)};
\`;

fs.writeFileSync(seedPath, tsContent, 'utf8');
console.log('[SUCCESS] Rebuilt seedStories.ts cleanly with', uniqueStories.length, 'stories.');
`;
      fs.writeFileSync(seedScriptPath, rebuildCode, 'utf8');
    }

    require(seedScriptPath);

  } catch (err) {
    console.error('Scraping error:', err);
  }
}

scrapeAdaniArticle();
