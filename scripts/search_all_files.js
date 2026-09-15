const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'live_stories.json'),
  path.join(__dirname, '..', 'data', 'articles.json'),
  path.join(__dirname, '..', 'data', 'seedStories.ts')
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, 'utf-8');
    console.log(f, 'Length:', txt.length);
    console.log('  Contains Nepal:', txt.includes('Nepal'));
    console.log('  Contains Shreyasi:', txt.includes('Shreyasi'));
    console.log('  Contains Suryavanshi:', txt.includes('Suryavanshi'));
    console.log('  Contains Jeevika:', txt.includes('Jeevika'));
    console.log('  Contains Gautam Banka:', txt.includes('Gautam Banka'));
  }
});
