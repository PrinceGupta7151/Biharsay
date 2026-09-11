const fs = require('fs');
const transcriptPath = 'C:/Users/91896/.gemini/antigravity-ide/brain/e0fb07f8-6b5b-435d-bf2f-f8fba3aeef9c/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.type === 'USER_INPUT' && typeof entry.content === 'string') {
      const idx = entry.content.indexOf('[{"id":5607');
      if (idx !== -1) {
        const raw = entry.content.substring(idx);
        console.log('Found user prompt with raw media JSON, total chars:', raw.length);
        
        // Find all "id":\s*(\d+)
        const idMatches = [...raw.matchAll(/"id":\s*(\d+)/g)].map(m => parseInt(m[1]));
        console.log('Total id occurrences in prompt:', idMatches.length);
        console.log('IDs in prompt:', idMatches);

        // Find all "post":\s*(\d+)
        const postMatches = [...raw.matchAll(/"post":\s*(\d+)/g)].map(m => parseInt(m[1]));
        console.log('Post IDs in prompt:', postMatches);

        // Find all source_url
        const sourceUrls = [...raw.matchAll(/"source_url":\s*"([^"]+)"/g)].map(m => m[1]);
        console.log('Source URLs in prompt count:', sourceUrls.length);
        console.log('First 10 source URLs:', sourceUrls.slice(0, 10));

        break;
      }
    }
  } catch (e) {}
}
