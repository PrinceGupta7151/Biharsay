$articles = Get-Content -Raw 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json
$matches = @($articles | Where-Object { $_.id -like "*bharatnet*" })
Write-Host "Count: $($matches.Count)"
foreach ($m in $matches) {
    Write-Host "ID: $($m.id), Title: $($m.title), Date: $($m.date)"
}
