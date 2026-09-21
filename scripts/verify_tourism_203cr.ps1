# Verification script for Bihar Gets ₹203 Crore Tourism Push
$articlesPath = "d:\biharsay\src\data\articles.json"
$articles = Get-Content -Raw -Path $articlesPath | ConvertFrom-Json

$story = $articles | Where-Object { $_.id -eq "bihar-gets-203-crore-tourism-push-for-3-key-destinations" }

if ($story) {
    Write-Host "Found article in src/data/articles.json:" -ForegroundColor Green
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
    Write-Host "ERROR: Story not found in articles.json" -ForegroundColor Red
}

# Test local server response if running
try {
    $res = Invoke-WebRequest -Uri "http://localhost:3000/story/bihar-gets-203-crore-tourism-push-for-3-key-destinations" -UseBasicParsing -TimeoutSec 10
    Write-Host "Server status code: $($res.StatusCode)" -ForegroundColor Green
    if ($res.Content -match "203 Crore Tourism Push") {
        Write-Host "Page contains 203 Crore Tourism Push title!" -ForegroundColor Green
    }
    if ($res.Content -match 'href="https://www.biharsay.com/"') {
        Write-Host "Page contains clickable biharsay link!" -ForegroundColor Green
    }
} catch {
    Write-Host "Server check notice: $_" -ForegroundColor Yellow
}
