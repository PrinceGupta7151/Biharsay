$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

$removedCardIds = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

$authenticImages = @(
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
  '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg'
)

function Sanitize-Story($s) {
  $img = if ($s.imageUrl) { [string]$s.imageUrl } else { '' }
  if ($img) {
    if ($authenticImages -notcontains $img -and -not $img.StartsWith('http://') -and -not $img.StartsWith('https://')) {
      $img = ''
    }
  }
  return [PSCustomObject]@{
    id = $s.id
    title = $s.title
    categorySlug = $s.categorySlug
    imageUrl = $img
    isFeatured = [bool]$s.isFeatured
  }
}

$sanitized = $articles | ForEach-Object { Sanitize-Story $_ }
$stories = $sanitized | Where-Object { $removedCardIds -notcontains $_.id }
$articlesWithoutImages = $stories | Where-Object { $_.imageUrl -eq '' }

Write-Host "Testing all $($articlesWithoutImages.Count) articles in RecentPostsSection..."

$failures = @()
foreach ($a in $articlesWithoutImages) {
  # Test with raw ID and decoded ID
  $rawId = $a.id
  $decodedId = [System.Uri]::UnescapeDataString($rawId)
  $normId = ($decodedId.ToLower() -replace '[^a-z0-9]', '')

  # Check if getStoryById would find it
  $found = $false
  foreach ($s in $articles) {
    if ($s.id -eq $rawId -or $s.id -eq $decodedId) { $found = $true; break }
    $sDecoded = [System.Uri]::UnescapeDataString($s.id)
    if ($sDecoded -eq $decodedId -or $sDecoded -eq $rawId) { $found = $true; break }
    $sNorm = ($sDecoded.ToLower() -replace '[^a-z0-9]', '')
    if ($normId -ne '' -and $sNorm -eq $normId) { $found = $true; break }
  }

  if (-not $found) {
    $failures += [PSCustomObject]@{
      id = $rawId
      title = $a.title
    }
  }
}

Write-Host "Failures in RecentPostsSection: $($failures.Count)"
$failures | Format-Table -AutoSize
