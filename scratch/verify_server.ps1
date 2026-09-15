# Check files exist and are valid UTF-8
$files = @(
    "d:\biharsay\components\CategorySection.tsx",
    "d:\biharsay\components\CategorySection.module.css",
    "d:\biharsay\components\Header.tsx",
    "d:\biharsay\components\HomeFeed.tsx",
    "d:\biharsay\lib\db.ts"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = [System.IO.File]::ReadAllText($f)
        Write-Host "OK ($($c.Length) chars): $f"
    } else {
        Write-Host "MISSING: $f"
    }
}
