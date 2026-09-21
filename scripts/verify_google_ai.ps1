$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$g = $raw | Where-Object { $_.id -like '*google-india*' }
Write-Host "Found Google India story: $($g.title)"
Write-Host "Category: $($g.category) | Slug: $($g.categorySlug)"
Write-Host "Image: $($g.imageUrl)"
Write-Host "Content Length: $($g.content.Length)"
Write-Host "Has H2 tags: $($g.content -match '<h2>')"
Write-Host "Image exists on disk: $(Test-Path "public$($g.imageUrl)")"

$allEdu = $raw | Where-Object { $_.categorySlug -eq 'education-social' -and (Test-Path "public$($_.imageUrl)") }
Write-Host "Total valid Education & Social stories with images on disk: $($allEdu.Count)"
Write-Host "First 4 in Education & Social:"
$allEdu | Select-Object -First 4 | ForEach-Object {
    Write-Host "- $($_.title) ($($_.date))"
}
