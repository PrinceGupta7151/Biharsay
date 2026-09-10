const http = require('http');

http.get('http://localhost:3000/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const cardMatches = d.match(/class="[^"]*StoryCard_card[^"]*"/g) || [];
    const summaryMatches = d.match(/class="[^"]*StoryCard_summary[^"]*"/g) || [];
    const has15k = d.includes('Now 0 to 15K');
    const hasOld13k = d.includes('Now 0 to 13K');

    console.log('--- Card Consistency Check ---');
    console.log('Total Story Cards Rendered:', cardMatches.length);
    console.log('Cards with Summaries:', summaryMatches.length);
    console.log('Has "Now 0 to 15K":', has15k);
    console.log('Has "Now 0 to 13K" (should be false):', hasOld13k);

    // Check specific section cards
    const gominiIdx = d.indexOf('Gomini');
    if (gominiIdx !== -1) {
      console.log('\nGomini snippet context:');
      console.log(d.slice(gominiIdx - 300, gominiIdx + 500));
    }
  });
});
