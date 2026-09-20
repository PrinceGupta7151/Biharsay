$path = "d:\biharsay\data\education_social_stories.json"
$items = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
$filtered = $items | Where-Object { $_.id -notlike "*686-cr-boost*" }
Write-Host "Before: $($items.Count) After: $($filtered.Count)"
$filtered | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $path -Encoding UTF8
