$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$v = $raw | Where-Object { $_.id -like '*vaibhav*' }
Write-Host "Found Vaibhav story: $($v.title)"
Write-Host "Image: $($v.imageUrl)"
Write-Host "Content Length: $($v.content.Length)"
Write-Host "Has H2 tags: $($v.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($v.imageUrl)")"

$sportsJson = Get-Content 'data\sports_articles.json' -Raw | ConvertFrom-Json
$vSports = $sportsJson | Where-Object { $_.title -like '*Vaibhav*' }
Write-Host "Found in sports_articles.json: $($vSports.title)"
Write-Host "Sports Image exists on disk: $(Test-Path "public$($vSports.featuredImage)")"
