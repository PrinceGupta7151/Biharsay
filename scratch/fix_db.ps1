$path = "d:\biharsay\lib\db.ts"
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
Write-Host "Current total lines: $($lines.Length)"

# Keep lines up to line 682 (index 0 to 681)
$cleanLines = $lines[0..681]
Write-Host "Clean lines: $($cleanLines.Length)"
Write-Host "Last 3 lines of cleanLines:"
$cleanLines[-3..-1]

[System.IO.File]::WriteAllLines($path, $cleanLines, [System.Text.Encoding]::UTF8)
Write-Host "Updated $path successfully!"
