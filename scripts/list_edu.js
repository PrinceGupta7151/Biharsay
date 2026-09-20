const fs = require('fs');

console.log('--- Checking src/data/articles.json ---');
const srcArticles = JSON.parse(fs.readFileSync('d:/biharsay/src/data/articles.json', 'utf8'));
const srcEdu = srcArticles.filter(a => a.categorySlug === 'education-social' || (a.category && a.category.includes('Education')));
console.log('Count in src/data/articles.json:', srcEdu.length);
srcEdu.forEach(a => console.log(`[${a.id}] ${a.title}`));

console.log('\n--- Checking data/education_social_stories.json ---');
const eduStories = JSON.parse(fs.readFileSync('d:/biharsay/data/education_social_stories.json', 'utf8'));
console.log('Count in data/education_social_stories.json:', eduStories.length);
eduStories.slice(0, 20).forEach(a => console.log(`[${a.id}] ${a.title}`));
