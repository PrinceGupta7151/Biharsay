$raw = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json

$count = 0
foreach ($a in $raw) {
    if ($a.categorySlug -eq 'education-social') {
        $count++
        if ($count -le 10) {
            [Console]::WriteLine("[$count] ID: " + $a.id)
            [Console]::WriteLine("    Title: " + $a.title)
            [Console]::WriteLine("    Summary: " + $a.summary)
            [Console]::WriteLine("    Image: " + $a.imageUrl)
            [Console]::WriteLine("---------------------------------------------")
        }
    }
}
