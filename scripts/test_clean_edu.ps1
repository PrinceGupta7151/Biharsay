$srcArticles = Get-Content 'd:\biharsay\src\data\articles.json' -Raw | ConvertFrom-Json
$removed = @(
  '57-new-kendriya-vidyalayas-to-be-opened-most-of-them-in-bihar',
  'aiims-patna-hosts-breast-cancer-awareness-program-2025',
  'bihar-womans-memoir-becomes-lesson-in-kerala-textbook',
  'meet-the-man-behind-indias-first-transgender-police-officer',
  'cbse-bihar-2025-toppers-meet-the-class-10-12-heroes-who-made-the-state-proud',
  'patna-to-host-annual-film-festival-celebrating-regional-talent',
  'the-story-of-patwatoli-bihars-iit-factory-biharcast-exclusive'
)

function Clean-Text($text) {
    if (-not $text) { return "" }
    $t = $text
    $t = $t -replace 'â€™', "'" -replace 'â€˜', "'" -replace 'â€œ', '"' -replace 'â€', '"' -replace 'â€“', '–' -replace 'â€”', '—' -replace 'Â', ''
    $t = $t -replace '&hellip;', '' -replace '\[&hellip;\]', '' -replace '\[\.\.\.\]', '' -replace '&amp;', '&'
    $t = $t -replace '\?Ts', "'s" -replace '\?T', "'" -replace '\?"', '–'
    $t = $t -replace '\?(\d+)', '₹$1'
    $t = $t -replace '([a-z])\.([A-Z])', '$1. $2'
    $t = $t -replace '([a-z])\?([A-Z])', '$1? $2'
    $t = $t -replace '\s+', ' '
    return $t.Trim()
}

$edu = $srcArticles | Where-Object { 
    ($_.categorySlug -eq 'education-social' -or $_.category -like '*Education*') -and 
    $removed -notcontains $_.id
}

foreach ($s in ($edu | Select-Object -First 10)) {
    Write-Output "ID: $($s.id)"
    Write-Output "OLD TITLE: $($s.title)"
    Write-Output "NEW TITLE: $(Clean-Text $s.title)"
    Write-Output "OLD SUMMARY: $($s.summary)"
    Write-Output "NEW SUMMARY: $(Clean-Text $s.summary)"
    Write-Output "=========================================================="
}
