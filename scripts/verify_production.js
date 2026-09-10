const http = require('http');

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: data.length,
          bodySnippet: data.slice(0, 300)
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function verifyAll() {
  console.log('Testing production endpoints on http://localhost:3000...\n');
  
  const routes = [
    '/',
    '/privacy-policy',
    '/terms-of-service',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/favicon.png',
    '/og-banner.png',
    '/non-existent-story-404-test'
  ];

  for (const route of routes) {
    const result = await checkRoute(route);
    if (result.error) {
      console.log(`❌ ${route} -> Error: ${result.error}`);
    } else {
      const isExpected = (route.includes('404') && result.status === 404) || (!route.includes('404') && result.status === 200);
      const icon = isExpected ? '✅' : '⚠️';
      console.log(`${icon} ${route} -> HTTP ${result.status} (${result.contentType || 'unknown'}) [${result.contentLength} bytes]`);
    }
  }
}

verifyAll();
