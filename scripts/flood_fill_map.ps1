Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\91896\.gemini\antigravity-ide\brain\f1d78402-b77c-4c58-8327-db9a7b5f47c1\.user_uploaded\media_1789878427351.png'
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Flood fill / BFS from (500, 150) which is inside the yellow Bihar map
$w = $bmp.Width
$h = $bmp.Height
$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

$startPt = New-Object System.Drawing.Point 500, 150
$queue.Enqueue($startPt)
$visited[500, 150] = $true

$mapPixels = New-Object System.Collections.Generic.List[System.Drawing.Point]

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $mapPixels.Add($pt)
    
    # Check 4 neighbors
    $neighbors = @(
        (New-Object System.Drawing.Point ($pt.X + 1), $pt.Y),
        (New-Object System.Drawing.Point ($pt.X - 1), $pt.Y),
        (New-Object System.Drawing.Point $pt.X, ($pt.Y + 1)),
        (New-Object System.Drawing.Point $pt.X, ($pt.Y - 1))
    )
    
    foreach ($n in $neighbors) {
        if ($n.X -ge 0 -and $n.X -lt $w -and $n.Y -ge 0 -and $n.Y -lt 240) { # strictly Y < 240
            if (-not $visited[$n.X, $n.Y]) {
                $visited[$n.X, $n.Y] = $true
                $p = $bmp.GetPixel($n.X, $n.Y)
                # Map is yellow or drop shadow of map
                if ($p.A -gt 15) {
                    $queue.Enqueue($n)
                }
            }
        }
    }
}

$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
foreach ($pt in $mapPixels) {
    if ($pt.X -lt $minX) { $minX = $pt.X }
    if ($pt.X -gt $maxX) { $maxX = $pt.X }
    if ($pt.Y -lt $minY) { $minY = $pt.Y }
    if ($pt.Y -gt $maxY) { $maxY = $pt.Y }
}

Write-Output "Flood Fill Map Bounds: X=[$minX, $maxX] (W=$($maxX - $minX + 1)), Y=[$minY, $maxY] (H=$($maxY - $minY + 1)), Pixels=$($mapPixels.Count)"

$mapW = $maxX - $minX + 1
$mapH = $maxY - $minY + 1

# Create clean 512x512 icon
$iconSize = 512
$cleanMap = New-Object System.Drawing.Bitmap $iconSize, $iconSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Copy only the connected map pixels with their exact alpha and colors
$pad = 48
$availW = $iconSize - ($pad * 2)
$availH = $iconSize - ($pad * 2)
$scale = [Math]::Min($availW / $mapW, $availH / $mapH)
$scaledW = [int]($mapW * $scale)
$scaledH = [int]($mapH * $scale)
$offsetX = $pad + [int](($availW - $scaledW) / 2)
$offsetY = $pad + [int](($availH - $scaledH) / 2)

# Temporary bitmap of exact map bounds
$tempBmp = New-Object System.Drawing.Bitmap $mapW, $mapH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
foreach ($pt in $mapPixels) {
    $p = $bmp.GetPixel($pt.X, $pt.Y)
    $tempBmp.SetPixel(($pt.X - $minX), ($pt.Y - $minY), $p)
}

$g = [System.Drawing.Graphics]::FromImage($cleanMap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($tempBmp, (New-Object System.Drawing.Rectangle $offsetX, $offsetY, $scaledW, $scaledH), (New-Object System.Drawing.Rectangle 0, 0, $mapW, $mapH), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$cleanMap.Save('d:\biharsay\public\logos\biharsay-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved 100% pure biharsay-icon.png"

# Favicons
$fav32 = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFav = [System.Drawing.Graphics]::FromImage($fav32)
$gFav.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFav.DrawImage($cleanMap, (New-Object System.Drawing.Rectangle 0, 0, 32, 32), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$gFav.Dispose()
$fav32.Save('d:\biharsay\public\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$fav32.Save('d:\biharsay\public\favicon.ico', [System.Drawing.Imaging.ImageFormat]::Icon)

# Apple touch icon on sleek #0F172A
$apple192 = New-Object System.Drawing.Bitmap 192, 192, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gApple = [System.Drawing.Graphics]::FromImage($apple192)
$gApple.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gApple.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
$gApple.FillRectangle($brush, 0, 0, 192, 192)
$brush.Dispose()
$applePad = 24
$appleContent = 192 - ($applePad * 2)
$gApple.DrawImage($cleanMap, (New-Object System.Drawing.Rectangle $applePad, $applePad, $appleContent, $appleContent), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$gApple.Dispose()
$apple192.Save('d:\biharsay\public\apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$cleanMap.Dispose()
$tempBmp.Dispose()
$fav32.Dispose()
$apple192.Dispose()
