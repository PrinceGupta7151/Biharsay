const fs = require('fs');
const path = require('path');

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
        const rawJson = entry.content.substring(idx);
        console.log('Total raw length:', rawJson.length);
        
        // Find how many valid items can be parsed by matching objects: {"id": ...
        // Regex to find all object start/ends or match individual items
        const items = [];
        let cur = rawJson;
        // Let's parse as many complete items as possible
        let pos = 1; // skip [
        while (pos < cur.length) {
          const nextStart = cur.indexOf('{"id":', pos);
          if (nextStart === -1) break;
          // Find the end of this item: next item starts with ,{"id": or ending with ]
          const nextNext = cur.indexOf(',{"id":', nextStart + 1);
          let itemStr = '';
          if (nextNext !== -1) {
            itemStr = cur.substring(nextStart, nextNext);
            pos = nextNext;
          } else {
            // Last item, try to find closing }
            const lastBrace = cur.lastIndexOf('}');
            if (lastBrace > nextStart) {
              itemStr = cur.substring(nextStart, lastBrace + 1);
            }
            pos = cur.length;
          }
          try {
            const itemObj = JSON.parse(itemStr);
            items.push(itemObj);
          } catch (err) {
            // maybe incomplete
          }
        }
        console.log('Recovered items count:', items.length);
        if (items.length > 0) {
          fs.writeFileSync(path.join(__dirname, '..', 'legacy_data', 'biharsay_media_user_partial.json'), JSON.stringify(items, null, 2), 'utf8');
          console.log('Sample recovered IDs:', items.slice(0, 5).map(x => x.id));
          console.log('Last recovered ID:', items[items.length - 1].id);
        }
        break;
      }
    }
  } catch (err) {}
}
