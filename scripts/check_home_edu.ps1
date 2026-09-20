$srcArticles = Get-Content 'd:\biharsay\src\data\articles.json' -Raw | ConvertFrom-Json
$removed = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

$edu = $srcArticles | Where-Object { 
    ($_.categorySlug -eq 'education-social' -or $_.category -like '*Education*') -and 
    $removed -notcontains $_.id -and
    $_.imageUrl -and $_.imageUrl.Trim().Length -gt 0
}

Write-Output "Stories in Education & Social on HomeFeed: $($edu.Count)"
foreach ($s in ($edu | Select-Object -First 10)) {
    Write-Output "ID: $($s.id)"
    Write-Output "Title: $($s.title)"
    Write-Output "Image: $($s.imageUrl)"
    Write-Output "Summary: $($s.summary)"
    Write-Output "--------------------------------------------------------"
}
