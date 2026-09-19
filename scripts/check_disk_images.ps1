$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json
$withImg = $articles | Where-Object { $_.imageUrl -and $_.imageUrl.Trim() -ne '' }
$missing = @()
$existing = @()

foreach ($a in $withImg) {
    $rel = $a.imageUrl.TrimStart('/')
    $full = Join-Path "d:/biharsay/public" $rel
    if (Test-Path $full) {
        $existing += $a
    } else {
        $missing += $a
    }
}

Write-Host "Articles with existing image on disk: $($existing.Count)"
Write-Host "Articles with MISSING image on disk: $($missing.Count)"

if ($missing.Count -gt 0) {
    Write-Host "`nSample missing images:"
    $missing | Select-Object -First 10 | ForEach-Object { Write-Host "$($_.imageUrl) (Article: $($_.title))" }
}
