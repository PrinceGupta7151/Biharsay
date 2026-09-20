$articles = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
$articleIds = New-Object System.Collections.Generic.HashSet[string]
foreach ($a in $articles) {
    [void]$articleIds.Add($a.id)
    if ($a.slug) { [void]$articleIds.Add($a.slug) }
}

[Console]::WriteLine("Total articles in src/data/articles.json: " + $articles.Count)

# Check complete_valid_articles.csv
$csvLines = Get-Content -Path 'd:\biharsay\complete_valid_articles.csv'
$missingFromCsv = @()
for ($i = 1; $i -lt $csvLines.Count; $i++) {
    $line = $csvLines[$i]
    if (-not $line.Trim()) { continue }
    # first column is articleId
    if ($line -match '^"([^"]+)"') {
        $id = $matches[1]
        if (-not $articleIds.Contains($id)) {
            $missingFromCsv += $id
        }
    }
}
[Console]::WriteLine("Missing from articles.json but present in complete_valid_articles.csv: " + $missingFromCsv.Count)
foreach ($m in $missingFromCsv) {
    [Console]::WriteLine("  - CSV missing: " + $m)
}

# Check scratch/all_blogs_list.json
if (Test-Path 'd:\biharsay\scratch\all_blogs_list.json') {
    $blogs = Get-Content -Raw -Path 'd:\biharsay\scratch\all_blogs_list.json' | ConvertFrom-Json
    $missingBlogs = @()
    foreach ($b in $blogs) {
        if (-not $articleIds.Contains($b.id)) {
            $missingBlogs += $b.id + " (" + $b.title + ")"
        }
    }
    [Console]::WriteLine("Missing from articles.json but present in all_blogs_list.json: " + $missingBlogs.Count)
    foreach ($mb in $missingBlogs) {
        [Console]::WriteLine("  - Blog missing: " + $mb)
    }
}
