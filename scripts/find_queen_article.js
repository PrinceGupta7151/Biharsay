const fs = require('fs');
const path = require('path');

const seedContent = fs.readFileSync(path.join(__dirname, '..', 'data', 'seedStories.ts'), 'utf-8');
const match = seedContent.match(/export const INITIAL_STORIES: Story\[\] = (\[[\s\S]*\]);/);
const stories = JSON.parse(match[1]);

const queenArticle = stories.find(s => s.id.includes('darbhanga') || s.title.includes('Darbhanga') || s.title.includes('Kamsundari'));
console.log('Queen Article found:');
console.log('ID:', queenArticle ? queenArticle.id : 'None');
console.log('Title:', queenArticle ? queenArticle.title : 'None');
console.log('Content snippet:', queenArticle ? queenArticle.content.slice(0, 300) : 'None');
