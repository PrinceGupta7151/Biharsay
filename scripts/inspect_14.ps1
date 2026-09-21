$articles = Get-Content -Raw 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
$item = $articles[14]
Write-Host "Index 14: id=$($item.id), legacyId=$($item.legacyId), category=$($item.category), categorySlug=$($item.categorySlug), imageUrl=$($item.imageUrl)"
