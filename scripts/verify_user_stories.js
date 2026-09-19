const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'src', 'data', 'articles.json');
const stories = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));

console.log('Total stories in seedStories:', stories.length);

const requestedTitles = [
  'BharatNet to Bring Fiber Internet to Bihar Villages',
  'Prime Group to invest',
  'Food Processing Story Is Going Global',
  'Indoor Stadium',
  'Nepal Floods Trapped 106 Pilgrims',
  'Singhada:The Superfood',
  'Sonpur Mela',
  'Patna Women’s College',
  'Double Decker Bus on JP Ganga Path',
  'Cleanest Air',
  '10th Result 2026',
  'Exploring Munger',
  'JK Cement Crosses 31 MTA',
  '0 to 13K',
  '75 Lakh Women',
  '1.4 Crore Jeevika',
  'Gomini India’s First Cow Care',
  'Flood-Affected Farmers via DBT',
  'Bihar AI Growth 2026',
  'Shreyasi Singh',
  'Phani Bhushan',
  'Akash Deep',
  'Rajgir’s First Sports Academy',
  'Shakti Priya',
  'Vaibhav Suryavanshi'
];

requestedTitles.forEach(term => {
  const found = stories.filter(s => 
    s.title.toLowerCase().includes(term.toLowerCase()) || 
    s.id.toLowerCase().includes(term.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  console.log(`Term "${term}" => Found ${found.length} matches:`, found.map(f => f.title.slice(0, 50)));
});
