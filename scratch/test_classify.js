const fs = require('fs');

function classify(title, summary, currentSlug) {
  const text = (title + ' ' + (summary || '')).toLowerCase();

  // Sports
  if (/\b(sport|sports|stadium|cricket|ipl|hockey|athlete|tournament|trophy|championship|ranji|vaibhav|suryavanshi|vijay hazare|sarthak ranjan|badminton|football|games)\b/i.test(text)) {
    return 'sports';
  }

  // Culture & Heritage
  if (/\b(culture|heritage|history|historical|monument|temple|shivlinga|mandir|ramayan|buddhist|buddhism|nalanda|rajgir|darbhanga raj|maharani|diwali|chhath|yoga day|art|sand art|double decker bus|ganga path|ghat|ghats|reunion|patna sahib|takht shri|simraungarh|magadh|mahamastakabhisheka|bodh gaya|vaishali|mithila|madhubani)\b/i.test(text)) {
    return 'culture-heritage';
  }

  // Entrepreneurship & Startups
  if (/\b(startup|startups|entrepreneur|entrepreneurship|founder|founders|incubator|incubation|agritech|litchi|makhana|bikaji|snack revolution|mahila udyog|msme|women entrepreneurs|jeevika|cottage industry|food processing|venture|diaspora|community|bihar say desk)\b/i.test(text)) {
    return 'entrepreneurship-startups';
  }

  // Industry & Innovation
  if (/\b(industry|industrial|manufacturing|factory|factories|plant|plants|semiconductor|chip|foxconn|sugar mill|sugar mills|tech|technology|ai|chatgpt|openai|software|it park|patna it|gcc policy|optic fiber|bharatnet|power plant|solar plant|son canal|anmol feeds|drone|doppler radar|cybercrime|mobile numbers)\b/i.test(text)) {
    return 'industry-innovation';
  }

  // Investments & Economic
  if (/\b(investment|investments|economic|economy|gdp|budget|union budget|crore|investor|investors|expressway|highway|metro|airport|terminal|railway|train|trains|special trains|fare|multi-modal|vending zone|dbt|subsid|loan scheme|bank|commercial|adani|britannia|bridge|corridor)\b/i.test(text)) {
    return 'investments-economic';
  }

  // Education & Social
  if (/\b(education|educational|school|schools|college|colleges|university|universities|bpsc|bseb|sakshamta|exam|result|merit list|scholarship|student|students|teacher|teachers|teaching|dr |doctor|hospital|aiims|health|medical|fellowship|nios|iit patna|amity|neet|voter|election|elections|turnout|polling|dengue|wcdc|adri|anti-dengue|pink innovation|survey of india|degree colleges|petc scheme|transfer rules)\b/i.test(text)) {
    return 'education-social';
  }

  return currentSlug || 'education-social';
}

// Let us test reading seedStories.ts
const code = fs.readFileSync('d:/biharsay/data/seedStories.ts', 'utf8');
const idRegex = /"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",/g;
let match;
let count = 0;
while ((match = idRegex.exec(code)) !== null) {
  count++;
}
console.log('Found ' + count + ' stories in seedStories.ts');
