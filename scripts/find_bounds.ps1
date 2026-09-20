Add-Type -AssemblyName System.Drawing
$filePath = 'd:\biharsay\public\logos\biharsay.png'
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Also find bounds of yellow map specifically (y < 260 and yellow)
$mapMinX = $bmp.Width
$mapMaxX = 0
$mapMinY = $bmp.Height
$mapMaxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }

            # If yellow and in upper half
            if ($y -lt 260 -and $p.R -gt 180 -and $p.G -gt 150 -and $p.B -lt 80) {
                if ($x -lt $mapMinX) { $mapMinX = $x }
                if ($x -gt $mapMaxX) { $mapMaxX = $x }
                if ($y -lt $mapMinY) { $mapMinY = $y }
                if ($y -gt $mapMaxY) { $mapMaxY = $y }
            }
        }
    }
}
$bmp.Dispose()

Write-Output "Overall Content Bounds: X=[$minX, $maxX], Y=[$minY, $maxY] (Width=$($maxX - $minX + 1), Height=$($maxY - $minY + 1))"
Write-Output "Bihar Map Bounds: X=[$mapMinX, $mapMaxX], Y=[$mapMinY, $mapMaxY] (Width=$($mapMaxX - $mapMinX + 1), Height=$($mapMaxY - $mapMinY + 1))"
