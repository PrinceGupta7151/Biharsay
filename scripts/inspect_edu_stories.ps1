$srcArticles = Get-Content 'd:\biharsay\src\data\articles.json' -Raw | ConvertFrom-Json
$edu = $srcArticles | Where-Object { $_.categorySlug -eq 'education-social' -or $_.category -like '*Education*' }
Write-Output "Total Education stories in src/data/articles.json: $($edu.Count)"
foreach ($s in $edu) {
    Write-Output "ID: $($s.id)"
    Write-Output "Title: $($s.title)"
    Write-Output "Summary: $($s.summary)"
    Write-Output "Content Preview: $(if ($s.content) { $s.content.Substring(0, [Math]::Min(150, $s.content.Length)) } else { 'NO CONTENT' })"
    Write-Output "--------------------------------------------------------"
}
