# Download authentic Bihar Say images directly into public/legacy-images/
# so the site operates 100% locally without external runtime dependencies.

$ErrorActionPreference = "SilentlyContinue"
$destDir = "d:\biharsay\public\legacy-images"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$images = @(
    @{ filename = "WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg"; url = "https://biharsay.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg" },
    @{ filename = "WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg"; url = "https://biharsay.com/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg" },
    @{ filename = "Bihar-Say-Website-8.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-8.png" },
    @{ filename = "Bihar-Say-Website-7.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-7.png" },
    @{ filename = "Bihar-Say-Website-6.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-6.png" },
    @{ filename = "Bihar-Say-Website-4.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-4.png" },
    @{ filename = "Bihar-Say-Website-3.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-3.png" },
    @{ filename = "Bihar-Say-Website-2.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-2.png" },
    @{ filename = "Bihar-Say-Website-1.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-1.png" },
    @{ filename = "Bihar-Say-Website.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website.png" },
    @{ filename = "Bihar-Say-Website-84.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-84.png" },
    @{ filename = "Bihar-Say-Website-82.png"; url = "https://biharsay.com/wp-content/uploads/2026/03/Bihar-Say-Website-82.png" },
    @{ filename = "Bihar-Say-Website-81.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-81.png" },
    @{ filename = "Bihar-Say-Website-80.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-80.png" },
    @{ filename = "Bihar-Say-Website-79.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-79.png" },
    @{ filename = "Bihar-Say-Website-78.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-78.png" },
    @{ filename = "Bihar-Say-Website-77.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-77.png" },
    @{ filename = "Bihar-Say-Website-75.png"; url = "https://biharsay.com/wp-content/uploads/2026/02/Bihar-Say-Website-75.png" },
    @{ filename = "Bihar-Say-Website-74.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-74.png" },
    @{ filename = "Bihar-Say-Website-73.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-73.png" },
    @{ filename = "Bihar-Say-Website-72.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-72.png" },
    @{ filename = "Bihar-Say-Website-71.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-71.png" },
    @{ filename = "Bihar-Say-Website-70.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-70.png" },
    @{ filename = "Bihar-Say-Website-69.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-69.png" },
    @{ filename = "Bihar-Say-Website-68.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-68.png" },
    @{ filename = "Bihar-Say-Website-67.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-67.png" },
    @{ filename = "Bihar-Say-Website-66.png"; url = "https://biharsay.com/wp-content/uploads/2026/01/Bihar-Say-Website-66.png" }
)

Write-Host "Downloading $($images.Count) authentic images to $destDir..."

$downloaded = 0
$failed = 0

foreach ($item in $images) {
    $out = Join-Path $destDir $item.filename
    if (Test-Path $out) {
        $downloaded++
        continue
    }
    
    try {
        & curl.exe -s -L -f --max-time 15 -o "$out" "$($item.url)"
        if (Test-Path $out) {
            $downloaded++
            Write-Host "  [OK] $($item.filename)"
        } else {
            $failed++
            Write-Warning "  [FAIL] $($item.filename)"
        }
    } catch {
        $failed++
        Write-Warning "  [ERROR] $($item.filename): $_"
    }
}

Write-Host "Completed: $downloaded downloaded/existing, $failed failed."
