const fs = require('fs');

async function testFast() {
  const content = JSON.parse(fs.readFileSync('legacy_data/biharsay_content.json', 'utf8'));
  const media = JSON.parse(fs.readFileSync('legacy_data/wp_live_media.json', 'utf8'));

  const mediaById = new Map(media.map(m => [m.id, m]));
  const mediaByPost = new Map();
  media.forEach(m => {
    if (m.post) mediaByPost.set(m.post, m);
  });

  const matchedItems = [];
  content.forEach(art => {
    let m = mediaById.get(art.featured_media) || mediaByPost.get(art.id);
    if (m && m.source_url) {
      matchedItems.push({
        articleId: art.id,
        title: art.title.rendered,
        mediaId: m.id,
        source_url: m.source_url
      });
    }
  });

  console.log(`Checking ${matchedItems.length} matched media items with concurrency 10 and 2s timeout...`);
  
  const results = [];
  const concurrency = 10;
  for (let i = 0; i < matchedItems.length; i += concurrency) {
    const chunk = matchedItems.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      try {
        const res = await fetch(item.source_url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000),
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        results.push({ ...item, status: res.status, ok: res.ok });
      } catch (err) {
        results.push({ ...item, status: 'err', ok: false, error: err.message });
      }
    }));
  }

  const okList = results.filter(r => r.ok);
  const failList = results.filter(r => !r.ok);
  console.log(`Results: OK = ${okList.length}, Failed = ${failList.length}`);
  
  console.log('\n--- 10 Sample OK items ---');
  okList.slice(0, 10).forEach(r => console.log(`[${r.status}] ${r.articleId} - ${r.title.slice(0, 40)} -> ${r.source_url}`));

  console.log('\n--- 10 Sample Failed items ---');
  failList.slice(0, 10).forEach(r => console.log(`[${r.status}] ${r.articleId} - ${r.title.slice(0, 40)} -> ${r.source_url}`));
}

testFast();
