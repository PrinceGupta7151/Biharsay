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

# Sanitize story image exactly like sanitizeStory in db.ts
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
$articlesWithImages = $stories | Where-Object { $_.imageUrl -ne '' }

# Hero story
$featuredStory = ($articlesWithImages | Where-Object { $_.isFeatured })[0]
if (-not $featuredStory) { $featuredStory = $articlesWithImages[0] }

# Side stories
$pool = $articlesWithImages
$sideStories = ($pool | Where-Object { $_.id -ne $featuredStory.id })[0..2]

$heroStoryIds = @($featuredStory.id) + @($sideStories | ForEach-Object { $_.id })

Write-Host "Real Hero story IDs:"
$heroStoryIds

# Education & Social stories
$eduArticles = $articlesWithImages | Where-Object { $_.categorySlug -eq 'education-social' }
$filteredEdu = $eduArticles | Where-Object { $heroStoryIds -notcontains $_.id }
$finalEdu = if ($filteredEdu.Count -gt 0) { $filteredEdu } else { $eduArticles }

Write-Host "`nReal Education & Social Stories on Homepage ($($finalEdu.Count)):"
$finalEdu[0..10] | Select-Object id, title, categorySlug | Format-Table -AutoSize
