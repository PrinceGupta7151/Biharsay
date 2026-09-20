$articlesJson = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

$removedCardIds = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

$excludedStoryIds = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

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

# Prototype map keys in db.ts
$prototypeKeys = @(
  '17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame',
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details',
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'bihar-board-10th-result-2026-declared',
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger',
  'bpsc-tre-1-teachers-get-salary-hike',
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
  'nalanda-university-global-centre'
)

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

function Get-Story-By-Id($id) {
  if ($excludedStoryIds -contains $id) { return $null }
  $decodedId = Safe-Decode $id
  if ($excludedStoryIds -contains $decodedId) { return $null }

  $canonicalId = if ($aliases.ContainsKey($id)) { $aliases[$id] } elseif ($aliases.ContainsKey($decodedId)) { $aliases[$decodedId] } else { $null }
  $targetId = if ($canonicalId) { $canonicalId } else { $id }
  $targetNorm = Normalize-Id $targetId

  # Step 1: localFound in INITIAL_STORIES
  foreach ($s in $articlesJson) {
    $sNorm = Normalize-Id $s.id
    $match = ($s.id -eq $targetId) -or ($s.id -eq $id) -or ($s.id -eq $decodedId) -or ($targetNorm -ne '' -and $sNorm -eq $targetNorm)
    if ($match) {
      if ($s.content -and $s.content.Trim().Length -ge 1000) {
        return $s
      }
    }
  }

  # Step 2: PROTOTYPE_CONTENT_MAP
  if ($prototypeKeys -contains $id -or $prototypeKeys -contains $decodedId) {
    return [PSCustomObject]@{ id = $id; source = "prototype" }
  }

  # Step 3: fallback find in INITIAL_STORIES
  $normId = Normalize-Id $id
  foreach ($s in $articlesJson) {
    if ($s.id -eq $id -or $s.id -eq $decodedId) {
      return $s
    }
    $sNorm = Normalize-Id $s.id
    if ($normId -ne '' -and $sNorm -eq $normId) {
      return $s
    }
  }

  # Step 4: canonicalStory
  if ($canonicalId) {
    $canNorm = Normalize-Id $canonicalId
    foreach ($s in $articlesJson) {
      if ($s.id -eq $canonicalId -or ($canNorm -ne '' -and (Normalize-Id $s.id) -eq $canNorm)) {
        return $s
      }
    }
  }

  # Step 5: prototype fallback
  if ($prototypeKeys -contains $id -or $prototypeKeys -contains $decodedId) {
    return [PSCustomObject]@{ id = $id; source = "prototype" }
  }

  return $null
}

# Now, filter stories like HomeFeed
$stories = $articlesJson | Where-Object { $removedCardIds -notcontains $_.id }

Write-Host "Stories in HomeFeed: $($stories.Count)"

# Test what happens when Next.js receives the URL param
# In Next.js, when user clicks `/article/${story.id}`, the browser sends URL, Next.js decodes params.id!
$failedStories = @()

foreach ($s in $stories) {
  # Test with raw ID
  $resRaw = Get-Story-By-Id $s.id
  
  # Test with Next.js decoded param
  $decodedParam = Safe-Decode $s.id
  $resDecoded = Get-Story-By-Id $decodedParam

  if ($null -eq $resRaw -or $null -eq $resDecoded) {
    $failedStories += [PSCustomObject]@{
      id = $s.id
      decodedParam = $decodedParam
      title = $s.title
      resRaw = ($null -ne $resRaw)
      resDecoded = ($null -ne $resDecoded)
    }
  }
}

Write-Host "`nStories failing getStoryById: $($failedStories.Count)"
$failedStories | Format-Table -AutoSize
