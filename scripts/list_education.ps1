$raw = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
foreach ($a in $raw) {
    if ($a.categorySlug -eq 'education-social' -or $a.category -like '*Education*') {
        [Console]::WriteLine($a.id + ' | ' + $a.title + ' | img:' + [bool]$a.imageUrl)
    }
}
