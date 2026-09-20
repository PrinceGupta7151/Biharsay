$articles = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json

# In lib/db.ts:
$excluded = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

$aliasMap = @{
  'india-nepal-jaynagar-immigration-post' = 'india-nepal-travel-is-about-to-get-easier-jaynagar-set-to-get-a-new-immigration-post';
  '59000-crore-heading-to-bihar' = '%e2%82%b959000-crore-is-heading-to-bihar-and-that-may-not-be-the-biggest-story';
  'nepal-floods-pilgrims-bihar' = 'when-nepal-floods-trapped-106-pilgrims-bihar-became-their-way-home-%e2%9d%a4%ef%b8%8f%f0%9f%87%ae%f0%9f%87%b3';
  'jk-cement-buxar-plant' = 'jk-cement-crosses-31-mta-with-new-buxar-plant-in-bihar';
  'bihar-gov-dbt-flood-relief' = 'bihar-gov-transfers-%e2%82%b9113-crore-to-flood-affected-farmers-via-dbt';
  'bihar-board-10th-result-2026' = 'bihar-board-10th-result-2026-declared';
  'bihar-deled-admission-2026' = 'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details';
  'wheat-procurement-bihar-2026' = 'wheat-procurement-in-bihar-2026-begins-april-1';
  'munger-cleanest-air-aqi-2026' = 'munger-records-indias-cleanest-air-bihar-aqi-2026-update';
  'patna-womens-college-golden-jubilee' = 'patna-womens-college-hosts-golden-jubilee-reunion';
  'singhada-superfood-immunity' = 'singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy';
  'sonpur-mela-special-trains' = 'sonpur-mela-2025-special-trains-full-list-timings-travel-guide';
  'patna-high-tech-stadium' = 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium';
  'bihar-makhana-boom-migration' = 'bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate';
  'bihar-ai-growth-2026-gcc-policy' = 'bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi'
}

$protoKeys = @(
  '17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame',
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details',
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'bihar-board-10th-result-2026-declared',
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger',
  'bpsc-tre-1-teachers-get-salary-hike',
  'foxconn-eyes-bihar-electronics',
  'asian-womens-hockey-championship-rajgir',
  'rajgirs-first-sports-academy',
  'vaibhav-suryavanshi-ipl-auction',
  'gomini-cow-care-startup',
  'bihar-say-community-milestone',
  'user-story-FuTHCYIkVKvugbaonRdp',
  'bihar-makhana-boom-migration'
)

function Test-Story($id) {
    if ($excluded -contains $id) { return $false }
    if ($protoKeys -contains $id) { return $true }
    if ($aliasMap.ContainsKey($id)) {
        $target = $aliasMap[$id]
        if ($protoKeys -contains $target) { return $true }
        foreach ($a in $articles) { if ($a.id -eq $target) { return $true } }
    }
    foreach ($a in $articles) {
        if ($a.id -eq $id) { return $true }
    }
    return $false
}

# Let's test all articles in articles.json
$failed = @()
foreach ($a in $articles) {
    if (-not (Test-Story $a.id)) {
        $failed += $a.id
    }
}
[Console]::WriteLine("Failed in articles.json: " + ($failed -join ", "))

# Let's test all in complete_valid_articles.csv
$csvLines = Get-Content -Path 'd:\biharsay\complete_valid_articles.csv'
$failedCsv = @()
for ($i = 1; $i -lt $csvLines.Count; $i++) {
    $line = $csvLines[$i]
    if (-not $line.Trim()) { continue }
    if ($line -match '^"([^"]+)"') {
        $id = $matches[1]
        if (-not (Test-Story $id)) {
            $failedCsv += $id
        }
    }
}
[Console]::WriteLine("Failed in complete_valid_articles.csv: " + ($failedCsv -join ", "))
