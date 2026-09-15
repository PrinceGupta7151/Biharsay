const http = require('http');

http.get('http://localhost:3000/', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Hero Has BharatNet:', data.includes('BharatNet to Bring Fiber Internet'));
    console.log('Side Pick Prime Group:', data.includes('Prime Group'));
    console.log('Side Pick Food Processing:', data.includes('Food Processing Story'));
    console.log('Side Pick Indoor Stadium:', data.includes('Indoor Stadium'));
    console.log('Culture & Heritage Section:', data.includes('Culture &amp; Heritage') || data.includes('Culture & Heritage'));
    console.log('Sports Section:', data.includes('Sports'));
    console.log('Vaibhav Suryavanshi:', data.includes('Vaibhav Suryavanshi'));
  });
});
