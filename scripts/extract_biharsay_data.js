const https = require('https');
const fs = require('fs');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const CATEGORY_MAP = {
  26: { name: 'Culture & Heritage', slug: 'culture-heritage' },
  27: { name: 'Education & Social', slug: 'education-social' },
  28: { name: 'Entrepreneurship & Startups', slug: 'entrepreneurship-startups' },
  29: { name: 'Industry & Innovation', slug: 'industry-innovation' },
  30: { name: 'Investments & Economic', slug: 'investments-economic' },
  9: { name: 'Sports', slug: 'sports' },
  3699: { name: 'Investments & Economic', slug: 'investments-economic' }, // agriculture mapped
  3722: { name: 'Industry & Innovation', slug: 'industry-innovation' }, // connectivity mapped
  2180: { name: 'Entrepreneurship & Startups', slug: 'entrepreneurship-startups' }, // success stories mapped
};

async function run() {
  console.log('Fetching live posts from biharsay.com...');
  const posts = await fetchJson('https://biharsay.com/wp-json/wp/v2/posts?per_page=35');
  console.log(`Fetched ${posts.length} posts.`);

  // Let's collect all media IDs
  const mediaIds = posts.map(p => p.featured_media).filter(Boolean);
  console.log('Found featured media IDs:', mediaIds.length);

  const mediaMap = {};
  if (mediaIds.length > 0) {
    try {
      const mediaList = await fetchJson(`https://biharsay.com/wp-json/wp/v2/media?include=${mediaIds.join(',')}&per_page=50`);
      mediaList.forEach(m => {
        mediaMap[m.id] = m.source_url || m.media_details?.sizes?.medium_large?.source_url || '';
      });
      console.log('Resolved media items:', Object.keys(mediaMap).length);
    } catch(err) {
      console.warn('Could not batch fetch media:', err.message);
    }
  }

  const stories = posts.map((post, idx) => {
    const rawTitle = post.title?.rendered || '';
    const title = decodeHtml(rawTitle);
    const summary = decodeHtml(post.excerpt?.rendered || '');
    const cleanContent = decodeHtml(post.content?.rendered || '').slice(0, 1200);

    // Extract image from featured_media or from post HTML
    let imageUrl = mediaMap[post.featured_media] || '';
    if (!imageUrl && post.content?.rendered) {
      const match = post.content.rendered.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i);
      if (match) {
        imageUrl = match[1];
      }
    }

    // Categories
    let category = 'Culture & Heritage';
    let categorySlug = 'culture-heritage';
    if (post.categories && post.categories.length > 0) {
      for (const catId of post.categories) {
        if (CATEGORY_MAP[catId]) {
          category = CATEGORY_MAP[catId].name;
          categorySlug = CATEGORY_MAP[catId].slug;
          break;
        }
      }
    }

    // Author
    let author = 'Bihar Say Desk';
    if (post._embedded && post._embedded.author && post._embedded.author[0]) {
      author = post._embedded.author[0].name || author;
    }

    // Date
    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Image URL already determined from mediaMap / content

    // Read time estimate
    const words = (cleanContent || summary).split(' ').length;
    const readMinutes = Math.max(2, Math.round(words / 60));

    return {
      id: post.slug || `post-${post.id}`,
      title,
      summary,
      content: cleanContent,
      category,
      categorySlug,
      date: formattedDate,
      author,
      imageUrl,
      isFeatured: idx === 0,
      featuredOrder: idx < 4 ? idx : undefined,
      readTime: `${readMinutes} min read`,
      views: 1200 + (35 - idx) * 115,
    };
  });

  fs.writeFileSync('scripts/live_stories.json', JSON.stringify(stories, null, 2));
  console.log('Saved to scripts/live_stories.json');
  console.log('Sample stories:', stories.slice(0, 5).map(s => ({ title: s.title, cat: s.category, img: s.imageUrl })));
}

run().catch(console.error);
