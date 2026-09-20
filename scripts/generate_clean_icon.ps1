Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\91896\.gemini\antigravity-ide\brain\f1d78402-b77c-4c58-8327-db9a7b5f47c1\.user_uploaded\media_1789878427351.png'
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = 1000
$maxX = 0
$minY = 1000
$maxY = 0

for ($y = 70; $y -le 239; $y++) {
    for ($x = 350; $x -le 620; $x++) {
        $p = $bmp.GetPixel($x, $y)
        # Check for non-transparent map pixel (including drop shadow)
        if ($p.A -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Clean Map Bounds: X=[$minX, $maxX] (W=$($maxX - $minX + 1)), Y=[$minY, $maxY] (H=$($maxY - $minY + 1))"

$mapW = $maxX - $minX + 1
$mapH = $maxY - $minY + 1

# Create a high-res 512x512 icon with the map perfectly centered
$iconSize = 512
$mapIcon = New-Object System.Drawing.Bitmap $iconSize, $iconSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($mapIcon)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$padding = 48
$targetW = $iconSize - ($padding * 2)
$scale = $targetW / $mapW
$targetH = [int]($mapH * $scale)
$targetX = $padding
$targetY = [int](($iconSize - $targetH) / 2)

$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle $targetX, $targetY, $targetW, $targetH), (New-Object System.Drawing.Rectangle $minX, $minY, $mapW, $mapH), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$mapIcon.Save('d:\biharsay\public\logos\biharsay-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved clean biharsay-icon.png (512x512)"

# Favicon (32x32)
$fav32 = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFav = [System.Drawing.Graphics]::FromImage($fav32)
$gFav.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFav.DrawImage($mapIcon, (New-Object System.Drawing.Rectangle 0, 0, 32, 32), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$gFav.Dispose()
$fav32.Save('d:\biharsay\public\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$fav32.Save('d:\biharsay\public\favicon.ico', [System.Drawing.Imaging.ImageFormat]::Icon)
Write-Output "Saved favicon.png & favicon.ico"

# Apple Touch Icon (192x192) on sleek dark #0F172A
$apple192 = New-Object System.Drawing.Bitmap 192, 192, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gApple = [System.Drawing.Graphics]::FromImage($apple192)
$gApple.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gApple.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
$gApple.FillRectangle($brush, 0, 0, 192, 192)
$brush.Dispose()
$applePad = 28
$appleContent = 192 - ($applePad * 2)
$gApple.DrawImage($mapIcon, (New-Object System.Drawing.Rectangle $applePad, $applePad, $appleContent, $appleContent), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$gApple.Dispose()
$apple192.Save('d:\biharsay\public\apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved apple-touch-icon.png"

$bmp.Dispose()
$mapIcon.Dispose()
$fav32.Dispose()
$apple192.Dispose()
