const cheerio = require('cheerio');

async function main() {
  const searchUrls = [
    'https://biharsay.com/?s=adani',
    'https://biharsay.com/?s=bhagalpur',
    'https://biharsay.com/category/investments-economic/',
    'https://biharsay.com/'
  ];

  for (const url of searchUrls) {
    try {
      console.log('Searching URL:', url);
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const $ = cheerio.load(html);

      $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (href.toLowerCase().includes('adani') || href.toLowerCase().includes('bhagalpur') || text.toLowerCase().includes('adani') || text.toLowerCase().includes('bhagalpur')) {
          console.log('FOUND MATCH:', href, '| TITLE:', text);
        }
      });
    } catch (err) {
      console.error('Error fetching', url, err.message);
    }
  }
}

main();
