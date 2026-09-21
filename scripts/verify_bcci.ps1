$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$bcci = $raw | Where-Object { $_.id -like '*bcci*' }
Write-Host "Found BCCI story: $($bcci.title)"
Write-Host "Image: $($bcci.imageUrl)"
Write-Host "Content Length: $($bcci.content.Length)"
Write-Host "Has H2 tags: $($bcci.content -match '<h2>')"
Write-Host "Has UL tags: $($bcci.content -match '<ul>')"
Write-Host "Image exists on disk: $(Test-Path "public$($bcci.imageUrl)")"
