import {
  collection,
  doc,
  limit as firestoreLimit,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { INITIAL_STORIES } from '@/data/seedStories';
import { Story, StorySubmission, CategorySlug, StoryComment, StoryReactions } from '@/types';

const STORIES_COLLECTION = 'stories';
const SUBMISSIONS_COLLECTION = 'submissions';
const BOOKMARKS_COLLECTION = 'bookmarks';
const COMMENTS_COLLECTION = 'comments';
const REACTIONS_COLLECTION = 'story_reactions';

// In-memory fallback for user submissions when running offline/demo
let localSubmissions: StorySubmission[] = [];
let localComments: StoryComment[] = [];
let localReactions: Record<string, { likesCount: number; likedBy: string[] }> = {};

const BROKEN_IMG_MAP: Record<string, string> = {
  'photo-1523050854058-8df90110c9f1': '/legacy-images/Bihar-Say-Website-3.png',
  'photo-1508098682722-e99c43a406b2': '/legacy-images/Bihar-Say-Website-81.png',
  'photo-1486406146926-c627a92ad1ab': '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg',
  'shahi-litchi-solar-cold-storage': '/legacy-images/shahi-litchi-muzaffarpur.jpg',
};

// Set of genuine authentic local images physically stored in public/legacy-images/
export const AUTHENTIC_LOCAL_IMAGES = new Set<string>([
  '/legacy-images/Bihar-Say-Website.png',
  '/legacy-images/Bihar-Say-Website-84.png',
  '/legacy-images/Bihar-Say-Website-82.png',
  '/legacy-images/Bihar-Say-Website-81.png',
  '/legacy-images/Bihar-Say-Website-80.png',
  '/legacy-images/Bihar-Say-Website-79.png',
  '/legacy-images/Bihar-Say-Website-78.png',
  '/legacy-images/Bihar-Say-Website-77.png',
  '/legacy-images/Bihar-Say-Website-75.png',
  '/legacy-images/Bihar-Say-Website-74.png',
  '/legacy-images/Bihar-Say-Website-73.png',
  '/legacy-images/Bihar-Say-Website-72.png',
  '/legacy-images/Bihar-Say-Website-71.png',
  '/legacy-images/Bihar-Say-Website-70.png',
  '/legacy-images/Bihar-Say-Website-69.png',
  '/legacy-images/Bihar-Say-Website-68.png',
  '/legacy-images/Bihar-Say-Website-67.png',
  '/legacy-images/Bihar-Say-Website-66.png',
  '/legacy-images/Bihar-Say-Website-8.png',
  '/legacy-images/Bihar-Say-Website-7.png',
  '/legacy-images/Bihar-Say-Website-6.png',
  '/legacy-images/Bihar-Say-Website-4.png',
  '/legacy-images/Bihar-Say-Website-3.png',
  '/legacy-images/Bihar-Say-Website-2.png',
  '/legacy-images/Bihar-Say-Website-1.png',
  '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg',
  '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg',
  '/legacy-images/hero-asia-hockey-cup-2025-rajgir.jpg',
  '/legacy-images/bcci-central-contract-2025-bihar.png',
  '/sports_images/bcci-central-contract-2025-bihar.png',
  '/legacy-images/bihar-coach-leads-india-3-medals-international-karate-championship.png',
  '/sports_images/bihar-coach-leads-india-3-medals-international-karate-championship.png',
  '/legacy-images/vaibhav-suryavanshi-youngest-ipl-star-bihar.png',
  '/sports_images/vaibhav-suryavanshi-youngest-ipl-star-bihar.png',
  '/legacy-images/sepaktakraw-takes-over-bihar.png',
  '/sports_images/sepaktakraw-takes-over-bihar.png',
  '/legacy-images/rajgir-to-host-womens-kabaddi-world-cup-2025.png',
  '/sports_images/rajgir-to-host-womens-kabaddi-world-cup-2025.png',
]);

// Canonical image mapping from authentic locally hosted legacy media
const CANONICAL_IMAGE_MAP: Record<string, string> = {};
const TITLE_IMAGE_MAP: Record<string, string> = {};

// Prototype & standalone stories image mapping
const PROTOTYPE_IMAGE_MAP: Record<string, string> = {
  'bihar-gov-dbt-flood-relief': '/legacy-images/Bihar-Say-Website-80.png',
  'bihar-ai-growth-2026-gcc-policy': '/legacy-images/Bihar-Say-Website-75.png',
  'bihar-makhana-boom-migration': '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg',
  '17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame': '/legacy-images/Bihar-Say-Website-2025-05-30T142446.563.png',
  'hero-asia-hockey-cup-2025-begins-in-rajgir-from-today': '/legacy-images/hero-asia-hockey-cup-2025-rajgir.jpg',
  'bcci-central-contract-2025-bihars-ishan-kishan-mukesh-kumar-akash-deep-included': '/legacy-images/bcci-central-contract-2025-bihar.png',
  'bcci-central-contract-2025': '/legacy-images/bcci-central-contract-2025-bihar.png',
  'bihar-coach-leads-india-to-3-medals-at-international-karate-championship': '/legacy-images/bihar-coach-leads-india-3-medals-international-karate-championship.png',
  'bihar-coach-leads-india-3-medals-international-karate-championship': '/legacy-images/bihar-coach-leads-india-3-medals-international-karate-championship.png',
  'vaibhav-suryavanshi-youngest-ipl-star-bihar-fastest-century': '/legacy-images/vaibhav-suryavanshi-youngest-ipl-star-bihar.png',
  'vaibhav-suryavanshi': '/legacy-images/vaibhav-suryavanshi-youngest-ipl-star-bihar.png',
  'sepaktakraw-takes-over-bihar-growth-success-future-opportunities': '/legacy-images/sepaktakraw-takes-over-bihar.png',
  'sepaktakraw-takes-over-bihar': '/legacy-images/sepaktakraw-takes-over-bihar.png',
  'rajgir-to-host-womens-kabaddi-world-cup-2025': '/legacy-images/rajgir-to-host-womens-kabaddi-world-cup-2025.png',
  'rajgir-to-host-womens-kabaddi-world-cup': '/legacy-images/rajgir-to-host-womens-kabaddi-world-cup-2025.png',
};

function normalizeTitle(title: string): string {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Canonical story object map for full content resolution
const CANONICAL_STORY_MAP: Record<string, Story> = {};

INITIAL_STORIES.forEach(s => {
  if (s.imageUrl && AUTHENTIC_LOCAL_IMAGES.has(s.imageUrl)) {
    if (s.id) CANONICAL_IMAGE_MAP[s.id] = s.imageUrl;
    if (s.legacyId) CANONICAL_IMAGE_MAP[String(s.legacyId)] = s.imageUrl;
    if (s.title) TITLE_IMAGE_MAP[normalizeTitle(s.title)] = s.imageUrl;
  }
  if (s.id) CANONICAL_STORY_MAP[s.id] = s;
  if (s.legacyId) CANONICAL_STORY_MAP[String(s.legacyId)] = s;
  if (s.title) CANONICAL_STORY_MAP[normalizeTitle(s.title)] = s;
});

// Explicit excluded stories (cards with no image content or mismatched image)
export const EXCLUDED_STORY_IDS = new Set<string>([
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive',
  '%e2%82%b9686-cr-boost-for-bihars-youth-artists-from-internships-to-guru-shishya-yojana',
  '₹686-cr-boost-for-bihars-youth-artists-from-internships-to-guru-shishya-yojana',
  '686-cr-boost-for-bihars-youth-artists-from-internships-to-guru-shishya-yojana',
]);

// Explicit alias map from short prototype slugs to their canonical full articles
export const ALIAS_TO_CANONICAL_ID: Record<string, string> = {
  'india-nepal-jaynagar-immigration-post': 'india-nepal-travel-is-about-to-get-easier-jaynagar-set-to-get-a-new-immigration-post',
  '59000-crore-heading-to-bihar': '%e2%82%b959000-crore-is-heading-to-bihar-and-that-may-not-be-the-biggest-story',
  'nepal-floods-pilgrims-bihar': 'when-nepal-floods-trapped-106-pilgrims-bihar-became-their-way-home-%e2%9d%a4%ef%b8%8f%f0%9f%87%ae%f0%9f%87%b3',
  'jk-cement-buxar-plant': 'jk-cement-crosses-31-mta-with-new-buxar-plant-in-bihar',
  'bihar-gov-dbt-flood-relief': 'bihar-gov-transfers-%e2%82%b9113-crore-to-flood-affected-farmers-via-dbt',
  'bihar-board-10th-result-2026': 'bihar-board-10th-result-2026-declared',
  'bihar-deled-admission-2026': 'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details',
  'wheat-procurement-bihar-2026': 'wheat-procurement-in-bihar-2026-begins-april-1',
  'munger-cleanest-air-aqi-2026': 'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'munger-records-indias-cleanest-air': 'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'bihar-declared-naxal-free': 'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger',
  'bpsc-tre-1-teachers-salary-hike': 'bpsc-tre-1-teachers-get-salary-hike',
  'patna-womens-college-golden-jubilee': 'patna-womens-college-hosts-golden-jubilee-reunion',
  'singhada-superfood-immunity': 'singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy',
  'sonpur-mela-special-trains': 'sonpur-mela-2025-special-trains-full-list-timings-travel-guide',
  'patna-high-tech-stadium': 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium',
  'patna-to-get-high-tech-21-crore-indoor-stadium': 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium',
  'prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects': 'prime-group-to-invest-%e2%82%b91500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects',
  'bihar-makhana-boom-migration': 'bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate',
  'bihar-ai-growth-2026-gcc-policy': 'bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi',
  // Hindi LPG article aliases (Unicode, with/without anusvara, and romanized)
  'बिहार-में-एलपीजी-संकट-नहीं': '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'बिहार-में-एलपीजी-संकट-नही': '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-lpg-crisis-not-true': '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-lpg-sankat-nahi': '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  // Sportstar Aces Awards aliases
  'sportstar-aces-awards-2026': 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  'sportstar-aces-awards-2026-खेलों-के-प्रचार-में-बिहार-को-मिला-best-state-का-सम्मान': 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  'sportstar-aces-awards-2026-खेलों-के-प्रचार-में-बि': 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  'sportstar-aces-awards-2026-best-state-sports-promotion': 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  'bcci-central-contract-2025': 'bcci-central-contract-2025-bihars-ishan-kishan-mukesh-kumar-akash-deep-included',
  'bcci-central-contract-2025-bihar': 'bcci-central-contract-2025-bihars-ishan-kishan-mukesh-kumar-akash-deep-included',
  'bcci-central-contract-2025-bihars-ishan-kishan-mukesh-kumar-akash-deep-included': 'bcci-central-contract-2025-bihars-ishan-kishan-mukesh-kumar-akash-deep-included',
  'bihar-coach-leads-india-3-medals-international-karate-championship': 'bihar-coach-leads-india-to-3-medals-at-international-karate-championship',
  'bihar-coach-leads-india-to-3-medals-at-international-karate-championship': 'bihar-coach-leads-india-to-3-medals-at-international-karate-championship',
  'vaibhav-suryavanshi': 'vaibhav-suryavanshi-youngest-ipl-star-bihar-fastest-century',
  'vaibhav-suryavanshi-youngest-ipl-star-bihar-fastest-century': 'vaibhav-suryavanshi-youngest-ipl-star-bihar-fastest-century',
};

// Rich editorial content for standalone prototype stories
export const PROTOTYPE_CONTENT_MAP: Record<string, { title?: string; summary?: string; content: string; readTime?: string }> = {
  '17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame': {
    title: "17-Year-Old Ethical Hacker from Bihar Enters NASA's Hall of Fame",
    summary: "“Ek Bihari, NASA Pe Bhaari!” – Meet the 17-Year-Old from Samastipur Who Entered NASA’s Cybersecurity Hall of Fame.",
    readTime: '3 min read',
    content: `<p><strong>“Ek Bihari, NASA Pe Bhaari!” – Meet the 17-Year-Old from Samastipur Who Entered NASA’s Cybersecurity Hall of Fame</strong></p>
<hr />
<h2>From Gaming Curiosity to Global Cyber Fame</h2>
<p>What happens when a child’s love for video games turns into a mission to secure the internet?</p>
<p>Ram Jee Raj, a 17-year-old from Samastipur, Bihar, has taken the global tech world by storm. The self-taught ethical hacker recently entered the <strong>NASA Hackers’ Hall of Fame</strong> after uncovering a major vulnerability on NASA’s official website.</p>
<p>Ram’s story began like many childhoods in India—with games. However, unlike others, he looked behind the screen: <em>“What makes a game run?”</em> he wondered.</p>
<p>This simple question launched him into the world of coding, game development, and web design. Eventually, he stumbled across hacking-related films. That curiosity soon grew into a passion for ethical hacking—all self-taught from his small town.</p>
<p>By the age of 11, Ram was already writing code. He began scanning websites for flaws and responsibly reporting them. Over the years, he has quietly contributed to the digital safety of hundreds of platforms, all without formal education in cybersecurity.</p>
<hr />
<h2>The Email That Shook NASA</h2>
<p>In the early hours of <strong>May 14, 2024</strong>, Ram emailed NASA with a report about a critical flaw on their website.</p>
<p>Within just five days, on <strong>May 19</strong>, the agency confirmed the vulnerability, resolved it, and officially acknowledged Ram’s findings.</p>
<p>Just like that, a teenager from a lesser-known town in Bihar earned a spot in one of the world’s most prestigious security circles: 🚀 <strong>The NASA Cyber Security Hall of Fame</strong>.</p>
<p>The son of Rinkesh Kumar, Ram represents a powerful truth—you don’t need a Silicon Valley zip code to be a world-class tech innovator.</p>
<hr />
<h2>AI Dreams Rooted in Real Problems</h2>
<p>Ram is not stopping at hacking. In fact, he’s already ventured into AI-driven innovation. He has built platforms like:</p>
<ul>
  <li><strong>MedVed AI:</strong> To assist in affordable healthcare</li>
  <li><strong>FarmEye:</strong> To enhance smart agriculture</li>
  <li><strong>YUVA Sathi:</strong> To empower rural youth with digital education</li>
</ul>
<p>These projects have earned him national and global recognition, including listings in the <strong>USA Book of World Records</strong> and multiple innovation awards.</p>
<p>Currently, he’s developing an AI-based startup to revolutionize farming. <em>“My aim is simple,”</em> he says. <em>“If one farmer can take care of five cows today, I want to help him manage five hundred—with tech.”</em></p>
<hr />
<h2>Bihar’s Youth Are Not Behind — They Just Need the Mic</h2>
<p>Stories like Ram’s rarely make national headlines, even though they deserve attention. They speak volumes about how youth from Bihar are rising, not just in academics, but in cutting-edge fields like cybersecurity, AI, and tech innovation.</p>
<p>In fact, Ram’s journey is a reminder that Bihar doesn’t lack talent — it only needs platforms that spotlight it.</p>
<p>That’s exactly what we do at <strong>Bihar Say</strong>. We tell stories that matter. Not because they’re viral, but because they’re real, raw, and rooted in change.</p>
<hr />
<h2>📢 Be Part of Bihar’s Growth Story</h2>
<p>👉 Want to stay updated on such untold achievements from Bihar and beyond? Follow <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> — Bihar’s leading apolitical digital platform for news, stories, and culture.</p>
<p>Join our <strong>15K+ global community</strong> across the globe and be a part of the new narrative.</p>`
  },
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details': {
    title: 'Bihar DElEd Admission 2026: 20 Aug Merit List, Dates & Admission Details',
    summary: 'The wait is finally over for thousands of aspiring teachers in Bihar. The Bihar School Examination Board (BSEB) has officially started the D.El.Ed admission process and released the counseling schedule and merit list dates.',
    readTime: '4 min read',
    content: `<p><strong>Bihar DElEd Admission 2026: Application Begins, First Merit List on August 20 – Check Full Counselling Schedule</strong></p>
<hr />
<h2>Online Application Process Begins</h2>
<p>The <strong>Bihar School Examination Board (BSEB)</strong> has officially activated the counselling and admission process for successful candidates.</p>
<p>Applicants must complete the online process to apply for admission to recognised D.El.Ed training institutes across Bihar.</p>
<p>First, candidates need to visit the official portal. Then, they must fill in their personal and academic details carefully. After that, they need to pay the required application fee online.</p>
<p>In addition, candidates must select their preferred institutes. These choices will play a key role in the final seat allotment process.</p>
<hr />
<h2>Direct Bihar DElEd Counselling Application Link</h2>
<p>Candidates who have qualified for the entrance examination can complete the counselling process through the official D.El.Ed portal.</p>
<p>👉 <strong><a href="https://bsebdeled.com/" target="_blank" rel="noopener">Click Here to Apply for Bihar DElEd Counselling 2026</a></strong></p>
<p>The application window remains open until <strong>August 16, 2026</strong>. Candidates should complete registration, fee payment, and college choice filling before the deadline.</p>
<p><em>Important: Always verify the official portal before entering login details or personal information.</em></p>
<hr />
<h2>How Will Selection Be Done?</h2>
<p>BSEB will prepare the merit list based on two key factors:</p>
<ul>
  <li>Marks obtained in the D.El.Ed entrance examination</li>
  <li>College and institute preferences filled by candidates</li>
</ul>
<p>Therefore, choice filling is not just a formality. It can directly affect your admission and seat allotment. Candidates should select their preferences carefully and double-check every detail before submitting.</p>
<hr />
<h2>Key Counselling &amp; Merit List Dates</h2>
<ul>
  <li><strong>August 16, 2026:</strong> Last date to complete online application and choice filling</li>
  <li><strong>August 20, 2026:</strong> Publication of First Merit List</li>
  <li><strong>August 20–24, 2026:</strong> Admission window for candidates shortlisted in First List</li>
  <li><strong>August 25, 2026:</strong> Vacancy and seat update by training institutes</li>
  <li><strong>August 29, 2026:</strong> Publication of Second Merit List</li>
  <li><strong>August 29–September 1, 2026:</strong> Admission window for Second Merit List</li>
  <li><strong>September 5, 2026:</strong> Publication of Third Merit List</li>
  <li><strong>September 5–7, 2026:</strong> Admission window for Third Merit List</li>
</ul>
<hr />
<h2>Stay Updated with Bihar Education News</h2>
<p>For the latest updates on education, careers, admissions, and important developments in Bihar, follow <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> — Bihar’s leading apolitical digital platform for news, stories, and culture.</p>
<p>Join our <strong>15K+ global community</strong> across the globe and stay connected with Bihar’s growth story.</p>`
  },
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update': {
    title: "Munger Records India's Cleanest Air: Bihar AQI 2026 Update",
    summary: "In a surprising yet inspiring shift, Munger has secured the top spot for the cleanest air in India, recording an enviable AQI score of 29 in the 'Good' green zone.",
    readTime: '4 min read',
    content: `<p><strong>“From Pollution to Purity: Munger Emerges as India’s Cleanest Air City with AQI 29”</strong></p>
<hr />
<h2>When Bihar Breathes Better Than the Nation</h2>
<p>What if the cleanest air in India came from Bihar? Yes, you read that right.</p>
<p>In a surprising yet inspiring shift, <strong>Munger</strong> has secured the top spot for the cleanest air in India, recording an exceptional <strong>AQI of 29</strong>, according to the Central Pollution Control Board (CPCB).</p>
<p>Not only does this mark a proud moment for Bihar, but it also challenges long-held perceptions about pollution in the state.</p>
<hr />
<h2>How Munger Outperformed the Entire Nation</h2>
<p>Interestingly, Munger didn’t just perform well—it outshined major cities across India. It surpassed cities like Srinagar (AQI 35) and other clean-air performers such as Nagaon, Madikeri, and Maihar (AQI 37).</p>
<p>Moreover, two more Bihar cities joined the clean air league:</p>
<ul>
  <li><strong>Rajgir</strong> – AQI 43</li>
  <li><strong>Kishanganj</strong> – AQI 50</li>
</ul>
<p>All these cities fall under the <strong>‘Good’ AQI category</strong>, which means minimal pollution and healthier living conditions. Clearly, Bihar is rewriting its environmental narrative.</p>
<hr />
<h2>The Science Behind This Clean Air Moment</h2>
<p>According to experts and the Bihar State Pollution Control Board, favorable weather played a key role:</p>
<ul>
  <li>Strong wind speeds helped disperse atmospheric pollutants rapidly.</li>
  <li>Recent localized rainfall settled dust particles effectively.</li>
  <li>Strict industrial emission controls along the riverfront helped maintain pure air quality.</li>
</ul>
<p>Meteorologists predict that these favorable atmospheric conditions will continue to benefit the region.</p>
<hr />
<h2>Patna Shows Improvement, But Challenges Remain</h2>
<p>Meanwhile, Patna showed noticeable improvement. Its AQI dropped from 137 to 101, moving from ‘poor’ to ‘moderate’. However, variations across urban sectors remain significant:</p>
<ul>
  <li><strong>Khagaul (DRM Office):</strong> 96</li>
  <li><strong>Rajbanshi Nagar:</strong> 61</li>
  <li><strong>Patna City:</strong> 110</li>
  <li><strong>Muradpur:</strong> 114</li>
  <li><strong>Samanpura:</strong> 125</li>
</ul>
<p>Across Bihar, cities like Sasaram, Motihari, Bettiah, Araria, and Katihar recorded AQI levels between 52 and 58, comfortably within the ‘satisfactory’ category.</p>
<hr />
<h2>Bihar Is Changing — And This Is Just the Beginning</h2>
<p>Moments like these are not just data points—they are signals of transformation. Bihar is no longer just battling pollution headlines; instead, it is creating environmental success stories that deserve national attention.</p>
<p>👉 Follow <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> for more powerful updates and become part of our <strong>15K+ global community</strong> celebrating Bihar’s rise.</p>`
  },
  'bihar-board-10th-result-2026-declared': {
    title: 'Bihar Board 10th Result 2026 Declared',
    summary: 'The wait is finally over for over 15 lakh students across Bihar. The Bihar School Examination Board (BSEB) has officially declared the Class 10 (Matric) Result 2026 with students checking scores online.',
    readTime: '3 min read',
    content: `<p><strong>Bihar Board 10th Result 2026 OUT: 15 Lakh Dreams Unlocked Today—Check Your Score Now!</strong></p>
<hr />
<h2>The Moment Bihar Was Waiting For</h2>
<p>The wait is finally over. Today, lakhs of students across Bihar woke up to a life-changing announcement.</p>
<p>The Bihar School Examination Board (BSEB) has officially declared the <strong>Class 10 (Matric) Result 2026</strong>. And instantly, emotions are running high—from joy and relief to anticipation about what comes next.</p>
<p>At exactly <strong>1:15 PM</strong>, the board released the results online. Now, students can quickly check their scores through official portals.</p>
<hr />
<h2>Where to Check Bihar Board 10th Result 2026</h2>
<p>To make things simple, here are the official websites:</p>
<ul>
  <li><strong>result.biharboardonline.org</strong></li>
  <li><strong>matricbiharboard.com</strong></li>
</ul>
<p>Additionally, students can also access results through the education portal of Indian Express.</p>
<p>👉 <em>Use your roll number and roll code to log in and download your scorecard.</em></p>
<hr />
<h2>Massive Participation, Bigger Aspirations</h2>
<p>This year, the scale was massive:</p>
<ul>
  <li><strong>Total students:</strong> 15,12,687</li>
  <li><strong>Girls:</strong> 7,85,722</li>
  <li><strong>Boys:</strong> 7,26,961</li>
  <li><strong>Exam centres:</strong> 1,699 across Bihar</li>
</ul>
<p>Behind every roll number is a story—sleepless nights, family sacrifices, and big dreams. Today, those efforts found their answers.</p>
<hr />
<h2>What to Do After Checking Your Result?</h2>
<ul>
  <li><strong>Download and save your mark sheet:</strong> Keep digital and physical copies safe for future admissions.</li>
  <li><strong>Check every detail carefully:</strong> Verify your name, roll code, subject-wise marks, and division.</li>
  <li><strong>Stay calm, no matter the score:</strong> A scorecard is a milestone, not the finish line. Whatever your result, new doors are waiting to open.</li>
</ul>
<hr />
<h2>📢 Follow Bihar Say for Inspiring Stories</h2>
<p>Behind these results are thousands of inspiring stories of resilience from every corner of Bihar. At <strong>Bihar Say</strong>, we celebrate the spirit, talent, and achievements shaping the future of our state.</p>
<p>👉 Follow <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> and join our <strong>15K+ community worldwide</strong> staying connected with Bihar’s growth story.</p>`
  },
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80': {
    title: 'बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील',
    summary: 'मुख्य सचिव प्रत्यय अमृत की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि राज्य में घरेलू एलपीजी, पीएनजी, पेट्रोल और डीजल का पर्याप्त भंडार उपलब्ध है। अफवाहों पर ध्यान न दें।',
    readTime: '3 min read',
    content: `<p><strong>बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील — राज्य में घरेलू गैस और ईंधन का पर्याप्त भंडार मौजूद</strong></p>
<hr />
<h2>अफवाहों पर ध्यान न दें: सरकार ने स्थिति साफ की</h2>
<p>अफवाहें अक्सर डर और भ्रम पैदा करती हैं। लेकिन इस बार बिहार सरकार ने समय रहते स्थिति साफ कर दी।</p>
<p>मुख्य सचिव <strong>प्रत्यय अमृत</strong> की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि <strong>एलपीजी, पीएनजी, पेट्रोल और डीजल की राज्य में कोई कमी नहीं है</strong>।</p>
<p>यह महत्वपूर्ण बैठक पटना में आयोजित हुई, जिसमें तेल और गैस कंपनियों के वरिष्ठ प्रतिनिधि शामिल हुए। वहीं, पूरे बिहार के जिलाधिकारी (DM) और पुलिस अधीक्षक (SP) वीडियो कॉन्फ्रेंसिंग से जुड़े।</p>
<p>सरकार ने जनता से साफ अपील की है: <em>अफवाहों पर ध्यान न दें और अनावश्यक रूप से गैस या ईंधन का भंडारण न करें।</em></p>
<hr />
<h2>तेल कंपनियों ने दिया पर्याप्त आपूर्ति का भरोसा</h2>
<p>बैठक में इंडियन ऑयल कॉर्पोरेशन (IOCL) सहित प्रमुख तेल कंपनियों ने सरकार को आपूर्ति की विस्तृत जानकारी दी। कंपनी के कार्यकारी निदेशक अनुप कुमार सामंतराय ने बताया कि राज्य में ईंधन और गैस का पर्याप्त भंडार मौजूद है।</p>
<p>बिहार की कुल गैस आपूर्ति का लगभग <strong>98.5% हिस्सा घरेलू सिलेंडरों के लिए सुरक्षित</strong> है। इसलिए सरकार घरेलू उपभोक्ताओं को सर्वोच्च प्राथमिकता दे रही है। एहतियात के तौर पर केवल कमर्शियल गैस की आपूर्ति सीमित की गई है, जबकि अस्पतालों और शैक्षणिक संस्थानों को पूरी छूट दी गई है।</p>
<hr />
<h2>कालाबाजारी पर सख्त कानूनी कार्रवाई</h2>
<p>राज्य सरकार ने अवैध गतिविधियों पर कड़ा रुख अपनाया है। मुख्य सचिव ने सभी जिलाधिकारियों और पुलिस अधीक्षकों को सख्त निर्देश दिए हैं:</p>
<ul>
  <li>घरेलू गैस सिलेंडर की कालाबाजारी और अवैध भंडारण पर तुरंत छापेमारी कर कानूनी कार्रवाई की जाए।</li>
  <li>गैस एजेंसियों और गोदामों की नियमित जांच सुनिश्चित की जाए।</li>
  <li>अनियमितता पाए जाने पर संबंधित एजेंसियों के लाइसेंस तत्काल निलंबित किए जाएं।</li>
</ul>
<hr />
<h2>हर जिले में कंट्रोल रूम और दैनिक प्रेस ब्रीफिंग</h2>
<p>जनता तक सही जानकारी पहुंचाने के लिए सरकार ने विशेष कदम उठाए हैं:</p>
<ul>
  <li>हर जिले में विशेष कंट्रोल रूम स्थापित किए गए हैं जहां उपभोक्ताओं की शिकायतों का त्वरित समाधान होगा।</li>
  <li>सभी जिलों के आधिकारिक सोशल मीडिया पेजों पर नियमित स्थिति अपडेट जारी किए जा रहे हैं।</li>
  <li>प्रतिदिन दोपहर 3 बजे जिला जनसंपर्क पदाधिकारी और एडीएम (सप्लाई) प्रेस कॉन्फ्रेंस आयोजित कर वास्तविक स्थिति से अवगत करा रहे हैं।</li>
</ul>
<hr />
<h2>📢 बिहार से जुड़ी सकारात्मक खबरों के लिए बिहार से जुड़ें</h2>
<p>👉 बिहार की ऐसी ही प्रामाणिक और महत्वपूर्ण खबरों के लिए <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> को फॉलो करें।</p>
<p>और बनिए <strong>15,000+ वैश्विक समुदाय</strong> का हिस्सा, जो बिहार की बदलती तस्वीर को दुनिया तक पहुंचा रहा है।</p>`
  },
  'बिहार-में-एलपीजी-संकट-नहीं': {
    title: 'बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील',
    summary: 'मुख्य सचिव प्रत्यय अमृत की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि राज्य में घरेलू एलपीजी, पीएनजी, पेट्रोल और डीजल का पर्याप्त भंडार उपलब्ध है। अफवाहों पर ध्यान न दें।',
    readTime: '3 min read',
    content: `<p><strong>बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील — राज्य में घरेलू गैस और ईंधन का पर्याप्त भंडार मौजूद</strong></p>
<hr />
<h2>अफवाहों पर ध्यान न दें: सरकार ने स्थिति साफ की</h2>
<p>अफवाहें अक्सर डर और भ्रम पैदा करती हैं। लेकिन इस बार बिहार सरकार ने समय रहते स्थिति साफ कर दी।</p>
<p>मुख्य सचिव <strong>प्रत्यय अमृत</strong> की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि <strong>एलपीजी, पीएनजी, पेट्रोल और डीजल की राज्य में कोई कमी नहीं है</strong>।</p>
<p>यह महत्वपूर्ण बैठक पटना में आयोजित हुई, जिसमें तेल और गैस कंपनियों के वरिष्ठ प्रतिनिधि शामिल हुए। वहीं, पूरे बिहार के जिलाधिकारी (DM) और पुलिस अधीक्षक (SP) वीडियो कॉन्फ्रेंसिंग से जुड़े।</p>
<p>सरकार ने जनता से साफ अपील की है: <em>अफवाहों पर ध्यान न दें और अनावश्यक रूप से गैस या ईंधन का भंडारण न करें।</em></p>
<hr />
<h2>तेल कंपनियों ने दिया पर्याप्त आपूर्ति का भरोसा</h2>
<p>बैठक में इंडियन ऑयल कॉर्पोरेशन (IOCL) सहित प्रमुख तेल कंपनियों ने सरकार को आपूर्ति की विस्तृत जानकारी दी। कंपनी के कार्यकारी निदेशक अनुप कुमार सामंतराय ने बताया कि राज्य में ईंधन और गैस का पर्याप्त भंडार मौजूद है।</p>
<p>बिहार की कुल गैस आपूर्ति का लगभग <strong>98.5% हिस्सा घरेलू सिलेंडरों के लिए सुरक्षित</strong> है। इसलिए सरकार घरेलू उपभोक्ताओं को सर्वोच्च प्राथमिकता दे रही है। एहतियात के तौर पर केवल कमर्शियल गैस की आपूर्ति सीमित की गई है, जबकि अस्पतालों और शैक्षणिक संस्थानों को पूरी छूट दी गई है।</p>
<hr />
<h2>कालाबाजारी पर सख्त कानूनी कार्रवाई</h2>
<p>राज्य सरकार ने अवैध गतिविधियों पर कड़ा रुख अपनाया है। मुख्य सचिव ने सभी जिलाधिकारियों और पुलिस अधीक्षकों को सख्त निर्देश दिए हैं:</p>
<ul>
  <li>घरेलू गैस सिलेंडर की कालाबाजारी और अवैध भंडारण पर तुरंत छापेमारी कर कानूनी कार्रवाई की जाए।</li>
  <li>गैस एजेंसियों और गोदामों की नियमित जांच सुनिश्चित की जाए।</li>
  <li>अनियमितता पाए जाने पर संबंधित एजेंसियों के लाइसेंस तत्काल निलंबित किए जाएं।</li>
</ul>
<hr />
<h2>हर जिले में कंट्रोल रूम और दैनिक प्रेस ब्रीफिंग</h2>
<p>जनता तक सही जानकारी पहुंचाने के लिए सरकार ने विशेष कदम उठाए हैं:</p>
<ul>
  <li>हर जिले में विशेष कंट्रोल रूम स्थापित किए गए हैं जहां उपभोक्ताओं की शिकायतों का त्वरित समाधान होगा।</li>
  <li>सभी जिलों के आधिकारिक सोशल मीडिया पेजों पर नियमित स्थिति अपडेट जारी किए जा रहे हैं।</li>
  <li>प्रतिदिन दोपहर 3 बजे जिला जनसंपर्क पदाधिकारी और एडीएम (सप्लाई) प्रेस कॉन्फ्रेंस आयोजित कर वास्तविक स्थिति से अवगत करा रहे हैं।</li>
</ul>
<hr />
<h2>📢 बिहार से जुड़ी सकारात्मक खबरों के लिए बिहार से जुड़ें</h2>
<p>👉 बिहार की ऐसी ही प्रामाणिक और महत्वपूर्ण खबरों के लिए <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> को फॉलो करें।</p>
<p>और बनिए <strong>15,000+ वैश्विक समुदाय</strong> का हिस्सा, जो बिहार की बदलती तस्वीर को दुनिया तक पहुंचा रहा है।</p>`
  },
  'बिहार-में-एलपीजी-संकट-नही': {
    title: 'बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील',
    summary: 'मुख्य सचिव प्रत्यय अमृत की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि राज्य में घरेलू एलपीजी, पीएनजी, पेट्रोल और डीजल का पर्याप्त भंडार उपलब्ध है। अफवाहों पर ध्यान न दें।',
    readTime: '3 min read',
    content: `<p><strong>बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील — राज्य में घरेलू गैस और ईंधन का पर्याप्त भंडार मौजूद</strong></p>
<hr />
<h2>अफवाहों पर ध्यान न दें: सरकार ने स्थिति साफ की</h2>
<p>अफवाहें अक्सर डर और भ्रम पैदा करती हैं। लेकिन इस बार बिहार सरकार ने समय रहते स्थिति साफ कर दी।</p>
<p>मुख्य सचिव <strong>प्रत्यय अमृत</strong> की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि <strong>एलपीजी, पीएनजी, पेट्रोल और डीजल की राज्य में कोई कमी नहीं है</strong>।</p>
<hr />
<h2>तेल कंपनियों ने दिया पर्याप्त आपूर्ति का भरोसा</h2>
<p>बैठक में इंडियन ऑयल कॉर्पोरेशन (IOCL) सहित प्रमुख तेल कंपनियों ने सरकार को आपूर्ति की विस्तृत जानकारी दी। कंपनी के कार्यकारी निदेशक अनुप कुमार सामंतराय ने बताया कि राज्य में ईंधन और गैस का पर्याप्त भंडार मौजूद है।</p>
<hr />
<h2>कालाबाजारी पर सख्त कानूनी कार्रवाई</h2>
<p>घरेलू गैस सिलेंडर की कालाबाजारी और अवैध भंडारण पर तुरंत छापेमारी कर कानूनी कार्रवाई की जाएगी।</p>`
  },
  'sportstar-aces-awards-2026': {
    title: 'Sportstar Aces Awards 2026: खेलों के प्रचार में बिहार को मिला Best State का सम्मान',
    summary: 'प्रतिष्ठित Sportstar Aces Awards 2026 में बिहार को खेलों के सर्वांगीण विकास और प्रोत्साहन के लिए “Best State for Promotion of Sports” का राष्ट्रीय सम्मान प्राप्त हुआ है।',
    readTime: '5 min read',
    content: `<p><strong>खेलों में बिहार का बड़ा सम्मान: Sportstar Aces Awards 2026 में मिला “Best State for Promotion of Sports” अवॉर्ड</strong></p>
<hr />
<h2>जब बिहार के खेल सपनों को मिला राष्ट्रीय मंच</h2>
<p>कभी अपनी खेल प्रतिभाओं के लिए संघर्ष करता बिहार, आज पूरे देश के सामने गर्व से खड़ा है। प्रतिष्ठित <strong>Sportstar Aces Awards 2026</strong> में बिहार को <strong>Best State for Promotion of Sports</strong> का प्रतिष्ठित पुरस्कार प्रदान किया गया।</p>
<p>यह सम्मान केवल एक ट्रॉफी नहीं, बल्कि बिहार के हजारों युवा खिलाड़ियों, कोचों और खेल प्रशंसकों के वर्षों के संघर्ष और समर्पण की विजय गाथा है।</p>
<hr />
<h2>खेल नीति और ढांचागत विकास में ऐतिहासिक बदलाव</h2>
<p>पिछले कुछ वर्षों में बिहार सरकार और <strong>बिहार राज्य खेल प्राधिकरण (BSSA)</strong> ने जमीनी स्तर पर अभूतपूर्व सुधार किए हैं:</p>
<ul>
  <li><strong>मेडल लाओ, नौकरी पाओ योजना:</strong> राष्ट्रीय और अंतरराष्ट्रीय स्तर पर पदक जीतने वाले खिलाड़ियों को सीधे पुलिस उपाधीक्षक (DSP) और अन्य राजपत्रित पदों पर नियुक्तियां दी गईं।</li>
  <li><strong>राजगीर खेल अकादमी व अंतरराष्ट्रीय स्टेडियम:</strong> अत्याधुनिक खेल परिसर और अंतरराष्ट्रीय हॉकी टर्फ का निर्माण, जहां हाल ही में महिला एशियाई चैंपियंस ट्रॉफी का सफल आयोजन हुआ।</li>
  <li><strong>खेलो इंडिया यूथ गेम्स 2025:</strong> बिहार के 5 प्रमुख शहरों में 27 खेल स्पर्धाओं का सफल आयोजन।</li>
  <li><strong>खिलाड़ी छात्रवृत्ति व नकद पुरस्कार:</strong> प्रतिभाओं को निखारने के लिए वार्षिक 20 लाख रुपये तक की खेल छात्रवृत्तियां और उत्कृष्ट प्रदर्शन पर नकद प्रोत्साहन।</li>
</ul>
<hr />
<h2>युवाओं के लिए प्रेरणा का नया युग</h2>
<p>यह पुरस्कार साबित करता है कि बिहार अब केवल इतिहास का केंद्र नहीं, बल्कि भारत के खेल भविष्य का प्रमुख स्तंभ बन रहा है।</p>
<p>👉 बिहार के ऐसे ही प्रेरक बदलाव और सकारात्मक खबरों के लिए <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> को फॉलो करें।</p>`
  },
  'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf': {
    title: 'Sportstar Aces Awards 2026: खेलों के प्रचार में बिहार को मिला Best State का सम्मान',
    summary: 'प्रतिष्ठित Sportstar Aces Awards 2026 में बिहार को खेलों के सर्वांगीण विकास और प्रोत्साहन के लिए “Best State for Promotion of Sports” का राष्ट्रीय सम्मान प्राप्त हुआ है।',
    readTime: '5 min read',
    content: `<p><strong>खेलों में बिहार का बड़ा सम्मान: Sportstar Aces Awards 2026 में मिला “Best State for Promotion of Sports” अवॉर्ड</strong></p>
<hr />
<h2>जब बिहार के खेल सपनों को मिला राष्ट्रीय मंच</h2>
<p>कभी अपनी खेल प्रतिभाओं के लिए संघर्ष करता बिहार, आज पूरे देश के सामने गर्व से खड़ा है। प्रतिष्ठित <strong>Sportstar Aces Awards 2026</strong> में बिहार को <strong>Best State for Promotion of Sports</strong> का प्रतिष्ठित पुरस्कार प्रदान किया गया।</p>
<p>यह सम्मान केवल एक ट्रॉफी नहीं, बल्कि बिहार के हजारों युवा खिलाड़ियों, कोचों और खेल प्रशंसकों के वर्षों के संघर्ष और समर्पण की विजय गाथा है।</p>
<hr />
<h2>खेल नीति और ढांचागत विकास में ऐतिहासिक बदलाव</h2>
<p>पिछले कुछ वर्षों में बिहार सरकार और <strong>बिहार राज्य खेल प्राधिकरण (BSSA)</strong> ने जमीनी स्तर पर अभूतपूर्व सुधार किए हैं:</p>
<ul>
  <li><strong>मेडल लाओ, नौकरी पाओ योजना:</strong> राष्ट्रीय और अंतरराष्ट्रीय स्तर पर पदक जीतने वाले खिलाड़ियों को सीधे पुलिस उपाधीक्षक (DSP) और अन्य राजपत्रित पदों पर नियुक्तियां दी गईं।</li>
  <li><strong>राजगीर खेल अकादमी व अंतरराष्ट्रीय स्टेडियम:</strong> अत्याधुनिक खेल परिसर और अंतरराष्ट्रीय हॉकी टर्फ का निर्माण, जहां हाल ही में महिला एशियाई चैंपियंस ट्रॉफी का सफल आयोजन हुआ।</li>
  <li><strong>खेलो इंडिया यूथ गेम्स 2025:</strong> बिहार के 5 प्रमुख शहरों में 27 खेल स्पर्धाओं का सफल आयोजन।</li>
  <li><strong>खिलाड़ी छात्रवृत्ति व नकद पुरस्कार:</strong> प्रतिभाओं को निखारने के लिए वार्षिक 20 लाख रुपये तक की खेल छात्रवृत्तियां और उत्कृष्ट प्रदर्शन पर नकद प्रोत्साहन।</li>
</ul>
<hr />
<h2>युवाओं के लिए प्रेरणा का नया युग</h2>
<p>यह पुरस्कार साबित करता है कि बिहार अब केवल इतिहास का केंद्र नहीं, बल्कि भारत के खेल भविष्य का प्रमुख स्तंभ बन रहा है।</p>
<p>👉 बिहार के ऐसे ही प्रेरक बदलाव और सकारात्मक खबरों के लिए <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> को फॉलो करें।</p>`
  },
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger': {
    title: 'Bihar Declared Naxal-Free After Suresh Koda’s Surrender in Munger',
    summary: 'From decades of fear to a future of peace, Bihar has officially been declared free of active armed Naxal activities following the surrender of the last armed Maoist commander, Suresh Koda, in Munger.',
    readTime: '4 min read',
    content: `<p><strong>Bihar Declared Naxal-Free: Last Armed Maoist Surrenders in Munger, Marking Historic Shift</strong></p>
<hr />
<h2>From Decades of Fear to a Future of Peace</h2>
<p>In a landmark development, Bihar has officially been declared free of active armed Naxal activities. The historic milestone came after the formal surrender of the last armed Maoist commander, Suresh Koda, in Munger.</p>
<p>With this surrender, the state closes a long and painful chapter of armed insurgency that spanned several decades.</p>
<p>The Deputy Inspector General of Police (DIG) for the Munger range, <strong>Rakesh Kumar</strong>, confirmed the breakthrough, stating that no armed Naxalite squad is currently active in any of the 23 districts once affected by extremism.</p>
<hr />
<h2>From 23 Affected Districts to Zero Incidents</h2>
<p>Back in 2012, twenty-three districts in Bihar struggled with Naxal influence. During the 1970s and 1980s, central Bihar districts had become strongholds of extremist activity, slowing development and bringing fear into rural life.</p>
<p>Yet, sustained joint action by the Central and State Governments changed the reality:</p>
<ul>
  <li>In 2025, not a single armed Naxalite incident was reported in Bihar.</li>
  <li>Security forces arrested 220 active cadres and recovered major illegal caches.</li>
  <li>Surrender and rehabilitation policies offered former cadres a dignified return to mainstream society.</li>
</ul>
<hr />
<h2>Rehabilitation and Policy Support in Action</h2>
<p>Importantly, this historic transition did not rely on force alone. The District Magistrate of Munger, <strong>Nikhil Dhanraj Nippanikar</strong>, confirmed that Suresh Koda will receive all benefits under the Central and State Government surrender and rehabilitation scheme.</p>
<p>Meanwhile, Suresh Koda’s wife, Pramila Devi, expressed deep relief and happiness, noting that their family can finally live in peace without fear.</p>
<hr />
<h2>What This Means for Bihar’s Future</h2>
<p>This declaration permanently reshapes Bihar’s identity. For decades, the label “Naxal-affected” weighed heavily on multiple districts. Now, that tag is gone.</p>
<ul>
  <li><strong>Accelerated Investment:</strong> Peace strengthens industry and private capital confidence.</li>
  <li><strong>Infrastructure Expansion:</strong> Rural roads, bridges, and electrification can proceed unimpeded.</li>
  <li><strong>Youth Empowerment:</strong> Stability brings schools, skill centers, and employment into once-remote areas.</li>
</ul>
<hr />
<h2>📢 Be Part of Bihar’s Growth Story</h2>
<p>👉 For more verified stories of Bihar’s transformation, policy shifts, and grassroots progress, visit <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> and become part of our <strong>15K+ global community</strong> worldwide!</p>`
  },
  'bpsc-tre-1-teachers-get-salary-hike': {
    title: 'BPSC TRE-1 Teachers Get Salary Hike',
    summary: 'After nearly two years of waiting, over 1.2 lakh BPSC TRE-1 teachers across Bihar are set to receive their long-pending annual salary increments and revised allowances starting January.',
    readTime: '4 min read',
    content: `<p><strong>Big Salary Boost for Bihar Teachers: BPSC TRE-1 Educators to Get Long-Awaited Pay Hike from January</strong></p>
<hr />
<h2>When Patience Finally Pays Off</h2>
<p>For thousands of teachers recruited through the first Bihar Teacher Recruitment Examination (BPSC TRE-1), relief has finally arrived.</p>
<p>After nearly two years of waiting, BPSC TRE-1 educators are set to receive their long-pending annual salary increment. And this time, the announcement brings concrete administrative action rather than just promises.</p>
<p>According to official updates from the Bihar Education Department, the increment benefit will be credited directly from the <strong>January salary</strong>.</p>
<hr />
<h2>Why the Salary Increment Was Delayed</h2>
<p>Initially, teachers were scheduled to receive this annual benefit starting from <strong>July 2024</strong>. However, HRMS technical integration glitches and payroll synchronization delays held up the revisions across district treasuries.</p>
<p>During a dedicated teacher grievance camp, <strong>DPO Establishment Sanjay Kumar Yadav</strong> confirmed that district establishment branches have resolved the technical bottlenecks and completed the required service book entries.</p>
<hr />
<h2>Key Benefits Cleared for Educators</h2>
<ul>
  <li><strong>Annual Increment Addition:</strong> Standard 3% pay grade increment credited directly into January payroll.</li>
  <li><strong>Arrears Settlement:</strong> Departmental timeline established to disburse pending arrears accumulated since eligibility.</li>
  <li><strong>Leave Allowances:</strong> Medical, maternity, and earned leave calculations clarified under standard service rules.</li>
  <li><strong>PRAN Resolution:</strong> Rapid resolution of pending Permanent Retirement Account Number issues for new recruits.</li>
</ul>
<hr />
<h2>Strengthening Bihar’s Educational Backbone</h2>
<p>Teachers form the foundation of Bihar’s resurgence. When educators receive their rightful dues on time, classrooms thrive and learning outcomes improve.</p>
<p>This administrative resolution rebuilds trust between educators and the government, allowing teachers to focus entirely on guiding the next generation of students.</p>
<hr />
<h2>📢 Follow Bihar Say for Verified Education Updates</h2>
<p>Follow <strong><a href="https://biharsay.com" target="_blank" rel="noopener">www.biharsay.com</a></strong> for verified, people-first education alerts, career updates, and stories of transformation across Bihar. Join our <strong>15K+ global community</strong> today!</p>`
  },
  'foxconn-eyes-bihar-electronics': {
    title: 'Foxconn Eyes Bihar for Electronics Manufacturing & Assembly Hub',
    summary: 'High-level delegation evaluates investment feasibility in Patna and Bihta IT corridors for consumer electronics and SMT assembly lines.',
    readTime: '5 min read',
    content: `<h2>Foxconn Explores Manufacturing Expansion in Bihar</h2>
<p>In what could mark a monumental milestone for eastern India's high-tech manufacturing landscape, delegations associated with contract electronics giant Foxconn have actively engaged with the Bihar State Industries Department to explore setting up an electronics assembly and hardware manufacturing hub.</p>
<p>The state's strategic location, rapid logistics connectivity through dedicated freight corridors, and abundant skilled workforce have turned Bihar into an attractive destination for ESDM (Electronics System Design and Manufacturing) investments.</p>
<h2>Key Investment Areas Under Discussion</h2>
<ul>
  <li><strong>Surface Mount Technology (SMT) Assembly:</strong> Establishing advanced printed circuit board assembly lines catering to domestic and export consumer electronics.</li>
  <li><strong>Component Sourcing & Packaging:</strong> Developing integrated packaging and precision component fabrication facilities in the Bihta Industrial Area.</li>
  <li><strong>Skilled Youth Employment:</strong> Creating direct employment for more than 15,000 diploma holders, engineers, and technical graduates across Bihar.</li>
</ul>
<h2>Bihar's Aggressive Industrial Incentives</h2>
<p>Under the revised Bihar Industrial Investment Promotion Policy, the state government offers aggressive capital subsidies, 100% stamp duty exemptions, and power tariff rebates for anchor industrial units in IT and electronics hardware. Senior officials reaffirmed the government's commitment to single-window fast-track clearances.</p>
<p>As discussions advance, Bihar's transition from an agricultural heartland to an emerging electronics manufacturing powerhouse continues to gain decisive momentum.</p>`
  },
  'hero-asia-hockey-cup-2025-begins-in-rajgir-from-today': {
    title: 'HERO Asia Hockey Cup 2025 Begins in Rajgir from Today',
    summary: 'Bihar makes history today as Rajgir hosts the HERO Asia Cup 2025, turning the ancient city into a global hockey destination with India vs China clash and eight Asian giants fighting for a direct Hockey World Cup spot.',
    readTime: '4 min read',
    content: `<h2>Asia Cup 2025 in Rajgir: Hockey’s Biggest Battle Begins Today with India vs China Clash</h2>
<p>Bihar makes history today. For the first time ever, Rajgir is hosting the HERO Asia Cup 2025, turning the ancient city into a global hockey destination. The atmosphere is electric as eight Asian giants prepare to fight for glory, and the winner will book a direct spot in the Hockey World Cup.</p>

<h2>A Historic Beginning in Bihar</h2>
<p>The ten-day tournament kicks off with four matches on day one. The opener between Malaysia and Bangladesh starts at 9 AM, followed by Korea vs Chinese Taipei at 11 AM. Later, Japan faces Kazakhstan at 1 PM. The highlight, however, comes at 3 PM when India will face China.</p>
<p>Adding to the moment, Chief Minister Nitish Kumar will inaugurate the Asia Cup at 2:45 PM, just before India’s clash with China.</p>

<h2>Tournament Format and Pool Division</h2>
<p>The competition features eight teams split into two pools:</p>
<ul>
  <li><strong>Pool A:</strong> India, Japan, China, Kazakhstan</li>
  <li><strong>Pool B:</strong> Malaysia, Korea, Bangladesh, Chinese Taipei</li>
</ul>
<p>After the group stage, the top teams advance to the Super Four, followed by knockout matches. The final is scheduled for 7 September at 7:30 PM.</p>

<h2>Tribute to Major Dhyan Chand</h2>
<p>The start date holds symbolic value. 29 August marks the birth anniversary of hockey wizard Major Dhyan Chand, celebrated nationwide as National Sports Day. To honor him, the tournament mascot has been named “Chand.”</p>
<p>The tiger-shaped mascot carries the Padma Bhushan emblem on its chest. Its red robe reflects passion, while the magician’s hat symbolizes Dhyan Chand’s unmatched skill.</p>

<h2>India’s Squad Ready for Battle</h2>
<p>Under the guidance of coach Craig Fulton and captain Harmanpreet Singh, India’s 18-member squad is determined to win on home turf. The team has trained hard and will use local conditions and massive fan support to their advantage.</p>
<p><strong>India’s Squad:</strong></p>
<ul>
  <li><strong>Goalkeepers:</strong> Krishan Pathak, Suraj Karkera</li>
  <li><strong>Defenders:</strong> Sumit Singh, Jarmanpreet Singh, Sanjay, Harmanpreet Singh, Amit Rohidas, Jugraj Singh</li>
  <li><strong>Midfielders:</strong> Rajinder Singh, Rajkumar Pal, Hardik Singh, Manpreet Singh, Vivek Sagar Prasad</li>
  <li><strong>Forwards:</strong> Mandeep Singh, Shilanand Lakra, Abhishek, Sukhjeet Singh, Dilpreet Singh</li>
  <li><strong>Reserves:</strong> Neelam, Sanjeev Jens, Selvam Karthi</li>
</ul>

<h2>Ticket Frenzy and Fan Excitement</h2>
<p>The excitement is so high that when tickets opened on the Zini app on 26 August, they sold out in just five minutes. Tickets are free but issued per day, allowing fans to watch all matches scheduled for that day.</p>
<p>Fan parks with giant screens have also been set up across Bihar to bring the tournament closer to the people.</p>

<h2>Why It Matters</h2>
<p>The HERO Asia Cup 2025 is not just about hockey. It is about Bihar stepping into the international sports spotlight. Rajgir, known for its heritage, now earns recognition as a modern hub for global sporting events.</p>
<p>This event will inspire young athletes, strengthen Bihar’s sporting infrastructure, and put the state firmly on the world map.</p>
<p>Follow <strong><a href="https://biharsay.com">www.biharsay.com</a></strong> for more regular updates on Bihar’s sports, culture, and grassroots change.</p>`
  },
  'asian-womens-hockey-championship-rajgir': {
    title: "Bihar: The Rising Star of Indian Sports — Hosts Asian Women's Hockey Championship",
    summary: "Historic Rajgir International Sports Complex hosts elite women's hockey squads from across Asia, cementing Bihar's arrival on the global sporting map.",
    readTime: '5 min read',
    content: `<h2>Rajgir Welcomes Asia’s Elite Hockey Champions</h2>
<p>The picturesque historical valley of Rajgir witnessed a landmark chapter in Indian sports history as the newly constructed Rajgir International Sports Complex hosted the prestigious Asian Women's Hockey Championship.</p>
<p>Featuring continental powerhouses including India, China, Japan, Korea, Thailand, and Malaysia, the tournament brought world-class international hockey action to Bihar for the very first time.</p>
<h2>World-Class Infrastructure at Rajgir</h2>
<p>The international hockey stadium in Rajgir boasts Olympic-grade synthetic blue turf, advanced LED floodlighting, high-definition broadcast towers, and a spectator capacity exceeding 10,000 cheering fans. Teams and technical delegates from the Asian Hockey Federation praised the world-class facilities and warm Bihari hospitality.</p>
<h2>Igniting Grassroots Athletic Passion</h2>
<p>Hosting an international tournament of this scale has electrified young girls and boys across Bihar's districts. The state government announced comprehensive grassroots scouting schemes to identify and train talented athletes from rural villages, providing them with international-level coaches, sports science support, and dietary stipends.</p>
<p>Bihar's sports renaissance is no longer an aspiration—it is an energetic, ground-level reality unfolding in Rajgir.</p>`
  },
  'rajgirs-first-sports-academy': {
    title: "Rajgir's First Sports Academy: A Game Changer for Bihar's Athletes",
    summary: "State-of-the-art Bihar Sports University and Academy in Rajgir begins training the next generation of national and Olympic champions.",
    readTime: '4 min read',
    content: `<h2>A New Era for Bihar’s Sporting Dreams</h2>
<p>The inauguration of the Bihar Sports Academy and Sports University in Rajgir has transformed how the state nurtures athletic potential. Spread over 90 sprawling acres, the academy provides Olympic-standard infrastructure for over 28 sporting disciplines.</p>
<h2>Facilities Available for State Athletes</h2>
<ul>
  <li><strong>Specialized Sports Science Labs:</strong> Advanced biomechanics, physiology testing, and sports nutrition clinics to optimize athlete performance.</li>
  <li><strong>Olympic Arenas:</strong> Indoor wooden courts for badminton, kabaddi, and basketball, alongside aquatic centers and synthetic athletics tracks.</li>
  <li><strong>Full Residential Facilities:</strong> Accommodations, nutritious dining, and academic tutoring for over 500 male and female student-athletes.</li>
</ul>
<p>With structured coaching and continuous tournament exposure, the Rajgir Sports Academy is set to produce champions who will wear India's colours on global podiums.</p>`
  },
  'vaibhav-suryavanshi-ipl-auction': {
    title: "Youngest Sensation: Bihar's Vaibhav Suryavanshi Shines at IPL Auction",
    summary: "At just 13 years old, Samastipur prodigy Vaibhav Suryavanshi creates history as the youngest cricketer acquired in IPL auction history.",
    readTime: '4 min read',
    content: `<h2>From Tajpur Village to the IPL Stage</h2>
<p>At just 13 years and 243 days, Bihar’s batting prodigy Vaibhav Suryavanshi scripted cricket history when Rajasthan Royals secured his talents for ₹1.10 Crore in the Indian Premier League auction, making him the youngest player ever signed in the tournament's storied history.</p>
<p>Hailing from the small village of Tajpur in Samastipur district, Vaibhav’s meteoric rise showcases the immense raw talent waiting to be unleashed across Bihar's rural heartlands.</p>
<h2>Record-Breaking Youth Career</h2>
<p>Vaibhav made waves nationally with an astonishing 58-ball century for India Under-19 against Australia in Chennai. Earlier in the domestic season, he made his Ranji Trophy debut for Bihar at the tender age of 12, facing seasoned international pacers with calm maturity and fearless strokeplay.</p>
<p>His journey has inspired thousands of aspiring young cricketers across Bihar, proving that dedication, grit, and passion can carry local talent to the world's grandest sporting arenas.</p>`
  },
  'gomini-cow-care-startup': {
    title: "Gomini: India’s First Cow Care Startup Blending Tradition & Technology",
    summary: "Bihar startup Gomini combines IoT cattle health tracking, organic hydroponic fodder delivery, and veterinary tele-consultation.",
    readTime: '4 min read',
    content: `<h2>Blending Vedic Compassion with Smart IoT Technology</h2>
<p>Founded by passionate innovators in Bihar, <strong>Gomini</strong> is pioneering a revolutionary approach to bovine healthcare and dairy productivity by blending ancient indigenous cow care principles with state-of-the-art agricultural technology.</p>
<h2>How Gomini Transforms Rural Cattle Care</h2>
<ul>
  <li><strong>Smart Health Collars:</strong> Non-invasive IoT collars that monitor rumination, temperature, and vital signs, predicting illnesses up to 48 hours before visible symptoms.</li>
  <li><strong>Doorstep Tele-Veterinary Care:</strong> Real-time video consultations connecting remote livestock keepers with experienced veterinary doctors.</li>
  <li><strong>High-Nutrition Hydroponic Fodder:</strong> Sustainable, water-efficient green fodder delivery ensuring consistent milk yield and livestock wellbeing.</li>
</ul>
<p>By modernizing cattle management, Gomini is boosting smallholder farmer incomes while preserving Bihar’s rich dairy heritage.</p>`
  },
  'bihar-say-community-milestone': {
    title: '"Bihar Say" Now 0 to 13K: What It Takes to Build a Lasting Digital Community',
    summary: "From a passionate storytelling initiative to a worldwide movement of 15,000+ members celebrating authentic, inspiring narratives from Bihar.",
    readTime: '4 min read',
    content: `<h2>The Journey of Redefining Bihar's Narrative</h2>
<p>When <strong>Bihar Say</strong> published its very first story, the mission was simple yet ambitious: to present Bihar as it truly is—a land of tireless resilience, grassroots innovation, cultural richness, and dynamic resurgence.</p>
<p>Today, our community has crossed over <strong>15,000 members worldwide</strong>, bringing together Biharis from Patna to Silicon Valley, London to Bengaluru, all united by pride in our shared roots.</p>
<h2>Why Constructive Storytelling Matters</h2>
<p>For decades, popular media has often reduced Bihar to outdated stereotypes. Bihar Say challenged that perception by putting the spotlight on:</p>
<ul>
  <li>Grassroots innovators and agritech pioneers solving real problems.</li>
  <li>Women founders leading thriving self-help groups and startups.</li>
  <li>Young athletes breaking world records and winning national medals.</li>
  <li>Mithila art, historical landmarks, and centuries-old cultural traditions.</li>
</ul>
<p>Thank you to every reader, contributor, and supporter who believes in Bihar’s unstoppable rise. This is only the beginning!</p>`
  },
  'user-story-FuTHCYIkVKvugbaonRdp': {
    title: "Solar Cold Storage Revolutionizes Muzaffarpur’s Shahi Litchi",
    summary: "Decentralized micro-cold storage units powered by solar energy extend shelf life of Shahi Litchi and stop distress sales for orchard farmers.",
    readTime: '4 min read',
    content: `<h2>Tackling the Perishable Dilemma of Shahi Litchi</h2>
<p>Muzaffarpur’s GI-tagged <strong>Shahi Litchi</strong> is celebrated worldwide for its distinctive aroma and delicate sweetness. However, orchard owners have long faced a crushing post-harvest crisis: fresh litchis begin browning and losing market value within 48 hours of picking.</p>
<p>To solve this seasonal challenge, innovative farmers and agritech collectives in Muzaffarpur have deployed decentralized 5-metric-ton solar-powered micro-cold storage rooms right at the orchard gate.</p>
<h2>Measurable Ground Impact</h2>
<ul>
  <li><strong>Extended Shelf Life:</strong> Controlled temperature and humidity extend fresh fruit preservation up to 21 days without chemical sprays.</li>
  <li><strong>Elimination of Distress Sales:</strong> Farmers no longer have to dump fresh produce at throwaway prices during peak heat waves.</li>
  <li><strong>Direct Export Connections:</strong> High-grade packaging at the orchard enables direct refrigerated transport to premium metro markets in Mumbai, Delhi, and Bengaluru.</li>
</ul>
<p>Solar technology is empowering Bihar’s farmers to take control of the supply chain and capture true market value for their world-class harvest.</p>`
  },
  'bihar-makhana-boom-migration': {
    title: "Bihar's Makhana Business Is Booming. So Why Are the People Who Know It Best Still Being Forced to Migrate?",
    summary: "Bihar’s makhana is reaching the world, but many families behind it still struggle to stay home. Traditional processors face seasonal migration, low working capital, and disrupted children's education.",
    readTime: '6 min read',
    content: `<p><strong>Bihar’s makhana is reaching the world, but many families behind it still struggle to stay home.</strong></p>
<p>Makhana has become one of India’s most popular superfoods. However, its rising demand hides a painful reality in Bihar.</p>
<p>Traditional processors still face unstable incomes, limited working capital, and seasonal migration. As a result, many children miss school for months.</p>
<p>In Mithila, makhana represents more than farming. It reflects culture, skill, and family heritage.</p>
<p><strong>“Pag-pag pokhar, maachh-makhaan.”</strong></p>
<p>This popular phrase captures Mithila’s deep connection with ponds, fish, and makhana. For generations, Mallah families have preserved the traditional processing craft.</p>
<p>Today, however, that heritage faces serious economic pressure.</p>
<h2>The Human Cost Behind Bihar’s Makhana Industry</h2>
<p>Makhana processing demands patience, strength, and experience. Artisans roast raw seeds in intense heat. Then, they crack them with wooden mallets.</p>
<p>This process requires precise timing and practiced hands. Therefore, machines cannot easily replace the knowledge passed through generations.</p>
<p>Yet many skilled processors cannot find enough work in their villages.</p>
<p>During the makhana season, families often migrate for nearly six months. They travel to Purnea, Katihar, and parts of West Bengal.</p>
<p>They rent small rooms near work locations. Meanwhile, their children may remain away from school.</p>
<p>A family earns money for the present. However, children can lose valuable months of education.</p>
<p>That trade-off reveals the hidden cost of Bihar’s makhana boom.</p>
<h2>Why Farmers and Processors Struggle</h2>
<p>The makhana supply chain depends on several connected groups. Farmers grow the crop. Processors transform the seeds. Traders and brands then take the product to consumers.</p>
<p>However, each group faces different challenges.</p>
<p>Farmers need reliable buyers and fair prices. Processors need raw seeds and timely working capital. Meanwhile, markets demand consistent quality and supply.</p>
<p>When money arrives late, the entire chain suffers.</p>
<p>Farmers may sell quickly at lower prices. Processors may leave their villages for seasonal work. Consequently, local communities lose both income and skilled labour.</p>
<p>The problem, therefore, involves more than market access. It also involves trust, timing, and financial support.</p>
<h2>How Molu Jha Is Building a Local Solution</h2>
<p>For <strong>Molu Jha</strong>, the makhana supply chain became a personal mission.</p>
<p>He saw farmers and processors struggling within the same system. Therefore, he began connecting them through a trust-based village network.</p>
<p>His approach focuses on three key needs:</p>
<ul>
  <li>Better access to raw makhana seeds</li>
  <li>Fairer connections between farmers and buyers</li>
  <li>More working opportunities for traditional processors</li>
</ul>
<p>Through this network, farmers can reach local processors more directly. At the same time, processors can access the materials they need to continue working near home.</p>
<p>This model can reduce unnecessary migration. It can also help families protect their children’s education.</p>
<p>Most importantly, it keeps more value within Bihar’s rural communities.</p>
<h2>Protecting a Skill That Bihar Cannot Afford to Lose</h2>
<p>Traditional makhana processing represents generations of knowledge. Artisans understand heat, timing, seed quality, and recovery rates through experience.</p>
<p>However, low and uncertain incomes can push younger workers away from the craft.</p>
<p>If that continues, Bihar could lose more than a livelihood. It could lose an important part of Mithila’s cultural identity.</p>
<p>Molu’s work also focuses on awareness. Farmers and processors need better information about grading, sizing, recovery ratios, and market prices.</p>
<p>With that knowledge, they can negotiate more confidently. They can also understand the real value of their labour.</p>
<p>As a result, transparency can strengthen the entire supply chain.</p>
<h2>Keeping Bihar’s Skilled Hands in Bihar</h2>
<p>Even a small reduction in seasonal migration can create a major social impact.</p>
<p>Families can remain closer to their homes. Children can attend school more regularly. Communities can retain their skilled workers.</p>
<p>Furthermore, local processing can create stronger village economies.</p>
<p>Money circulates within the community. Workers spend locally. Farmers gain more dependable market connections.</p>
<p>This creates a more resilient rural system.</p>
<p>The goal is not simply to sell more makhana. Instead, the goal is to build a supply chain that respects the people behind the product.</p>
<h2>The Question Bihar Must Ask</h2>
<p>Bihar’s makhana demand continues to grow. Consumers across India now recognise its nutritional value.</p>
<p>However, market growth alone cannot guarantee social progress.</p>
<p>The real question is simple:</p>
<p><strong>Can Bihar build a makhana economy where farmers and processors receive a fairer share of the value they create?</strong></p>
<p>The answer depends on stronger local networks, better financial access, and transparent market connections.</p>
<p>It also depends on recognising traditional processors as skilled professionals.</p>
<p>They do not merely perform manual labour. They carry knowledge that gives Bihar’s makhana its identity.</p>
<h2>A New Future for Bihar’s Makhana</h2>
<p>Molu Jha’s work points towards a more decentralised makhana supply chain.</p>
<p>Such a system can connect farmers, processors, and markets more fairly. It can also create more local employment.</p>
<p>Most importantly, it can help families earn without leaving their villages for half the year.</p>
<p>Bihar’s makhana story is, therefore, not only about a growing superfood market.</p>
<p>It is about culture, migration, education, and dignity.</p>
<p>It is about protecting the hands that have preserved this craft for generations.</p>
<p>It is also about creating better opportunities for the next generation.</p>
<p><strong>Follow <a href="https://www.biharsay.com/">Bihar Say</a> for more powerful stories from Bihar. Become part of our 15,000+ community worldwide and stay connected with the people, ideas, and changemakers shaping the state.</strong></p>`
  }
};

export function findCanonicalStory(story: Story): Story | undefined {
  if (!story) return undefined;
  if (story.id && ALIAS_TO_CANONICAL_ID[story.id]) {
    const canonical = CANONICAL_STORY_MAP[ALIAS_TO_CANONICAL_ID[story.id]];
    if (canonical) return canonical;
  }
  if (story.id && CANONICAL_STORY_MAP[story.id]) return CANONICAL_STORY_MAP[story.id];
  if (story.legacyId && CANONICAL_STORY_MAP[String(story.legacyId)]) return CANONICAL_STORY_MAP[String(story.legacyId)];

  const normTitle = normalizeTitle(story.title || '');
  if (normTitle && CANONICAL_STORY_MAP[normTitle]) return CANONICAL_STORY_MAP[normTitle];

  const idLower = (story.id || '').toLowerCase();
  for (const candidate of INITIAL_STORIES) {
    const candIdLower = (candidate.id || '').toLowerCase();
    if (idLower.includes('jaynagar') && candIdLower.includes('jaynagar')) return candidate;
    if (idLower.includes('59000') && candIdLower.includes('59000')) return candidate;
    if (idLower.includes('flood') && candIdLower.includes('flood')) return candidate;
    if (idLower.includes('buxar') && candIdLower.includes('buxar')) return candidate;
    if (idLower.includes('singhada') && candIdLower.includes('singhada')) return candidate;
    if (idLower.includes('sonpur') && candIdLower.includes('sonpur')) return candidate;
    if (idLower.includes('indoor-stadium') || (idLower.includes('patna') && idLower.includes('stadium') && candIdLower.includes('stadium'))) return candidate;
    if (idLower.includes('makhana') && candIdLower.includes('makhana')) return candidate;
  }
  return undefined;
}

export function cleanStoryText(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // 1. Repair common UTF-8 / Mojibake corruptions
  text = text
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€ /g, '"')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€¦/g, '…')
    .replace(/Â/g, '')
    .replace(/\b(\w+)\?\?\?s\b/gi, "$1's")
    .replace(/\?\?\?/g, '—');

  // 2. Corrupted apostrophes and dashes from database exports
  text = text
    .replace(/\b([A-Za-z0-9]+)\?Ts\b/g, "$1's")
    .replace(/\?Ts\b/g, "'s")
    .replace(/\b([A-Za-z0-9]+)\?T\b/g, "$1'")
    .replace(/\?T/g, "'")
    .replace(/\?"/g, '–')
    .replace(/`([A-Z][^']*)'/g, "'$1'"); // Fix `Pink Innovation' -> 'Pink Innovation'

  // 3. Corrupted currency symbols (?3,000 -> ₹3,000, ?20 Lakh -> ₹20 Lakh, ?72,750 -> ₹72,750)
  text = text.replace(/(?<=\s|^|>|\+)\?([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?(?:\s*(?:Lakh|Crore|K|M|B))?)/gi, '₹$1');

  // 4. HTML entities & trailing scrapers
  text = text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&hellip;/gi, '…')
    .replace(/\[&hellip;\]/gi, '')
    .replace(/\[\u0026hellip;\]/gi, '')
    .replace(/\[\.\.\.\]/g, '')
    .replace(/\[\s*…\s*\]/g, '')
    .replace(/\[\s*\]/g, '');

  // 5. Spacing fixes after punctuation (e.g. "arrived.After" -> "arrived. After")
  text = text.replace(/([a-z0-9])\.([A-Z])/g, '$1. $2');
  text = text.replace(/([a-z0-9])\?([A-Z])/g, '$1? $2');
  text = text.replace(/([a-z0-9])!([A-Z])/g, '$1! $2');

  // 6. Fix Hindi LPG article if corrupt question marks
  if (text.includes('?????') || text.includes('??????')) {
    if (text.length < 120) {
      return 'बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील';
    } else {
      return 'मुख्य सचिव प्रत्यय अमृत की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि राज्य में घरेलू एलपीजी, पीएनजी, पेट्रोल और डीजल का पर्याप्त भंडार उपलब्ध है। अफवाहों पर ध्यान न दें।';
    }
  }

  // 7. Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ').trim();

  return text;
}

export function cleanStorySummary(rawSummary: string, title?: string): string {
  if (!rawSummary) return '';
  let s = cleanStoryText(rawSummary);

  // Strip leading quoted headlines e.g. "Headline..." or “Headline...”
  s = s.replace(/^["“][^"”]{10,140}["”]\s*/, '').trim();

  // Strip common noisy prefix patterns from scraped summaries
  s = s.replace(/^[^:]{5,80}\s*OUT:\s*[^\n.!?-]+[-—–]\s*(?:Check|Read|See)[^.!?-]+[.!?-]\s*/i, '').trim();
  s = s.replace(/^Big Salary Boost for Bihar Teachers After 2 Years:\s*[^\n.!?-]+from January\s*/i, '').trim();
  s = s.replace(/^(?:The Moment [A-Za-z0-9 ]+ Was Waiting For|When [A-Za-z0-9 ]+ Breathes Better Than [A-Za-z0-9 ]+)\s*/i, '').trim();
  s = s.replace(/^From decades of fear to a future of peace\s*[-—–]\s*Bihar turns a powerful page[.!?-]\s*/i, '').trim();

  // If summary starts with the title or title lead, strip the duplicate title
  if (title) {
    const cleanT = cleanStoryText(title);
    const titleLead = cleanT.replace(/[:\-–—].*$/, '').trim();
    if (titleLead.length > 8 && s.toLowerCase().startsWith(titleLead.toLowerCase())) {
      s = s.slice(titleLead.length).replace(/^[:\-–—\s]+/, '').trim();
    }
    if (s.toLowerCase().startsWith(cleanT.toLowerCase())) {
      s = s.slice(cleanT.length).replace(/^[:\-–—\s]+/, '').trim();
    }
  }

  // If summary has a duplicated "Title: Subtitle Title: Subtitle" pattern
  const colonMatch = s.match(/^([^:]{10,80}:\s*)(.*)$/);
  if (colonMatch) {
    const prefix = colonMatch[1];
    const rest = colonMatch[2];
    if (rest.startsWith(prefix.trim())) {
      s = rest;
    }
  }

  // Remove trailing ellipsis / incomplete brackets
  s = s.replace(/\s*…\s*$/, '').replace(/\s*\.\.\.\s*$/, '').trim();

  // Ensure ends with a complete sentence punctuation if reasonable
  if (s.length > 50 && !/[.!?]$/.test(s)) {
    const lastDot = Math.max(s.lastIndexOf('. '), s.lastIndexOf('! '), s.lastIndexOf('? '));
    if (lastDot > 60) {
      s = s.slice(0, lastDot + 1).trim();
    } else {
      s = s + '.';
    }
  }

  return s;
}

export function safeDecode(str: string): string {
  let current = str || '';
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
}

export function safeEncode(str: string): string {
  try {
    return encodeURIComponent(str || '');
  } catch {
    return str || '';
  }
}

export function cleanArticleContent(rawContent: string): string {
  if (!rawContent) return '';

  let text = cleanStoryText(rawContent);

  // 1. Repair common UTF-8 / Mojibake encoding corruptions
  text = text
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€ /g, '"')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€¦/g, '…')
    .replace(/Â/g, '')
    .replace(/\b(\w+)\?\?\?s\b/gi, "$1's") // fixes "Bihar???s" -> "Bihar's"
    .replace(/\?\?\?/g, '—');

  // 2. Comprehensive HTML Entity Decoding (handles single, double, and numeric escaping like &amp;lt;h1&amp;gt;)
  for (let pass = 0; pass < 4; pass++) {
    if (!/&(?:amp|lt|gt|quot|apos|#39|#x27|nbsp|#8211|#8212|#8216|#8217|#8220|#8221|#038|#\d+|#x[0-9a-fA-F]+);/i.test(text) &&
        !/&lt;|&gt;|&amp;/i.test(text)) {
      break;
    }
    text = text
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8216;/g, '‘')
      .replace(/&#8217;/g, '’')
      .replace(/&#8220;/g, '“')
      .replace(/&#8221;/g, '”')
      .replace(/&#038;/g, '&')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  // 3. Strip scraper tracking/chunk attributes like data-start="123", data-end="456", data-is-last-node, etc.
  text = text.replace(/\s*data-[a-zA-Z0-9\-]+(?:="[^"]*"|='[^']*'|=[^\s>]+)?/gi, '');

  // 4. Sanitize inline class and style attributes (preserve font-family, bold, italic, underline and article classes)
  text = text.replace(/style=["']([^"']*)["']/gi, (match, styleStr) => {
    const rules = styleStr.split(';').map((r: string) => r.trim()).filter(Boolean);
    const kept: string[] = [];
    for (const rule of rules) {
      const [prop, val] = rule.split(':').map((s: string) => s.trim());
      if (!prop || !val) continue;
      const lower = prop.toLowerCase();
      if (lower === 'font-family') {
        kept.push(`font-family: ${val}`);
      } else if (lower === 'font-weight' && (val === 'bold' || parseInt(val, 10) >= 600)) {
        kept.push('font-weight: bold');
      } else if (lower === 'font-style' && val === 'italic') {
        kept.push('font-style: italic');
      } else if (lower === 'text-decoration' && val.includes('underline')) {
        kept.push('text-decoration: underline');
      }
    }
    return kept.length > 0 ? ` style="${kept.join('; ')}"` : '';
  });

  text = text.replace(/\s*class=["']([^"']*)["']/gi, (match, classStr) => {
    const keptClasses = classStr
      .split(/\s+/)
      .filter((c: string) => c.startsWith('article-'))
      .join(' ');
    return keptClasses ? ` class="${keptClasses}"` : '';
  });

  // 5. Unwrap empty/useless spans but preserve spans that have style attributes (e.g. font-family)
  text = text.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');
  text = text.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '');

  // 6. Normalize newlines
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 7. Convert markdown headers (####, ###, ##, #) to proper HTML tags
  text = text.replace(/^[ \t]*####[ \t]+(.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^[ \t]*###[ \t]+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^[ \t]*##[ \t]+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^[ \t]*#[ \t]+(.+)$/gm, '<h2>$1</h2>');

  // 8. Convert markdown bold and italic if raw
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  // 9. Clean up self-closing br tags and empty tags
  text = text.replace(/<br\s*\/?>/gi, '<br />');
  text = text.replace(/<(p|div|span)[^>]*>\s*<\/\1>/gi, '');

  // 10. Un-glue fused series badges and quotes
  text = text.replace(/([a-z0-9\)])(Series:\s*\d+[^\n<]*)/gi, '$1</p>\n<p class="article-series-badge"><strong>$2</strong>');
  text = text.replace(/([”"»])([A-Z\u0900-\u097F])/g, '$1</p>\n<p>$2');

  // 11. Convert internal <h1> to <h2> so user headings are prominently retained (article page headline is h1)
  text = text.replace(/<h1(\s*|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');

  // 12. If text does not contain <p> tags, split by double newlines into blocks
  if (!/<p[\s>]/i.test(text)) {
    const blocks = text.split(/\n\n+/);
    text = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h\d|ul|ol|blockquote|table|hr)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    }).filter(Boolean).join('\n\n');
  }

  // 13. Parse and style titles, questions, quotes, and lists within <p> tags
  text = text.replace(/<p>([\s\S]*?)<\/p>/gi, (match: string, rawInner: string) => {
    let inner: string = (rawInner || '').trim();
    if (!inner) return '';

    // A. Standalone blockquotes / lead quotes (e.g. “मिट्टी से निकली कहानी, जिसने लाखों ज़िंदगियों की फसल बदल दी।”)
    if (/^[“"«][^”"»\n]+[”"»]$/.test(inner)) {
      return `<blockquote><strong>${inner}</strong></blockquote>`;
    }

    // B. Detect Questions (e.g. "Who is Founder of DeHaat", "Who is Sumant Sinha?", "Why Bihar Business Mahakumbh 2025 Is a Must-Attend", etc.)
    const isQuestionPunctuation = /\?$/.test(inner);
    const isQuestionPhrase = /^(Who|What|Where|When|Why|How|Which|Whom|Whose|Is|Are|Was|Were|Can|Could|Do|Does|Did|Will|Would|Should)\b/i.test(inner);
    const isQuestionLength = inner.length >= 6 && inner.length <= 115;
    const notMultiSentence = !/\.\s+[A-Z]/.test(inner);
    const notBulletOrLink = !/^(http|https|www|Tags:|#|👉|•|\-)/i.test(inner);

    if ((isQuestionPunctuation || isQuestionPhrase) && isQuestionLength && notMultiSentence && notBulletOrLink) {
      return `<h3 class="article-question"><strong>${inner}</strong></h3>`;
    }

    // C. Detect Section Titles / Subheadings (e.g. "The Humble Seed That Sprouted a Movement (2012–2025)", "From One Village to Millions...", "A Culture That Mirrors the Soil It Serves", "Not Just a Startup. A Soil-Born Movement.")
    const isTitleLength = inner.length >= 6 && inner.length <= 90;
    const startsWithCapital = /^[A-Z0-9\u0900-\u097F]/.test(inner);
    const isSpecialTitle = /^Not Just a Startup/i.test(inner) || /^This Is Just the Beginning/i.test(inner);
    const noSentenceEnd = !/[.,;:]$/.test(inner) || isSpecialTitle;
    const notMultiSentenceTitle = !/\.\s+[A-Z]/.test(inner) || isSpecialTitle;
    const notDisallowedStart = !/^(http|https|www|Tags:|#|👉|•|\-|In 20\d\d|On \d|At the|According to|Consider a|This reach|Mutual respect|For two|Their team|What started|What they|The numbers|Such integration|Technology often|Labels don't|The team didn't|From the soil)/i.test(inner);
    const notHtmlBlock = !/<(img|blockquote|table|ul|ol|h\d)/i.test(inner);

    if (isTitleLength && startsWithCapital && noSentenceEnd && notMultiSentenceTitle && notDisallowedStart && notHtmlBlock) {
      return `<h2 class="article-section-title"><strong>${inner}</strong></h2>`;
    }

    // D. Detect emoji sub-headings (e.g. 🛫 Global Export Pavilion, 🚀 Youth Startup Hall, etc.)
    if (inner.length <= 65 && /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(inner)) {
      return `<h4 class="article-sub-heading"><strong>${inner}</strong></h4>`;
    }

    // E. Detect bullet/numbered lists within paragraph (handles mixed paragraphs with intro/outro sentences)
    if (inner.includes('•') || inner.includes('–') || inner.includes('🔹') || inner.includes('- ') || /^\d+[\.\)]\s/.test(inner)) {
      const lines: string[] = inner.split(/<br\s*\/?>|\n|(?=🔹)/).map((l: string) => l.trim()).filter(Boolean);
      const hasBullets = lines.some((l: string) => /^[•\-\–\*🔹]|\d+[\.\)]\s/.test(l));

      if (hasBullets) {
        const parts: string[] = [];
        let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
        let currentParagraph: string[] = [];

        const flushText = () => {
          if (currentParagraph.length > 0) {
            parts.push(`<p>${currentParagraph.join('<br />')}</p>`);
            currentParagraph = [];
          }
        };

        const flushList = () => {
          if (currentList && currentList.items.length > 0) {
            const tag = currentList.type;
            const itemsHtml = currentList.items.map(it => `  <li>${it}</li>`).join('\n');
            parts.push(`<${tag}>\n${itemsHtml}\n</${tag}>`);
            currentList = null;
          }
        };

        for (const line of lines) {
          const bulletMatch = line.match(/^[•\-\–\*🔹]\s*(.*)$/);
          const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);

          if (bulletMatch) {
            flushText();
            if (currentList && currentList.type !== 'ul') flushList();
            if (!currentList) currentList = { type: 'ul', items: [] };
            currentList.items.push(bulletMatch[1]);
          } else if (numMatch) {
            flushText();
            if (currentList && currentList.type !== 'ol') flushList();
            if (!currentList) currentList = { type: 'ol', items: [] };
            currentList.items.push(numMatch[2]);
          } else {
            flushList();
            currentParagraph.push(line);
          }
        }

        flushList();
        flushText();

        return parts.join('\n');
      }
    }

    return `<p>${inner}</p>`;
  });

  // 14. Ensure <hr /> precedes <h2> if not already preceded by <hr> and not at the very top
  let joined = text.trim();
  joined = joined.replace(/(?<!<hr\s*\/?>\s*)(<h2[^>]*>)/gi, (match: string, h2: string, offset: number) => {
    return offset > 10 ? `<hr />\n${h2}` : h2;
  });

  // Remove redundant consecutive <hr /> tags
  joined = joined.replace(/(<hr\s*\/?>\s*){2,}/gi, '<hr />\n');

  return joined;
}

export function sanitizeStory(story: Story): Story {
  if (!story) return story;
  let img = story.imageUrl || '';

  // 1. Resolve canonical authentic image by id or title
  const canonical =
    PROTOTYPE_IMAGE_MAP[story.id] ||
    CANONICAL_IMAGE_MAP[story.id] ||
    (story.legacyId ? CANONICAL_IMAGE_MAP[String(story.legacyId)] : undefined) ||
    (story.title ? TITLE_IMAGE_MAP[normalizeTitle(story.title)] : undefined);

  if (canonical && AUTHENTIC_LOCAL_IMAGES.has(canonical)) {
    img = canonical;
  }

  if (story.id === 'bihar-makhana-boom-migration') {
    img = '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg';
  }

  const isBorderPillarStory =
    (story.id && (story.id.includes('border-pillar') || story.id.includes('5000'))) ||
    (story.title && story.title.toLowerCase().includes('border pillar'));

  if (!isBorderPillarStory && img.endsWith('/legacy-images/Bihar-Say-Website.png')) {
    img = '';
  }

  const isLpgStory =
    (story.id && (story.id.includes('lpg') || story.id.includes('एलपीजी') || story.id.includes('84'))) ||
    (story.title && (story.title.toLowerCase().includes('lpg') || story.title.includes('एलपीजी')));

  if (!isLpgStory && img.includes('Bihar-Say-Website-84.png')) {
    img = '';
  }

  // Handle broken images mapping if any
  for (const [broken, replacement] of Object.entries(BROKEN_IMG_MAP)) {
    if (img.includes(broken)) {
      img = replacement;
      break;
    }
  }

  // Strictly enforce user constraint:
  // "if any article has no image then you dont add any image from your side like in this"
  // Never default to a generic image, stock photo, or skyscraper image.
  // Only retain images that belong to the authentic set or are user profile photos.
  if (img) {
    if (
      !AUTHENTIC_LOCAL_IMAGES.has(img) &&
      !img.startsWith('http://') &&
      !img.startsWith('https://')
    ) {
      img = '';
    } else if (
      img.includes('bihar-industrial-investment-growth.jpg') ||
      img.includes('images.unsplash.com') ||
      img.includes('bihar-uae-food-processing.jpg') ||
      img.includes('jaynagar-immigration-post-border.jpg') ||
      img.includes('patna-metro-tbm-tunnel.jpg') ||
      img.includes('patna-indoor-sports-stadium.jpg') ||
      img.includes('bharatnet-fiber-optic-villages.jpg') ||
      img.includes('bihar-real-estate-investment.jpg') ||
      img.includes('bihar-nepal-floods-rescue.jpg') ||
      img.includes('bihar-factories-industrial-growth.jpg') ||
      img.includes('bihar-makhana-farming-subsidy.jpg') ||
      img.includes('bihar-ai-departments-governance.jpg') ||
      img.includes('patna-delhi-kolkata-train-fare.jpg') ||
      img.includes('bihar-petc-coaching-students.jpg') ||
      img.includes('aiims-patna-acute-stroke-care-unit.jpg') ||
      img.includes('bpsc-prelims-results-examination.jpg')
    ) {
      img = '';
    }
  }

  let title = story.title ? cleanStoryText(story.title.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000')) : story.title;
  let summary = story.summary ? cleanStorySummary(story.summary.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000'), title) : story.summary;
  let content = story.content ? cleanArticleContent(story.content) : story.content;
  let readTime = story.readTime;

  // Resolve full content if missing or if an editorial prototype / canonical version is available
  const canonicalFull = findCanonicalStory(story);
  const proto = (story.id ? PROTOTYPE_CONTENT_MAP[story.id] : undefined) ||
    (story.id ? PROTOTYPE_CONTENT_MAP[safeDecode(story.id)] : undefined) ||
    (story.id ? PROTOTYPE_CONTENT_MAP[safeEncode(story.id)] : undefined);
  const richerSource = (proto && proto.content)
    ? proto
    : (canonicalFull && canonicalFull.content && canonicalFull.content.length > (content ? content.length : 0))
      ? canonicalFull
      : null;

  if (proto) {
    if (proto.title) title = proto.title;
    if (proto.summary) summary = proto.summary;
    if (proto.content) content = cleanArticleContent(proto.content);
    if (proto.readTime) readTime = proto.readTime;
  } else if (richerSource && richerSource.content) {
    content = cleanArticleContent(richerSource.content);
    if (!summary || summary.trim().length < 50 || richerSource.summary) {
      summary = richerSource.summary || summary;
    }
    if (!readTime || richerSource.readTime) {
      readTime = richerSource.readTime || readTime;
    }
    if (richerSource.title && (!title || title.length < richerSource.title.length)) {
      title = richerSource.title;
    }
  } else if (!content || content.trim().length < 400) {
    if (canonicalFull && canonicalFull.content && canonicalFull.content.trim().length >= 400) {
      content = cleanArticleContent(canonicalFull.content);
      if (!summary || summary.trim().length < 50) {
        summary = canonicalFull.summary;
      }
      if (!readTime) {
        readTime = canonicalFull.readTime;
      }
    }
  }

  // Explicit safety check for Hindi LPG article
  if (story.id && (story.id.includes('%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0') || story.id.includes('lpg') || story.id.includes('एलपीजी'))) {
    title = 'बिहार में एलपीजी संकट नहीं, अफवाहों से बचने की अपील';
    summary = 'मुख्य सचिव प्रत्यय अमृत की अध्यक्षता में हुई उच्चस्तरीय बैठक में स्पष्ट किया गया कि राज्य में घरेलू एलपीजी, पीएनजी, पेट्रोल और डीजल का पर्याप्त भंडार उपलब्ध है। अफवाहों पर ध्यान न दें।';
  }

  if (title && title.toLowerCase().includes('litchi') && content) {
    content = content.replace(/mango and makhana clusters/gi, 'mango and regional horticulture clusters')
      .replace(/makhana/gi, 'horticulture');
  }

  const clean = { ...story, title, summary, content, readTime, imageUrl: img };
  if ((clean as any).serverTimestamp) {
    delete (clean as any).serverTimestamp;
  }
  return clean;
}

export function deduplicateStories(stories: Story[]): Story[] {
  if (!Array.isArray(stories)) return [];
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();

  return stories.filter((story) => {
    if (!story || !story.id) return false;

    const idKey = story.id.toLowerCase().trim();
    if (seenIds.has(idKey)) return false;

    const titleKey = normalizeTitle(story.title || '');
    if (titleKey && seenTitles.has(titleKey)) return false;

    seenIds.add(idKey);
    if (titleKey) seenTitles.add(titleKey);
    return true;
  });
}

/**
 * Fetch all stories from Firestore with fast timeout, falling back to rich local seed data.
 */
export async function getAllStories(): Promise<Story[]> {
  const localStories = INITIAL_STORIES.map(sanitizeStory);
  const localStoryMap = new Map<string, Story>();
  localStories.forEach(s => {
    if (s.id) localStoryMap.set(s.id.toLowerCase().trim(), s);
  });

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, STORIES_COLLECTION), firestoreLimit(500));
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);

      if (snapshot && !snapshot.empty) {
        const firestoreStories: Story[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data() as Partial<Story>;
          const docId = doc.id;
          const docIdLower = docId.toLowerCase().trim();

          if (localStoryMap.has(docIdLower)) {
            const local = localStoryMap.get(docIdLower)!;
            firestoreStories.push(sanitizeStory({
              ...local,
              views: (data.views && data.views > (local.views || 0)) ? data.views : local.views,
              reactions: data.reactions || local.reactions,
              commentsCount: data.commentsCount || local.commentsCount,
            }));
            localStoryMap.delete(docIdLower);
          } else {
            firestoreStories.push(sanitizeStory({ id: docId, ...data } as Story));
          }
        });

        const getStoryTimestamp = (s: Story): number => {
          if (s.createdAt) {
            const t = new Date(s.createdAt).getTime();
            if (!isNaN(t)) return t;
          }
          if (s.date) {
            const t = new Date(s.date).getTime();
            if (!isNaN(t)) return t;
          }
          return 0;
        };

        // Sort firestore stories so newly approved/published stories come FIRST
        firestoreStories.sort((a, b) => getStoryTimestamp(b) - getStoryTimestamp(a));

        const combined = [...firestoreStories, ...Array.from(localStoryMap.values())]
          .filter(s => !EXCLUDED_STORY_IDS.has(s.id));
        return deduplicateStories(combined);
      }
    } catch (err) {
      console.warn('Firestore fetch failed or timed out, using curated seed stories:', err);
    }
  }
  return deduplicateStories(localStories.filter(s => !EXCLUDED_STORY_IDS.has(s.id)));
}

/**
 * Seed Firestore with initial rich stories if empty.
 */
export async function seedFirestoreStories(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const colRef = collection(db, STORIES_COLLECTION);
    for (const story of INITIAL_STORIES) {
      const docRef = doc(colRef, story.id);
      await setDoc(docRef, {
        ...story,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
    console.log('Seeded Firestore with initial Bihar Say stories.');
  } catch (err) {
    console.error('Error seeding stories to Firestore:', err);
  }
}

/**
 * Get single story by ID with full bidirectional encoding & alias resilience.
 */
export async function getStoryById(id: string): Promise<Story | null> {
  if (!id) return null;
  if (EXCLUDED_STORY_IDS.has(id)) return null;

  const decodedId = safeDecode(id);
  if (EXCLUDED_STORY_IDS.has(decodedId)) return null;
  const encodedId = safeEncode(decodedId);

  const normalize = (str: string) => safeDecode(str).toLowerCase().replace(/[^a-z0-9]/g, '');

  const canonicalId =
    ALIAS_TO_CANONICAL_ID[id] ||
    ALIAS_TO_CANONICAL_ID[decodedId] ||
    ALIAS_TO_CANONICAL_ID[encodedId];
  const targetId = canonicalId || id;
  const targetDecoded = safeDecode(targetId);
  const targetNorm = normalize(targetId);

  // 1. Check standalone prototype stories with rich content first
  const protoKeysToCheck = [id, decodedId, encodedId, targetId, targetDecoded];
  for (const k of protoKeysToCheck) {
    if (k && PROTOTYPE_CONTENT_MAP[k]) {
      const proto = PROTOTYPE_CONTENT_MAP[k];
      const isSports = k.includes('hockey') || k.includes('sports') || k.includes('ipl') || k.includes('sportstar');
      const isStartup = k.includes('cow') || k.includes('litchi') || k.includes('community') || k.includes('makhana');
      const isEdu = k.includes('deled') || k.includes('result') || k.includes('cleanest-air') || k.includes('lpg') || k.includes('एलपीजी') || k.includes('naxal') || k.includes('teacher');
      const protoStory: Story = {
        id: k,
        title: proto.title || k,
        summary: proto.summary || '',
        content: proto.content,
        categorySlug: isSports ? 'sports' : isStartup ? 'entrepreneurship-startups' : isEdu ? 'education-social' : 'industry-innovation',
        category: isSports ? 'Sports' : isStartup ? 'Entrepreneurship & Startups' : isEdu ? 'Education & Social' : 'Industry & Innovation',
        date: 'March 15, 2026',
        author: 'Bihar Say Desk',
        readTime: proto.readTime || '4 min read',
        imageUrl: PROTOTYPE_IMAGE_MAP[k] || PROTOTYPE_IMAGE_MAP[targetId] || ''
      };
      return sanitizeStory(protoStory);
    }
  }

  // 2. Check local INITIAL_STORIES with comprehensive matching:
  // - exact match on raw id or decoded id
  // - match on safeDecode(s.id).toLowerCase() === targetDecoded.toLowerCase()
  // - match on normalized alphanumeric string (if non-empty)
  // - match on slug prefix / fuzzy match for known stories
  const localFound = INITIAL_STORIES.find(s => {
    if (!s || !s.id) return false;
    if (s.id === targetId || s.id === id || s.id === decodedId || s.id === encodedId) return true;
    const sDecoded = safeDecode(s.id);
    if (sDecoded.toLowerCase() === decodedId.toLowerCase() || sDecoded.toLowerCase() === targetDecoded.toLowerCase()) return true;
    
    // Fuzzy match for Hindi LPG article
    if (
      (id.includes('एलपीजी') || id.includes('lpg') || decodedId.includes('एलपीजी') || decodedId.includes('lpg')) &&
      (s.id.includes('%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0') || s.id.includes('lpg'))
    ) {
      return true;
    }

    // Fuzzy match for Sportstar Aces Awards
    if (
      (id.includes('sportstar') || decodedId.includes('sportstar')) &&
      s.id.includes('sportstar')
    ) {
      return true;
    }

    // Normalized alphanumeric match (only if targetNorm is meaningful)
    if (targetNorm && targetNorm.length >= 4) {
      const sNorm = normalize(s.id);
      if (sNorm === targetNorm) return true;
      if (sNorm.length >= 8 && targetNorm.length >= 8) {
        if (sNorm.startsWith(targetNorm) || targetNorm.startsWith(sNorm)) return true;
      }
    }
    return false;
  });

  if (localFound) {
    return sanitizeStory({ ...localFound, id });
  }

  // 3. Check Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, STORIES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return sanitizeStory({ id: snapshot.id, ...snapshot.data() } as Story);
      }
      if (decodedId !== id) {
        const decodedDocRef = doc(db, STORIES_COLLECTION, decodedId);
        const decodedSnapshot = await getDoc(decodedDocRef);
        if (decodedSnapshot.exists()) {
          return sanitizeStory({ id: decodedSnapshot.id, ...decodedSnapshot.data() } as Story);
        }
      }
    } catch (err) {
      console.warn(`Firestore getStoryById(${id}) fallback:`, err);
    }
  }

  // 4. Fallback prototype matching by fuzzy key
  for (const [protoKey, proto] of Object.entries(PROTOTYPE_CONTENT_MAP)) {
    const protoDecoded = safeDecode(protoKey).toLowerCase();
    if (protoDecoded === decodedId.toLowerCase() || protoDecoded === targetDecoded.toLowerCase()) {
      const isSports = protoKey.includes('hockey') || protoKey.includes('sports') || protoKey.includes('ipl') || protoKey.includes('sportstar');
      const isStartup = protoKey.includes('cow') || protoKey.includes('litchi') || protoKey.includes('community');
      const isEdu = protoKey.includes('deled') || protoKey.includes('result') || protoKey.includes('cleanest-air') || protoKey.includes('lpg') || protoKey.includes('एलपीजी');
      return sanitizeStory({
        id,
        title: proto.title || protoKey,
        summary: proto.summary || '',
        content: proto.content,
        categorySlug: isSports ? 'sports' : isStartup ? 'entrepreneurship-startups' : isEdu ? 'education-social' : 'industry-innovation',
        category: isSports ? 'Sports' : isStartup ? 'Entrepreneurship & Startups' : isEdu ? 'Education & Social' : 'Industry & Innovation',
        date: 'March 15, 2026',
        author: 'Bihar Say Desk',
        readTime: proto.readTime || '4 min read',
        imageUrl: PROTOTYPE_IMAGE_MAP[protoKey] || ''
      });
    }
  }

  return null;
}


/**
 * Get stories by category.
 */
export async function getStoriesByCategory(categorySlug: CategorySlug): Promise<Story[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, STORIES_COLLECTION),
        where('categorySlug', '==', categorySlug),
        firestoreLimit(100)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const rawStories = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Story))
          .filter(s => !EXCLUDED_STORY_IDS.has(s.id));
        const stories = rawStories.map(sanitizeStory);
        const sorted = stories.sort((a, b) => {
          const isUserA = a.id.startsWith('user-story') || a.id.startsWith('local');
          const isUserB = b.id.startsWith('user-story') || b.id.startsWith('local');
          if (isUserA && !isUserB) return -1;
          if (!isUserA && isUserB) return 1;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        return deduplicateStories(sorted);
      }
    } catch (err) {
      console.warn(`Firestore category query for ${categorySlug} fallback:`, err);
    }
  }
  return deduplicateStories(
    INITIAL_STORIES
      .filter(s => s.categorySlug === categorySlug && !EXCLUDED_STORY_IDS.has(s.id))
      .map(sanitizeStory)
  );
}

/**
 * Submit a community story to Firestore.
 * Submissions default to 'pending' and require editorial approval before appearing in public feeds.
 */
export async function submitStory(submission: Omit<StorySubmission, 'createdAt' | 'status'>): Promise<string> {
  const fullSubmission: StorySubmission = {
    ...submission,
    imageUrl: submission.imageUrl || '',
    authorName: submission.authorName || 'Community Voice',
    authorEmail: submission.authorEmail || 'contributor@biharsay.com',
    userId: submission.userId || '',
    createdAt: new Date().toISOString(),
    status: 'pending', // Pending editorial moderation before publishing
  };

  if (isFirebaseConfigured() && db) {
    try {
      const cleanDoc: Record<string, any> = {
        title: fullSubmission.title || '',
        category: fullSubmission.category || 'Culture & Heritage',
        categorySlug: fullSubmission.categorySlug || 'culture-heritage',
        content: fullSubmission.content || '',
        authorName: fullSubmission.authorName,
        authorEmail: fullSubmission.authorEmail,
        status: 'pending',
        createdAt: fullSubmission.createdAt,
        imageUrl: fullSubmission.imageUrl || '',
        serverTimestamp: serverTimestamp(),
      };
      if (fullSubmission.userId) {
        cleanDoc.userId = fullSubmission.userId;
      }

      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), cleanDoc);
      return docRef.id;
    } catch (err: any) {
      console.error('Failed saving submission to Firestore:', err);
      // Re-throw so user gets real error feedback
      throw new Error(err?.message || 'Failed saving story to database.');
    }
  }

  // Fallback local persistence (held in pending submissions list)
  localSubmissions.push(fullSubmission);
  const localId = `pending-local-${Date.now()}`;
  return localId;
}

/**
 * Editorial helper: Approve a pending community submission and publish it to the live feed.
 */
export async function approveStorySubmission(submissionId: string): Promise<boolean> {
  if (isFirebaseConfigured() && db) {
    try {
      const subDocRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      const subSnap = await getDoc(subDocRef);
      if (!subSnap.exists()) return false;

      const data = subSnap.data() as StorySubmission;
      const storyId = `story-${submissionId}`;

      // Mark submission as approved
      await updateDoc(subDocRef, { status: 'approved' });

      // Publish to public stories collection with featured & hero priority
      const now = new Date();
      await setDoc(doc(db, STORIES_COLLECTION, storyId), {
        id: storyId,
        title: data.title,
        summary: data.content.slice(0, 160) + '...',
        content: data.content,
        category: data.category,
        categorySlug: data.categorySlug,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: data.authorName,
        readTime: '3 min read',
        views: 1,
        imageUrl: data.imageUrl || '',
        isFeatured: true,
        isHero: true,
        featuredOrder: 0,
        createdAt: now.toISOString(),
        publishedAt: now.toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Error approving story submission:', err);
      return false;
    }
  }
  return false;
}

/**
 * Toggle bookmark for an authenticated user.
 */
export async function toggleBookmark(userId: string, storyId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Local storage cache for instant UI feedback
  const storageKey = `biharsay_bookmarks_${userId}`;
  const raw = localStorage.getItem(storageKey);
  const bookmarks: string[] = raw ? JSON.parse(raw) : [];
  const exists = bookmarks.includes(storyId);
  const updated = exists ? bookmarks.filter(id => id !== storyId) : [...bookmarks, storyId];
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // Sync with Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${storyId}`);
      if (exists) {
        await setDoc(bookmarkRef, { active: false }, { merge: true });
      } else {
        await setDoc(bookmarkRef, {
          userId,
          storyId,
          active: true,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Bookmark sync with Firestore fallback:', err);
    }
  }

  return !exists;
}

export function getUserBookmarks(userId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`biharsay_bookmarks_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch all comments for an article from Firestore.
 */
export async function getStoryComments(storyId: string): Promise<StoryComment[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('storyId', '==', storyId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryComment));
        return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn(`Error fetching comments for ${storyId} from Firestore:`, err);
    }
  }

  // Fallback to local comments
  return localComments
    .filter(c => c.storyId === storyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Post a new comment to an article in Firestore.
 */
export async function addStoryComment(comment: Omit<StoryComment, 'id' | 'createdAt'>): Promise<StoryComment> {
  const newComment: StoryComment = {
    ...comment,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
        ...newComment,
        serverTimestamp: serverTimestamp(),
      });
      return { id: docRef.id, ...newComment };
    } catch (err) {
      console.warn('Failed to save comment to Firestore, saving to local memory:', err);
    }
  }

  const localId = `local-comm-${Date.now()}`;
  const fullLocalComment: StoryComment = { id: localId, ...newComment };
  localComments.push(fullLocalComment);
  return fullLocalComment;
}

/**
 * Get story likes/claps count and whether the current user liked it.
 */
export async function getStoryReactions(storyId: string, currentUserId?: string): Promise<{ likesCount: number; isLiked: boolean }> {
  // Base count seeded from story views or default
  const baseLikes = 12;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, REACTIONS_COLLECTION, storyId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const likedBy: string[] = data.likedBy || [];
        return {
          likesCount: (data.likesCount || 0) + baseLikes,
          isLiked: currentUserId ? likedBy.includes(currentUserId) : false,
        };
      }
    } catch (err) {
      console.warn(`Firestore getStoryReactions fallback for ${storyId}:`, err);
    }
  }

  const local = localReactions[storyId];
  if (local) {
    return {
      likesCount: local.likesCount + baseLikes,
      isLiked: currentUserId ? local.likedBy.includes(currentUserId) : false,
    };
  }

  return {
    likesCount: baseLikes,
    isLiked: false,
  };
}

/**
 * Toggle like/clap on a story.
 */
export async function toggleStoryLike(storyId: string, userId: string): Promise<{ likesCount: number; isLiked: boolean }> {
  const baseLikes = 12;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, REACTIONS_COLLECTION, storyId);
      const snapshot = await getDoc(docRef);
      let likedBy: string[] = [];
      let likesCount = 0;

      if (snapshot.exists()) {
        const data = snapshot.data();
        likedBy = data.likedBy || [];
        likesCount = data.likesCount || 0;
      }

      const alreadyLiked = likedBy.includes(userId);

      // Use atomic Firestore operations to prevent race conditions
      // when multiple users like/unlike simultaneously
      await setDoc(docRef, {
        storyId,
        likesCount: increment(alreadyLiked ? -1 : 1),
        likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const updatedCount = alreadyLiked ? Math.max(0, likesCount - 1) : likesCount + 1;

      return {
        likesCount: updatedCount + baseLikes,
        isLiked: !alreadyLiked,
      };
    } catch (err) {
      console.warn('Failed to update reaction in Firestore, updating local state:', err);
    }
  }

  // Local fallback
  if (!localReactions[storyId]) {
    localReactions[storyId] = { likesCount: 0, likedBy: [] };
  }
  const local = localReactions[storyId];
  const alreadyLiked = local.likedBy.includes(userId);
  local.likedBy = alreadyLiked
    ? local.likedBy.filter(id => id !== userId)
    : [...local.likedBy, userId];
  local.likesCount = alreadyLiked ? Math.max(0, local.likesCount - 1) : local.likesCount + 1;

  return {
    likesCount: local.likesCount + baseLikes,
    isLiked: !alreadyLiked,
  };
}

export interface BusinessInquiry {
  id?: string;
  service: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  message?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

const BUSINESS_QUERIES_COLLECTION = 'business_queries';

export async function saveBusinessInquiry(
  inquiry: Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; id: string }> {
  const newInquiry: BusinessInquiry = {
    ...inquiry,
    createdAt: new Date().toISOString(),
    status: 'new',
  };

  const localId = `query-${Date.now()}`;

  // Persist to Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, BUSINESS_QUERIES_COLLECTION), newInquiry);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.warn('Firestore business query failed, saving locally:', err);
    }
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('biharsay_business_queries') || '[]');
      existing.unshift({ id: localId, ...newInquiry });
      localStorage.setItem('biharsay_business_queries', JSON.stringify(existing));
    } catch (e) {
      console.error('Local business query storage error:', e);
    }
  }

  return { success: true, id: localId };
}

export interface NewsletterSubscriber {
  id?: string;
  contact: string;
  channel: 'email' | 'whatsapp';
  createdAt: string;
  status: 'active' | 'unsubscribed';
}

const NEWSLETTER_COLLECTION = 'newsletter_subscribers';

export async function subscribeNewsletter(data: {
  contact: string;
  channel: 'email' | 'whatsapp';
}): Promise<{ success: boolean; id: string }> {
  const subscriber: NewsletterSubscriber = {
    contact: data.contact.trim(),
    channel: data.channel,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  const localId = `sub-${Date.now()}`;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, NEWSLETTER_COLLECTION), subscriber);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.warn('Firestore newsletter subscription failed, saving locally:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('biharsay_subscribers') || '[]');
      existing.unshift({ id: localId, ...subscriber });
      localStorage.setItem('biharsay_subscribers', JSON.stringify(existing));
    } catch (e) {
      console.error('Local subscriber storage error:', e);
    }
  }

  return { success: true, id: localId };
}
