$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$s = $raw | Where-Object { $_.id -like '*sudarshan-kashyap*' }
Write-Host "Found Sudarshan Kashyap story: $($s.title)"
Write-Host "Category: $($s.category) | Slug: $($s.categorySlug)"
Write-Host "Image: $($s.imageUrl)"
Write-Host "Content Length: $($s.content.Length)"
Write-Host "Has H2 tags: $($s.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($s.imageUrl)")"

$allStartups = $raw | Where-Object { $_.categorySlug -eq 'entrepreneurship-startups' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid Startups stories with images on disk: $($allStartups.Count)"
Write-Host "First 3 in Startups:"
$allStartups | Select-Object -First 3 | ForEach-Object {
    Write-Host "- $($_.title) ($($_.date))"
}
