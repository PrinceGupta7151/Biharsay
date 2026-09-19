$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json
$withImg = $articles | Where-Object { $_.imageUrl -and $_.imageUrl.Trim() -ne '' }
$prefixes = $withImg | Group-Object {
    if ($_.imageUrl.StartsWith('/legacy-images/')) { '/legacy-images/' }
    elseif ($_.imageUrl.StartsWith('http')) { 'http/remote' }
    else { 'other: ' + $_.imageUrl }
}
foreach ($p in $prefixes) {
    Write-Host "$($p.Name): $($p.Count)"
}
