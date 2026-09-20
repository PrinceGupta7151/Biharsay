$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

foreach ($a in $articles) {
  $d = [System.Uri]::UnescapeDataString($a.id)
  $norm = ($d.ToLower() -replace '[^a-z0-9]', '')
  if ($norm -eq '') {
    Write-Host "Empty norm ID: $($a.id) | Title: $($a.title)"
  }
}
