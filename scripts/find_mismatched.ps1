$json = Get-Content 'd:\biharsay\data\education_social_stories.json' -Raw | ConvertFrom-Json
$matches = $json | Where-Object { $_.imageUrl -like '*Bihar-Say-Website-3*' }
Write-Output "Found $($matches.Count) stories with Bihar-Say-Website-3:"
foreach ($m in $matches) {
    Write-Output "ID: $($m.id) | Title: $($m.title)"
}
