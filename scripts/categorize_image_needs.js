const fs = require('fs');
const content = JSON.parse(fs.readFileSync('legacy_data/biharsay_content.json', 'utf8'));
const media = JSON.parse(fs.readFileSync('legacy_data/wp_live_media.json', 'utf8'));

const mediaById = new Map(media.map(m => [m.id, m]));
const mediaByPost = new Map();
media.forEach(m => {
  if (m.post) mediaByPost.set(m.post, m);
});

const legacyFiles = fs.readdirSync('public/legacy-images');

const withRealMedia = [];
const needingImages = [];

content.forEach(art => {
  const m = mediaById.get(art.featured_media) || mediaByPost.get(art.id);
  // Check if m has a 2026 url or working url
  if (m && m.source_url && m.source_url.includes('/2026/')) {
    withRealMedia.push({
      id: art.id,
      slug: art.slug,
      title: art.title.rendered.replace(/&#8217;/g, "'").replace(/&#038;/g, "&"),
      mediaId: m.id,
      url: m.source_url
    });
  } else {
    needingImages.push({
      id: art.id,
      slug: art.slug,
      title: art.title.rendered.replace(/&#8217;/g, "'").replace(/&#038;/g, "&"),
      category: art.categories
    });
  }
});

console.log(`With real 2026 WP media: ${withRealMedia.length}`);
console.log(`Needing authentic topic images: ${needingImages.length}`);
fs.writeFileSync('scratch/with_real_media.json', JSON.stringify(withRealMedia, null, 2));
fs.writeFileSync('scratch/needing_images.json', JSON.stringify(needingImages, null, 2));
console.log('Sample needing images:', needingImages.slice(0, 5));
