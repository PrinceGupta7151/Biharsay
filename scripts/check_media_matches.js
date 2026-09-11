const fs = require('fs');
const media = require('../legacy_data/biharsay_media.json');
const content = require('../legacy_data/biharsay_content.json');

console.log('Total media:', media.length);
console.log('Total content:', content.length);

// Check mapping
const postToMedia = new Map();
const mediaById = new Map();

media.forEach(m => {
  mediaById.set(m.id, m);
  if (m.post) {
    postToMedia.set(m.post, m);
  }
});

let exactMatches = 0;
let postMatches = 0;

content.forEach(c => {
  const m1 = mediaById.get(c.featured_media);
  const m2 = postToMedia.get(c.id);
  if (m1) exactMatches++;
  if (m2) postMatches++;
});

console.log('Articles with exact featured_media in media JSON:', exactMatches);
console.log('Articles with post ID in media JSON:', postMatches);

// Check downloaded files in public/legacy-images
const downloadedFiles = fs.readdirSync('./public/legacy-images');
console.log('Downloaded files in legacy-images:', downloadedFiles.length);

// Check which media items have a downloaded file that is NOT the border pillar duplicate
const borderPillarBuffer = fs.readFileSync('./public/legacy-images/Bihar-Say-Website.png');
const crypto = require('crypto');
const borderHash = crypto.createHash('md5').update(borderPillarBuffer).digest('hex');

let goodDownloads = 0;
let borderDuplicates = 0;

downloadedFiles.forEach(f => {
  const buf = fs.readFileSync('./public/legacy-images/' + f);
  const h = crypto.createHash('md5').update(buf).digest('hex');
  if (h === borderHash) {
    borderDuplicates++;
  } else {
    goodDownloads++;
  }
});

console.log(`Good unique downloads: ${goodDownloads}, Border pillar duplicates: ${borderDuplicates}`);
