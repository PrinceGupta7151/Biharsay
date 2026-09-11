async function run() {
  const res = await fetch('https://biharsay.com/wp-json/wp/v2/media?per_page=100', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  const ids = [5411, 5371, 5320];
  for (const id of ids) {
    const item = data.find(x => x.id === id);
    if (!item) continue;
    console.log(`\n=== ID ${id} (${item.slug}) ===`);
    console.log('source_url:', item.source_url);
    console.log('sizes:');
    for (const [sName, sObj] of Object.entries(item.media_details?.sizes || {})) {
      console.log(`  ${sName}: ${sObj.source_url}`);
      // Test if sObj.source_url is 200
      try {
        const testRes = await fetch(sObj.source_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`    -> HTTP ${testRes.status}`);
      } catch (e) {
        console.log(`    -> ERR ${e.message}`);
      }
    }
  }
}
run();
