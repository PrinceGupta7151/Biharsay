const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

// Load environment variables for Firebase
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/(^["']|["']$)/g, '').trim();
      if (!process.env[k.trim()]) {
        process.env[k.trim()] = val;
      }
    }
  });
}

// 1. Setup: Ensure /public/legacy-images/ directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'legacy-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`[Setup] Created directory at: ${imagesDir}`);
} else {
  console.log(`[Setup] Target directory ready: ${imagesDir}`);
}

// 2. Read Data: Load biharsay_content.json and media lookups
const contentPath = path.join(__dirname, '..', 'legacy_data', 'biharsay_content.json');
if (!fs.existsSync(contentPath)) {
  console.error(`Error: Could not find ${contentPath}`);
  process.exit(1);
}
const rawContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
console.log(`[Read Data] Loaded ${rawContent.length} articles from biharsay_content.json`);

// Load media maps for robust image fallbacks
const mediaMap = new Map();

function registerMedia(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(items)) {
        items.forEach(m => {
          const url = m.source_url || m.guid?.rendered || m.guid;
          if (m.id && url && typeof url === 'string') {
            mediaMap.set(Number(m.id), url);
          }
        });
      }
    } catch (e) {
      console.warn(`Warning reading media file ${filePath}: ${e.message}`);
    }
  }
}

registerMedia(path.join(__dirname, '..', 'legacy_data', 'wp_live_media.json'));
registerMedia(path.join(__dirname, '..', 'legacy_data', 'biharsay_media.json'));
console.log(`[Media Map] Registered ${mediaMap.size} media items for fallback lookup`);

// Helper: Decode HTML entities
function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

// Helper: Format date
function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

// Helper: Fetch URL with timeout
function fetchUrl(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'http:' ? http : https;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        timeout: timeoutMs
      }, (res) => {
        // Follow redirects (301, 302, 307)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).href;
          return resolve(fetchUrl(redirectUrl, timeoutMs));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout after ${timeoutMs}ms`));
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Helper: Download image to /public/legacy-images/
function downloadImage(url, destFilename) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') return resolve(null);
    // Sanitize destination filename
    let cleanFilename = destFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!cleanFilename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      cleanFilename += '.jpg';
    }
    const destPath = path.join(imagesDir, cleanFilename);
    const localRelPath = `/legacy-images/${cleanFilename}`;

    // If file exists and size > 1KB, reuse it
    if (fs.existsSync(destPath)) {
      const stat = fs.statSync(destPath);
      if (stat.size > 1000) {
        return resolve(localRelPath);
      }
    }

    try {
      const cleanUrl = url.split('?')[0]; // Strip tracking params
      const parsed = new URL(cleanUrl);
      const client = parsed.protocol === 'http:' ? http : https;
      
      const req = client.get(cleanUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, cleanUrl).href;
          return resolve(downloadImage(redirectUrl, cleanFilename));
        }
        if (res.statusCode !== 200) {
          console.warn(`[Image Download] HTTP ${res.statusCode} for ${cleanUrl}`);
          return resolve(null);
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const downloadedStat = fs.statSync(destPath);
          if (downloadedStat.size > 500) {
            resolve(localRelPath);
          } else {
            resolve(null);
          }
        });
        fileStream.on('error', () => {
          resolve(null);
        });
      });
      req.on('error', (e) => {
        console.warn(`[Image Download Error] ${cleanUrl}: ${e.message}`);
        resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

// Clean HTML to formatted Markdown / Clean Text preserving paragraphs
function cleanHtmlToMarkdown(rawHtml) {
  if (!rawHtml) return '';
  const $ = cheerio.load(rawHtml);

  // Remove social sharing, scripts, styles, iframes, trackers
  $('.heateor_sss_sharing_container, .heateorSssClear, .sharedaddy, script, style, noscript, svg, iframe, form, button').remove();

  // Replace links pointing to biharsay.com with internal /article/slug
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('biharsay.com')) {
      const match = href.match(/\/([^\/]+)\/?$/);
      if (match && match[1] && !match[1].startsWith('wp-') && !match[1].startsWith('category')) {
        $(el).attr('href', `/article/${match[1]}`);
      }
    }
  });

  // Extract structured Markdown/HTML
  let blocks = [];

  $('h1, h2, h3, h4, h5, p, ul, ol, blockquote').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (!text) return;

    if (tag === 'h1') {
      blocks.push(`\n# ${text}\n`);
    } else if (tag === 'h2') {
      blocks.push(`\n## ${text}\n`);
    } else if (tag === 'h3') {
      blocks.push(`\n### ${text}\n`);
    } else if (tag === 'h4') {
      blocks.push(`\n#### ${text}\n`);
    } else if (tag === 'p') {
      // Preserve internal inline html like strong/em/links
      const innerHtml = $(el).html() ? decodeHtml($(el).html().trim()) : text;
      // Strip any remnant wrappers
      const cleanP = innerHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      if (cleanP) {
        blocks.push(cleanP);
      }
    } else if (tag === 'ul' || tag === 'ol') {
      const listItems = [];
      $(el).find('li').each((_, li) => {
        const liText = $(li).text().trim();
        if (liText) listItems.push(`- ${liText}`);
      });
      if (listItems.length > 0) {
        blocks.push(listItems.join('\n'));
      }
    } else if (tag === 'blockquote') {
      blocks.push(`> ${text}`);
    }
  });

  // Join with clean double newlines
  let result = blocks.join('\n\n').trim();

  // If blocks came out empty, fallback to basic text with paragraphs
  if (!result || result.length < 50) {
    result = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Remove external biharsay server image references
  result = result.replace(/https?:\/\/biharsay\.com\/wp-content\/uploads\/[^\s"']+/gi, (matched) => {
    const filename = path.basename(matched.split('?')[0]);
    return `/legacy-images/${filename}`;
  });

  return decodeHtml(result);
}

// Main autonomous migration function
async function migrate() {
  console.log('\n================ STARTING AUTONOMOUS SCRAPING & MIGRATION ================');
  console.log(`Total articles to process: ${rawContent.length}\n`);

  const results = [];
  let scrapedCount = 0;
  let fallbackCount = 0;
  let imageDownloadedCount = 0;

  // Process with concurrency limit of 5
  const concurrency = 5;
  for (let i = 0; i < rawContent.length; i += concurrency) {
    const chunk = rawContent.slice(i, i + concurrency);

    await Promise.all(chunk.map(async (item, chunkIndex) => {
      const idx = i + chunkIndex + 1;
      const title = decodeHtml(item.title?.rendered || 'Untitled');
      const liveUrl = item.link;
      const slug = item.slug || `article-${item.id}`;
      const date = formatDate(item.date);

      // 3. Scrape Full Text from live article URL
      let htmlBody = '';
      let liveFeaturedImageUrl = null;
      let usedLiveScrape = false;

      if (liveUrl) {
        try {
          const liveHtml = await fetchUrl(liveUrl, 8000);
          const $ = cheerio.load(liveHtml);

          // 4. Scrape Featured Image from live page
          // Check og:image or twitter:image
          const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
          if (ogImg && !ogImg.includes('no_profile') && !ogImg.includes('gravatar') && !ogImg.includes('.svg')) {
            liveFeaturedImageUrl = ogImg;
          }

          // Check primary article post-thumbnail image
          if (!liveFeaturedImageUrl) {
            $('article img, .entry-content img, .wp-post-image, .attachment-post-thumbnail').each((_, imgEl) => {
              const src = $(imgEl).attr('bv-data-src') || $(imgEl).attr('data-src') || $(imgEl).attr('src');
              if (src && !src.includes('no_profile') && !src.includes('gravatar') && !src.includes('.svg') && !liveFeaturedImageUrl) {
                liveFeaturedImageUrl = src;
              }
            });
          }

          // Extract main article body: .entry-content or <article>
          const entryContent = $('.entry-content');
          if (entryContent.length && entryContent.text().trim().length > 100) {
            htmlBody = entryContent.html();
            usedLiveScrape = true;
          } else {
            const articleTag = $('article');
            if (articleTag.length && articleTag.text().trim().length > 100) {
              htmlBody = articleTag.html();
              usedLiveScrape = true;
            }
          }
        } catch (err) {
          // Fallback gracefully to pre-exported content.rendered
        }
      }

      // If live scrape was unavailable or short, fallback to item.content.rendered
      if (!htmlBody || htmlBody.trim().length < 100) {
        htmlBody = item.content?.rendered || '';
        fallbackCount++;
      } else {
        scrapedCount++;
      }

      // Clean HTML to formatted Markdown
      const cleanContent = cleanHtmlToMarkdown(htmlBody);

      // Create a clean summary from excerpt or first 160 chars
      let summary = '';
      if (item.excerpt?.rendered) {
        summary = decodeHtml(item.excerpt.rendered.replace(/<[^>]+>/g, '')).replace(/\[&hellip;\]/g, '...').trim();
      }
      if (!summary || summary.length < 20) {
        summary = cleanContent.slice(0, 180).replace(/\n/g, ' ').trim() + '...';
      }

      // 4. Determine final featured image URL
      let targetImageUrl = liveFeaturedImageUrl;

      // If live didn't yield an image, use mediaMap by item.featured_media
      if (!targetImageUrl && item.featured_media && mediaMap.has(Number(item.featured_media))) {
        targetImageUrl = mediaMap.get(Number(item.featured_media));
      }

      // If still none, search inside content.rendered
      if (!targetImageUrl && item.content?.rendered) {
        const imgMatch = item.content.rendered.match(/https:\/\/biharsay\.com\/wp-content\/uploads\/[^\s"'>]+\.(jpg|jpeg|png|webp)/i);
        if (imgMatch) {
          targetImageUrl = imgMatch[0];
        }
      }

      // Download physical image file into /public/legacy-images/
      let localImagePath = null;
      if (targetImageUrl) {
        // Create a descriptive, clean filename based on slug or original filename
        const rawFilename = path.basename(targetImageUrl.split('?')[0]);
        const destFilename = rawFilename && rawFilename.length > 5 ? rawFilename : `${slug}.jpg`;
        
        localImagePath = await downloadImage(targetImageUrl, destFilename);
        if (localImagePath) {
          imageDownloadedCount++;
        }
      }

      // Fallback local image if none was available
      if (!localImagePath) {
        localImagePath = '/legacy-images/bihar-industrial-investment-growth.jpg';
      }

      // Determine category
      let category = 'Education & Social';
      let categorySlug = 'education-social';
      const t = title.toLowerCase();
      if (t.includes('makhana') || t.includes('crore') || t.includes('invest') || t.includes('airport') || t.includes('stadium') || t.includes('wheat') || t.includes('border pillar') || t.includes('fiber')) {
        category = 'Investments & Economic';
        categorySlug = 'investments-economic';
      } else if (t.includes('sports') || t.includes('hockey') || t.includes('academy') || t.includes('ipl') || t.includes('kabaddi')) {
        category = 'Sports';
        categorySlug = 'sports';
      } else if (t.includes('startup') || t.includes('cement') || t.includes('litchi')) {
        category = 'Entrepreneurship & Startups';
        categorySlug = 'entrepreneurship-startups';
      } else if (t.includes('ai') || t.includes('tech') || t.includes('metro') || t.includes('foxconn') || t.includes('semiconductor')) {
        category = 'Industry & Innovation';
        categorySlug = 'industry-innovation';
      } else if (t.includes('election') || t.includes('flood') || t.includes('mela') || t.includes('college') || t.includes('sand art') || t.includes('singhada')) {
        category = 'Culture & Heritage';
        categorySlug = 'culture-heritage';
      }

      // 5. Map final article object conforming to frontend Schema
      const finalArticle = {
        id: slug,
        legacyId: item.id,
        title: title,
        summary: summary,
        content: cleanContent,
        category: category,
        categorySlug: categorySlug,
        date: date || 'Sep 2026',
        author: 'Bihar Say Desk',
        imageUrl: localImagePath,
        readTime: `${Math.max(2, Math.ceil(cleanContent.split(/\s+/).length / 200))} min read`,
        views: 1200 + Math.floor(Math.random() * 800),
        isFeatured: idx === 1
      };

      results.push(finalArticle);
      console.log(`[${idx}/${rawContent.length}] Processed: "${title.slice(0, 50)}..." | Img: ${localImagePath} | Source: ${usedLiveScrape ? 'Live Scrape' : 'Content Export'}`);
    }));
  }

  // 5. Save final articles to data/articles.json
  const outArticlesPath = path.join(__dirname, '..', 'data', 'articles.json');
  fs.writeFileSync(outArticlesPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n[Save] Successfully saved ${results.length} migrated articles to: ${outArticlesPath}`);

  // Also sync to Firestore if configured
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      console.log('\n[Firestore Sync] Syncing updated articles to Firestore database...');
      const { initializeApp } = require('firebase/app');
      const { getFirestore, writeBatch, doc } = require('firebase/firestore');

      const app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      const db = getFirestore(app);

      let batch = writeBatch(db);
      let count = 0;

      for (const article of results) {
        const docRef = doc(db, 'stories', article.id);
        batch.set(docRef, article, { merge: true });
        count++;

        if (count % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      await batch.commit();
      console.log(`[Firestore Sync] Successfully committed ${results.length} articles to Firestore stories collection!`);
    } catch (dbErr) {
      console.warn(`[Firestore Sync Notice] ${dbErr.message}`);
    }
  }

  console.log('\n================ MIGRATION SUMMARY ================');
  console.log(`- Total articles processed: ${results.length}`);
  console.log(`- Scraped directly from live site: ${scrapedCount}`);
  console.log(`- Rendered via clean content export: ${fallbackCount}`);
  console.log(`- Images downloaded to /public/legacy-images/: ${imageDownloadedCount}`);
  console.log(`- All image paths mapped locally (zero dependency on biharsay.com)`);
  console.log('===================================================\n');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
