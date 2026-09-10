/**
 * Bihar Say — Seed Migration Script
 * 
 * Migrates legacy WordPress export data (JSON) into the Firebase Firestore
 * 'stories' collection and updates local seed data for offline fallback.
 * 
 * Usage:
 *   node scripts/seed_migration.js
 *   node scripts/seed_migration.js --file <custom-path-to-json>
 *   node scripts/seed_migration.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch 
} = require('firebase/firestore');

// --- 1. Load Environment Variables from .env.local ---
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/(^["']|["']$)/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val.trim();
        }
      }
    });
  }
}
loadEnv();

// --- 2. Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBb-C1RSm0oEKaTBhc7XhfZ0X_yeGg6En8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "biharsay-e6712.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "biharsay-e6712",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "biharsay-e6712.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "593257472042",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:593257472042:web:8d55e87a48d6937609a353",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-D6MVJHKFP7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const STORIES_COLLECTION = 'stories';

// --- 3. Category Mapping & Fallbacks ---
const CATEGORY_MAP = {
  9: { name: 'Sports', slug: 'sports' },
  26: { name: 'Culture & Heritage', slug: 'culture-heritage' },
  27: { name: 'Education & Social', slug: 'education-social' },
  28: { name: 'Entrepreneurship & Startups', slug: 'entrepreneurship-startups' },
  29: { name: 'Industry & Innovation', slug: 'industry-innovation' },
  30: { name: 'Investments & Economic', slug: 'investments-economic' },
  3699: { name: 'Investments & Economic', slug: 'investments-economic' }, // agriculture
  3722: { name: 'Industry & Innovation', slug: 'industry-innovation' }, // infrastructure / connectivity
  2180: { name: 'Entrepreneurship & Startups', slug: 'entrepreneurship-startups' }, // success stories
  1: { name: 'Culture & Heritage', slug: 'culture-heritage' }, // general news fallback
};

const THEMATIC_IMAGES = {
  'investments-economic': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
  ],
  'industry-innovation': [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  ],
  'sports': [
    'https://biharsay.com/wp-content/uploads/2025/04/Bihar-Say-Website-99.png',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  ],
  'culture-heritage': [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  ],
  'education-social': [
    'https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-4.png',
    'https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-6.png',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
  ],
  'entrepreneurship-startups': [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
  ]
};

// --- 4. Helper Functions: Decoding & Cleaning ---
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function cleanHtmlToParagraphs(html) {
  if (!html) return '';
  let text = html
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote|section|article)>/gi, '\n\n')
    .replace(/<(?:br|hr)\s*\/?>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
  text = decodeHtmlEntities(text);
  return text
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDate(dateStr) {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return dateStr;
  }
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// --- 5. Determine Image ---
function extractImageUrl(record, categorySlug, index) {
  // 1. From Yoast SEO OpenGraph Image
  if (record.yoast_head_json?.og_image?.[0]?.url) {
    return record.yoast_head_json.og_image[0].url;
  }

  // 2. From Jetpack featured media
  if (record.jetpack_featured_media_url) {
    return record.jetpack_featured_media_url;
  }

  // 3. From <img> tag inside HTML content
  if (record.content?.rendered) {
    const match = record.content.rendered.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^"']*)?)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 4. Curated thematic high-res fallback based on category
  const pool = THEMATIC_IMAGES[categorySlug] || THEMATIC_IMAGES['culture-heritage'];
  return pool[index % pool.length];
}

// --- 6. Entry Validation ---
function validateRecord(record, index) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { isValid: false, errors: ['Record is not a valid JSON object'] };
  }

  // Validate title
  const rawTitle = record.title?.rendered;
  if (!rawTitle || typeof rawTitle !== 'string' || !rawTitle.trim()) {
    errors.push('Missing or empty title.rendered');
  }

  // Validate date
  if (!record.date || typeof record.date !== 'string') {
    errors.push('Missing date string');
  } else if (isNaN(new Date(record.date).getTime())) {
    errors.push(`Invalid date format: "${record.date}"`);
  }

  // Validate slug / doc ID
  if (!record.slug || typeof record.slug !== 'string' || !record.slug.trim()) {
    errors.push('Missing or empty slug');
  } else if (record.slug.includes('/')) {
    errors.push(`Invalid slug containing slashes: "${record.slug}"`);
  } else if (record.slug.length > 1500) {
    errors.push('Slug exceeds Firestore ID limit (1500 bytes)');
  }

  // Validate content
  const rawContent = record.content?.rendered;
  if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
    errors.push('Missing or empty content.rendered');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// --- 7. Transform Record to Story Schema ---
function mapRecordToStory(record, index) {
  const title = decodeHtmlEntities(record.title?.rendered || '').trim();
  const cleanedContent = cleanHtmlToParagraphs(record.content?.rendered || '');
  
  // Extract summary from excerpt.rendered or the first clean paragraph
  let summary = '';
  if (record.excerpt?.rendered) {
    summary = decodeHtmlEntities(record.excerpt.rendered.replace(/<[^>]+>/g, '')).trim();
  }
  if (!summary && cleanedContent) {
    const firstPara = cleanedContent.split('\n\n')[0] || '';
    summary = firstPara.length > 220 ? firstPara.slice(0, 217) + '...' : firstPara;
  }

  // Determine category & slug
  let category = 'Culture & Heritage';
  let categorySlug = 'culture-heritage';
  if (Array.isArray(record.categories) && record.categories.length > 0) {
    for (const catId of record.categories) {
      if (CATEGORY_MAP[catId]) {
        category = CATEGORY_MAP[catId].name;
        categorySlug = CATEGORY_MAP[catId].slug;
        break;
      }
    }
  }

  // Estimate read time
  const words = (cleanedContent || summary).split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(2, Math.round(words / 160));

  // Determine image
  const imageUrl = extractImageUrl(record, categorySlug, index);

  // Author
  let author = 'Bihar Say Desk';
  if (record._embedded?.author?.[0]?.name) {
    author = record._embedded.author[0].name;
  }

  // Realistic initial view counts based on recency/order
  const views = 1200 + (100 - index) * 115;

  const story = {
    id: record.slug.trim(),
    title,
    summary,
    content: cleanedContent,
    category,
    categorySlug,
    date: formatDate(record.date),
    author,
    imageUrl,
    isFeatured: index < 4,
    readTime: `${readMinutes} min read`,
    views,
    createdAt: new Date(record.date).toISOString()
  };

  if (index < 4) {
    story.featuredOrder = index;
  }

  return story;
}

function cleanUndefined(obj) {
  const res = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      res[key] = val;
    }
  }
  return res;
}

// --- 8. Batch Insertion into Firestore ---
async function batchInsertStories(stories, batchSize = 50) {
  console.log(`\n🚀 Starting batch insertion into Firestore collection "${STORIES_COLLECTION}"...`);
  console.log(`   Total stories to insert: ${stories.length}`);
  console.log(`   Batch chunk size: ${batchSize} documents per transaction\n`);

  const totalBatches = Math.ceil(stories.length / batchSize);
  let totalCommitted = 0;

  for (let b = 0; b < totalBatches; b++) {
    const startIdx = b * batchSize;
    const chunk = stories.slice(startIdx, startIdx + batchSize);
    const batch = writeBatch(db);

    for (const story of chunk) {
      const docRef = doc(db, STORIES_COLLECTION, story.id);
      batch.set(docRef, cleanUndefined(story), { merge: true });
    }

    const t0 = Date.now();
    await batch.commit();
    const durationMs = Date.now() - t0;
    totalCommitted += chunk.length;

    const progressPct = Math.round((totalCommitted / stories.length) * 100);
    console.log(`   [Batch ${b + 1}/${totalBatches}] Committed ${chunk.length} stories in ${durationMs}ms (${progressPct}% complete)`);
  }

  console.log(`\n✅ Successfully committed all ${totalCommitted} stories to Firestore!`);
  return totalCommitted;
}

// --- 9. Update Local seedStories.ts for Offline Sync ---
function syncLocalSeedStories(stories) {
  try {
    const seedPath = path.join(process.cwd(), 'data', 'seedStories.ts');
    if (!fs.existsSync(seedPath)) {
      console.warn(`   ⚠️ seedStories.ts not found at ${seedPath}`);
      return;
    }

    const currentContent = fs.readFileSync(seedPath, 'utf8');
    const categoriesSectionMatch = currentContent.match(/export const CATEGORIES: CategoryInfo\[\] = \[[\s\S]*?\];/);
    if (!categoriesSectionMatch) {
      console.warn('   ⚠️ Could not locate CATEGORIES in seedStories.ts');
      return;
    }

    const newContent = `import { CategoryInfo, Story } from '@/types';\n\n${categoriesSectionMatch[0]}\n\nexport const INITIAL_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};\n`;
    fs.writeFileSync(seedPath, newContent, 'utf8');
    console.log(`   📁 Local fallback data synchronized in data/seedStories.ts (${stories.length} stories)`);
  } catch (err) {
    console.warn(`   ⚠️ Warning: Could not update local seedStories.ts: ${err.message}`);
  }
}

// --- 10. Main Migration Orchestrator ---
async function runMigration() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('           BIHAR SAY — SEED MIGRATION');
  console.log('====================================================');

  // Command-line options
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArgIdx = args.findIndex(a => a === '--file' || a === '-f');
  const customFilePath = fileArgIdx !== -1 ? args[fileArgIdx + 1] : null;

  // Candidate paths for legacy export
  const candidatePaths = [
    customFilePath,
    path.join(process.cwd(), 'legacy_data', 'biharsay_content.json'),
    'C:\\Users\\91896\\OneDrive\\Desktop\\bihar say json.json'
  ].filter(Boolean);

  let targetFilePath = null;
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      targetFilePath = candidate;
      break;
    }
  }

  if (!targetFilePath) {
    console.error('\n❌ ERROR: Legacy export JSON not found in any of the following paths:');
    candidatePaths.forEach(p => console.error(`   - ${p}`));
    console.error('\nPlease specify the file location using: node scripts/seed_migration.js --file <path>');
    process.exit(1);
  }

  console.log(`\n📂 Reading legacy export from:`);
  console.log(`   ${targetFilePath}`);

  // Read and parse JSON
  let rawData;
  try {
    const fileContent = fs.readFileSync(targetFilePath, 'utf8');
    rawData = JSON.parse(fileContent);
  } catch (err) {
    console.error(`\n❌ Failed to read or parse JSON: ${err.message}`);
    process.exit(1);
  }

  const rawArray = Array.isArray(rawData) ? rawData : (rawData.posts || Object.values(rawData));
  console.log(`   Found ${rawArray.length} records in legacy export.`);

  // Validation and Transformation
  console.log('\n🔍 Validating and mapping records into Story schema...');
  const validStories = [];
  const failedEntries = [];
  const categoryCount = {};

  rawArray.forEach((record, idx) => {
    const validation = validateRecord(record, idx);
    const identifier = record?.slug || record?.id || `index_${idx}`;

    if (!validation.isValid) {
      failedEntries.push({
        index: idx,
        identifier,
        errors: validation.errors
      });
      console.warn(`   ❌ [FAIL #${idx}] Item "${identifier}": ${validation.errors.join('; ')}`);
    } else {
      const story = mapRecordToStory(record, idx);
      validStories.push(story);
      categoryCount[story.category] = (categoryCount[story.category] || 0) + 1;
    }
  });

  console.log(`\n📊 Validation Summary:`);
  console.log(`   • Total Raw Records:   ${rawArray.length}`);
  console.log(`   • Valid Records:       ${validStories.length}`);
  console.log(`   • Failed Validation:   ${failedEntries.length}`);

  if (failedEntries.length > 0) {
    console.log('\n⚠️ Details of Failed Entries:');
    failedEntries.forEach(f => {
      console.log(`   - [Row #${f.index}] ID: "${f.identifier}" -> ${f.errors.join(', ')}`);
    });
  } else {
    console.log('   🎉 100% of records passed validation with zero errors!');
  }

  console.log('\n📑 Category Distribution:');
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   • ${cat.padEnd(28)}: ${count} stories`);
  });

  // Batch insert into Firestore if not dry-run
  if (isDryRun) {
    console.log('\n⚠️ DRY-RUN MODE: Skipping Firestore batch writes.');
  } else {
    await batchInsertStories(validStories, 50);
    console.log('\n🔄 Syncing local fallback seed file...');
    syncLocalSeedStories(validStories);
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n====================================================');
  console.log(`✅ MIGRATION COMPLETE in ${totalDuration}s`);
  console.log(`   Stories Ready & Live: ${validStories.length}`);
  console.log('====================================================\n');
}

// Execute
runMigration().catch(err => {
  console.error('\n❌ Unhandled Migration Error:', err);
  process.exit(1);
});
