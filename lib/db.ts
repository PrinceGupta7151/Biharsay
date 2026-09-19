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
]);

// Canonical image mapping from authentic locally hosted legacy media
const CANONICAL_IMAGE_MAP: Record<string, string> = {};
const TITLE_IMAGE_MAP: Record<string, string> = {};

// Prototype & standalone stories image mapping
const PROTOTYPE_IMAGE_MAP: Record<string, string> = {
  'bihar-gov-dbt-flood-relief': '/legacy-images/Bihar-Say-Website-80.png',
  'bihar-ai-growth-2026-gcc-policy': '/legacy-images/Bihar-Say-Website-75.png',
  'bihar-makhana-boom-migration': '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg',
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
  'patna-womens-college-golden-jubilee': 'patna-womens-college-hosts-golden-jubilee-reunion',
  'singhada-superfood-immunity': 'singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy',
  'sonpur-mela-special-trains': 'sonpur-mela-2025-special-trains-full-list-timings-travel-guide',
  'patna-high-tech-stadium': 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium',
  'bihar-makhana-boom-migration': 'bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate',
  'bihar-ai-growth-2026-gcc-policy': 'bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi',
};

// Rich editorial content for standalone prototype stories
export const PROTOTYPE_CONTENT_MAP: Record<string, { title?: string; summary?: string; content: string; readTime?: string }> = {
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


export function cleanArticleContent(rawContent: string): string {
  if (!rawContent) return '';

  let text = rawContent;

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

  // 4. Remove inline class and style attributes from raw scraped DOM elements
  text = text.replace(/\s*class="[^"]*"/gi, '');
  text = text.replace(/\s*style="[^"]*"/gi, '');

  // 5. Normalize newlines
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 6. Convert markdown headers (####, ###, ##, #) to proper HTML tags
  text = text.replace(/^[ \t]*####[ \t]+(.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^[ \t]*###[ \t]+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^[ \t]*##[ \t]+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^[ \t]*#[ \t]+(.+)$/gm, '<h2>$1</h2>');

  // 7. Convert markdown bold and italic if raw
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  // 8. Clean up self-closing br tags and empty tags
  text = text.replace(/<br\s*\/?>/gi, '<br />');
  text = text.replace(/<(p|div|span)[^>]*>\s*<\/\1>/gi, '');

  // 9. Convert any redundant <h1> tags in body to <h2> so page title <h1> remains unique
  text = text.replace(/<h1(\s*|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');

  // 10. Ensure proper semantic paragraph wrapping
  const blocks = text.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
  const formattedBlocks = blocks.map(block => {
    // If block is already a block-level HTML element, keep as is
    if (/^<(h[1-6]|p|blockquote|ul|ol|li|div|figure|table|section)/i.test(block)) {
      return block;
    }
    // Replace single newlines within a paragraph with <br />
    const inner = block.replace(/\n/g, '<br />');
    return `<p>${inner}</p>`;
  });

  return formattedBlocks.join('\n\n').trim();
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

  let title = story.title ? story.title.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000') : story.title;
  let summary = story.summary ? story.summary.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000') : story.summary;
  let content = story.content ? cleanArticleContent(story.content) : story.content;
  let readTime = story.readTime;

  // Resolve full content if missing or if a much richer version is available
  const canonicalFull = findCanonicalStory(story);
  const proto = PROTOTYPE_CONTENT_MAP[story.id];
  const richerSource = (proto && proto.content && proto.content.length > (content ? content.length : 0))
    ? proto
    : (canonicalFull && canonicalFull.content && canonicalFull.content.length > (content ? content.length : 0))
      ? canonicalFull
      : null;

  if (richerSource && richerSource.content) {
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
    } else if (PROTOTYPE_CONTENT_MAP[story.id]) {
      const protoFallback = PROTOTYPE_CONTENT_MAP[story.id];
      content = cleanArticleContent(protoFallback.content);
      if (!summary || summary.trim().length < 50) {
        summary = protoFallback.summary || summary;
      }
      if (!readTime) {
        readTime = protoFallback.readTime || '4 min read';
      }
    }
  }

  if (title && title.toLowerCase().includes('litchi') && content) {
    content = content.replace(/mango and makhana clusters/gi, 'mango and regional horticulture clusters')
      .replace(/makhana/gi, 'horticulture');
  }
  return { ...story, title, summary, content, readTime, imageUrl: img };
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
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
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

        const combined = [...firestoreStories, ...Array.from(localStoryMap.values())];
        return deduplicateStories(combined);
      }
    } catch (err) {
      console.warn('Firestore fetch failed or timed out, using curated seed stories:', err);
    }
  }
  return deduplicateStories(localStories);
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
 * Get single story by ID.
 */
export async function getStoryById(id: string): Promise<Story | null> {
  const safeDecode = (str: string) => {
    try {
      return decodeURIComponent(str || '');
    } catch {
      return str || '';
    }
  };

  const decodedId = safeDecode(id);
  const normalize = (str: string) => safeDecode(str).toLowerCase().replace(/[^a-z0-9]/g, '');

  const canonicalId = ALIAS_TO_CANONICAL_ID[id] || ALIAS_TO_CANONICAL_ID[decodedId];
  const targetId = canonicalId || id;

  // 1. Prioritize full rich local story from INITIAL_STORIES if available with high detail (>= 1000 chars)
  const localFound = INITIAL_STORIES.find(s => s.id === targetId || s.id === id || s.id === decodedId || normalize(s.id) === normalize(targetId));
  if (localFound && localFound.content && localFound.content.trim().length >= 1000) {
    return sanitizeStory(localFound);
  }

  // 2. Check standalone prototype stories with rich content
  if (PROTOTYPE_CONTENT_MAP[id] || PROTOTYPE_CONTENT_MAP[decodedId]) {
    const protoKey = PROTOTYPE_CONTENT_MAP[id] ? id : decodedId;
    const proto = PROTOTYPE_CONTENT_MAP[protoKey];
    const isSports = protoKey.includes('hockey') || protoKey.includes('sports') || protoKey.includes('ipl');
    const isStartup = protoKey.includes('cow') || protoKey.includes('litchi') || protoKey.includes('community') || protoKey.includes('makhana');
    const protoStory: Story = {
      id: protoKey,
      title: proto.title || protoKey,
      summary: proto.summary || '',
      content: proto.content,
      categorySlug: isSports ? 'sports' : isStartup ? 'entrepreneurship-startups' : 'industry-innovation',
      category: isSports ? 'Sports' : isStartup ? 'Entrepreneurship & Startups' : 'Industry & Innovation',
      date: 'Dec 1, 2025',
      author: 'Amrita',
      readTime: proto.readTime || '6 min read',
      imageUrl: PROTOTYPE_IMAGE_MAP[protoKey] || ''
    };
    return sanitizeStory(protoStory);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, STORIES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return sanitizeStory({ id: snapshot.id, ...snapshot.data() } as Story);
      }
      // Check with decodedId if exact id not found
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

  const targetNorm = normalize(id);
  const found = INITIAL_STORIES.find(s => {
    if (s.id === id || s.id === decodedId) return true;
    return normalize(s.id) === targetNorm;
  });

  if (found) {
    return sanitizeStory(found);
  }

  // Alias lookup fallback
  if (canonicalId) {
    const canonicalStory = INITIAL_STORIES.find(s => s.id === canonicalId || normalize(s.id) === normalize(canonicalId));
    if (canonicalStory) {
      return sanitizeStory({ ...canonicalStory, id });
    }
  }

  // Standalone prototype story fallback
  if (PROTOTYPE_CONTENT_MAP[id] || PROTOTYPE_CONTENT_MAP[decodedId]) {
    const protoKey = PROTOTYPE_CONTENT_MAP[id] ? id : decodedId;
    const proto = PROTOTYPE_CONTENT_MAP[protoKey];
    const isSports = protoKey.includes('hockey') || protoKey.includes('sports') || protoKey.includes('ipl');
    const isStartup = protoKey.includes('cow') || protoKey.includes('litchi') || protoKey.includes('community');
    const protoStory: Story = {
      id: protoKey,
      title: proto.title || protoKey,
      summary: proto.summary || '',
      content: proto.content,
      categorySlug: isSports ? 'sports' : isStartup ? 'entrepreneurship-startups' : 'industry-innovation',
      category: isSports ? 'Sports' : isStartup ? 'Entrepreneurship & Startups' : 'Industry & Innovation',
      date: 'March 15, 2026',
      author: 'Bihar Say Desk',
      readTime: proto.readTime || '4 min read',
      imageUrl: PROTOTYPE_IMAGE_MAP[protoKey] || ''
    };
    return sanitizeStory(protoStory);
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
        const rawStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
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
  return deduplicateStories(INITIAL_STORIES.filter(s => s.categorySlug === categorySlug).map(sanitizeStory));
}

/**
 * Submit a community story to Firestore.
 * Submissions default to 'pending' and require editorial approval before appearing in public feeds.
 */
export async function submitStory(submission: Omit<StorySubmission, 'createdAt' | 'status'>): Promise<string> {
  const fullSubmission: StorySubmission = {
    ...submission,
    createdAt: new Date().toISOString(),
    status: 'pending', // Pending editorial moderation before publishing
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
        ...fullSubmission,
        serverTimestamp: serverTimestamp(),
      });
      // Story stays in SUBMISSIONS_COLLECTION with status 'pending'
      // until reviewed and approved by Bihar Say editorial moderation.
      return docRef.id;
    } catch (err) {
      console.warn('Failed saving submission to Firestore, saving to local state:', err);
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

      // Publish to public stories collection
      await setDoc(doc(db, STORIES_COLLECTION, storyId), {
        id: storyId,
        title: data.title,
        summary: data.content.slice(0, 160) + '...',
        content: data.content,
        category: data.category,
        categorySlug: data.categorySlug,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: data.authorName,
        readTime: '3 min read',
        views: 1,
        imageUrl: '',
        createdAt: new Date().toISOString(),
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
