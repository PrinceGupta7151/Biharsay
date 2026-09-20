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
$articlesWithImages = $stories | Where-Object { $_.imageUrl -ne '' }
$articlesWithoutImages = $stories | Where-Object { $_.imageUrl -eq '' }

# Hero story
$featuredStory = ($articlesWithImages | Where-Object { $_.isFeatured })[0]
if (-not $featuredStory) { $featuredStory = $articlesWithImages[0] }

# Side stories
$pool = $articlesWithImages
$sideStories = ($pool | Where-Object { $_.id -ne $featuredStory.id })[0..2]
$heroStoryIds = @($featuredStory.id) + @($sideStories | ForEach-Object { $_.id })

$allRenderedStories = @()
$allRenderedStories += $featuredStory
$allRenderedStories += $sideStories

$categories = @('culture-heritage', 'education-social', 'entrepreneurship-startups', 'industry-innovation', 'sports', 'investments-economic')

foreach ($cat in $categories) {
  $catArticles = $articlesWithImages | Where-Object { $_.categorySlug -eq $cat }
  $filtered = $catArticles | Where-Object { $heroStoryIds -notcontains $_.id }
  $catList = if ($filtered.Count -gt 0) { $filtered } else { $catArticles }
  Write-Host "`nCategory: $cat ($($catList.Count) stories)"
  $catList | Select-Object id, title | Format-Table -AutoSize
  $allRenderedStories += $catList
}

Write-Host "`nArticles without images in RecentPostsSection: $($articlesWithoutImages.Count)"
