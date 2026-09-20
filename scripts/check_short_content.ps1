$articlesJson = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

$shortContent = @()
foreach ($a in $articlesJson) {
  $len = if ($a.content) { $a.content.Trim().Length } else { 0 }
  if ($len -lt 1000) {
    $shortContent += [PSCustomObject]@{
      id = $a.id
      title = $a.title
      category = $a.category
      length = $len
    }
  }
}

Write-Host "Articles with content < 1000 chars: $($shortContent.Count)"
$shortContent | Format-Table -AutoSize
