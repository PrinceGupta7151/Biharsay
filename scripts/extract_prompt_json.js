const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:/Users/91896/.gemini/antigravity-ide/brain/e0fb07f8-6b5b-435d-bf2f-f8fba3aeef9c/.system_generated/logs/transcript_full.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.error('Transcript full not found');
  process.exit(1);
}

const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.type === 'USER_INPUT' && typeof entry.content === 'string') {
      const idx = entry.content.indexOf('[{"id":5607');
      if (idx !== -1) {
        let jsonPart = entry.content.substring(idx).trim();
        const lastBracket = jsonPart.lastIndexOf(']');
        if (lastBracket !== -1) {
          jsonPart = jsonPart.substring(0, lastBracket + 1);
        }
        try {
          const parsed = JSON.parse(jsonPart);
          console.log(`Successfully parsed ${parsed.length} media items from user input!`);
          fs.writeFileSync(path.join(__dirname, '..', 'legacy_data', 'biharsay_media_user.json'), JSON.stringify(parsed, null, 2), 'utf8');
          console.log('Saved to legacy_data/biharsay_media_user.json');
          process.exit(0);
        } catch (e) {
          console.error('JSON parse error:', e.message);
        }
      }
    }
  } catch (err) {
    // ignore
  }
}
console.error('User input with JSON not found in transcript');
