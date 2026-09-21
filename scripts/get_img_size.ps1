Copy-Item 'C:\Users\91896\.gemini\antigravity-ide\brain\af9399ec-8239-4437-bb87-e86a4bfb90df\.user_uploaded\media_1790011488933.jpg' -Destination 'd:\biharsay\public\logos\biharsay-popup-logo.jpg' -Force
Copy-Item 'C:\Users\91896\.gemini\antigravity-ide\brain\af9399ec-8239-4437-bb87-e86a4bfb90df\.user_uploaded\media_1790011488933.jpg' -Destination 'd:\biharsay\public\logos\biharsay-popup-logo.png' -Force

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('d:\biharsay\public\logos\biharsay-popup-logo.jpg')
Write-Host "Width: $($img.Width) Height: $($img.Height)"
$img.Dispose()
