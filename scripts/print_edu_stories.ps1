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

# hasValidImage
function Has-Valid-Image($art) {
  if ($removedCardIds -contains $art.id) { return $false }
  if (-not $art.imageUrl) { return $false }
  $u = [string]$art.imageUrl.Trim()
  if ($u -eq '' -or $u -eq 'no_url' -or $u -eq 'null') { return $false }
  return $true
}

$stories = $articles | Where-Object { $removedCardIds -notcontains $_.id }
$articlesWithImages = $stories | Where-Object { Has-Valid-Image $_ }

# Hero story
$featuredStory = ($articlesWithImages | Where-Object { $_.isFeatured })[0]
if (-not $featuredStory) { $featuredStory = $articlesWithImages[0] }

# Side stories
$pool = $articlesWithImages
$sideStories = ($pool | Where-Object { $_.id -ne $featuredStory.id })[0..2]

$heroStoryIds = @($featuredStory.id) + @($sideStories | ForEach-Object { $_.id })

Write-Host "Hero story IDs:"
$heroStoryIds

# Education & Social stories
$eduArticles = $articlesWithImages | Where-Object { $_.categorySlug -eq 'education-social' }
$filteredEdu = $eduArticles | Where-Object { $heroStoryIds -notcontains $_.id }
$finalEdu = if ($filteredEdu.Count -gt 0) { $filteredEdu } else { $eduArticles }

Write-Host "`nEducation & Social Stories on Homepage ($($finalEdu.Count)):"
$finalEdu[0..5] | Select-Object id, title, categorySlug | Format-Table -AutoSize
