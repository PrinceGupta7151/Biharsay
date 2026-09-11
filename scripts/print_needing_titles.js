const fs = require('fs');
const needing = JSON.parse(fs.readFileSync('scratch/needing_images.json', 'utf8'));

console.log('Total needing:', needing.length);
needing.forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.id}] ${item.title}`);
});
