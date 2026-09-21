$articlesPath = "d:\biharsay\src\data\articles.json"
$articles = Get-Content -Raw -Path $articlesPath -Encoding UTF8 | ConvertFrom-Json

$expected = @(
    @{ id = "59000-crore-heading-to-bihar-and-that-may-not-be-the-biggest-story"; image = "/legacy-images/59000-crore-heading-to-bihar.jpg"; cat = "investments-economic" },
    @{ id = "patna-to-get-high-tech-21-crore-indoor-stadium"; image = "/legacy-images/patna-21-crore-indoor-stadium.jpg"; cat = "investments-economic" },
    @{ id = "prime-group-to-invest-1500-crore-in-bihar-real-estate-targeting-5-million-sq-ft-projects"; image = "/legacy-images/prime-group-1500-crore-bihar-real-estate.jpg"; cat = "investments-economic" },
    @{ id = "bharatnet-to-bring-fiber-internet-to-bihar-villages"; image = "/legacy-images/bharatnet-fiber-internet-bihar-villages.jpg"; cat = "investments-economic" },
    @{ id = "bihar-gets-203-crore-tourism-push-for-3-key-destinations"; image = "/legacy-images/bihar-203-crore-tourism-push-bodh-gaya-sonepur-mela.jpg"; cat = "investments-economic" },
    @{ id = "gayas-vishnupad-corridor-to-get-a-2520-crore-makeover-bihars-17-big-development-plans-unveiled"; image = "/legacy-images/gaya-vishnupad-corridor-2520-crore-makeover.jpg"; cat = "investments-economic" },
    @{ id = "they-left-saran-now-coming-together-to-build-saran"; image = "/legacy-images/they-left-saran-now-coming-together-to-build-saran.png"; cat = "entrepreneurship-startups" },
    @{ id = "from-bihar-to-india-how-sudarshan-kashyap-is-building-a-smarter-automotive-business"; image = "/legacy-images/sudarshan-kashyap-broomax-automotive-business.jpg"; cat = "entrepreneurship-startups" },
    @{ id = "bihar-to-sign-mou-with-google-india-to-enhance-teachers-ai-skills"; image = "/legacy-images/bihar-teachers-ai-training-google-india.jpg"; cat = "education-social" },
    @{ id = "bihar-police-to-set-up-child-help-desks-in-every-police-station-from-october-2"; image = "/legacy-images/bihar-police-child-help-desks-october-2.jpg"; cat = "education-social" }
)

$allPassed = $true

foreach ($item in $expected) {
    $found = @($articles | Where-Object { $_.id -eq $item.id })
    if ($found.Count -eq 0) {
        Write-Host "FAIL: Missing $($item.id)" -ForegroundColor Red
        $allPassed = $false
    } elseif ($found.Count -gt 1) {
        Write-Host "FAIL: Duplicate for $($item.id)" -ForegroundColor Red
        $allPassed = $false
    } else {
        $story = $found[0]
        $imgCheck = Join-Path "d:\biharsay\public" ($story.imageUrl.TrimStart('/'))
        if (Test-Path $imgCheck) {
            Write-Host "PASS: $($story.id) | $($story.category) | Image OK" -ForegroundColor Green
        } else {
            Write-Host "FAIL: Image missing at $imgCheck" -ForegroundColor Red
            $allPassed = $false
        }
    }
}

if ($allPassed) {
    Write-Host "`nALL 10 ARTICLES VERIFIED SUCCESSFULLY!" -ForegroundColor Cyan
} else {
    Write-Host "`nSOME ARTICLES FAILED VERIFICATION!" -ForegroundColor Red
}
