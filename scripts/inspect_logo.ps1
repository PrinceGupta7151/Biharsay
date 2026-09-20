Add-Type -AssemblyName System.Drawing
$filePath = 'd:\biharsay\public\logos\biharsay.png'
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
$colors = @{}
for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    for ($y = 0; $y -lt $bmp.Height; $y += 4) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 200 -and $pixel.R -gt 150 -and $pixel.G -gt 150 -and $pixel.B -lt 100) {
            $hex = ('#{0:X2}{1:X2}{2:X2}' -f $pixel.R, $pixel.G, $pixel.B)
            if ($colors.ContainsKey($hex)) {
                $colors[$hex] = $colors[$hex] + 1
            } else {
                $colors[$hex] = 1
            }
        }
    }
}
$bmp.Dispose()
$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10
