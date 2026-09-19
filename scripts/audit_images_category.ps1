$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json
$cats = $articles | Group-Object category
Write-Host "=== Current Total Articles & Articles with Image per Category ==="
foreach ($c in $cats) {
    $withImg = ($c.Group | Where-Object { $_.imageUrl -and $_.imageUrl.Trim() -ne '' }).Count
    Write-Host "$($c.Name): $withImg with image / $($c.Count) total"
}

Write-Host "`n=== All files in public/legacy-images ==="
$files = Get-ChildItem -Path ./public/legacy-images -File
Write-Host "Total files in public/legacy-images: $($files.Count)"
$usedImages = ($articles | Where-Object { $_.imageUrl } | Select-Object -ExpandProperty imageUrl -Unique)
$unused = $files | Where-Object { $usedImages -notcontains ('/legacy-images/' + $_.Name) }
Write-Host "Unused files in public/legacy-images: $($unused.Count)"
foreach ($u in $unused) {
    Write-Host "  - $($u.Name)"
}
