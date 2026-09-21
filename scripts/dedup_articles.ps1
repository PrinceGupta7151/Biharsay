$articles = Get-Content -Raw 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
# Keep index 0, remove subsequent duplicates of 'bharatnet-to-bring-fiber-internet-to-bihar-villages'
$seen = @{}
$filtered = [System.Collections.Generic.List[Object]]::new()

foreach ($a in $articles) {
    if ($seen.ContainsKey($a.id)) {
        Write-Host "Removing duplicate id: $($a.id), legacyId: $($a.legacyId)"
    } else {
        $seen[$a.id] = $true
        $filtered.Add($a)
    }
}

Write-Host "New total count: $($filtered.Count) (was $($articles.Count))"
$filtered | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 'd:\biharsay\src\data\articles.json'
Write-Host "Saved successfully!"
