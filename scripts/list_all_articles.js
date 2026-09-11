const fs = require('fs');
const content = JSON.parse(fs.readFileSync('legacy_data/biharsay_content.json', 'utf8'));
const list = content.map((c, idx) => ({
  index: idx + 1,
  id: c.id,
  slug: c.slug,
  title: c.title.rendered.replace(/&#8217;/g, "'").replace(/&#038;/g, "&").replace(/&amp;/g, "&"),
  categories: c.categories,
  featured_media: c.featured_media
}));
fs.writeFileSync('scratch/all_articles_list.json', JSON.stringify(list, null, 2));
console.log(`Saved ${list.length} articles to scratch/all_articles_list.json`);
console.log('Sample (first 5):', list.slice(0, 5));
console.log('Sample (last 5):', list.slice(-5));
