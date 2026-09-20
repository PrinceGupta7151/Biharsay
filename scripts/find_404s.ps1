$articlesJson = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

# Excluded IDs
$excluded = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

# Aliases
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
  'patna-womens-college-golden-jubilee' = 'patna-womens-college-hosts-golden-jubilee-reunion';
  'singhada-superfood-immunity' = 'singhadathe-superfood-that-boosts-immunity-beauty-everyday-energy';
  'sonpur-mela-special-trains' = 'sonpur-mela-2025-special-trains-full-list-timings-travel-guide';
  'patna-high-tech-stadium' = 'patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium';
  'bihar-makhana-boom-migration' = 'bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate';
  'bihar-ai-growth-2026-gcc-policy' = 'bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi'
}

function Safe-Decode($str) {
  try {
    return [System.Uri]::UnescapeDataString($str)
  } catch {
    return $str
  }
}

function Normalize-Id($str) {
  $d = Safe-Decode $str
  return ($d.ToLower() -replace '[^a-z0-9]', '')
}

Write-Host "Total articles in articles.json: $($articlesJson.Count)"

# Test every article with both raw ID and decoded ID
$failedRaw = @()
$failedDecoded = @()

foreach ($a in $articlesJson) {
  $rawId = $a.id
  $decodedId = Safe-Decode $rawId
  
  if ($excluded -contains $rawId -or $excluded -contains $decodedId) {
    continue
  }

  # Simulate getStoryById when user clicks link /article/${rawId} -> Next.js passes decodedId to getStoryById!
  $found = $false
  
  # Step 1: localFound in INITIAL_STORIES
  $targetNorm = Normalize-Id $decodedId
  $canonicalId = if ($aliases.ContainsKey($decodedId)) { $aliases[$decodedId] } elseif ($aliases.ContainsKey($rawId)) { $aliases[$rawId] } else { $null }
  $targetId = if ($canonicalId) { $canonicalId } else { $decodedId }

  foreach ($s in $articlesJson) {
    if ($s.id -eq $targetId -or $s.id -eq $rawId -or $s.id -eq $decodedId) {
      $found = $true
      break
    }
    $sNorm = Normalize-Id $s.id
    if ($targetNorm -ne '' -and $sNorm -eq $targetNorm) {
      $found = $true
      break
    }
  }

  if (-not $found) {
    $failedDecoded += [PSCustomObject]@{
      id = $rawId
      decoded = $decodedId
      title = $a.title
      category = $a.category
    }
  }
}

Write-Host "`nFAILED ARTICLES (Simulated Next.js decoded id lookup): $($failedDecoded.Count)"
$failedDecoded | Format-Table -AutoSize
