const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://biharsay.com/2025/11/02/patna-womens-college-hosts-golden-jubilee-reunion/';

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
  console.log('Fetching live article from:', targetUrl);
  const html = await fetchHtml(targetUrl);
  if (!html) {
    console.error('Could not fetch page html!');
    return;
  }

  const $ = cheerio.load(html);

  let title = $('h1').first().text() || $('title').text() || 'Patna Women’s College Hosts Golden Jubilee Reunion';
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

  // Save to articles.json & seedStories.ts
  const DATA_DIR = path.join(__dirname, '..', 'data');
  const ARTICLES_PATH = path.join(DATA_DIR, 'articles.json');
  const SEED_PATH = path.join(DATA_DIR, 'seedStories.ts');

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
  const targetId = 'patna-womens-college-golden-jubilee';

  // Find or insert story
  let foundIndex = articles.findIndex(a => a.id.includes('patna-women') || a.id.includes('golden-jubilee'));
  const newArticle = {
    id: targetId,
    title: title,
    url: targetUrl,
    publishedDate: '2025-11-02T10:00:00+00:00',
    modifiedDate: '2025-11-02T10:00:00+00:00',
    author: 'Bihar Say | Amrita',
    category: 'Culture & Heritage',
    categorySlug: 'culture-heritage',
    wordCount: 550,
    featuredImage: 'https://biharsay.com/wp-content/uploads/2025/11/Bihar-Say-Website-12.png',
    metaDescription: 'Patna Women’s College hosted its Golden Jubilee Reunion, bringing together alumni from across generations to celebrate excellence and nostalgia.',
    summary: 'Patna Women’s College hosted its Golden Jubilee Reunion, bringing together alumni from across generations to celebrate excellence, sisterhood, and nostalgia.',
    content: cleanedHtml
  };

  if (foundIndex >= 0) {
    articles[foundIndex] = { ...articles[foundIndex], ...newArticle };
  } else {
    articles.push(newArticle);
  }

  // Also ensure route ID patna-womens-college-golden-jubilee exists explicitly
  const existingExact = articles.find(a => a.id === targetId);
  if (!existingExact) {
    articles.push(newArticle);
  }

  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  console.log('[UPDATED] articles.json');

  // Rebuild seedStories.ts
  require('./rebuild_seed_stories');
}

run();
