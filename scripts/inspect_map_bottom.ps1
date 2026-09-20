Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\91896\.gemini\antigravity-ide\brain\f1d78402-b77c-4c58-8327-db9a7b5f47c1\.user_uploaded\media_1789878427351.png'
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Let's inspect rows 220 to 260 for the map vs text
# Map is between X=390 and X=610
for ($y = 220; $y -le 255; $y += 2) {
    $yellows = 0
    $minX = 1000
    $maxX = 0
    for ($x = 350; $x -le 650; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 50 -and $p.R -gt 180 -and $p.G -gt 150 -and $p.B -lt 80) {
            $yellows++
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
    Write-Output "Y=$y : yellow count=$yellows, X=[$minX, $maxX]"
}
$bmp.Dispose()
