$stories = Get-Content "d:\biharsay\data\seedStories.ts" -Raw

function Get-ProperCategory($title, $summary, $id, $currentSlug) {
    $text = "$title $summary $id".ToLower()

    # Sports
    if ($text -match '\b(sport|sports|stadium|cricket|ipl|hockey|athlete|athletes|tournament|trophy|championship|ranji|vaibhav|suryavanshi|vijay hazare|sarthak ranjan|badminton|football|games|indoor sports)\b') {
        return 'sports'
    }

    # Culture & Heritage
    if ($text -match '\b(culture|heritage|history|historical|monument|temple|shivlinga|mandir|ramayan|buddhist|buddhism|nalanda|rajgir|darbhanga raj|maharani|diwali|chhath|yoga|yoga day|art|sand art|double decker bus|ganga path|ghat|ghats|reunion|patna sahib|takht shri|simraungarh|magadh|mahamastakabhisheka|bodh gaya|vaishali|mithila|madhubani|ashok kumar|sonepur mela sand art)\b') {
        return 'culture-heritage'
    }

    # Entrepreneurship & Startups
    if ($text -match '\b(startup|startups|entrepreneur|entrepreneurs|entrepreneurship|founder|founders|incubator|incubation|agritech|litchi|makhana|bikaji|snack revolution|mahila udyog|msme|women entrepreneurs|jeevika|cottage industry|food processing|venture|diaspora|community|bihar say desk|cow care|shahi litchi|cold storage|fodder)\b') {
        return 'entrepreneurship-startups'
    }

    # Industry & Innovation
    if ($text -match '\b(industry|industrial|manufacturing|factory|factories|plant|plants|semiconductor|chip|foxconn|sugar mill|sugar mills|tech|technology|ai|chatgpt|openai|software|it park|patna it|gcc policy|optic fiber|bharatnet|power plant|solar plant|son canal|anmol feeds|drone|doppler radar|cybercrime|mobile numbers|nift|textile|film journey|netflix)\b') {
        return 'industry-innovation'
    }

    # Investments & Economic
    if ($text -match '\b(investment|investments|economic|economy|gdp|budget|union budget|crore|investor|investors|expressway|highway|metro|airport|terminal|railway|railways|train|trains|special trains|fare|train fare|multi-modal|vending zone|dbt|subsid|loan scheme|bank|commercial|adani|britannia|bridge|corridor|development commissioner|jobs in five years|transfers)\b') {
        return 'investments-economic'
    }

    # Education & Social
    if ($text -match '\b(education|educational|school|schools|college|colleges|university|universities|bpsc|bseb|sakshamta|exam|result|merit list|scholarship|student|students|teacher|teachers|teaching|dr |doctor|hospital|aiims|health|medical|fellowship|nios|iit patna|amity|neet|voter|election|elections|turnout|polling|dengue|wcdc|adri|anti-dengue|pink innovation|survey of india|degree colleges|petc scheme|transfer rules|ips promotion|dig|naxal-free|safety star|anti-dengue)\b') {
        return 'education-social'
    }

    return $currentSlug
}

$pattern = '\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",[\s\S]*?"categorySlug":\s*"([^"]+)"'
$regex = [regex]::new($pattern)
$matches = $regex.Matches($stories)

$results = @{}
foreach ($m in $matches) {
    $id = $m.Groups[1].Value
    $title = $m.Groups[2].Value
    $current = $m.Groups[3].Value
    $proper = Get-ProperCategory $title "" $id $current
    if (-not $results.ContainsKey($proper)) {
        $results[$proper] = 0
    }
    $results[$proper]++
}

foreach ($k in $results.Keys) {
    Write-Host "$k : $($results[$k])"
}
