$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$v = $raw | Where-Object { $_.id -like '*vishnupad*' }
Write-Host "Found Vishnupad story: $($v.title)"
Write-Host "Category: $($v.category) | Slug: $($v.categorySlug)"
Write-Host "Image: $($v.imageUrl)"
Write-Host "Content Length: $($v.content.Length)"
Write-Host "Has H2 tags: $($v.content -match '<h2>')"
Write-Host "Has clickable link: $($v.content -match '<a href=""https://www.biharsay.com/""')"
Write-Host "Image exists on disk: $(Test-Path "public$($v.imageUrl)")"

$allInv = $raw | Where-Object { $_.categorySlug -eq 'investments-economic' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid Investments stories with images on disk: $($allInv.Count)"
Write-Host "First 3 in Investments:"
$allInv | Select-Object -First 3 | ForEach-Object {
    Write-Host "- $($_.title) ($($_.date))"
}
