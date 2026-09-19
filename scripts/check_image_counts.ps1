$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json
$withImg = $articles | Where-Object { $_.imageUrl -and $_.imageUrl.Trim() -ne '' }
$noImg = $articles | Where-Object { -not $_.imageUrl -or $_.imageUrl.Trim() -eq '' }
$groups = $withImg | Group-Object imageUrl
$shared = $groups | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending
$unique = $groups | Where-Object { $_.Count -eq 1 }

Write-Host "=== OVERALL ARTICLE IMAGE STATISTICS ==="
Write-Host "Total Articles in articles.json:" $articles.Count
Write-Host "Articles with Images:" $withImg.Count
Write-Host "Articles without Images (text-only):" $noImg.Count
Write-Host "Distinct Image Files Used:" $groups.Count
Write-Host "Images used by exactly 1 article (Unique):" $unique.Count
Write-Host "Images shared by 2 or more articles:" $shared.Count

$totalArticlesSharing = ($shared | Measure-Object -Property Count -Sum).Sum
Write-Host "Total articles that share an image:" $totalArticlesSharing

Write-Host "`n=== DETAILED BREAKDOWN OF SHARED IMAGES ==="
foreach ($g in $shared) {
    Write-Host "`nImage: $($g.Name) (Used in $($g.Count) articles)"
    foreach ($item in $g.Group) {
        Write-Host "  * [$($item.category)] [ID: $($item.id)] $($item.title)"
    }
}

Write-Host "`n=== SEED_STORIES CHECK (CURRENT HOMEPAGE FEED) ==="
if (Test-Path ./data/seedStories.ts) {
    $raw = Get-Content ./data/seedStories.ts -Raw
    $regex = [regex]'imageUrl:\s*["'']([^"'']+)["'']'
    $allMatches = $regex.Matches($raw)
    $urls = @($allMatches | ForEach-Object { $_.Groups[1].Value })
    $feedGroups = $urls | Group-Object | Sort-Object Count -Descending
    $feedShared = $feedGroups | Where-Object { $_.Count -gt 1 }
    $feedUnique = $feedGroups | Where-Object { $_.Count -eq 1 }

    Write-Host "Total stories in seedStories.ts:" $urls.Count
    Write-Host "Distinct images used in seedStories:" $feedGroups.Count
    Write-Host "Images used by exactly 1 story:" $feedUnique.Count
    Write-Host "Images shared across multiple stories in seedStories:" $feedShared.Count

    foreach ($fg in $feedShared) {
        Write-Host "  * $($fg.Name) : Used in $($fg.Count) stories"
    }
}

