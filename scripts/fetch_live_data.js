const https = require('https');
const fs = require('fs');

https.get('https://biharsay.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('biharsay_raw.html', data);
    const matches = data.match(/https?:\/\/[^\s\"']+\.(jpg|jpeg|png|webp)/gi);
    if (matches) {
      const filtered = Array.from(new Set(matches)).filter(m => m.includes('biharsay.com') || m.includes('uploads'));
      console.log('Found images:', filtered.length);
      console.log(filtered.slice(0, 30).join('\n'));
    } else {
      console.log('No matches');
    }
  });
}).on('error', err => console.error(err));
