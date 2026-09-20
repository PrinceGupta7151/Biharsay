Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\91896\.gemini\antigravity-ide\brain\f1d78402-b77c-4c58-8327-db9a7b5f47c1\.user_uploaded\media_1789903905687.png'
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Function to create transparent full logo (removing white background)
function Make-TransparentFull($bmp) {
    $out = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $bright = ($p.R + $p.G + $p.B) / 3.0
            if ($bright -ge 250) {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($bright -gt 238) {
                $alpha = [int](255 * (250 - $bright) / 12.0)
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            } else {
                $out.SetPixel($x, $y, $p)
            }
        }
    }
    return $out
}

# 2. Function to extract pure blue emblem ONLY (no black text, no white bg)
function Make-EmblemOnly($bmp) {
    $out = New-Object System.Drawing.Bitmap $bmp.Width, 332, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt 330; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBlue = ($p.B -gt 90) -and ($p.B -gt ($p.R + 20)) -and ($p.B -gt ($p.G - 20))
            $bright = ($p.R + $p.G + $p.B) / 3.0
            
            if ($isBlue -and $bright -lt 248) {
                if ($bright -gt 235) {
                    $alpha = [int](255 * (248 - $bright) / 13.0)
                    $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
                } else {
                    $out.SetPixel($x, $y, $p)
                }
            } else {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    return $out
}

$transFull = Make-TransparentFull $srcBmp
$emblemOnly = Make-EmblemOnly $srcBmp

# Save full cropped logo (with text)
$pad = 14
$cropX = 41 - $pad
$cropY = 49 - $pad
$cropW = 422 + ($pad * 2)
$cropH = 375 + ($pad * 2)

$fullLogo = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g1 = [System.Drawing.Graphics]::FromImage($fullLogo)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($transFull, (New-Object System.Drawing.Rectangle 0, 0, $cropW, $cropH), (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH), [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()

$fullLogo.Save('d:\biharsay\public\logos\biharsay-full.png', [System.Drawing.Imaging.ImageFormat]::Png)
$fullLogo.Save('d:\biharsay\public\logos\biharsay.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved biharsay-full.png and biharsay.png"

# Save pristine icon mark: X=[131, 368] (W=237), Y=[50, 327] (H=277)
$embX = 130
$embY = 48
$embW = 239
$embH = 280

$iconSize = 300
$iconBmp = New-Object System.Drawing.Bitmap $iconSize, $iconSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($iconBmp)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$targetH = 264
$targetW = [int]($embW * ($targetH / $embH))
$targetX = [int](($iconSize - $targetW) / 2)
$targetY = [int](($iconSize - $targetH) / 2)

$g2.DrawImage($emblemOnly, (New-Object System.Drawing.Rectangle $targetX, $targetY, $targetW, $targetH), (New-Object System.Drawing.Rectangle $embX, $embY, $embW, $embH), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$iconBmp.Save('d:\biharsay\public\logos\biharsay-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved pure biharsay-icon.png: 300x300"

# Favicon (32x32)
$fav32 = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g3 = [System.Drawing.Graphics]::FromImage($fav32)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.DrawImage($iconBmp, (New-Object System.Drawing.Rectangle 1, 1, 30, 30), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$g3.Dispose()

$fav32.Save('d:\biharsay\public\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$hIcon = $fav32.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::OpenWrite('d:\biharsay\public\favicon.ico')
$ico.Save($fs)
$fs.Close()
$ico.Dispose()
Write-Output "Saved favicon.png and favicon.ico"

# Apple Touch Icon (192x192)
$apple192 = New-Object System.Drawing.Bitmap 192, 192, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g4 = [System.Drawing.Graphics]::FromImage($apple192)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g4.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
$g4.FillRectangle($bgBrush, 0, 0, 192, 192)
$bgBrush.Dispose()

$appleIconSize = 144
$appleX = [int]((192 - $appleIconSize) / 2)
$appleY = [int]((192 - $appleIconSize) / 2)
$g4.DrawImage($iconBmp, (New-Object System.Drawing.Rectangle $appleX, $appleY, $appleIconSize, $appleIconSize), (New-Object System.Drawing.Rectangle 0, 0, $iconSize, $iconSize), [System.Drawing.GraphicsUnit]::Pixel)
$g4.Dispose()

$apple192.Save('d:\biharsay\public\apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved apple-touch-icon.png"

$srcBmp.Dispose()
$transFull.Dispose()
$emblemOnly.Dispose()
$fullLogo.Dispose()
$iconBmp.Dispose()
$fav32.Dispose()
$apple192.Dispose()

Write-Output "Complete pristine logo replacement done!"
