$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json
Write-Host "Total articles: $($articles.Count)"

$dehaat = $articles | Where-Object { $_.id -eq "how-dehaat-transformed-1-8-million-farmer-lives-in-just-13-years" }
Write-Host "`nDeHaat paragraphs in content:"
$dehaatParagraphs = [regex]::Matches($dehaat.content, '<p>(.*?)</p>')
foreach ($m in $dehaatParagraphs) {
  $text = $m.Groups[1].Value.Trim()
  Write-Host "P: $text"
}
