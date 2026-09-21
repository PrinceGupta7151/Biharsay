$articles = Get-Content -Raw 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
for ($i = 0; $i -lt $articles.Count; $i++) {
    if ($articles[$i].id -eq 'bharatnet-to-bring-fiber-internet-to-bihar-villages') {
        Write-Host "Index $i : $($articles[$i].title)"
    }
}
