$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$p = $raw | Where-Object { $_.id -like '*child-help-desks*' }
Write-Host "Found Child Help Desks story: $($p.title)"
Write-Host "Category: $($p.category) | Slug: $($p.categorySlug)"
Write-Host "Image: $($p.imageUrl)"
Write-Host "Content Length: $($p.content.Length)"
Write-Host "Has H2 tags: $($p.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($p.imageUrl)")"

$allEdu = $raw | Where-Object { $_.categorySlug -eq 'education-social' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid Education & Social stories with images on disk: $($allEdu.Count)"
Write-Host "First 3 in Education & Social:"
$allEdu | Select-Object -First 3 | ForEach-Object {
    Write-Host "- $($_.title) ($($_.date))"
}
