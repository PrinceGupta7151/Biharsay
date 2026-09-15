$c = [System.IO.File]::ReadAllText("d:\biharsay\lib\db.ts")
$open = ([regex]::Matches($c, '\{')).Count
$close = ([regex]::Matches($c, '\}')).Count
Write-Host "Open braces: $open"
Write-Host "Close braces: $close"
Write-Host "Balanced: $($open -eq $close)"
