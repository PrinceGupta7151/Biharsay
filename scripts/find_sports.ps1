$raw = Get-Content 'src\data\articles.json' -Raw | ConvertFrom-Json
$sports = @()
foreach ($item in $raw) {
    if ($item.categorySlug -eq 'sports' -or $item.category -eq 'Sports') {
        $sports += $item
    }
}
Write-Host "Found $($sports.Count) sports articles in src\data\articles.json:"
foreach ($s in $sports) {
    Write-Host "ID: $($s.id) | Title: $($s.title) | Image: $($s.imageUrl)"
}
