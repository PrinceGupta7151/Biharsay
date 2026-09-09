const https = require('https');
const fs = require('fs');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
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
  3699: { name: 'Investments & Economic', slug: 'investments-economic' },
  3722: { name: 'Industry & Innovation', slug: 'industry-innovation' },
  2180: { name: 'Entrepreneurship & Startups', slug: 'entrepreneurship-startups' },
};

const THEMATIC_IMAGES = {
  'investments-economic': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
  ],
  'industry-innovation': [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  ],
  'sports': [
    'https://biharsay.com/wp-content/uploads/2025/04/Bihar-Say-Website-99.png',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  ],
  'culture-heritage': [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  ],
  'education-social': [
    'https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-4.png',
    'https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-6.png',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
  ],
  'entrepreneurship-startups': [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
  ]
};

async function run() {
  console.log('Fetching diverse category posts from biharsay.com...');
  const [latestPosts, sportsPosts, startupPosts, culturePosts] = await Promise.all([
    fetchJson('https://biharsay.com/wp-json/wp/v2/posts?per_page=25'),
    fetchJson('https://biharsay.com/wp-json/wp/v2/posts?categories=9&per_page=10'),
    fetchJson('https://biharsay.com/wp-json/wp/v2/posts?categories=28&per_page=10'),
    fetchJson('https://biharsay.com/wp-json/wp/v2/posts?categories=26&per_page=10'),
  ]);

  // Deduplicate by ID
  const allPostsMap = new Map();
  [...latestPosts, ...sportsPosts, ...startupPosts, ...culturePosts].forEach(p => {
    if (p && p.id && !allPostsMap.has(p.id)) {
      allPostsMap.set(p.id, p);
    }
  });

  const allPosts = Array.from(allPostsMap.values());
  console.log(`Total unique live posts fetched: ${allPosts.length}`);

  // Resolve media IDs
  const mediaIds = allPosts.map(p => p.featured_media).filter(Boolean);
  const mediaMap = {};
  if (mediaIds.length > 0) {
    const chunkIds = Array.from(new Set(mediaIds)).slice(0, 100);
    const mediaList = await fetchJson(`https://biharsay.com/wp-json/wp/v2/media?include=${chunkIds.join(',')}&per_page=100`);
    mediaList.forEach(m => {
      mediaMap[m.id] = m.source_url || m.media_details?.sizes?.medium_large?.source_url || '';
    });
  }

  const categoryCounters = {
    'culture-heritage': 0,
    'education-social': 0,
    'entrepreneurship-startups': 0,
    'industry-innovation': 0,
    'investments-economic': 0,
    'sports': 0,
  };

  const stories = allPosts.map((post, idx) => {
    const title = decodeHtml(post.title?.rendered || '');
    const summary = decodeHtml(post.excerpt?.rendered || '');
    let cleanContent = decodeHtml(post.content?.rendered || '').slice(0, 1400);

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

    let author = 'Amrita';
    if (post.author === 1 || title.toLowerCase().includes('shreyasi') || title.toLowerCase().includes('akash deep')) {
      author = 'Neehar';
    } else if (post.author === 2) {
      author = 'Amrita';
    } else {
      author = 'Bihar Say Desk';
    }

    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let imageUrl = mediaMap[post.featured_media] || '';
    if (!imageUrl && post.content?.rendered) {
      const match = post.content.rendered.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i);
      if (match) imageUrl = match[1];
    }

    // Fallback to beautiful thematic image for category
    if (!imageUrl) {
      const fallbackList = THEMATIC_IMAGES[categorySlug] || THEMATIC_IMAGES['investments-economic'];
      const currentCount = categoryCounters[categorySlug] || 0;
      imageUrl = fallbackList[currentCount % fallbackList.length];
      categoryCounters[categorySlug] = currentCount + 1;
    }

    const words = (cleanContent || summary).split(' ').length;
    const readMinutes = Math.max(2, Math.round(words / 65));

    return {
      id: post.slug || `post-${post.id}`,
      title,
      summary: summary.length > 220 ? summary.slice(0, 217) + '...' : summary,
      content: cleanContent,
      category,
      categorySlug,
      date: formattedDate,
      author,
      imageUrl,
      isFeatured: idx === 0 || post.id === 5615, // Indoor stadium or latest Prime Group
      featuredOrder: idx < 4 ? idx : undefined,
      readTime: `${readMinutes} min read`,
      views: 1500 + Math.floor(Math.random() * 3200),
    };
  });

  // Ensure top 4 featured stories have order 0, 1, 2, 3
  stories[0].isFeatured = true;
  stories[0].featuredOrder = 0;
  if (stories[1]) stories[1].featuredOrder = 1;
  if (stories[2]) stories[2].featuredOrder = 2;
  if (stories[3]) stories[3].featuredOrder = 3;

  console.log(`Generated ${stories.length} stories. Categorized:`);
  const distribution = {};
  stories.forEach(s => distribution[s.categorySlug] = (distribution[s.categorySlug] || 0) + 1);
  console.log(distribution);

  const fileContent = `import { CategoryInfo, Story } from '@/types';

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
    subtitle: "Capital inflows, policy roadmaps, and commercial ecosystems driving Bihar's GDP.",
    dotClass: 'invest',
    color: '#2E5FA3',
  },
];

export const INITIAL_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};
`;

  fs.writeFileSync('data/seedStories.ts', fileContent, 'utf-8');
  console.log('Successfully written real stories to data/seedStories.ts');
}

run().catch(console.error);
