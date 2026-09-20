Add-Type -AssemblyName System.Drawing

$srcPath = 'd:\biharsay\public\logos\biharsay.png'
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Tightly cropped full logo (with 16px margin)
$cropX = [Math]::Max(0, 171 - 16)
$cropY = [Math]::Max(0, 71 - 16)
$cropW = [Math]::Min($srcBmp.Width - $cropX, (855 - 171 + 1) + 32)
$cropH = [Math]::Min($srcBmp.Height - $cropY, (442 - 71 + 1) + 32)

$fullCropped = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g1 = [System.Drawing.Graphics]::FromImage($fullCropped)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle 0, 0, $cropW, $cropH), (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH), [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()

# Save tightly cropped full logo
$fullCropped.Save('d:\biharsay\public\logos\biharsay-full.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved biharsay-full.png: $($cropW)x$($cropH)"

# 2. Yellow Bihar Map Emblem (Icon)
# Map bounds: X=[404, 673] (270w), Y=[75, 259] (185h)
$mapX = 404
$mapY = 75
$mapW = 270
$mapH = 185

# Create a square icon 300x300 with map centered
$iconSize = 300
$mapIcon = New-Object System.Drawing.Bitmap $iconSize, $iconSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($mapIcon)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$destW = 250
$destH = [int](250 * ($mapH / $mapW))
$destX = [int](($iconSize - $destW) / 2)
$destY = [int](($iconSize - $destH) / 2)

$g2.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle $destX, $destY, $destW, $destH), (New-Object System.Drawing.Rectangle $mapX, $mapY, $mapW, $mapH), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$mapIcon.Save('d:\biharsay\public\logos\biharsay-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved biharsay-icon.png: 300x300"

# 3. Favicon (32x32)
$fav32 = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g3 = [System.Drawing.Graphics]::FromImage($fav32)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.DrawImage($mapIcon, (New-Object System.Drawing.Rectangle 0, 0, 32, 32), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$g3.Dispose()

$fav32.Save('d:\biharsay\public\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$fav32.Save('d:\biharsay\public\favicon.ico', [System.Drawing.Imaging.ImageFormat]::Icon)
Write-Output "Saved favicon.png and favicon.ico: 32x32"

# 4. Apple Touch Icon (192x192) with sleek dark background #0F172A
$apple192 = New-Object System.Drawing.Bitmap 192, 192, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g4 = [System.Drawing.Graphics]::FromImage($apple192)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g4.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
$g4.FillRectangle($bgBrush, 0, 0, 192, 192)
$bgBrush.Dispose()

$appleIconSize = 140
$appleIconX = [int]((192 - $appleIconSize) / 2)
$appleIconY = [int]((192 - $appleIconSize) / 2)
$g4.DrawImage($mapIcon, (New-Object System.Drawing.Rectangle $appleIconX, $appleIconY, $appleIconSize, $appleIconSize), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$g4.Dispose()

$apple192.Save('d:\biharsay\public\apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved apple-touch-icon.png: 192x192"

# 5. Overwrite public/logos/biharsay.png with the cropped full logo
$fullCropped.Save('d:\biharsay\public\logos\biharsay.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Updated public/logos/biharsay.png with cropped version"

$srcBmp.Dispose()
$fullCropped.Dispose()
$mapIcon.Dispose()
$fav32.Dispose()
$apple192.Dispose()
