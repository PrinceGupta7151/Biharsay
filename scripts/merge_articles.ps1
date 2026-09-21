$articlesPath = "d:\biharsay\src\data\articles.json"
$bundlePath = "d:\biharsay\scripts\new_articles_bundle.json"

$articles = Get-Content -Raw -Path $articlesPath -Encoding UTF8 | ConvertFrom-Json
$bundle = Get-Content -Raw -Path $bundlePath -Encoding UTF8 | ConvertFrom-Json

$bundleIds = @($bundle | ForEach-Object { $_.id })
$bundleIds += "%e2%82%b959000-crore-is-heading-to-bihar-and-that-may-not-be-the-biggest-story"
$bundleIds += "59000-crore-heading-to-bihar"

$merged = [System.Collections.Generic.List[Object]]::new()

# First add the new bundle in order
foreach ($b in $bundle) {
    $merged.Add($b)
}

# Then add existing articles that are not in bundleIds
foreach ($a in $articles) {
    if ($bundleIds -contains $a.id) {
        Write-Host "Skipping duplicate/old ID: $($a.id)"
    } else {
        $merged.Add($a)
    }
}

Write-Host "Total merged articles: $($merged.Count)"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$json = $merged | ConvertTo-Json -Depth 15
[System.IO.File]::WriteAllText($articlesPath, $json, $utf8NoBom)
Write-Host "Successfully written to $articlesPath"
