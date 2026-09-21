$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$k = $raw | Where-Object { $_.id -like '*rajgir-to-host-womens-kabaddi-world-cup*' }
Write-Host "Found Kabaddi story: $($k.title)"
Write-Host "Image: $($k.imageUrl)"
Write-Host "Content Length: $($k.content.Length)"
Write-Host "Has H2 tags: $($k.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($k.imageUrl)")"

$sportsJson = Get-Content 'data\sports_articles.json' -Raw | ConvertFrom-Json
$kSports = $sportsJson | Where-Object { $_.title -like '*Kabaddi World Cup*' }
Write-Host "Found in sports_articles.json: $($kSports.title)"
Write-Host "Sports Image exists on disk: $(Test-Path "public$($kSports.featuredImage)")"

$allSports = $raw | Where-Object { $_.categorySlug -eq 'sports' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid sports stories with images on disk: $($allSports.Count)"
