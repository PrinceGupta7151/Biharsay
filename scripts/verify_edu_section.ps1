$ports = @(3000, 3001)
$activePort = $null

foreach ($p in $ports) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:$p/" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            $activePort = $p
            break
        }
    } catch {
        # continue
    }
}

if (-not $activePort) {
    [Console]::WriteLine("Dev server not responding on port 3000 or 3001")
    exit 0
}

[Console]::WriteLine("Dev server active on port $activePort")

# 1. Check Homepage for Education & Social section
$homeHtml = (Invoke-WebRequest -Uri "http://localhost:$activePort/" -UseBasicParsing).Content
[Console]::WriteLine("Homepage contains 'Education & Social': " + ($homeHtml -match "Education &amp; Social|Education & Social"))
[Console]::WriteLine("Homepage contains corrupted question marks for LPG: " + ($homeHtml -match "\?\?\?\?\?"))
[Console]::WriteLine("Homepage contains clean Hindi LPG title: " + ($homeHtml -match "बिहार में एलपीजी संकट नहीं"))
[Console]::WriteLine("Homepage contains DElEd clean title: " + ($homeHtml -match "Bihar DElEd Admission 2026"))
[Console]::WriteLine("Homepage contains Munger clean title: " + ($homeHtml -match "Munger Records India's Cleanest Air"))
[Console]::WriteLine("Homepage contains BSEB 10th result clean: " + ($homeHtml -match "Bihar Board 10th Result 2026 Declared"))

# 2. Check each target article page
$targetSlugs = @(
    "bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details",
    "munger-records-indias-cleanest-air-bihar-aqi-2026-update",
    "bihar-board-10th-result-2026-declared",
    "bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger",
    "bpsc-tre-1-teachers-get-salary-hike",
    "17-year-old-ethical-hacker-from-bihar-enters-nasas-hall-of-fame"
)

foreach ($slug in $targetSlugs) {
    try {
        $artHtml = (Invoke-WebRequest -Uri "http://localhost:$activePort/article/$slug" -UseBasicParsing).Content
        $hasHr = $artHtml -match "<hr"
        $hasH2 = $artHtml -match "<h2"
        $hasClean15k = $artHtml -match "15K\+|15,000\+"
        [Console]::WriteLine("Article [$slug]: status=OK, hasHr=$hasHr, hasH2=$hasH2, has15k=$hasClean15k")
    } catch {
        [Console]::WriteLine("Article [$slug]: FAILED to load ($_)")
    }
}
