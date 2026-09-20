Add-Type -AssemblyName System.Drawing

$filePath = 'C:\Users\91896\.gemini\antigravity-ide\brain\f1d78402-b77c-4c58-8327-db9a7b5f47c1\.user_uploaded\media_1789903905687.png'
$img = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Output "Dimensions: $($img.Width)x$($img.Height)"

$tl = $img.GetPixel(0, 0)
Write-Output "Top-Left: R=$($tl.R), G=$($tl.G), B=$($tl.B), A=$($tl.A)"

# Find non-white bounds (content bounds)
$minX = $img.Width
$maxX = 0
$minY = $img.Height
$maxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        # Check if not pure white
        if ($p.R -lt 245 -or $p.G -lt 245 -or $p.B -lt 245) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Content bounds: X=[$minX, $maxX] (W=$($maxX - $minX + 1)), Y=[$minY, $maxY] (H=$($maxY - $minY + 1))"

# Find icon emblem bounds (blue pixels only)
$iconMinX = $img.Width
$iconMaxX = 0
$iconMinY = $img.Height
$iconMaxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        # Blue pixels (butterfly emblem)
        if ($p.B -gt 150 -and $p.B -gt ($p.R + 40)) {
            if ($x -lt $iconMinX) { $iconMinX = $x }
            if ($x -gt $iconMaxX) { $iconMaxX = $x }
            if ($y -lt $iconMinY) { $iconMinY = $y }
            if ($y -gt $iconMaxY) { $iconMaxY = $y }
        }
    }
}

Write-Output "Blue Emblem bounds: X=[$iconMinX, $iconMaxX] (W=$($iconMaxX - $iconMinX + 1)), Y=[$iconMinY, $iconMaxY] (H=$($iconMaxY - $iconMinY + 1))"

$img.Dispose()
