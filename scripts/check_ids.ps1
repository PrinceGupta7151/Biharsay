$articles = Get-Content 'd:\biharsay\src\data\articles.json' -Raw | ConvertFrom-Json
$ids = @(
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)
$found = $articles | Where-Object { $ids -contains $_.id }
Write-Output "Found in src/data/articles.json: $($found.Count)"
