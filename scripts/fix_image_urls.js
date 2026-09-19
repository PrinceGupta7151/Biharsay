/**
 * Fix all CDN-mangled / resized image URLs in data/articles.json
 * Converts:
 *   - CDN-optimized .bv.webp / .bv_resized_*.png paths → original WP PNG
 *   - Query-string CDN URLs (?bv_host=... ) → clean WP path
 *   - -1024x576 size suffixes → original filename
 *   - /legacy-images/Bihar-Say-Website-3.png generic fallback (already has live URL) → use live URL
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'data', 'articles.json');

function normalizeImageUrl(url) {
  if (!url) return url;

  // 1. Strip CDN al_opt_content wrapper — extract the embedded wp-content path
  // e.g. /al_opt_content/IMAGE/biharsay.com/wp-content/uploads/2025/03/Bihar-Say-Website-7.png.bv_resized_mobile.png.bv.webp
  const cdnMatch = url.match(/\/al_opt_content\/IMAGE\/[^/]+\/(wp-content\/uploads\/[^?.]+\.(png|jpg|jpeg|webp))/i);
  if (cdnMatch) {
    url = 'https://biharsay.com/' + cdnMatch[1];
  }

  // 2. Strip query strings (CDN ?bv_host=..., etc.)
  url = url.replace(/\?.*$/, '');

  // 3. Strip .bv.webp, .bv_resized_*.webp, .bv_resized_*.png endings that appear AFTER the real extension
  // e.g. Bihar-Say-Website-7.png.bv_resized_mobile.png.bv.webp → Bihar-Say-Website-7.png
  url = url.replace(/\.(png|jpg|jpeg)\.(bv_resized_[^.]+\.(webp|png|jpg)|bv\.(webp|png|jpg))$/i, '.$1');
  url = url.replace(/\.bv\.(webp|png|jpg)$/i, '');

  // 4. Strip WordPress responsive size suffixes like -1024x576, -803x490, -300x169
  // BUT only when followed by a file extension — avoid matching timestamp parts like T142446
  // Pattern: dash + 3-4 digits + x + 3-4 digits + .ext  (must start with a dash, not a letter)
  url = url.replace(/-(\d{3,4})x(\d{3,4})\.(png|jpg|jpeg|webp)$/i, '.$3');

  // 5. Ensure it starts with https if it's a biharsay.com path
  if (url.startsWith('//biharsay.com')) url = 'https:' + url;
  if (url.startsWith('/wp-content/')) url = 'https://biharsay.com' + url;

  return url;
}


const raw = fs.readFileSync(ARTICLES_PATH, 'utf8').replace(/^\uFEFF/, '');
const articles = JSON.parse(raw);

let fixedCount = 0;
const fixLog = [];

const updated = articles.map(article => {
  const original = article.imageUrl || '';
  const fixed = normalizeImageUrl(original);
  if (fixed !== original) {
    fixedCount++;
    fixLog.push({ id: article.id, title: article.title, before: original, after: fixed });
    return { ...article, imageUrl: fixed };
  }
  return article;
});

// Write back
fs.writeFileSync(ARTICLES_PATH, JSON.stringify(updated, null, 4), 'utf8');

console.log(`\n✅ Fixed ${fixedCount} image URLs in data/articles.json\n`);
if (fixLog.length > 0) {
  console.log('Sample fixes (first 20):');
  fixLog.slice(0, 20).forEach((f, i) => {
    console.log(`${i+1}. "${f.title}"`);
    console.log(`   Before: ${f.before}`);
    console.log(`   After:  ${f.after}`);
    console.log('');
  });
}

// Also check how many still have /legacy-images/Bihar-Say-Website-3.png (generic fallback)
const generic = updated.filter(a => a.imageUrl && a.imageUrl.includes('Bihar-Say-Website-3.png'));
console.log(`⚠️  Articles still using generic Bihar-Say-Website-3.png: ${generic.length}`);
generic.slice(0, 5).forEach(a => console.log(`   - "${a.title}" → ${a.imageUrl}`));
