/**
 * Fix the 39 articles that still use the generic Bihar-Say-Website-3.png thumbnail.
 * Fetches the live page for each and extracts the real OG image.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ARTICLES_PATH = path.join(__dirname, '..', 'data', 'articles.json');
const IMAGES_DIR    = path.join(__dirname, '..', 'public', 'legacy-images');

function fetchUrl(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch(e) { return reject(e); }
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Bihar-Say-Bot/1.0', 'Accept': 'text/html' },
      timeout,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith('http') ? res.headers.location : `https://biharsay.com${res.headers.location}`;
        return fetchUrl(redir, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch(e) { return reject(e); }
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Bihar-Say-Image-Downloader/1.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith('http') ? res.headers.location : `https://biharsay.com${res.headers.location}`;
        return downloadImage(redir, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { fs.writeFileSync(destPath, Buffer.concat(chunks)); resolve(destPath); });
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

function extractOgImage(html) {
  const m1 = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
  if (m1) return m1[1].replace(/&amp;/g, '&').replace(/\?.*$/, '');

  // Twitter card fallback
  const m2 = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
  if (m2) return m2[1].replace(/&amp;/g, '&').replace(/\?.*$/, '');

  // WP featured image
  const m3 = html.match(/class="wp-post-image"[^>]*src="([^"]+)"/i);
  if (m3) return m3[1].replace(/&amp;/g, '&').replace(/\?.*$/, '');

  return null;
}

function normalizeWpUrl(url) {
  if (!url) return null;
  // Strip size suffix
  url = url.replace(/-(\d{3,4})x(\d{3,4})\.(png|jpg|jpeg|webp)$/i, '.$3');
  // Strip CDN wrappers
  url = url.replace(/\.(png|jpg|jpeg)\.(bv_resized_[^.]+\.(webp|png|jpg)|bv\.(webp|png|jpg))$/i, '.$1');
  url = url.replace(/\.bv\.(webp|png|jpg)$/i, '');
  if (!url.startsWith('http')) url = 'https://biharsay.com/' + url.replace(/^\//, '');
  return url;
}

function getFilename(url) {
  try { return path.basename(new URL(url).pathname); } catch { return path.basename(url.split('?')[0]); }
}

async function main() {
  const raw = fs.readFileSync(ARTICLES_PATH, 'utf8').replace(/^\uFEFF/, '');
  const articles = JSON.parse(raw);

  // Identify generic-thumbnail articles
  const needsFix = articles.filter(a =>
    a.imageUrl && a.imageUrl.includes('/legacy-images/Bihar-Say-Website-3.png') && a.url
  );

  console.log(`\n🔍 Fixing ${needsFix.length} articles with generic thumbnail...\n`);

  let fixed = 0;
  const fixMap = new Map();

  for (let i = 0; i < needsFix.length; i++) {
    const article = needsFix[i];
    process.stdout.write(`[${i+1}/${needsFix.length}] "${article.title.substring(0,60)}"...`);

    try {
      const html = await fetchUrl(article.url);
      const rawImg = extractOgImage(html);
      if (!rawImg) { console.log(' ❌ no OG image found'); continue; }

      const normalized = normalizeWpUrl(rawImg);
      if (!normalized) { console.log(' ❌ could not normalize URL'); continue; }

      // If it's a WP URL, download locally
      let localPath = normalized;
      if (normalized.startsWith('https://biharsay.com/wp-content/')) {
        const filename = getFilename(normalized);
        const destPath = path.join(IMAGES_DIR, filename);
        if (!fs.existsSync(destPath)) {
          try {
            await downloadImage(normalized, destPath);
          } catch {
            // try without size suffix already stripped above
          }
        }
        if (fs.existsSync(destPath)) {
          localPath = `/legacy-images/${filename}`;
        } else {
          localPath = normalized; // fall back to remote URL
        }
      }

      fixMap.set(article.id, localPath);
      fixed++;
      console.log(` ✅ ${localPath}`);
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }

  // Apply fixes to articles.json
  if (fixMap.size > 0) {
    const updated = articles.map(a => fixMap.has(a.id) ? { ...a, imageUrl: fixMap.get(a.id) } : a);
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(updated, null, 4), 'utf8');
    console.log(`\n✅ Updated ${fixed} articles in data/articles.json`);
  } else {
    console.log('\n⚠️  No fixes were applied (no live OG images found)');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
