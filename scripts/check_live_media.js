async function run() {
  try {
    const res = await fetch('https://biharsay.com/wp-json/wp/v2/media?per_page=100', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Total live media items:', data.length);
    const ids = [5411, 5371, 5320, 5607, 5604, 5595, 5592, 5589, 5586, 5583, 5582, 5579, 5576];
    const found = data.filter(x => ids.includes(x.id));
    console.log('Target items found:', found.map(x => ({
      id: x.id,
      slug: x.slug,
      source_url: x.source_url,
      post: x.post,
      file: x.media_details?.file,
      sizes: Object.keys(x.media_details?.sizes || {})
    })));

    // Also let's check what media IDs exist in the range 5300-5500
    const older = data.filter(x => x.id < 5576);
    console.log(`Media items with id < 5576 in this page: ${older.length}`);
    if (older.length > 0) {
      console.log('Sample older items:', older.slice(0, 5).map(x => ({ id: x.id, source_url: x.source_url, file: x.media_details?.file })));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
