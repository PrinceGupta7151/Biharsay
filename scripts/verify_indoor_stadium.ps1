# Verification script for Patna ₹21 Crore Indoor Stadium article
$articlesPath = "d:\biharsay\src\data\articles.json"
$articles = Get-Content -Raw -Path $articlesPath | ConvertFrom-Json

$story = $articles | Where-Object { $_.id -eq "patna-to-get-high-tech-21-crore-indoor-stadium" }

if ($story) {
    Write-Host "Found Indoor Stadium article in src/data/articles.json:" -ForegroundColor Green
    Write-Host "Title: $($story.title)"
    Write-Host "Category: $($story.category) ($($story.categorySlug))"
    Write-Host "Image URL: $($story.imageUrl)"
    Write-Host "Date: $($story.date)"
    
    $localImagePath = Join-Path "d:\biharsay\public" ($story.imageUrl.TrimStart('/'))
    if (Test-Path $localImagePath) {
        Write-Host "Image exists at $localImagePath" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Image missing at $localImagePath" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Indoor Stadium story not found in articles.json" -ForegroundColor Red
}
