const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '..', 'src', 'data', 'articles.json');
const raw = fs.readFileSync(articlesPath, 'utf8');
const articles = JSON.parse(raw);

console.log(`Total articles loaded: ${articles.length}`);

let fullContentCount = 0;
let shortContentCount = 0;
let missingContentCount = 0;
let validSummaryCount = 0;
let missingSummaryCount = 0;
let validTitleCount = 0;
let missingTitleCount = 0;
let validIdCount = 0;
let hasImageCount = 0;
let missingImageCount = 0;

const details = [];

articles.forEach((a, idx) => {
  const hasTitle = Boolean(a.title && a.title.trim().length > 0);
  if (hasTitle) validTitleCount++; else missingTitleCount++;

  const hasSummary = Boolean(a.summary && a.summary.trim().length > 0);
  if (hasSummary) validSummaryCount++; else missingSummaryCount++;

  const hasId = Boolean(a.id && a.id.trim().length > 0);
  if (hasId) validIdCount++;

  const content = a.content || '';
  const cleanContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;

  let contentStatus = 'full';
  if (!cleanContent) {
    contentStatus = 'missing';
    missingContentCount++;
  } else if (wordCount < 100) {
    contentStatus = 'short';
    shortContentCount++;
  } else {
    fullContentCount++;
  }

  const hasImage = Boolean(a.imageUrl && a.imageUrl.trim().length > 0);
  if (hasImage) hasImageCount++; else missingImageCount++;

  details.push({
    index: idx + 1,
    id: a.id,
    title: a.title,
    category: a.category,
    wordCount,
    contentStatus,
    hasSummary,
    hasImage,
    imageUrl: a.imageUrl || ''
  });
});

const report = {
  total: articles.length,
  validTitles: validTitleCount,
  missingTitles: missingTitleCount,
  validSummaries: validSummaryCount,
  missingSummaries: missingSummaryCount,
  contentStats: {
    fullContent: fullContentCount,
    shortContent: shortContentCount,
    missingContent: missingContentCount
  },
  imageStats: {
    hasImage: hasImageCount,
    missingImage: missingImageCount
  },
  details
};

fs.writeFileSync(path.join(__dirname, 'content_audit_results.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('Report generated successfully: content_audit_results.json');
