$art = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$edu = $art | Where-Object { $_.categorySlug -eq 'education-social' }
Write-Host "Total Education & Social articles: $($edu.Count)"
$eduWithImg = $edu | Where-Object { $_.imageUrl -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Education & Social with valid local image: $($eduWithImg.Count)"
$eduWithImg | Select-Object -First 5 | ForEach-Object {
    Write-Host "ID: $($_.id) | Img: $($_.imageUrl)"
}
