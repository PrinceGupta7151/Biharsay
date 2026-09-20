$port = 3000
try {
  $test = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
} catch {
  $port = 3001
}
Write-Host "Active Port: $port"

# Get homepage HTML
$homeHtml = (Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing).Content

# Extract all /article/ links
$regex = [regex]'href=["'']/article/([^"''#?]+)["'']'
$matches = $regex.Matches($homeHtml)

$links = @()
foreach ($m in $matches) {
  $slug = $m.Groups[1].Value
  if ($links -notcontains $slug) {
    $links += $slug
  }
}

Write-Host "Found $($links.Count) unique article links on homepage."

$results404 = @()
$results200 = @()

foreach ($slug in $links) {
  $url = "http://localhost:$port/article/$slug"
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -eq 200) {
      if ($resp.Content -match 'Story Not Found' -or $resp.Content -match '404') {
        $results404 += [PSCustomObject]@{ Slug = $slug; Status = "404 in content" }
      } else {
        $results200 += $slug
      }
    } else {
      $results404 += [PSCustomObject]@{ Slug = $slug; Status = $resp.StatusCode }
    }
  } catch {
    $results404 += [PSCustomObject]@{ Slug = $slug; Status = $_.Exception.Message }
  }
}

Write-Host "`n404 Articles on Homepage: $($results404.Count)"
$results404 | Format-Table -AutoSize

Write-Host "Successful Articles: $($results200.Count)"
