import { Story } from '@/types';

// Known broken/404 CDN assets identified during live audit
const KNOWN_BROKEN_PATTERNS = [
  '2025/11/Bihar-Say-Website-28.png',
  '2025/12/Bihar-Say-Website-65.png',
  '2025/12/Bihar-Say-Website-56.png',
  '2025/12/Bihar-Say-Website-54.png',
  '2025/12/Bihar-Say-Website-53.png',
  '2025/12/Bihar-Say-Website-51.png',
  '2025/11/Bihar-Say-Website-46.png',
  '2025/11/Bihar-Say-Website-45.png',
  '2025/11/Bihar-Say-Website-39.png',
  '2025/11/Bihar-Say-Website-38.png',
  '2025/11/Bihar-Say-Website-36.png',
  '2025/11/Bihar-Say-Website-31.png',
  '2025/11/Bihar-Say-Website-29.png',
  '2025/11/Bihar-Say-Website-22.png',
  '2025/11/Bihar-Say-Website-20.png',
  '2025/11/Bihar-Say-Website-18-1.png',
  '2025/11/Bihar-Say-Website-17.png',
  '2025/10/Bihar-Say-Website-14.png',
  '2025/10/Bihar-Say-Website-10.png',
  '2025/10/Bihar-Say-Website-9.png',
  '2025/10/Bihar-Say-Website-77.png',
  '2025/10/Bihar-Say-Website-2.png',
];

/**
 * Checks whether an article possesses a valid, loadable, non-placeholder image.
 * Returns false if:
 * - image field is null or undefined
 * - image field is empty
 * - image URL is missing
 * - image URL is invalid or broken
 * - image is a placeholder / generic box
 */
export function hasValidImage(article?: Partial<Story> | null): boolean {
  if (!article) return false;

  // Exclude cards with no image content or mismatched image
  if (
    article.id === '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar' ||
    article.id === 'aiims-patna-hosts-breast-cancer-awareness-program-2025' ||
    article.id === 'bihar-womans-memoir-becomes-lesson-in-kerala-textbook' ||
    article.id === 'meet-the-man-behind-indias-first-transgender-police-officer' ||
    article.id === 'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud' ||
    article.id === 'patna-to-host-annual-film-festival-celebrating-regional-talent' ||
    article.id === 'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
  ) {
    return false;
  }

  if (!article.imageUrl) return false;

  const url = String(article.imageUrl).trim();
  if (!url || url === 'no_url' || url === 'null' || url === 'undefined' || url === '""') {
    return false;
  }

  // Reject generic placeholders or default images
  const lower = url.toLowerCase();
  if (
    lower.includes('placeholder') ||
    lower.includes('default-image') ||
    lower.includes('no-image') ||
    lower.includes('fallback')
  ) {
    return false;
  }

  // Local /legacy-images/ paths or remote images are supported
  // Reject known 404 CDN files
  for (const pattern of KNOWN_BROKEN_PATTERNS) {
    if (url.includes(pattern)) {
      return false;
    }
  }

  return true;
}
