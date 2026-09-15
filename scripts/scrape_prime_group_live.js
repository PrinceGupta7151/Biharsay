const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://biharsay.com/2026/09/09/prime-group-to-invest-%e2%82%b91500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects/';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => resolve(html));
    }).on('error', err => {
      console.error('Fetch error:', err.message);
      resolve('');
    });
  });
}

function cleanContent(rawHtml) {
  if (!rawHtml) return '';
  const $ = cheerio.load(rawHtml, null, false);
  $('script, style, iframe, nav, .share-bar, .comments, .advertisement, .author-box').remove();
  $('*').each((_, elem) => {
    const attribs = elem.attribs || {};
    Object.keys(attribs).forEach(attr => {
      if (/^data-/i.test(attr) || attr === 'class' || attr === 'style') {
        $(elem).removeAttr(attr);
      }
    });
  });
  const blocks = [];
  $('h1, h2, h3, h4, p, ul, ol, blockquote, hr').each((_, elem) => {
    const tag = elem.name.toLowerCase();
    const html = $(elem).html() ? $(elem).html().trim() : '';
    if (html && html !== '&nbsp;') {
      blocks.push(`<${tag}>${html}</${tag}>`);
    }
  });
  return blocks.join('\n');
}

async function run() {
  console.log('Fetching live Prime Group article from:', targetUrl);
  const html = await fetchHtml(targetUrl);
  if (!html) {
    console.error('Could not fetch page html!');
    return;
  }

  const $ = cheerio.load(html);

  let title = $('h1').first().text() || $('title').text() || 'Prime Group to invest ₹1,500 crore in Bihar real estate, targeting 5 million sq ft Projects';
  title = title.replace(/\s*-\s*Bihar Say$/i, '').trim();

  const contentContainer = $('.entry-content, .post-content, .td-post-content, article, main').first();
  let rawContent = contentContainer.length ? contentContainer.html() : $('body').html();
  let cleanedHtml = cleanContent(rawContent);

  if (!cleanedHtml || cleanedHtml.length < 50) {
    const paras = [];
    $('p').each((_, elem) => {
      const txt = $(elem).text().trim();
      if (txt.length > 20 && !txt.includes('Cookie')) {
        paras.push(`<p>${$(elem).html()}</p>`);
      }
    });
    cleanedHtml = paras.join('\n');
  }

  console.log('Scraped Title:', title);
  console.log('Scraped Content Length:', cleanedHtml.length);
  console.log('Content Snippet:', cleanedHtml.slice(0, 300));

  const DATA_DIR = path.join(__dirname, '..', 'data');
  const ARTICLES_PATH = path.join(DATA_DIR, 'articles.json');

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));

  const storyItem = {
    id: 'prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects',
    title: title,
    url: targetUrl,
    publishedDate: '2026-09-09T10:00:00+00:00',
    modifiedDate: '2026-09-09T10:00:00+00:00',
    author: 'Bihar Say | Amrita',
    category: 'Investments & Economic',
    categorySlug: 'investments-economic',
    wordCount: 650,
    featuredImage: 'https://biharsay.com/wp-content/uploads/2026/09/Bihar-Say-Website-3.png',
    metaDescription: 'Prime Group plans to invest around ₹1,500 crore in Bihar real estate over the next four quarters, with a development pipeline of 5 million sq ft.',
    summary: 'For years, Bihar’s real estate story was largely seen through the lens of Patna. Now, something bigger may be taking shape. Prime Group plans to invest around ₹1,500 crore in Bihar’s real estate sector over the next four quarters, with a development pipeline of nearly 5 million sq ft across residential and mixed-use projects.',
    content: cleanedHtml
  };

  // Ensure entries exist for all 3 slug variations so any URL format resolves
  const targetIds = [
    'prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects',
    'prime-group-to-invest-%e2%82%b91500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects',
    'prime-group-to-invest-₹1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects'
  ];

  targetIds.forEach(id => {
    const idx = articles.findIndex(a => a.id === id);
    if (idx >= 0) {
      articles[idx] = { ...articles[idx], ...storyItem, id };
    } else {
      articles.push({ ...storyItem, id });
    }
  });

  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  console.log('[UPDATED] articles.json');

  // Rebuild seedStories.ts
  require('./rebuild_seed_stories');
}

run();
