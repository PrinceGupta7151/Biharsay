const cp = require('child_process');
const fs = require('fs');

const prev = cp.execSync('git show HEAD:data/seedStories.ts', { maxBuffer: 20 * 1024 * 1024 }).toString();
const regex = /"id":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*"([^"]+)"/g;
let match;
const stories = [];
while ((match = regex.exec(prev)) !== null) {
  stories.push({
    id: match[1],
    title: match[2],
    imageUrl: match[3]
  });
}

console.log('Total previous stories in git:', stories.length);

const terms = ['women', 'sonpur', 'singhada', 'makhana', 'stadium', 'metro', 'litchi'];
for (const term of terms) {
  const found = stories.filter(s => s.id.toLowerCase().includes(term) || s.title.toLowerCase().includes(term));
  console.log(`\n=== Matches for "${term}" (${found.length}) ===`);
  found.forEach(s => console.log(`  [${s.id}] ${s.title}\n    -> ${s.imageUrl}`));
}
