const fs = require('fs');
const path = require('path');

const userStoriesData = [
  // --- TOP PICKS (HERO & SIDE PICKS) ---
  {
    id: "bharatnet-to-bring-fiber-internet-to-bihar-villages",
    title: "BharatNet to Bring Fiber Internet to Bihar Villages",
    url: "https://biharsay.com/2026/09/10/bharatnet-to-bring-fiber-internet-to-bihar-villages/",
    categorySlug: "investments-economic",
    categoryName: "Investments & Economic",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-09-10",
    isHero: true,
    isFeatured: true,
    featuredOrder: 1,
    summary: "What if the next big change in a Bihar village does not arrive on a new highway, but through a fiber cable running quietly into homes? That is the promise behind the revised BharatNet plan for Bihar, which aims to take high-speed internet beyond panchayat buildings and closer to ordinary rural households with direct fiber links and Fiber to the Home (FTTH).",
    content: "<h1>Bihar’s Villages Are Getting a Digital Lifeline: BharatNet Plans to Take Fiber Internet to Every Home</h1>\n<p>What if the next big change in a Bihar village does not arrive on a new highway, but through a fiber cable running quietly into homes?</p>\n<p>That is the promise behind the revised <strong>BharatNet plan for Bihar</strong>, which aims to take high-speed internet beyond panchayat buildings and closer to ordinary rural households. The plan focuses on stronger village connectivity, direct fiber links for government institutions, and <strong>Fiber to the Home (FTTH)</strong> connections for families.</p>\n<p>According to reports, the Bihar government’s Information Technology Department has started work on necessary changes to its existing agreement with the Centre. The network expansion is expected to begin by the end of the year.</p>\n<h2>What is changing with BharatNet in Bihar?</h2>\n<p>Until now, BharatNet connectivity in many villages has largely focused on reaching the <strong>gram panchayat level</strong>. The revised approach aims to take that network further into schools, health centres, and households.</p>"
  },
  {
    id: "prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects",
    title: "Prime Group to invest ₹1,500 crore in Bihar real estate, targeting 5 million sq ft Projects",
    url: "https://biharsay.com/2026/09/09/prime-group-to-invest-%e2%82%b91500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects/",
    categorySlug: "investments-economic",
    categoryName: "Investments & Economic",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-09-09",
    isHero: false,
    isFeatured: true,
    featuredOrder: 2,
    summary: "For years, Bihar’s real estate story was largely seen through the lens of Patna. Now, something bigger may be taking shape. Prime Group plans to invest around ₹1,500 crore in Bihar’s real estate sector over the next four quarters, with a development pipeline of nearly 5 million sq ft across residential and mixed-use projects.",
    content: "<h1>₹1,500 Crore, 5 Million Sq Ft: Why Prime Group Is Turning to Bihar</h1>\n<p>For years, Bihar’s real estate story was largely seen through the lens of Patna. Now, something bigger may be taking shape.</p>\n<p>Prime Group plans to invest around <strong>₹1,500 crore in Bihar’s real estate sector over the next four quarters</strong>, with a development pipeline of nearly <strong>5 million sq ft</strong> across residential and mixed-use projects.</p>"
  },
  {
    id: "bihars-food-processing-story-is-going-global-what-the-new-bihar-uae-partnership-could-unlock",
    title: "Bihar’s Food Processing Story Is Going Global: What the New Bihar–UAE Partnership Could Unlock",
    url: "https://biharsay.com/2026/09/08/bihars-food-processing-story-is-going-global-what-the-new-bihar-uae-partnership-could-unlock/",
    categorySlug: "investments-economic",
    categoryName: "Investments & Economic",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-09-08",
    isHero: false,
    isFeatured: true,
    featuredOrder: 3,
    summary: "What if Bihar’s next big investment story begins not with a factory, but with what already grows in its fields? That is the bigger question behind a new Bihar–UAE partnership announced at the AIM Congress 2026 in Dubai to promote a dedicated Food Processing Park serving Gulf and global markets.",
    content: "<h1>Bihar’s Food Processing Story Is Going Global: What the New Bihar–UAE Partnership Could Unlock</h1>\n<p><strong>What if Bihar’s next big investment story begins not with a factory, but with what already grows in its fields?</strong></p>\n<p>That is the bigger question behind a new Bihar–UAE partnership announced at the <strong>AIM Congress 2026 in Dubai</strong>.</p>"
  },
  {
    id: "patna-to-get-high-tech-21-crore-indoor-stadium",
    title: "Patna to Get High-Tech ₹21 Crore Indoor Stadium",
    url: "https://biharsay.com/2026/09/07/patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-09-07",
    isHero: false,
    isFeatured: true,
    featuredOrder: 4,
    summary: "Patna is set to welcome a modern ₹21 Crore indoor sports facility equipped with international-grade badminton, table tennis, and multi-purpose arenas for young athletes.",
    content: "<h1>Patna to Get High-Tech ₹21 Crore Indoor Stadium</h1>\n<p>Patna’s sporting landscape is set for a major upgrade with the approval of a modern ₹21 crore high-tech indoor stadium equipped for national and international events.</p>"
  },

  // --- CULTURE & HERITAGE ---
  {
    id: "when-nepal-floods-trapped-106-pilgrims-bihar-became-their-way-home",
    title: "When Nepal Floods Trapped 106 Pilgrims, Bihar Became Their Way Home",
    url: "https://biharsay.com/2026/09/02/when-nepal-floods-trapped-106-pilgrims-bihar-became-their-way-home-%e2%9d%a4%ef%b8%8f%f0%9f%87%ae%f0%9f%87%b3/",
    categorySlug: "culture-heritage",
    categoryName: "Culture & Heritage",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-09-02",
    summary: "When Nepal Floods Trapped 106 Pilgrims, Bihar Became Their Way Home. What happened next in Sitamarhi was more than a rescue. It was a reminder that compassion can cross every border.",
    content: "<h1>When Nepal Floods Trapped 106 Pilgrims, Bihar Became Their Way Home</h1>\n<p>What happened next in Sitamarhi was more than a rescue. It was a reminder that compassion can cross every border.</p>\n<p>When severe floods stranded 106 pilgrims in Nepal, local authorities and communities in Bihar stepped in to provide shelter, food, transport, and a safe journey home.</p>"
  },
  {
    id: "singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy",
    title: "Singhada: The Superfood That Boosts Immunity, Beauty & Everyday Energy",
    url: "https://biharsay.com/2025/11/24/singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy/",
    categorySlug: "culture-heritage",
    categoryName: "Culture & Heritage",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-11-24",
    summary: "Singhada (Water Chestnut) harvested across Bihar's wetlands is gaining global recognition as an everyday superfood boosting immunity, skin health, and natural energy.",
    content: "<h1>Singhada: The Superfood That Boosts Immunity, Beauty & Everyday Energy</h1>\n<p>Harvested in abundance across Bihar’s aquatic fields, Singhada (Water Chestnut) is far more than a seasonal treat—it is a nutrient-dense superfood powerpack.</p>"
  },
  {
    id: "sonpur-mela-2025-special-trains-full-list-timings-travel-guide",
    title: "Sonpur Mela 2025 Special Trains: Full List, Timings & Travel Guide",
    url: "https://biharsay.com/2025/11/15/sonpur-mela-2025-special-trains-full-list-timings-travel-guide/",
    categorySlug: "culture-heritage",
    categoryName: "Culture & Heritage",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-11-15",
    summary: "Sonpur Mela 2025: Special Trains, Fresh Buzz & A Smoother Journey Than Ever! Indian Railways introduces expanded services for Asia's largest historic cattle and cultural fair.",
    content: "<h1>Sonpur Mela 2025: Special Trains, Fresh Buzz & A Smoother Journey Than Ever!</h1>\n<p>If you have ever wanted to feel Bihar’s cultural heartbeat in one place, <strong>Sonpur Mela 2025</strong> is calling louder than ever. The energy is rising, the stalls are ready, and Indian Railways has stepped in to make your journey easier than before.</p>"
  },
  {
    id: "patna-womens-college-hosts-golden-jubilee-reunion",
    title: "Patna Women’s College Hosts Golden Jubilee Reunion",
    url: "https://biharsay.com/2025/11/02/patna-womens-college-hosts-golden-jubilee-reunion/",
    categorySlug: "culture-heritage",
    categoryName: "Culture & Heritage",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-11-02",
    summary: "Patna Women’s College hosted its Golden Jubilee Reunion, bringing together alumni from across generations to celebrate excellence, sisterhood, and nostalgia.",
    content: "<h1>Patna Women’s College Hosts Golden Jubilee Reunion</h1>\n<p>Golden Jubilee Reunion: When Patna Women’s College 1975 Batch Turned Memories Into Magic! A morning filled with nostalgia, awards, and emotional reunions.</p>"
  },
  {
    id: "bihar-tourism-launches-a-double-decker-bus-on-jp-ganga-path-covering-ghats-and-heritage-spots",
    title: "Bihar Tourism launches Double Decker Bus on JP Ganga Path, covering ghats and heritage spots",
    url: "https://biharsay.com/2025/09/05/bihar-tourism-launches-a-double-decker-bus-on-jp-ganga-path-covering-ghats-and-heritage-spots/",
    categorySlug: "culture-heritage",
    categoryName: "Culture & Heritage",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-09-05",
    summary: "Bihar Tourism introduces open-top Double Decker Tourist Buses along JP Ganga Path in Patna, offering panoramic riverfront views of historic ghats.",
    content: "<h1>Bihar Tourism Launches Open-Top Double Decker Bus on JP Ganga Path</h1>\n<p>Patna’s riverfront gets a major tourism boost as open-top double decker buses hit the scenic JP Ganga Path corridor.</p>"
  },

  // --- EDUCATION & SOCIAL IMPACT ---
  {
    id: "bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details",
    title: "Bihar DElEd Admission 2026: 20 Aug Merit List, Dates & Admission Details",
    url: "https://biharsay.com/2026/08/10/bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-08-10",
    summary: "Complete schedule, merit list release details, and step-by-step guidance for Bihar DElEd Admission 2026 aspirants.",
    content: "<h1>Bihar DElEd Admission 2026: Merit List, Key Dates & Counseling Details</h1>\n<p>BSEB releases key dates and merit list schedule for candidate counseling across teacher training institutes in Bihar.</p>"
  },
  {
    id: "bihar-approves-10mw-solar-power-plant-on-son-canal",
    title: "Bihar approves 10MW solar power plant on Son Canal",
    url: "https://biharsay.com/2026/03/29/bihar-approves-10mw-solar-power-plant-on-son-canal/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-03-29",
    summary: "In a major green energy milestone, Bihar Cabinet approves a 10MW canal-top solar power plant over the Son Canal network.",
    content: "<h1>Bihar Approves 10MW Canal-Top Solar Power Plant on Son Canal</h1>\n<p>Promoting clean energy infrastructure, Bihar approves 10MW solar installation over canal waters, preventing evaporation and generating green grid electricity.</p>"
  },
  {
    id: "munger-records-indias-cleanest-air-bihar-aqi-2026-update",
    title: "Munger Records India’s Cleanest Air : Bihar AQI 2026 Update",
    url: "https://biharsay.com/2026/03/29/munger-records-indias-cleanest-air-bihar-aqi-2026-update/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-03-29",
    summary: "Munger in Bihar surprises environmental monitors by recording India's cleanest air quality index (AQI) amidst green plantation drives.",
    content: "<h1>Munger Records India’s Cleanest Air: Bihar AQI 2026 Update</h1>\n<p>Environmental data reveals Munger topping clean air charts across India with an enviable single-digit AQI score.</p>"
  },
  {
    id: "bihar-board-10th-result-2026-declared",
    title: "Bihar Board 10th Result 2026 Declared",
    url: "https://biharsay.com/2026/03/29/bihar-board-10th-result-2026-declared/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-03-29",
    summary: "BSEB declares Class 10 Matriculation Results with record pass percentage and rural toppers leading the honor roll.",
    content: "<h1>Bihar Board 10th Result 2026 Declared</h1>\n<p>BSEB announces Class 10 matric exam results with high pass percentages across all districts of Bihar.</p>"
  },
  {
    id: "explore-munger-bihar-the-birthplace-of-yoga",
    title: "Celebrating Yoga Day: Discovering Bihar’s Legacy",
    url: "https://biharsay.com/2024/01/29/explore-munger-bihar-the-birthplace-of-yoga/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Explore Munger, Bihar — home of Bihar School of Yoga, attracting global seekers to the world capital of spiritual wellness.",
    content: "<h1>Celebrating Yoga Day: Discovering Munger & Bihar’s Spiritual Legacy</h1>\n<p>The story of modern yoga education begins in Munger on the banks of the Ganga at the renowned Bihar School of Yoga.</p>"
  },
  {
    id: "from-navy-to-netflix-how-santosh-singh",
    title: "From Navy to Netflix: How Santosh Singh Built His Film Journey",
    url: "https://biharsay.com/2024/01/29/19-cold-soup-recipes-for-hot-summer-days/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "The inspiring journey of Bihar-born director Santosh Singh, transitioning from Indian Navy officer to directing hit shows on Netflix.",
    content: "<h1>From Navy to Netflix: How Santosh Singh Built His Film Journey</h1>\n<p>From military service to OTT storytelling, Santosh Singh represents the creative drive of Bihari creators on the global stage.</p>"
  },
  {
    id: "why-nift-begusarai-is-more-than-just-an-institute-bihars-blueprint-for-textile",
    title: "Why NIFT Begusarai is More Than Just an Institute: Bihar's Blueprint for Textile",
    url: "https://biharsay.com/2024/01/29/why-nift-begusarai-is-more-than-just-an-institute-bihars-blueprint-for-textile/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "NIFT Begusarai is transforming Bihar's textile and apparel landscape, empowering local weavers and fashion entrepreneurs.",
    content: "<h1>Why NIFT Begusarai is More Than Just an Institute: Bihar's Blueprint for Textile</h1>\n<p>How NIFT in Begusarai is linking traditional Bihar handlooms with modern fashion supply chains and youth employment.</p>"
  },
  {
    id: "bihars-snack-revolution-gautam-bankas-game-changing-journey-with-bikaji-foods",
    title: "Bihar’s Snack Revolution: Gautam Banka’s Game-Changing Journey with Bikaji Foods",
    url: "https://biharsay.com/2024/01/29/bihars-snack-revolution-gautam-bankas-game-changing-journey-with-bikaji-foods/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Gautam Banka’s entrepreneurial vision building FMCG and snack distribution networks scaling across Bihar.",
    content: "<h1>Bihar’s Snack Revolution: Gautam Banka’s Game-Changing Journey with Bikaji Foods</h1>\n<p>Building nationwide FMCG manufacturing footprint from Bihar’s growing consumer market.</p>"
  },
  {
    id: "bihar-mahila-udyog-sangh",
    title: "The Legacy of Bihar Mahila Udyog Sangh",
    url: "https://biharsay.com/2024/01/29/bihar-mahila-udyog-sangh/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Empowering thousands of women artisans, craftswomen, and micro-entrepreneurs across Bihar through trade fairs and self-help groups.",
    content: "<h1>The Legacy of Bihar Mahila Udyog Sangh</h1>\n<p>For over three decades, Bihar Mahila Udyog Sangh has provided market access and financial independence for women artisans.</p>"
  },
  {
    id: "from-jhajha-to-google-abhishek-kumars-inspiring-journey-to-a-2-07-crore-dream-job",
    title: "From Jhajha to Google: Abhishek Kumar’s Inspiring Journey to a ₹2.07 Crore Dream Job",
    url: "https://biharsay.com/2024/01/29/from-jhajha-to-google-abhishek-kumars-inspiring-journey-to-a-%e2%82%b92-07-crore-dream-job/",
    categorySlug: "education-social",
    categoryName: "Education & Social",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Abhishek Kumar from Jhajha in Jamui district overcomes humble beginnings to land a ₹2.07 crore software engineering offer at Google.",
    content: "<h1>From Jhajha to Google: Abhishek Kumar’s Inspiring Journey to a ₹2.07 Crore Dream Job</h1>\n<p>Proof that talent from Bihar's small towns can excel at global tech giants with perseverance and technical mastery.</p>"
  },

  // --- ENTREPRENEURSHIP & STARTUPS ---
  {
    id: "jk-cement-crosses-31-mta-with-new-buxar-plant-in-bihar",
    title: "JK Cement Crosses 31 MTA With New Buxar Plant in Bihar",
    url: "https://biharsay.com/2026/01/30/jk-cement-crosses-31-mta-with-new-buxar-plant-in-bihar/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-01-30",
    summary: "JK Cement expands manufacturing capacity past 31 MTA following commercial operations at its newly commissioned Buxar plant in Bihar.",
    content: "<h1>JK Cement Crosses 31 MTA With New Buxar Plant in Bihar</h1>\n<p>Industrial milestone in Buxar as JK Cement inaugurates modern grinding facility to supply Eastern India infrastructure.</p>"
  },
  {
    id: "bihar-say-now-0-to-13k-what-it-really-takes-to-build-a-digital-community-that-lasts-longer",
    title: "“Bihar Say” Now 0 to 13K: What It Really Takes to Build a Digital Community That Lasts Longer",
    url: "https://biharsay.com/2025/10/06/bihar-say-now-0-to-13k-what-it-really-takes-to-build-a-digital-community-that-lasts-longer/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-10-06",
    summary: "Most media pages fail in 100 days. Bihar Say grew to 15K+ community members through authentic, apolitical storytelling spotlighting Bihar's culture and startup founders.",
    content: "<h1>“Bihar Say” Now 0 to 13K: What It Really Takes to Build a Digital Community That Lasts</h1>\n<p>How Bihar Say built a 15K+ global audience by showcasing positive innovation, culture, and grassroot stories.</p>"
  },
  {
    id: "pm-transfers-7500-crore-to-75-lakh-women-in-bihar-10000-each-under-mukhyamantri-mahila-rojgar-yojana",
    title: "PM Transfers ₹7,500 Crore to 75 Lakh Women in Bihar, ₹10,000 Each Under Mukhyamantri Mahila Rojgar Yojana",
    url: "https://biharsay.com/2025/09/26/pm-transfers-%e2%82%b97500-crore-to-75-lakh-women-in-bihar-%e2%82%b910000-each-under-mukhyamantri-mahila-rojgar-yojana/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-09-26",
    summary: "Direct seed capital transfer empowering 75 lakh women across Bihar to start small enterprises and self-help business ventures.",
    content: "<h1>PM Transfers ₹7,500 Crore to 75 Lakh Women in Bihar Under Mukhyamantri Mahila Rojgar Yojana</h1>\n<p>Massive financial inclusion boost for Jeevika Didis and rural women entrepreneurs across Bihar.</p>"
  },
  {
    id: "bihar-gov-launches-cheap-loan-scheme-for-1-4-crore-jeevika-women",
    title: "Bihar Gov. Launches Cheap Loan Scheme for 1.4 Crore Jeevika Women",
    url: "https://biharsay.com/2025/09/02/bihar-gov-launches-cheap-loan-scheme-for-1-4-crore-jeevika-women/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-09-02",
    summary: "Subsidized low-interest credit facility announced for 1.4 crore Jeevika network members to fuel cottage industries.",
    content: "<h1>Bihar Gov Launches Subsidized Credit Scheme for 1.4 Crore Jeevika Women</h1>\n<p>Empowering rural micro-enterprises with low-interest institutional bank credit.</p>"
  },
  {
    id: "bihar-announces-scheme-for-women-entrepreneurs-offering-support-up-to-2-lakh",
    title: "Bihar Announces Scheme for Women Entrepreneurs, Offering Support Up to ₹2 Lakh",
    url: "https://biharsay.com/2025/09/01/bihar-announces-scheme-for-women-entrepreneurs-offering-support-up-to-%e2%82%b92-lakh/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-09-01",
    summary: "Financial assistance up to ₹2 Lakh provided to emerging women founders launching artisanal, food processing, or retail businesses.",
    content: "<h1>Bihar Announces Scheme for Women Entrepreneurs Offering Support Up to ₹2 Lakh</h1>\n<p>Targeted capital grant for women starting registered micro-enterprises in Bihar.</p>"
  },
  {
    id: "gomini-indias-first-cow-care-startup-blending-tradition-technology",
    title: "Gomini: India’s First Cow Care Startup Blending Tradition & Technology",
    url: "https://biharsay.com/2025/08/26/gomini-indias-first-cow-care-startup-blending-tradition-technology/",
    categorySlug: "entrepreneurship-startups",
    categoryName: "Entrepreneurship & Startups",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2025-08-26",
    summary: "Bihar startup Gomini combines IoT cattle health tracking, organic fodder delivery, and veterinary tele-consultation.",
    content: "<h1>Gomini: India’s First Cow Care Startup Blending Tradition & Technology</h1>\n<p>Agri-tech innovation originating from Bihar for dairy health and cattle wellness.</p>"
  },

  // --- INDUSTRY & INNOVATION ---
  {
    id: "bihar-gov-transfers-113-crore-to-flood-affected-farmers-via-dbt",
    title: "Bihar Gov Transfers ₹113 Crore to Flood-Affected Farmers via DBT",
    url: "https://biharsay.com/2026/02/22/bihar-gov-transfers-%e2%82%b9113-crore-to-flood-affected-farmers-via-dbt/",
    categorySlug: "industry-innovation",
    categoryName: "Industry & Innovation",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-02-22",
    summary: "Direct Benefit Transfer of ₹113 Crore credited to bank accounts of farmers affected by seasonal river swelling across 16 districts.",
    content: "<h1>Bihar Gov Transfers ₹113 Crore to Flood-Affected Farmers via Direct Benefit Transfer</h1>\n<p>Transparent digital payout delivering immediate relief to agricultural households.</p>"
  },
  {
    id: "bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi",
    title: "Bihar AI Growth 2026 : MoUs, GCC Policy & Tech Push at India AI Impact Summit Delhi",
    url: "https://biharsay.com/2026/02/17/bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi/",
    categorySlug: "industry-innovation",
    categoryName: "Industry & Innovation",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2026-02-17",
    summary: "Bihar unveils GCC Policy 2026 and signs AI infrastructure MoUs at India AI Impact Summit to establish IT hubs in Patna.",
    content: "<h1>Bihar AI Growth 2026: GCC Policy & Tech Push Announced in Delhi</h1>\n<p>Positioning Patna as an emerging Global Capability Center (GCC) and AI development cluster.</p>"
  },
  {
    id: "major-infrastructure-boost-for-bihar-union-budget-2024",
    title: "Major Infrastructure Boost for Bihar: Union Budget 2024",
    url: "https://biharsay.com/2024/01/29/major-infrastructure-boost-for-bihar-union-budget-2024/",
    categorySlug: "industry-innovation",
    categoryName: "Industry & Innovation",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Union Budget allocates ₹26,000 crore for highways, expressways, thermal power plants, and industrial corridors in Bihar.",
    content: "<h1>Major Infrastructure Boost for Bihar: Union Budget Allocations</h1>\n<p>Patna-Purnea Expressway, Buxar power plants, and flood mitigation grants spearhead Bihar infra drive.</p>"
  },
  {
    id: "foxconn-eyes-bihar-for-electronics-manufacturing",
    title: "Foxconn Eyes Bihar for Electronics Manufacturing",
    url: "https://biharsay.com/2024/01/29/foxconn-eyes-bihar-for-electronics-manufacturing/",
    categorySlug: "industry-innovation",
    categoryName: "Industry & Innovation",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-01-29",
    summary: "Global electronics manufacturing giant Foxconn evaluates land sites and talent availability for component assembly plants in Bihar.",
    content: "<h1>Foxconn Eyes Bihar for Electronics Manufacturing Expansion</h1>\n<p>High-level discussions focus on Bihar's plug-and-play industrial parks and skilled electronics workforce.</p>"
  },
  {
    id: "anmol-feeds-a-debt-free-powerhouse-with-800-crore-turnover-making-muzaffarpur-indias-no-1-feed-producer",
    title: "Anmol Feeds: A Debt-Free Powerhouse with ₹800 Crore Turnover Making Muzaffarpur India's No. 1 Feed Hub",
    url: "https://biharsay.com/2024/10/11/anmol-feeds-a-debt-free-powerhouse-with-%e2%82%b9800-crore-turnover-making-muzaffarpur-indias-no-1-feed-producer/",
    categorySlug: "industry-innovation",
    categoryName: "Industry & Innovation",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-10-11",
    summary: "How Muzaffarpur turned into India's leading aqua and poultry feed production capital driven by Anmol Feeds.",
    content: "<h1>Anmol Feeds: A Debt-Free Powerhouse with ₹800 Crore Turnover in Muzaffarpur</h1>\n<p>Industrial scale-up story showcasing Bihar's leadership in livestock and aqua feed manufacturing.</p>"
  },

  // --- SPORTS ---
  {
    id: "meet-bihars-shreyasi-singh-indias-first-mla-to-compete-in-the-olympics",
    title: "Meet Bihar’s Shreyasi Singh, India’s First MLA to Compete in the Olympics",
    url: "https://biharsay.com/2024/10/10/meet-bihars-shreyasi-singh-indias-first-mla-to-compete-in-the-olympics/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Neehar",
    publishedDate: "2024-10-10",
    summary: "International trap shooter and Jamui MLA Shreyasi Singh represents India at Paris Olympics, balancing public service with athletic excellence.",
    content: "<h1>Meet Bihar’s Shreyasi Singh, India’s First MLA to Compete in the Olympics</h1>\n<p>Commonwealth Gold Medalist Shreyasi Singh makes history as a sporting champion and elected representative.</p>"
  },
  {
    id: "meet-mr-phani-bhushan-from-bihar-nurturing-the-grassroots-talents-of-football-in-india",
    title: "Meet Mr Phani Bhushan from Bihar, Nurturing the Grassroots Talents of Football in India",
    url: "https://biharsay.com/2024/10/10/meet-mr-phani-bhushan-from-bihar-nurturing-the-grassroots-talents-of-football-in-india/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Neehar",
    publishedDate: "2024-10-10",
    summary: "Phani Bhushan’s dedicated football academy in Bihar nurtures young village talents for national leagues and AIFF youth squads.",
    content: "<h1>Meet Mr Phani Bhushan: Nurturing Bihar’s Grassroots Football Stars</h1>\n<p>Transforming village fields into training grounds for India's upcoming football talent.</p>"
  },
  {
    id: "akash-deeps-inspiring-journey-from-bihar-to-indias-test-cricket-team",
    title: "Akash Deep’s Inspiring Journey: From Bihar to India’s Test Cricket Team",
    url: "https://biharsay.com/2024/10/25/akash-deeps-inspiring-journey-from-bihar-to-indias-test-cricket-team/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Neehar",
    publishedDate: "2024-10-25",
    summary: "Fast bowler Akash Deep from Sasaram overcomes personal tragedies to earn his Test cap for Team India.",
    content: "<h1>Akash Deep’s Inspiring Journey: From Bihar to India’s Test Cricket Team</h1>\n<p>Story of grit, pace, and determination as Sasaram's Akash Deep shines on the international stage.</p>"
  },
  {
    id: "rajgirs-first-sports-academy-a-game-changer-for-bihars-athletes",
    title: "Rajgir’s First Sports Academy: A Game Changer for Bihar’s Athletes",
    url: "https://biharsay.com/2024/10/25/rajgirs-first-sports-academy-a-game-changer-for-bihars-athletes/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Neehar",
    publishedDate: "2024-10-25",
    summary: "State-of-the-art sports complex and hockey stadium in Rajgir provides Olympic-level training infrastructure.",
    content: "<h1>Rajgir’s First Sports Academy: A Game Changer for Bihar’s Athletes</h1>\n<p>World-class facilities hosting Asian Women's Hockey Championship and international tournaments.</p>"
  },
  {
    id: "supauls-rising-star-shakti-priya-makes-her-way-to-national-badminton-championship",
    title: "Supaul’s Rising Star: Shakti Priya Makes Her Way to National Badminton Championship",
    url: "https://biharsay.com/2024/11/13/supauls-rising-star-shakti-priya-makes-her-way-to-national-badminton-championship/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-11-13",
    summary: "Badminton prodigy Shakti Priya from Supaul qualifies for National Junior Badminton Championship.",
    content: "<h1>Supaul’s Rising Star: Shakti Priya Qualifies for National Badminton Championship</h1>\n<p>Rising shuttler from Kosi region storming national rankings.</p>"
  },
  {
    id: "bihar-the-rising-star-of-indian-sports-hosts-the-prestigious-asian-womens-hockey-championship",
    title: "Bihar: The Rising Star of Indian Sports – Hosts Asian Women’s Hockey Championship",
    url: "https://biharsay.com/2024/11/15/bihar-the-rising-star-of-indian-sports-hosts-the-prestigious-asian-womens-hockey-championship/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-11-15",
    summary: "Historical milestone as Rajgir Hockey Stadium hosts Asian Champions Trophy with international teams competing.",
    content: "<h1>Bihar Hosts Asian Women’s Hockey Championship at Rajgir</h1>\n<p>Global sports spotlight on Bihar as top Asian hockey teams battle in Rajgir.</p>"
  },
  {
    id: "bihar-a-game-changer-training-olympians-by-2025",
    title: "Bihar: A Game Changer – Training Olympians by 2025?",
    url: "https://biharsay.com/2024/11/16/bihar-a-game-changer-training-olympians-by-2025/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-11-16",
    summary: "State Sports Authority's talent identification program training 5,000+ promising youngsters across 38 districts.",
    content: "<h1>Bihar Sports Policy: Nurturing Olympic Prospects for 2028 and 2032</h1>\n<p>Systematic grassroots sports scouting and specialized coaching academies.</p>"
  },
  {
    id: "youngest-sensation-bihars-vaibhav-suryavanshi-shines-at-ipl-auction",
    title: "Youngest Sensation: Bihar’s Vaibhav Suryavanshi Shines at IPL Auction",
    url: "https://biharsay.com/2024/11/18/youngest-sensation-bihars-vaibhav-suryavanshi-shines-at-ipl-auction/",
    categorySlug: "sports",
    categoryName: "Sports",
    authorName: "Bihar Say | Amrita",
    publishedDate: "2024-11-18",
    summary: "13-year-old batting prodigy Vaibhav Suryavanshi from Samastipur creates IPL history after Rajasthan Royals bid ₹1.10 Crore.",
    content: "<h1>Youngest Sensation: Bihar’s Vaibhav Suryavanshi Shines at IPL Auction</h1>\n<p>Samastipur teen sensation Vaibhav Suryavanshi breaks records as the youngest IPL contract winner in history.</p>"
  }
];

// Write to articles.json & seedStories.ts
const DATA_DIR = path.join(__dirname, '..', 'data');
const ARTICLES_PATH = path.join(DATA_DIR, 'articles.json');
const SEED_PATH = path.join(DATA_DIR, 'seedStories.ts');

let existingArticles = [];
if (fs.existsSync(ARTICLES_PATH)) {
  existingArticles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
}

// Map requested user stories ahead
const userMap = new Map();
userStoriesData.forEach(s => userMap.set(s.id, s));

// Combine user stories first, then rest
const finalArticles = [...userStoriesData];
existingArticles.forEach(a => {
  if (!userMap.has(a.id)) {
    finalArticles.push(a);
  }
});

fs.writeFileSync(ARTICLES_PATH, JSON.stringify(finalArticles, null, 2), 'utf-8');
console.log(`[UPDATED] ${ARTICLES_PATH} with ${finalArticles.length} total articles.`);

// Rebuild seedStories.ts
const header = `// Automatically generated from legacy WordPress migration with 100% locally hosted assets
import { CategoryInfo, Story } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'culture-heritage',
    name: 'Culture & Heritage',
    subtitle: 'Stories, festivals, crafts and everyday cultural resurgence across Bihar.',
    dotClass: 'culture',
    color: '#0E3E73',
  },
  {
    slug: 'education-social',
    name: 'Education & Social',
    subtitle: "Academics, results, youth empowerment, and the state's social progress.",
    dotClass: 'edu',
    color: '#4A7AAE',
  },
  {
    slug: 'entrepreneurship-startups',
    name: 'Entrepreneurship & Startups',
    subtitle: 'Founders, innovators and grassroots enterprises scaling from Bihar to the world.',
    dotClass: 'startup',
    color: '#1D6FD8',
  },
  {
    slug: 'industry-innovation',
    name: 'Industry & Innovation',
    subtitle: 'Manufacturing, tech corridors, infrastructure and green momentum.',
    dotClass: 'industry',
    color: '#7FA8D6',
  },
  {
    slug: 'sports',
    name: 'Sports',
    subtitle: "Athletes, state academies and Bihar's historic rise on the national & global stage.",
    dotClass: 'sports',
    color: '#092C54',
  },
  {
    slug: 'investments-economic',
    name: 'Investments & Economic',
    subtitle: 'Financial growth, policy reforms and private investment momentum in Bihar.',
    dotClass: 'startup',
    color: '#16A34A',
  }
];

`;

const cleanStories = finalArticles.map(art => {
  let cleanId = art.id || 'article-2025';
  try { cleanId = decodeURIComponent(cleanId); } catch (e) {}
  cleanId = cleanId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    id: cleanId,
    title: art.title || cleanId,
    summary: art.summary || art.metaDescription || '',
    content: art.content || '',
    categorySlug: art.categorySlug || 'education-social',
    categoryName: art.categoryName || art.category || 'Education & Social',
    publishedDate: art.publishedDate ? art.publishedDate.split('T')[0] : '2025-12-01',
    readingTimeMinutes: Math.ceil((art.wordCount || 500) / 200),
    imageUrl: art.featuredImage || art.imageUrl || '/legacy-images/Bihar-Say-Website-3.png',
    authorName: art.authorName || art.author || 'Bihar Say | Amrita',
    isHero: Boolean(art.isHero),
    isFeatured: Boolean(art.isFeatured),
    featuredOrder: art.featuredOrder,
    isTrending: true,
    isEditorPick: false,
    likesCount: 15,
    viewsCount: 420
  };
});

const fileContent = `${header}export const INITIAL_STORIES: Story[] = ${JSON.stringify(cleanStories, null, 2)};\n`;
fs.writeFileSync(SEED_PATH, fileContent, 'utf-8');
console.log(`[SUCCESS] Rebuilt ${SEED_PATH} with ${cleanStories.length} stories.`);
