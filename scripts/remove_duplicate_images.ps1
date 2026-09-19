$articles = Get-Content -Encoding UTF8 ./src/data/articles.json | ConvertFrom-Json

# List of article IDs where the duplicate image should be removed (set to empty string)
$idsToRemoveImage = @(
    # 1. Bihar-Say-Website-81.png (Keep on: jbc-kabaddi-league-uniting-jharkhand-bihar-and-chhattisgarh-for-a-kabaddi-revolution)
    "bihar-sports-scholarship-2026-%e2%82%b920-lakh-aid-for-athletes",
    "over-1000-civil-servants-compete-in-national-athletics-championship-in-patna",
    "east-champarans-horse-race-pond-to-get-%e2%82%b950-crore-makeover",

    # 2. WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg (Keep on: bihar-makhana-boom-migration)
    "bihars-makhana-business-is-booming-so-why-are-the-people-who-know-it-best-still-being-forced-to-migrate",
    "bihar-makhana-farming-subsidy-2026-%e2%82%b972750-per-hectare-for-farmers",

    # 3. Bihar-Say-Website-75.png (Keep on: bihar-ai-growth-2026-mous-gcc-policy-tech-push-at-india-ai-impact-summit-delhi)
    "business-mahakumbh-bihar-2025-bihars-biggest-startup-msme-event",
    "bihar-idea-festival-portal-launched-for-startups-students",

    # 4. Bihar-Say-Website-73.png (Keep on: how-dehaat-transformed-1-8-million-farmer-lives-in-just-13-years)
    "pm-kisan-samman-nidhi-how-digital-reform-can-empower-every-farmer",
    "gomini-indias-first-cow-care-startup-blending-tradition-technology",

    # 5. Bihar-Say-Website-82.png (Keep on: patna-to-get-high-tech-%e2%82%b921-crore-indoor-stadium)
    "sportstar-aces-awards-2026-%e0%a4%96%e0%a5%87%e0%a4%b2%e0%a5%8b%e0%a4%82-%e0%a4%95%e0%a5%87-%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%9a%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%ac%e0%a4%bf",
    "bihar-creates-world-record-with-574-6-in-vijay-hazare-trophy",

    # 6. Bihar-Say-Website-68.png (Keep on: discover-indias-oldest-functional-temple-mundeshwari-kaimur)
    "worlds-largest-shivlinga-reaches-bihar-gopalganj-to-virat-ramayan-mandir",

    # 7. Bihar-Say-Website-66.png (Keep on: built-in-bihar-for-bharat-gofloww-msme-digital-barriers)
    "bihar-bhumi-live-land-verification-see-your-property-before-registry",

    # 8. Bihar-Say-Website-72.png (Keep on: bihar-sabhyata-dwar-patna-symbol-of-unity-and-heritage)
    "nalanda-dongguk-university-revive-ancient-buddhist-knowledge-corridor",

    # 9. Bihar-Say-Website-7.png (Keep on: sumant-sinha-founder-of-renew-power-and-bihars-green-energy-billionaire)
    "bihar-approves-10mw-solar-power-plant-on-son-canal",

    # 10. Bihar-Say-Website-70.png (Keep on: why-is-patna-metro-changing-its-plan-near-patna-zoo-4-tbms-hold-the-answer)
    "bihar-introduces-149-new-deluxe-bsrtc-buses-before-holi"
)

$updatedCount = 0
foreach ($a in $articles) {
    if ($idsToRemoveImage -contains $a.id) {
        Write-Host "Clearing duplicate image from: [$($a.category)] $($a.title)"
        $a.imageUrl = ""
        $updatedCount++
    }
}

Write-Host "`nTotal articles updated: $updatedCount"

# Save updated articles.json
$json = $articles | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("d:/biharsay/src/data/articles.json", $json, [System.Text.Encoding]::UTF8)
Write-Host "Successfully saved src/data/articles.json"
