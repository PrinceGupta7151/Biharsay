const http = require('http');

http.get('http://localhost:3000/article/last-queen-of-darbhanga-raj-maharani-kamsundari-devi-passes-away-at-96', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Contains data-start:', data.includes('data-start'));
    console.log('Contains data-end:', data.includes('data-end'));
    console.log('Contains markdown ##:', data.includes('## Bihar Mourns'));
    const bodyMatch = data.match(/<div class="[^"]*bodyContent[^"]*">([\s\S]*?)<\/div>/);
    console.log('Rendered Body Output Snippet:\n', bodyMatch ? bodyMatch[1].slice(0, 500) : 'Not found');
  });
});
