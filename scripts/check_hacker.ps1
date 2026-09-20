$raw = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
$found = $raw | Where-Object { $_.id -like '*ethical-hacker*' -or $_.id -like '*nasa*' -or $_.title -like '*Hacker*' }
if ($found) {
    [Console]::WriteLine("Found in articles.json: " + $found.id + " | category: " + $found.category + " | categorySlug: " + $found.categorySlug)
} else {
    [Console]::WriteLine("NOT found in articles.json!")
}
