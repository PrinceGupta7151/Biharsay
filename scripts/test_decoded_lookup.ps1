$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json

# Let's inspect getStoryById from lib/db.ts
# It does:
# 1. safeDecode(id)
# 2. ALIAS_TO_CANONICAL_ID
# 3. INITIAL_STORIES.find(s => s.id === targetId || s.id === id || s.id === decodedId || normalize(s.id) === normalize(targetId))
# 4. PROTOTYPE_CONTENT_MAP
# 5. INITIAL_STORIES.find with normalize

function Test-Lookup($searchId) {
  $decoded = [System.Uri]::UnescapeDataString($searchId)
  $normSearch = ($decoded.ToLower() -replace '[^a-z0-9]', '')
  
  foreach ($s in $articles) {
    if ($s.id -eq $searchId -or $s.id -eq $decoded) { return $s.id }
    $sDecoded = [System.Uri]::UnescapeDataString($s.id)
    if ($sDecoded -eq $decoded -or $sDecoded -eq $searchId) { return $s.id }
    $sNorm = ($sDecoded.ToLower() -replace '[^a-z0-9]', '')
    if ($normSearch -ne '' -and $sNorm -eq $normSearch) { return $s.id }
  }
  return $null
}

# Now, in the real browser:
# When Next.js loads /article/[id], params.id is ALREADY DECODED.
# Let's test what happens when we look up each story using its decoded id with the CURRENT db.ts logic:

$failures = @()
foreach ($a in $articles) {
  $decodedParam = [System.Uri]::UnescapeDataString($a.id)
  
  # Current db.ts:
  # localFound = INITIAL_STORIES.find(s => s.id === targetId || s.id === id || s.id === decodedId || normalize(s.id) === normalize(targetId))
  # where targetId = ALIAS_TO_CANONICAL_ID[decodedParam] || decodedParam
  # normalize(str) = safeDecode(str).toLowerCase().replace(/[^a-z0-9]/g, '')
  
  $normParam = ($decodedParam.ToLower() -replace '[^a-z0-9]', '')
  $found = $false
  
  foreach ($s in $articles) {
    if ($s.id -eq $decodedParam) { $found = $true; break }
    # Notice: s.id in INITIAL_STORIES is NOT decoded! It is $a.id (which might be %-encoded)!
    # Does $s.id -eq $decodedParam? Only if $s.id has NO % characters!
    $sNorm = (([System.Uri]::UnescapeDataString($s.id)).ToLower() -replace '[^a-z0-9]', '')
    if ($normParam -ne '' -and $sNorm -eq $normParam) { $found = $true; break }
    if ($normParam -eq '' -and $sNorm -eq '' -and $s.id -eq $a.id) {
      # If both are empty, did find() match?
      # Wait, in JS: find() returns the FIRST item where callback is true!
      # If $normParam is '', then find() returns the FIRST story where normalize(s.id) === ''!
    }
  }

  if (-not $found) {
    $failures += [PSCustomObject]@{
      id = $a.id
      decoded = $decodedParam
      norm = $normParam
      title = $a.title
    }
  }
}

Write-Host "Lookup failures when params.id is decoded: $($failures.Count)"
$failures | Format-Table -AutoSize
