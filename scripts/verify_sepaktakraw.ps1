$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$s = $raw | Where-Object { $_.id -like '*sepaktakraw*' }
Write-Host "Found SepakTakraw story: $($s.title)"
Write-Host "Image: $($s.imageUrl)"
Write-Host "Content Length: $($s.content.Length)"
Write-Host "Has H2 tags: $($s.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($s.imageUrl)")"

$sportsJson = Get-Content 'data\sports_articles.json' -Raw | ConvertFrom-Json
$sSports = $sportsJson | Where-Object { $_.title -like '*SepakTakraw*' }
Write-Host "Found in sports_articles.json: $($sSports.title)"
Write-Host "Sports Image exists on disk: $(Test-Path "public$($sSports.featuredImage)")"

$allSports = $raw | Where-Object { $_.categorySlug -eq 'sports' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid sports stories with images on disk: $($allSports.Count)"
