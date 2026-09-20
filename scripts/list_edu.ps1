$srcArticles = Get-Content 'd:\biharsay\src\data\articles.json' -Raw | ConvertFrom-Json
$srcEdu = $srcArticles | Where-Object { $_.categorySlug -eq 'education-social' -or $_.category -like '*Education*' }
Write-Output "--- src/data/articles.json ($($srcEdu.Count) stories) ---"
foreach ($a in $srcEdu) {
    Write-Output "[$($a.id)] $($a.title)"
}

$eduStories = Get-Content 'd:\biharsay\data\education_social_stories.json' -Raw | ConvertFrom-Json
Write-Output "`n--- data/education_social_stories.json ($($eduStories.Count) stories) ---"
foreach ($a in ($eduStories | Select-Object -First 25)) {
    Write-Output "[$($a.id)] $($a.title)"
}
