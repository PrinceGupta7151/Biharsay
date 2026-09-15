const https = require('https');

https.get('https://biharsay.com/2026/03/29/wheat-procurement-in-bihar-2026-begins-april-1/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const ogImageMatch = data.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
    console.log('og:image:', ogImageMatch ? ogImageMatch[1] : 'not found');
    
    // Check for any images in the article or page
    const imgs = data.match(/<img[^>]+>/gi) || [];
    console.log(`Total <img> tags: ${imgs.length}`);
    imgs.slice(0, 10).forEach((img, idx) => {
      console.log(` ${idx+1}: ${img}`);
    });
    
    process.exit(0);
  });
}).on('error', err => {
  console.error(err);
  process.exit(1);
});
