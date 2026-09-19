$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json
$withImg = $articles | Where-Object { $_.imageUrl -and $_.imageUrl.Trim() -ne '' }
foreach ($a in $withImg) {
    Write-Host "$($a.imageUrl) ---> $($a.title)"
}
