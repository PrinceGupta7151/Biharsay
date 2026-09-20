$articles = Get-Content -Raw -Path "d:\biharsay\src\data\articles.json" | ConvertFrom-Json
$dehaat = $articles | Where-Object { $_.id -eq "how-dehaat-transformed-1-8-million-farmer-lives-in-just-13-years" }

function Clean-Content($text) {
  # 1. Un-glue fused series and quotes
  $text = [regex]::Replace($text, '([a-z0-9\)])(Series:\s*\d+)', '$1</p><p class="series-badge"><strong>$2')
  $text = [regex]::Replace($text, '([”"»])([A-Z\u0900-\u097F])', '$1</p><p>$2')
  
  # 2. Process all <p>...</p> tags
  $pattern = '(?is)<p>(.*?)</p>'
  $evaluator = [System.Text.RegularExpressions.MatchEvaluator]{
    param($match)
    $inner = $match.Groups[1].Value.Trim()
    if ($inner -eq '') { return '' }
    
    # Check if it is a blockquote / lead quote
    if ($inner -match '^“[^\n”]+”$' -or $inner -match '^"[^\n"]+"$') {
      return "<blockquote><strong>$inner</strong></blockquote>"
    }
    
    # Check if Question: ends with ? or starts with question word (Who, What, Where, When, Why, How, etc.)
    $isQuestion = ($inner -match '\?$' -or $inner -match '^(Who|What|Where|When|Why|How|Which|Whom|Whose|Is|Are|Was|Were|Can|Could|Do|Does|Did|Will|Would|Should)\b') -and
                  $inner.Length -le 110 -and
                  -not ($inner -match '\.\s+[A-Z]') -and
                  -not ($inner -match '^(http|https|www|Tags:|#|👉|•|\-)')
    
    if ($isQuestion) {
      return "<h3 class=`"article-question`"><strong>$inner</strong></h3>"
    }
    
    # Check if Section Title: short, starts with capital, no ending period, not bullet/link/quote
    $isTitle = ($inner.Length -ge 8 -and $inner.Length -le 85) -and
               ($inner -match '^[A-Z0-9\u0900-\u097F]') -and
               (-not ($inner -match '[.,;:]$') -or $inner -match '^Not Just a Startup') -and
               (-not ($inner -match '\.\s+[A-Z]') -or $inner -match '^Not Just a Startup') -and
               (-not ($inner -match '^(http|https|www|Tags:|#|👉|•|\-|In 20|On 1|At the|According)')) -and
               (-not ($inner -match '<(img|blockquote|table)'))
    
    if ($isTitle) {
      return "<h2 class=`"article-section-title`"><strong>$inner</strong></h2>"
    }

    # Sub-heading for emoji points like 🛫 Global Export Pavilion
    if ($inner.Length -le 60 -and $inner -match '^[\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2B50\u203C\u2049\u25AA-\u25FE]') {
      return "<h4 class=`"article-sub-heading`"><strong>$inner</strong></h4>"
    }
    
    return "<p>$inner</p>"
  }
  
  $res = [regex]::Replace($text, $pattern, $evaluator)
  return $res
}

$cleaned = Clean-Content $dehaat.content
Write-Host "CLEANED OUTPUT FOR DEHAAT:"
$cleanedLines = $cleaned -split "\n"
foreach ($line in $cleanedLines) {
  if ($line -match '<h[234]' -or $line -match '<blockquote') {
    Write-Host "HEAD/QUOTE: $line"
  }
}
