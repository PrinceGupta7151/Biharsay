$csv = Import-Csv -Path "d:\biharsay\complete_valid_articles.csv"
$json = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

$jsonIds = @($json | ForEach-Object { $_.id })
$jsonLegacyIds = @($json | ForEach-Object { [string]$_.legacyId })

$missing = @()
foreach ($row in $csv) {
  $csvId = $row.id
  $csvLegacy = [string]$row.legacyId
  if ($jsonIds -notcontains $csvId -and $jsonLegacyIds -notcontains $csvLegacy) {
    $missing += [PSCustomObject]@{
      id = $csvId
      title = $row.title
      category = $row.category
      legacyId = $csvLegacy
    }
  }
}

Write-Host "Missing from articles.json: $($missing.Count)"
$missing | Format-Table -AutoSize
