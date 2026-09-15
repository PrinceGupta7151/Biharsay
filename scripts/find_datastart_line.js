const http = require('http');

http.get('http://localhost:3000/article/last-queen-of-darbhanga-raj-maharani-kamsundari-devi-passes-away-at-96', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('data-start')) {
        console.log(`Line ${i+1}: ${line.trim().slice(0, 150)}`);
      }
    });
  });
});
