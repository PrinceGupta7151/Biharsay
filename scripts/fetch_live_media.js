const fs = require('fs');

async function getAllMedia() {
  console.log('Fetching media from WordPress API...');
  let page = 1;
  let allMedia = [];
  while (page <= 5) {
    try {
      console.log(`Fetching page ${page}...`);
      const res = await fetch(`https://biharsay.com/wp-json/wp/v2/media?per_page=100&page=${page}`);
      if (!res.ok) {
        console.log(`Page ${page} status: ${res.status}`);
        break;
      }
      const data = await res.json();
      if (!data || data.length === 0) break;
      allMedia = allMedia.concat(data);
      console.log(`Fetched page ${page}: ${data.length} items (total: ${allMedia.length})`);
      page++;
    } catch (err) {
      console.error(`Error on page ${page}:`, err.message);
      break;
    }
  }

  console.log(`Total media fetched: ${allMedia.length}`);
  fs.writeFileSync('legacy_data/wp_live_media.json', JSON.stringify(allMedia, null, 2));

  // Check matching with content
  const content = JSON.parse(fs.readFileSync('legacy_data/biharsay_content.json', 'utf8'));
  const mediaByPost = new Map();
  const mediaById = new Map();
  allMedia.forEach(m => {
    mediaById.set(m.id, m);
    if (m.post) mediaByPost.set(m.post, m);
  });

  let matched = 0;
  content.forEach(art => {
    if (mediaById.has(art.featured_media)) {
      matched++;
    } else if (mediaByPost.has(art.id)) {
      matched++;
    }
  });

  console.log(`Matches with 100 articles: ${matched}/100`);
}

getAllMedia();
