const fs = require('fs');
const path = require('path');

function normalizeStr(str) {
  return (str || '')
    .toLowerCase()
    .replace(/₹|%e2%82%b9/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function analyzeData() {
  console.log('=== CHECKING DUPLICATES IN DATASET ===\n');

  // 1. Check articles.json
  const articlesJsonPath = path.join(__dirname, '..', 'data', 'articles.json');
  if (fs.existsSync(articlesJsonPath)) {
    const rawArticles = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf8'));
    console.log(`Total items in data/articles.json: ${rawArticles.length}`);

    const idCounts = {};
    const exactTitleCounts = {};
    const normTitleMap = {};

    rawArticles.forEach((art, idx) => {
      const id = art.id || `index-${idx}`;
      const title = art.title || '';
      const normTitle = normalizeStr(title);

      idCounts[id] = (idCounts[id] || 0) + 1;
      exactTitleCounts[title] = (exactTitleCounts[title] || 0) + 1;

      if (!normTitleMap[normTitle]) {
        normTitleMap[normTitle] = [];
      }
      normTitleMap[normTitle].push({ id, title, idx });
    });

    const duplicateIds = Object.entries(idCounts).filter(([_, count]) => count > 1);
    const duplicateExactTitles = Object.entries(exactTitleCounts).filter(([_, count]) => count > 1);
    const duplicateNormTitles = Object.entries(normTitleMap).filter(([_, items]) => items.length > 1);

    console.log(`- Duplicate IDs: ${duplicateIds.length}`);
    console.log(`- Duplicate Exact Titles: ${duplicateExactTitles.length}`);
    console.log(`- Duplicate Normalized Titles: ${duplicateNormTitles.length}`);

    if (duplicateNormTitles.length > 0) {
      console.log('\n--- Duplicate Title Groups in articles.json ---');
      duplicateNormTitles.forEach(([normKey, items], index) => {
        console.log(`\nGroup ${index + 1} (${items.length} copies):`);
        items.forEach(item => console.log(`   [ID: ${item.id}] -> "${item.title}"`));
      });
    }
  }

  // 2. Check seedStories.ts
  const seedStoriesPath = path.join(__dirname, '..', 'data', 'seedStories.ts');
  if (fs.existsSync(seedStoriesPath)) {
    const content = fs.readFileSync(seedStoriesPath, 'utf8');
    const match = content.match(/export const INITIAL_STORIES: Story\[\] = (\[[\s\S]*\]);/);
    if (match) {
      const stories = JSON.parse(match[1]);
      console.log(`\nTotal items in data/seedStories.ts: ${stories.length}`);

      const seedNormMap = {};
      stories.forEach((s) => {
        const norm = normalizeStr(s.title);
        if (!seedNormMap[norm]) seedNormMap[norm] = [];
        seedNormMap[norm].push(s);
      });

      const seedDupes = Object.entries(seedNormMap).filter(([_, items]) => items.length > 1);
      console.log(`- Duplicate Normalized Titles in seedStories.ts: ${seedDupes.length}`);

      if (seedDupes.length > 0) {
        console.log('\n--- Duplicate Title Groups in seedStories.ts ---');
        seedDupes.forEach(([normKey, items], index) => {
          console.log(`\nGroup ${index + 1} (${items.length} copies):`);
          items.forEach(item => console.log(`   [ID: ${item.id}] -> "${item.title}"`));
        });
      }
    }
  }
}

analyzeData();
