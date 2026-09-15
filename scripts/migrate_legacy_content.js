#!/usr/bin/env node
/**
 * Bihar Say — Legacy Content Migration Script
 * =============================================
 * Reads /legacy_data/biharsay_content.json (WordPress REST API export),
 * extracts clean article text, downloads featured images, and outputs
 * a consolidated /data/articles.json ready for the Next.js frontend.
 *
 * Usage:  node scripts/migrate_legacy_content.js
 *
 * Dependencies (all in package.json already):  cheerio
 * No Puppeteer/Playwright needed — we use the JSON content + HTTP scrape.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// We use cheerio for HTML-to-text conversion (already in package.json)
let cheerio;
try {
  cheerio = require('cheerio');
} catch {
  console.error('cheerio is required. Run: npm install cheerio');
  process.exit(1);
}

// --- Paths ---
const ROOT = path.resolve(__dirname, '..');
const CONTENT_JSON = path.join(ROOT, 'legacy_data', 'biharsay_content.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'legacy-images');
const OUTPUT_JSON = path.join(ROOT, 'data', 'articles.json');
const LOG_FILE = path.join(ROOT, 'scripts', 'migration_log.txt');

// --- Category mapping (WordPress cat IDs to our slugs) ---
const WP_CATEGORY_MAP = {
  1:    { name: 'Industry & Innovation',       slug: 'industry-innovation' },
  9:    { name: 'Investments & Economic',       slug: 'investments-economic' },
  26:   { name: 'Culture & Heritage',           slug: 'culture-heritage' },
  27:   { name: 'Education & Social',           slug: 'education-social' },
  28:   { name: 'Entrepreneurship & Startups',  slug: 'entrepreneurship-startups' },
  29:   { name: 'Industry & Innovation',        slug: 'industry-innovation' },
  30:   { name: 'Investments & Economic',       slug: 'investments-economic' },
  3699: { name: 'Investments & Economic',       slug: 'investments-economic' },
  3722: { name: 'Industry & Innovation',        slug: 'industry-innovation' },
};

// --- Utilities ---

/** Download a file from a URL, following redirects, with timeout. */
function downloadFile(url, destPath, timeoutMs) {
  timeoutMs = timeoutMs || 30000;
  return new Promise(function (resolve, reject) {
    var proto = url.startsWith('https') ? https : http;

    function makeRequest(targetUrl, redirectCount) {
      redirectCount = redirectCount || 0;
      if (redirectCount > 5) return reject(new Error('Too many redirects'));

      var req = proto.get(targetUrl, { timeout: timeoutMs }, function (res) {
        if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location) {
          var next = new URL(res.headers.location, targetUrl).href;
          return makeRequest(next, redirectCount + 1);
        }

        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error('HTTP ' + res.statusCode + ' for ' + targetUrl));
        }

        var ws = fs.createWriteStream(destPath);
        res.pipe(ws);
        ws.on('finish', function () {
          ws.close();
          var stats = fs.statSync(destPath);
          if (stats.size < 500) {
            fs.unlinkSync(destPath);
            reject(new Error('Downloaded file too small (' + stats.size + ' bytes)'));
          } else {
            resolve(destPath);
          }
        });
        ws.on('error', function (e) { fs.unlink(destPath, function () {}); reject(e); });
      });

      req.on('timeout', function () { req.destroy(); reject(new Error('Timeout')); });
      req.on('error', reject);
    }

    makeRequest(url);
  });
}

/** Fetch HTML from a URL. */
function fetchHtml(url, timeoutMs) {
  timeoutMs = timeoutMs || 25000;
  return new Promise(function (resolve, reject) {
    var proto = url.startsWith('https') ? https : http;

    function makeRequest(targetUrl, redirectCount) {
      redirectCount = redirectCount || 0;
      if (redirectCount > 5) return reject(new Error('Too many redirects'));

      var req = proto.get(targetUrl, { timeout: timeoutMs }, function (res) {
        if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location) {
          var next = new URL(res.headers.location, targetUrl).href;
          return makeRequest(next, redirectCount + 1);
        }

        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error('HTTP ' + res.statusCode));
        }

        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) { data += chunk; });
        res.on('end', function () { resolve(data); });
      });

      req.on('timeout', function () { req.destroy(); reject(new Error('Timeout')); });
      req.on('error', reject);
    }

    makeRequest(url);
  });
}

/** Convert raw WordPress HTML content to clean Markdown-ish text. */
function htmlToCleanText(rawHtml) {
  if (!rawHtml) return '';

  var $ = cheerio.load(rawHtml, { decodeEntities: true });

  // Remove script, style, and extraneous wrappers
  $('script, style, noscript, iframe').remove();

  // Remove ChatGPT wrapper divs (flex/message containers from AI-pasted content)
  $('div.flex, div.min-h-8, div.text-message').each(function () {
    $(this).replaceWith($(this).html());
  });

  // Convert headings
  $('h1, h2, h3, h4, h5, h6').each(function () {
    var level = parseInt(this.tagName.charAt(1));
    var prefix = '#'.repeat(level) + ' ';
    $(this).replaceWith('\n\n' + prefix + $(this).text().trim() + '\n\n');
  });

  // Convert lists
  $('ul, ol').each(function () {
    var items = [];
    $(this).find('li').each(function () {
      items.push('  - ' + $(this).text().trim());
    });
    $(this).replaceWith('\n' + items.join('\n') + '\n');
  });

  // Convert links - keep text, strip href
  $('a').each(function () {
    $(this).replaceWith($(this).text());
  });

  // Convert strong/b/em/i
  $('strong, b').each(function () {
    $(this).replaceWith('**' + $(this).text() + '**');
  });
  $('em, i').each(function () {
    $(this).replaceWith('*' + $(this).text() + '*');
  });

  // Convert br and hr
  $('br').replaceWith('\n');
  $('hr').replaceWith('\n---\n');

  // Convert p - ensure paragraph breaks
  $('p').each(function () {
    $(this).replaceWith('\n\n' + $(this).text().trim() + '\n\n');
  });

  // Get final text
  var text = $.root().text();

  // Clean up entities and whitespace
  text = text
    .replace(/\[\u2026\]/g, '\u2026')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  return text;
}

/** Derive clean filename from URL. */
function urlToFilename(url) {
  try {
    var parsed = new URL(url);
    var name = path.basename(parsed.pathname);
    name = name.split('?')[0];
    if (!path.extname(name)) name += '.png';
    return name;
  } catch (e) {
    return 'image-' + Date.now() + '.png';
  }
}

/** Create a URL-safe slug from title */
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/\u20B9/g, 'rupees-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

/** Decode HTML entities in title */
function decodeHtmlEntities(str) {
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** Extract og:image from live page HTML */
function extractOgImage(html) {
  var $ = cheerio.load(html);

  var ogUrl = $('meta[property="og:image"]').attr('content');
  if (ogUrl) return ogUrl;

  ogUrl = $('meta[name="twitter:image"]').attr('content');
  if (ogUrl) return ogUrl;

  ogUrl = $('article img').first().attr('src') ||
          $('.entry-content img').first().attr('src');
  if (ogUrl) return ogUrl;

  return null;
}

/** Derive author from yoast data */
function extractAuthor(wpArticle) {
  var yoast = wpArticle.yoast_head_json;
  if (yoast && yoast.author) {
    var cleaned = yoast.author
      .replace(/Bihar Say \|/g, '')
      .replace(/\|/g, '')
      .replace(/bihar say/gi, 'Bihar Say')
      .trim();
    return cleaned || 'Bihar Say Desk';
  }
  return 'Bihar Say Desk';
}

/** Derive reading time from text */
function estimateReadTime(text) {
  var words = text.split(/\s+/).length;
  var minutes = Math.max(1, Math.round(words / 200));
  return minutes + ' min read';
}

/** Compute category from WP category IDs */
function resolveCategory(wpCategoryIds) {
  var priority = [26, 27, 28, 29, 3699, 30, 9, 3722, 1];
  for (var p = 0; p < priority.length; p++) {
    var pCat = priority[p];
    if (wpCategoryIds.indexOf(pCat) !== -1 && WP_CATEGORY_MAP[pCat]) {
      return WP_CATEGORY_MAP[pCat];
    }
  }
  return { name: 'Investments & Economic', slug: 'investments-economic' };
}

/** Sleep helper */
function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

// --- Main Migration ---
async function main() {
  console.log('============================================================');
  console.log('  Bihar Say -- Legacy Content Migration');
  console.log('============================================================\n');

  // 1. Setup
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('Created /public/legacy-images/');
  } else {
    console.log('/public/legacy-images/ already exists');
  }

  var logLines = [];
  function log(msg) { console.log(msg); logLines.push(msg); }

  // 2. Read data
  log('\nReading biharsay_content.json...');
  var rawData = JSON.parse(fs.readFileSync(CONTENT_JSON, 'utf8'));
  log('   Found ' + rawData.length + ' articles');

  // Catalog existing images to avoid re-downloading
  var existingFiles = fs.readdirSync(IMAGES_DIR).map(function (f) { return f.toLowerCase(); });
  var existingImages = new Set(existingFiles);
  log('   ' + existingImages.size + ' images already downloaded\n');

  var articles = [];
  var imagesDownloaded = 0;
  var imagesFailed = 0;
  var scrapeAttempts = 0;

  for (var i = 0; i < rawData.length; i++) {
    var wp = rawData[i];
    var title = decodeHtmlEntities(wp.title.rendered);
    var wpId = wp.id;
    var slug = wp.slug || titleToSlug(title);
    var dateStr = wp.date;
    var link = wp.link;
    var cat = resolveCategory(wp.categories || []);

    log('\n[' + (i + 1) + '/' + rawData.length + '] ID:' + wpId + ' -- ' + title.substring(0, 70) + '...');

    // 3. Extract clean text from content.rendered
    var rawHtml = (wp.content && wp.content.rendered) ? wp.content.rendered : '';
    var cleanText = htmlToCleanText(rawHtml);
    var summary = cleanText.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
    var readTime = estimateReadTime(cleanText);
    var author = extractAuthor(wp);

    log('   Extracted ' + cleanText.length + ' chars of clean text (' + readTime + ')');

    // 4. Resolve image URL
    var imageUrl = null;
    var localImagePath = null;

    // 4a. Try og_image from Yoast JSON (already in the export)
    var ogFromJson = (wp.yoast_head_json && wp.yoast_head_json.og_image && wp.yoast_head_json.og_image[0])
      ? wp.yoast_head_json.og_image[0].url : null;
    if (ogFromJson) {
      imageUrl = ogFromJson;
      log('   OG image from JSON: ' + path.basename(imageUrl));
    }

    // 4b. If no og_image in JSON, scrape the live page
    if (!imageUrl && link) {
      try {
        scrapeAttempts++;
        log('   Scraping live page for image: ' + link);
        var pageHtml = await fetchHtml(link);
        var scraped = extractOgImage(pageHtml);
        if (scraped) {
          imageUrl = scraped;
          log('   Scraped OG image: ' + path.basename(imageUrl));
        } else {
          log('   WARNING: No image found on live page');
        }
        await sleep(500);
      } catch (err) {
        log('   WARNING: Scrape failed: ' + err.message);
      }
    }

    // 4c. Download the image if we have a URL
    if (imageUrl) {
      var filename = wpId + '_' + urlToFilename(imageUrl);
      var destPath = path.join(IMAGES_DIR, filename);

      if (existingImages.has(filename.toLowerCase())) {
        localImagePath = '/legacy-images/' + filename;
        log('   Image already exists: ' + filename);
      } else {
        try {
          await downloadFile(imageUrl, destPath);
          localImagePath = '/legacy-images/' + filename;
          imagesDownloaded++;
          log('   Downloaded: ' + filename);
          await sleep(300);
        } catch (err) {
          imagesFailed++;
          log('   FAILED download: ' + err.message);

          // Check if an existing image with just the basename exists
          var baseName = urlToFilename(imageUrl).toLowerCase();
          var fallbackArr = Array.from(existingImages);
          var fallback = null;
          for (var fi = 0; fi < fallbackArr.length; fi++) {
            if (fallbackArr[fi].indexOf(baseName) !== -1) {
              fallback = fallbackArr[fi];
              break;
            }
          }
          if (fallback) {
            localImagePath = '/legacy-images/' + fallback;
            log('   Using existing fallback: ' + fallback);
          }
        }
      }
    }

    // 5. Build article record
    var article = {
      id: slug,
      legacyId: wpId,
      title: title,
      summary: summary,
      content: rawHtml,
      cleanText: cleanText,
      category: cat.name,
      categorySlug: cat.slug,
      date: new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }),
      dateISO: dateStr,
      author: author,
      imageUrl: localImagePath || '/legacy-images/bihar-industrial-investment-growth.jpg',
      readTime: readTime,
      views: Math.floor(Math.random() * 800) + 200,
      link: link,
      isFeatured: i < 5,
    };

    articles.push(article);
  }

  // 6. Save output
  log('\n============================================================');
  log('Writing /data/articles.json...');

  var dataDir = path.join(ROOT, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(articles, null, 2), 'utf8');
  log('Saved ' + articles.length + ' articles to ' + OUTPUT_JSON);

  // Verify no external image links remain
  var outputStr = fs.readFileSync(OUTPUT_JSON, 'utf8');
  var externalImageRefs = (outputStr.match(/"imageUrl"\s*:\s*"https?:\/\/biharsay\.com/g) || []).length;
  log('\nExternal biharsay.com image refs in output: ' + externalImageRefs);

  // Summary
  log('\n============================================================');
  log('  Migration Complete');
  log('------------------------------------------------------------');
  log('  Total articles processed:  ' + articles.length);
  log('  Images downloaded (new):   ' + imagesDownloaded);
  log('  Images failed:             ' + imagesFailed);
  log('  Live pages scraped:        ' + scrapeAttempts);
  log('  External refs remaining:   ' + externalImageRefs);
  log('============================================================');

  // Save log
  fs.writeFileSync(LOG_FILE, logLines.join('\n'), 'utf8');
  log('\nFull log saved to: ' + LOG_FILE);
}

main().catch(function (err) {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
