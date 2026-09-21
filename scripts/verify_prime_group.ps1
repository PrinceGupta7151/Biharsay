# Verification script for Prime Group ₹1,500 crore real estate article
$articlesPath = "d:\biharsay\src\data\articles.json"
$articles = Get-Content -Raw -Path $articlesPath | ConvertFrom-Json

$story = $articles | Where-Object { $_.id -eq "prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects" }

if ($story) {
    Write-Host "Found Prime Group article in src/data/articles.json:" -ForegroundColor Green
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
    Write-Host "ERROR: Prime Group story not found in articles.json" -ForegroundColor Red
}
