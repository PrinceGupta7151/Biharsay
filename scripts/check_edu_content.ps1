$raw = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json

$targetIds = @(
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details',
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update',
  'bihar-board-10th-result-2026-declared',
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80',
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger',
  'bpsc-tre-1-teachers-get-salary-hike'
)

foreach ($a in $raw) {
    if ($targetIds -contains $a.id) {
        [Console]::WriteLine("==================================================")
        [Console]::WriteLine("ID: " + $a.id)
        [Console]::WriteLine("CONTENT PREVIEW (first 500 chars):")
        if ($a.content) {
            $preview = $a.content.Substring(0, [Math]::Min(500, $a.content.Length))
            [Console]::WriteLine($preview)
        } else {
            [Console]::WriteLine("[NO CONTENT]")
        }
    }
}
