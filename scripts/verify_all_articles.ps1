$articlesJson = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

# Excluded IDs from db.ts
$excludedStoryIds = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

# Helper functions
function Safe-Decode($str) {
  try {
    return [System.Uri]::UnescapeDataString($str)
  } catch {
    return $str
  }
}

function Safe-Encode($str) {
  try {
    return [System.Uri]::EscapeDataString($str)
  } catch {
    return $str
  }
}

function Normalize-Id($str) {
  $d = Safe-Decode $str
  return ($d.ToLower() -replace '[^a-z0-9]', '')
}

# The Hindi decoded strings:
$hindiLpgDecoded1 = Safe-Decode "%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80"
$hindiLpgDecoded2 = $hindiLpgDecoded1 + [char]0x0902

$sportstarDecoded = Safe-Decode "sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf"

# Aliases from db.ts
$aliases = @{
  'india-nepal-jaynagar-immigration-post' = 'india-nepal-travel-is-about-to-get-easier-jaynagar-set-to-get-a-new-immigration-post';
  '59000-crore-heading-to-bihar' = '%e2%82%b959000-crore-is-heading-to-bihar-and-that-may-not-be-the-biggest-story';
  'nepal-floods-pilgrims-bihar' = 'when-nepal-floods-trapped-106-pilgrims-bihar-became-their-way-home-%e2%9d%a4%ef%b8%8f%f0%9f%87%ae%f0%9f%87%b3';
  'jk-cement-buxar-plant' = 'jk-cement-crosses-31-mta-with-new-buxar-plant-in-bihar';
  'bihar-gov-dbt-flood-relief' = 'bihar-gov-transfers-%e2%82%b9113-crore-to-flood-affected-farmers-via-dbt';
  'bihar-board-10th-result-2026' = 'bihar-board-10th-result-2026-declared';
  'bihar-deled-admission-2026' = 'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details';
  'wheat-procurement-bihar-2026' = 'wheat-procurement-in-bihar-2026-begins-april-1';
  'munger-cleanest-air-aqi-2026' = 'munger-records-indias-cleanest-air-bihar-aqi-2026-update';
  'munger-records-indias-cleanest-air' = 'munger-records-indias-cleanest-air-bihar-aqi-2026-update';
  'bihar-declared-naxal-free' = 'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger';
  'bpsc-tre-1-teachers-salary-hike' = 'bpsc-tre-1-teachers-get-salary-hike';
  'patna-womens-college-golden-jubilee' = 'patna-womens-college-hosts-golden-jubilee-reunion';
  'singhada-superfood-immunity' = 'singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy';
  'sonpur-mela-special-trains' = 'sonpur-mela-2025-special-trains-full-list-timings-travel-guide';
  'patna-high-tech-stadium' = 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium';
  'patna-to-get-high-tech-21-crore-indoor-stadium' = 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium';
  'prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects' = 'prime-group-to-invest-%e2%82%b91500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects';
  'bihar-makhana-boom-migration' = 'bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate';
  'bihar-ai-growth-2026-gcc-policy' = 'bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi';
  'bihar-lpg-crisis-not-true' = '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80';
  'bihar-lpg-sankat-nahi' = '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80';
  'sportstar-aces-awards-2026' = 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf';
  'sportstar-aces-awards-2026-best-state-sports-promotion' = 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf'
}
$aliases[$hindiLpgDecoded1] = '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80'
$aliases[$hindiLpgDecoded2] = '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80'
$aliases[$sportstarDecoded] = 'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf'

# Prototype map keys from db.ts
$prototypeKeys = @(
  '17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame',
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details',
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'munger-records-indias-cleanest-air',
  'bihar-board-10th-result-2026-declared',
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger',
  'bihar-declared-naxal-free',
  'bpsc-tre-1-teachers-get-salary-hike',
  'bpsc-tre-1-teachers-salary-hike',
  'foxconn-eyes-bihar-electronics',
  'bihar-ai-mission-policy',
  'bihar-startup-fund-boost',
  'bihar-tourism-rajgir-glass-bridge',
  'patna-marine-drive-expansion',
  'bihar-shahi-litchi-global-export',
  'mithila-makhana-superfood-boom',
  'bihar-sports-policy-cash-awards',
  'bihar-women-kabaddi-league',
  'bihar-dairy-sudha-expansion',
  'patna-smart-city-electric-buses',
  'nalanda-university-global-centre',
  'sportstar-aces-awards-2026',
  'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  $hindiLpgDecoded1,
  $hindiLpgDecoded2
)

function Get-Story-By-Id($id) {
  if (-not $id) { return $null }
  if ($excludedStoryIds -contains $id) { return $null }
  $decodedId = Safe-Decode $id
  if ($excludedStoryIds -contains $decodedId) { return $null }
  $encodedId = Safe-Encode $decodedId

  $canonicalId = if ($aliases.ContainsKey($id)) {
    $aliases[$id]
  } elseif ($aliases.ContainsKey($decodedId)) {
    $aliases[$decodedId]
  } elseif ($aliases.ContainsKey($encodedId)) {
    $aliases[$encodedId]
  } else {
    $null
  }

  $targetId = if ($canonicalId) { $canonicalId } else { $id }
  $targetDecoded = Safe-Decode $targetId
  $targetNorm = Normalize-Id $targetId

  # 1. Check PROTOTYPE_CONTENT_MAP
  $protoKeysToCheck = @($id, $decodedId, $encodedId, $targetId, $targetDecoded)
  foreach ($k in $protoKeysToCheck) {
    if ($k -and $prototypeKeys -contains $k) {
      return [PSCustomObject]@{ id = $k; source = "prototype" }
    }
  }

  # 2. Check INITIAL_STORIES
  foreach ($s in $articlesJson) {
    if (-not $s.id) { continue }
    if ($s.id -eq $targetId -or $s.id -eq $id -or $s.id -eq $decodedId -or $s.id -eq $encodedId) {
      return $s
    }
    $sDecoded = Safe-Decode $s.id
    if ($sDecoded.ToLower() -eq $decodedId.ToLower() -or $sDecoded.ToLower() -eq $targetDecoded.ToLower()) {
      return $s
    }
    # Fuzzy match Hindi LPG
    if (
      ($id.Contains('lpg') -or $decodedId.Contains('lpg') -or $decodedId -eq $hindiLpgDecoded1 -or $decodedId -eq $hindiLpgDecoded2) -and
      ($s.id.Contains('%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0') -or $s.id.Contains('lpg'))
    ) {
      return $s
    }
    # Fuzzy match Sportstar
    if (
      ($id.Contains('sportstar') -or $decodedId.Contains('sportstar')) -and
      $s.id.Contains('sportstar')
    ) {
      return $s
    }
    # Normalized alphanumeric match
    if ($targetNorm -and $targetNorm.Length -ge 4) {
      $sNorm = Normalize-Id $s.id
      if ($sNorm -eq $targetNorm) { return $s }
      if ($sNorm.Length -ge 8 -and $targetNorm.Length -ge 8) {
        if ($sNorm.StartsWith($targetNorm) -or $targetNorm.StartsWith($sNorm)) { return $s }
      }
    }
  }

  return $null
}

# Test all active stories
$activeArticles = $articlesJson | Where-Object { $excludedStoryIds -notcontains $_.id }
Write-Host "Testing all $($activeArticles.Count) active articles..."

$failCount = 0
foreach ($a in $activeArticles) {
  $decodedParam = Safe-Decode $a.id
  $resDecoded = Get-Story-By-Id $decodedParam
  $resRaw = Get-Story-By-Id $a.id

  if ($null -eq $resDecoded) {
    Write-Host "FAIL for decoded: $($a.id) -> $decodedParam"
    $failCount++
  }
  if ($null -eq $resRaw) {
    Write-Host "FAIL for raw: $($a.id)"
    $failCount++
  }
}

# Also test specific known aliases and tricky Hindi URLs
$specialTests = @(
  $hindiLpgDecoded1,
  $hindiLpgDecoded2,
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-lpg-crisis-not-true',
  'bihar-lpg-sankat-nahi',
  'sportstar-aces-awards-2026',
  'sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf',
  $sportstarDecoded,
  'munger-records-indias-cleanest-air',
  'bihar-declared-naxal-free',
  'bpsc-tre-1-teachers-salary-hike',
  'patna-to-get-high-tech-21-crore-indoor-stadium'
)

Write-Host "`nTesting $($specialTests.Count) special / alias URLs..."
foreach ($testId in $specialTests) {
  $res = Get-Story-By-Id $testId
  if ($null -eq $res) {
    Write-Host "SPECIAL TEST FAIL: $testId"
    $failCount++
  } else {
    Write-Host "PASS: $testId"
  }
}

Write-Host "`nTotal Failures: $failCount"
