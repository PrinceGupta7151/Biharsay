const fs = require('fs');
const raw = fs.readFileSync('./biharsay_raw.html', 'utf8');

const slugs = ['patna-womens-college', 'sonpur-mela-2025', 'singhadathe-superfood', 'bihars-makhana-business'];

for (const slug of slugs) {
  const idx = raw.indexOf(slug);
  if (idx !== -1) {
    const start = Math.max(0, idx - 800);
    const end = Math.min(raw.length, idx + 800);
    const snippet = raw.substring(start, end);
    const re = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    const imgs = [];
    while ((match = re.exec(snippet)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`\n=== ${slug} ===`);
    console.log('Images found:', imgs);
  } else {
    console.log(`\n=== ${slug} === NOT FOUND`);
  }
}
