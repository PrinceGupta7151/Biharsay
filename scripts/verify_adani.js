const fs = require('fs');

const seedContent = fs.readFileSync('data/seedStories.ts', 'utf8');

// Match the id lines
const matches = seedContent.match(/"id":\s*"adani-power[^"]*"/g);
console.log('SeedStories matched Adani IDs:', matches);
