$raw = Get-Content -Raw -Path 'd:\biharsay\src\data\articles.json' | ConvertFrom-Json

# Known broken/excluded patterns
$excluded = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

$authenticLocalImages = @(
  '/legacy-images/Bihar-Say-Website.png',
  '/legacy-images/Bihar-Say-Website-84.png',
  '/legacy-images/Bihar-Say-Website-82.png',
  '/legacy-images/Bihar-Say-Website-81.png',
  '/legacy-images/Bihar-Say-Website-80.png',
  '/legacy-images/Bihar-Say-Website-79.png',
  '/legacy-images/Bihar-Say-Website-78.png',
  '/legacy-images/Bihar-Say-Website-77.png',
  '/legacy-images/Bihar-Say-Website-75.png',
  '/legacy-images/Bihar-Say-Website-74.png',
  '/legacy-images/Bihar-Say-Website-73.png',
  '/legacy-images/Bihar-Say-Website-72.png',
  '/legacy-images/Bihar-Say-Website-71.png',
  '/legacy-images/Bihar-Say-Website-70.png',
  '/legacy-images/Bihar-Say-Website-69.png',
  '/legacy-images/Bihar-Say-Website-68.png',
  '/legacy-images/Bihar-Say-Website-67.png',
  '/legacy-images/Bihar-Say-Website-66.png',
  '/legacy-images/Bihar-Say-Website-8.png',
  '/legacy-images/Bihar-Say-Website-7.png',
  '/legacy-images/Bihar-Say-Website-6.png',
  '/legacy-images/Bihar-Say-Website-4.png',
  '/legacy-images/Bihar-Say-Website-3.png',
  '/legacy-images/Bihar-Say-Website-2.png',
  '/legacy-images/Bihar-Say-Website-1.png',
  '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg',
  '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg'
)

$canonicalImageMap = @{
  'bihar-deled-admission-2026-20-aug-merit-list-dates-admission-details' = '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg';
  'munger-records-indias-cleanest-air-bihar-aqi-2026-update' = '/legacy-images/Bihar-Say-Website-6.png';
  'bihar-board-10th-result-2026-declared' = '/legacy-images/Bihar-Say-Website-4.png';
  '%e0%a4%ac%e0%a4%bf%e0%a4%b9%e0%a4%be%e0%a4%b0-%e0%a4%ae%e0%a5%87%e0%a4%82-%e0%a4%8f%e0%a4%b2%e0%a4%aa%e0%a5%80%e0%a4%9c%e0%a5%80-%e0%a4%b8%e0%a4%82%e0%a4%95%e0%a4%9f-%e0%a4%a8%e0%a4%b9%e0%a5%80' = '/legacy-images/Bihar-Say-Website-84.png';
  'bihar-declared-naxal-free-after-suresh-kodas-surrender-in-munger' = '/legacy-images/Bihar-Say-Website-78.png';
  'bpsc-tre-1-teachers-get-salary-hike' = '/legacy-images/Bihar-Say-Website-71.png';
  'nalanda-dongguk-university-revive-ancient-buddhist-knowledge-corridor' = '/legacy-images/Bihar-Say-Website-72.png';
  'bihar-to-open-degree-colleges-in-360-blocks' = '/legacy-images/Bihar-Say-Website-3.png'
}

$eduStories = @()
foreach ($a in $raw) {
    if ($a.categorySlug -eq 'education-social') {
        if ($excluded -contains $a.id) { continue }
        
        $img = $a.imageUrl
        if ($canonicalImageMap.ContainsKey($a.id)) {
            $img = $canonicalImageMap[$a.id]
        }
        
        # Check if authentic local image
        if ($authenticLocalImages -contains $img) {
            $eduStories += [PSCustomObject]@{
                id = $a.id
                title = $a.title
                summary = $a.summary
                imageUrl = $img
            }
        }
    }
}

[Console]::WriteLine("Total Education & Social stories with authentic images: " + $eduStories.Count)
foreach ($s in $eduStories) {
    [Console]::WriteLine("ID: " + $s.id)
    [Console]::WriteLine("TITLE: " + $s.title)
    [Console]::WriteLine("SUMMARY: " + $s.summary)
    [Console]::WriteLine("IMAGE: " + $s.imageUrl)
    [Console]::WriteLine("==================================================")
}
