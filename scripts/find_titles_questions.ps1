$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

$titlesFound = @()
$questionsFound = @()

foreach ($a in $articles) {
  if (-not $a.content) { continue }
  $pMatches = [regex]::Matches($a.content, '<p>(.*?)</p>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $pMatches) {
    $inner = $m.Groups[1].Value.Trim()
    
    # Check question
    $isQuestion = ($inner -match '\?' -or $inner -match '^(Who|What|Where|When|Why|How|Which|Whom|Whose|Is|Are|Was|Were|Can|Could|Do|Does|Did|Will|Would|Should)\b') -and $inner.Length -le 100 -and -not ($inner -match '\.\s+[A-Z]')
    if ($isQuestion) {
      $questionsFound += [PSCustomObject]@{ article = $a.id; text = $inner }
      continue
    }

    # Check title / heading
    $isTitle = ($inner.Length -ge 8 -and $inner.Length -le 85 -and $inner -match '^[A-Z0-9\u0900-\u097F]' -and -not ($inner -match '^(http|https|www|Tags:|#|👉|•|\-)') -and -not ($inner -match '\.\s+[A-Z]'))
    if ($isTitle) {
      $titlesFound += [PSCustomObject]@{ article = $a.id; text = $inner }
    }
  }
}

Write-Host "Total Questions found: $($questionsFound.Count)"
$questionsFound | Select-Object -First 15 | Format-Table -AutoSize

Write-Host "`nTotal Titles found: $($titlesFound.Count)"
$titlesFound | Select-Object -First 20 | Format-Table -AutoSize
