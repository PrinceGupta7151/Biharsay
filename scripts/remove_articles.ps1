$json = Get-Content 'd:\biharsay\data\education_social_stories.json' -Raw | ConvertFrom-Json
$idsToRemove = @(
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)
$filtered = $json | Where-Object { $idsToRemove -notcontains $_.id }
Write-Output "Original: $($json.Count) | After: $($filtered.Count)"
$filtered | ConvertTo-Json -Depth 10 | Set-Content 'd:\biharsay\data\education_social_stories.json' -Encoding UTF8
