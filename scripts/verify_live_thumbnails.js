/**
 * Bihar Say — Live Thumbnail & Content Verification Script
 * 
 * For each article in data/articles.json:
 *   1. Fetches the live biharsay.com page (using the article's URL)
 *   2. Extracts the OG image (thumbnail) and full article content
 *   3. Compares with what we have locally
 *   4. Downloads the correct thumbnail to public/legacy-images/ if different
 *   5. Outputs a detailed audit report: scripts/thumbnail_audit_report.json
 * 
 * Usage:
 *   node scripts/verify_live_thumbnails.js
 *   node scripts/verify_live_thumbnails.js --limit 50     (test with first 50 articles)
 *   node scripts/verify_live_thumbnails.js --fix           (auto-apply correct images to articles.json)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ─── Config ─────────────────────────────────────────────────────────────────
const ARTICLES_JSON  = path.join(__dirname, '..', 'data', 'articles.json');
const IMAGES_DIR     = path.join(__dirname, '..', 'public', 'legacy-images');
const REPORT_PATH    = path.join(__dirname, 'thumbnail_audit_report.json');
const REPORT_CSV     = path.join(__dirname, 'thumbnail_audit_report.csv');
const CONCURRENCY    = 4;   // parallel fetches at once
const TIMEOUT_MS     = 12000;
const DELAY_BETWEEN_BATCHES_MS = 500;

const args = process.argv.slice(2);
const LIMIT     = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 0;
const AUTO_FIX  = args.includes('--fix');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fetchUrl(url, timeout = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Bihar-Say-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://biharsay.com${res.headers.location}`;
        return fetchUrl(redirectUrl, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
    req.on('error', reject);
  });
}

function downloadImage(url, destPath, timeout = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) return reject(new Error('Invalid image URL'));
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Bihar-Say-Image-Downloader/1.0' },
      timeout,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://biharsay.com${res.headers.location}`;
        return downloadImage(redirectUrl, destPath, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        fs.writeFileSync(destPath, Buffer.concat(chunks));
        resolve(destPath);
      });
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Image download timeout')); });
    req.on('error', reject);
  });
}

function extractFromHtml(html, articleUrl) {
  // 1. OG image (most reliable for thumbnail)
  const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
  let liveImageUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : null;

  // 2. Twitter card image fallback
  if (!liveImageUrl) {
    const twitterMatch = html.match(/<meta\s+(?:name)="twitter:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+name="twitter:image"/i);
    if (twitterMatch) liveImageUrl = twitterMatch[1].replace(/&amp;/g, '&');
  }

  // 3. Featured image in WordPress entry-content
  if (!liveImageUrl) {
    const wpFeatured = html.match(/class="wp-post-image"[^>]*src="([^"]+)"/i)
      || html.match(/class="attachment-post-thumbnail[^"]*"[^>]*src="([^"]+)"/i);
    if (wpFeatured) liveImageUrl = wpFeatured[1].replace(/&amp;/g, '&');
  }

  // Normalize CDN-optimized image URLs to original WP URL
  if (liveImageUrl) {
    liveImageUrl = liveImageUrl
      .replace(/\/al_opt_content\/IMAGE\/[^/]+\/(wp-content\/uploads\/[^?]+)\?.*/, '/$1')
      .replace(/\.bv_resized_[^.]+\.webp$/, '')
      .replace(/\.bv_resized_[^.]+\.png$/, '.png')
      .replace(/\.bv\.webp$/, '');
    if (!liveImageUrl.startsWith('http')) {
      liveImageUrl = `https://biharsay.com/${liveImageUrl.replace(/^\//, '')}`;
    }
  }

  // 4. OG title (for cross-referencing)
  const ogTitleMatch = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:title"/i);
  const liveTitle = ogTitleMatch ? ogTitleMatch[1].replace(/&amp;/g, '&').replace(/&#8211;/g, '–').trim() : null;

  // 5. OG description (for content check)
  const ogDescMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:description"/i);
  const liveDescription = ogDescMatch ? ogDescMatch[1].replace(/&amp;/g, '&').trim() : null;

  // 6. Check if content body is truncated (article has full content on the live page)
  const hasFullContent = html.includes('entry-content') || html.includes('post-content') || html.includes('article-content');
  
  // 7. Estimate word count of content from the live page
  const entryContentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  let liveContentWordCount = 0;
  if (entryContentMatch) {
    const cleanText = entryContentMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    liveContentWordCount = cleanText.split(' ').filter(w => w.length > 0).length;
  }

  return { liveImageUrl, liveTitle, liveDescription, hasFullContent, liveContentWordCount };
}

function getImageFilenameFromUrl(imgUrl) {
  if (!imgUrl) return null;
  try {
    const parsed = new URL(imgUrl);
    return path.basename(parsed.pathname);
  } catch {
    return path.basename(imgUrl.split('?')[0]);
  }
}

function slugToFilename(slug) {
  return slug.replace(/[^a-z0-9\-]/gi, '-').toLowerCase().substring(0, 80) + '.jpg';
}

function normalizeImageUrl(url) {
  if (!url) return '';
  return url.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('     Bihar Say — Live Thumbnail & Content Verification');
  console.log('═══════════════════════════════════════════════════════════\n');

  const rawJson = fs.readFileSync(ARTICLES_JSON, 'utf8').replace(/^\uFEFF/, '');
  const articles = JSON.parse(rawJson);
  const toProcess = LIMIT > 0 ? articles.slice(0, LIMIT) : articles;
  
  console.log(`📊 Total articles to verify: ${toProcess.length}`);
  console.log(`⚙️  Auto-fix mode: ${AUTO_FIX ? 'ON (will update articles.json)' : 'OFF (dry run)'}`);
  console.log(`🔄 Concurrency: ${CONCURRENCY} parallel fetches\n`);

  const report = {
    summary: {
      total: toProcess.length,
      scrapedSuccessfully: 0,
      thumbnailMismatch: 0,
      thumbnailMissing: 0,
      thumbnailCorrect: 0,
      contentTruncated: 0,
      contentFull: 0,
      errors: 0,
      fixed: 0,
    },
    articles: [],
  };

  // Process in batches
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(toProcess.length / CONCURRENCY);

    process.stdout.write(`\r[${i + 1}–${Math.min(i + CONCURRENCY, toProcess.length)}/${toProcess.length}] Batch ${batchNum}/${totalBatches}...`);

    const results = await Promise.all(batch.map(async (article) => {
      const result = {
        id: article.id,
        title: article.title,
        localImageUrl: article.imageUrl || '',
        liveImageUrl: null,
        liveTitle: null,
        liveDescription: null,
        localContentWords: 0,
        liveContentWords: 0,
        contentStatus: 'unknown',
        thumbnailStatus: 'unknown',
        imageFilenameLocal: null,
        imageFilenameLive: null,
        downloadedTo: null,
        newLocalPath: null,
        articleUrl: article.url || '',
        error: null,
      };

      // Count local content words
      if (article.content) {
        const cleanLocal = article.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        result.localContentWords = cleanLocal.split(' ').filter(w => w.length > 2).length;
      }

      if (!article.url || !article.url.startsWith('http')) {
        result.error = 'No valid URL';
        result.thumbnailStatus = 'no_url';
        result.contentStatus = 'no_url';
        return result;
      }

      try {
        const html = await fetchUrl(article.url);
        const { liveImageUrl, liveTitle, liveDescription, hasFullContent, liveContentWordCount } = extractFromHtml(html, article.url);

        result.liveImageUrl = liveImageUrl;
        result.liveTitle = liveTitle;
        result.liveDescription = liveDescription;
        result.liveContentWords = liveContentWordCount;

        // Content status
        const localWordCount = result.localContentWords;
        const liveWordCount = liveContentWordCount;
        if (localWordCount < 30 && liveWordCount > 100) {
          result.contentStatus = 'truncated_locally';
        } else if (localWordCount >= 50) {
          result.contentStatus = 'sufficient';
        } else {
          result.contentStatus = 'short';
        }

        // Thumbnail status
        result.imageFilenameLocal = getImageFilenameFromUrl(article.imageUrl);
        result.imageFilenameLive  = getImageFilenameFromUrl(liveImageUrl);

        const localNorm = normalizeImageUrl(article.imageUrl || '');
        const liveNorm  = normalizeImageUrl(liveImageUrl || '');

        if (!liveImageUrl) {
          result.thumbnailStatus = 'live_image_not_found';
        } else if (!article.imageUrl || article.imageUrl.includes('Bihar-Say-Website-3.png')) {
          result.thumbnailStatus = 'local_missing_or_generic';
        } else if (localNorm === liveNorm || result.imageFilenameLocal === result.imageFilenameLive) {
          result.thumbnailStatus = 'correct';
        } else if (article.imageUrl.startsWith('/legacy-images/') && !article.imageUrl.includes('Bihar-Say-Website-3.png')) {
          // We have a local specific image — check if the filename hints at the right subject
          result.thumbnailStatus = 'local_specific_needs_review';
        } else if (article.imageUrl.startsWith('https://biharsay.com/wp-content/') && liveImageUrl && article.imageUrl !== liveImageUrl) {
          result.thumbnailStatus = 'cdn_url_mismatch';
        } else {
          result.thumbnailStatus = 'mismatch';
        }

        // Download the live image if it's better than what we have
        const shouldDownload = AUTO_FIX && liveImageUrl && (
          result.thumbnailStatus === 'local_missing_or_generic' ||
          result.thumbnailStatus === 'mismatch' ||
          result.thumbnailStatus === 'cdn_url_mismatch'
        );

        if (shouldDownload) {
          const liveFilename = getImageFilenameFromUrl(liveImageUrl) || slugToFilename(article.id);
          const destPath = path.join(IMAGES_DIR, liveFilename);
          if (!fs.existsSync(destPath)) {
            try {
              await downloadImage(liveImageUrl, destPath);
              result.downloadedTo = `/legacy-images/${liveFilename}`;
            } catch (dlErr) {
              // Try original WordPress upload URL
              const wpUrl = liveImageUrl.replace(/\/al_opt_content\/IMAGE\/[^/]+\//, '/');
              try {
                await downloadImage(wpUrl, destPath);
                result.downloadedTo = `/legacy-images/${liveFilename}`;
              } catch {
                result.downloadedTo = null;
              }
            }
          } else {
            result.downloadedTo = `/legacy-images/${liveFilename}`;
          }
          if (result.downloadedTo) {
            result.newLocalPath = result.downloadedTo;
          }
        }

      } catch (err) {
        result.error = err.message;
        result.thumbnailStatus = 'fetch_error';
        result.contentStatus = 'fetch_error';
      }

      return result;
    }));

    // Accumulate results
    for (const r of results) {
      report.articles.push(r);
      if (r.error && r.thumbnailStatus === 'fetch_error') {
        report.summary.errors++;
      } else if (r.liveImageUrl) {
        report.summary.scrapedSuccessfully++;
      }
      if (r.thumbnailStatus === 'correct') report.summary.thumbnailCorrect++;
      else if (r.thumbnailStatus === 'local_missing_or_generic') report.summary.thumbnailMissing++;
      else if (r.thumbnailStatus === 'mismatch' || r.thumbnailStatus === 'cdn_url_mismatch') report.summary.thumbnailMismatch++;
      if (r.contentStatus === 'truncated_locally') report.summary.contentTruncated++;
      if (r.contentStatus === 'sufficient') report.summary.contentFull++;
      if (r.newLocalPath) report.summary.fixed++;
    }

    if (i + CONCURRENCY < toProcess.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log('\n');

  // ─── Apply Fixes to articles.json ────────────────────────────────────────
  if (AUTO_FIX) {
    const fixMap = new Map();
    report.articles.forEach(r => {
      if (r.newLocalPath) fixMap.set(r.id, r.newLocalPath);
    });

    if (fixMap.size > 0) {
      const updated = articles.map(a => {
        if (fixMap.has(a.id)) {
          return { ...a, imageUrl: fixMap.get(a.id) };
        }
        return a;
      });
      fs.writeFileSync(ARTICLES_JSON, JSON.stringify(updated, null, 4), 'utf8');
      console.log(`✅ Updated ${fixMap.size} article image URLs in data/articles.json`);
    }
  }

  // ─── Save JSON Report ─────────────────────────────────────────────────────
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  // ─── Save CSV Report ──────────────────────────────────────────────────────
  const csvHeader = 'Article ID,Title,Thumbnail Status,Content Status,Local Words,Live Words,Local Image,Live Image,Article URL\n';
  const csvRows = report.articles.map(r => {
    const esc = s => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      esc(r.id),
      esc(r.title),
      esc(r.thumbnailStatus),
      esc(r.contentStatus),
      r.localContentWords,
      r.liveContentWords,
      esc(r.localImageUrl),
      esc(r.liveImageUrl || ''),
      esc(r.articleUrl),
    ].join(',');
  }).join('\n');
  fs.writeFileSync(REPORT_CSV, csvHeader + csvRows, 'utf8');

  // ─── Print Summary ────────────────────────────────────────────────────────
  const s = report.summary;
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║            THUMBNAIL & CONTENT AUDIT RESULTS             ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  Total articles processed:         ${String(s.total).padEnd(24)}║`);
  console.log(`║  Successfully scraped:             ${String(s.scrapedSuccessfully).padEnd(24)}║`);
  console.log(`║  ─────────────────────────────────────────────────────── ║`);
  console.log(`║  ✅ Thumbnails CORRECT:             ${String(s.thumbnailCorrect).padEnd(24)}║`);
  console.log(`║  ⚠️  Thumbnails MISSING/GENERIC:    ${String(s.thumbnailMissing).padEnd(24)}║`);
  console.log(`║  ❌ Thumbnails MISMATCH:            ${String(s.thumbnailMismatch).padEnd(24)}║`);
  console.log(`║  ─────────────────────────────────────────────────────── ║`);
  console.log(`║  📄 Content TRUNCATED locally:     ${String(s.contentTruncated).padEnd(24)}║`);
  console.log(`║  📄 Content SUFFICIENT locally:    ${String(s.contentFull).padEnd(24)}║`);
  console.log(`║  ─────────────────────────────────────────────────────── ║`);
  console.log(`║  🔧 Fixed (images downloaded):     ${String(s.fixed).padEnd(24)}║`);
  console.log(`║  🚫 Fetch errors:                  ${String(s.errors).padEnd(24)}║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  console.log(`\n📋 JSON report saved to: ${REPORT_PATH}`);
  console.log(`📋 CSV report saved to:  ${REPORT_CSV}`);
  
  // Print top issues
  const mismatches = report.articles.filter(r =>
    r.thumbnailStatus === 'mismatch' || r.thumbnailStatus === 'local_missing_or_generic' || r.thumbnailStatus === 'cdn_url_mismatch'
  ).slice(0, 20);

  if (mismatches.length > 0) {
    console.log('\n🔍 Top Thumbnail Issues (first 20):');
    console.log('─'.repeat(100));
    mismatches.forEach((r, i) => {
      console.log(`${i + 1}. [${r.thumbnailStatus.toUpperCase()}] "${r.title}"`);
      console.log(`   Local:  ${r.localImageUrl || '(none)'}`);
      console.log(`   Live:   ${r.liveImageUrl || '(not found)'}`);
      console.log(`   URL:    ${r.articleUrl}`);
      console.log('');
    });
  }

  const truncated = report.articles.filter(r => r.contentStatus === 'truncated_locally').slice(0, 10);
  if (truncated.length > 0) {
    console.log('\n📄 Articles with Truncated Content (first 10):');
    console.log('─'.repeat(100));
    truncated.forEach((r, i) => {
      console.log(`${i + 1}. "${r.title}"`);
      console.log(`   Local words: ${r.localContentWords}  |  Live words: ${r.liveContentWords}`);
      console.log(`   URL: ${r.articleUrl}`);
      console.log('');
    });
  }

  console.log('\n✅ Verification complete!');
  if (!AUTO_FIX) {
    console.log('💡 Run with --fix flag to automatically download correct thumbnails:');
    console.log('   node scripts/verify_live_thumbnails.js --fix');
    console.log('   node scripts/verify_live_thumbnails.js --fix --limit 50   (test first 50)');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
