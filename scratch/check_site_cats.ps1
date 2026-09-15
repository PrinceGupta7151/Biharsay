$c = Get-Content "C:\Users\91896\.gemini\antigravity-ide\brain\35b69bfb-f3ff-4cac-a02e-07c3952f771a\.system_generated\steps\862\content.md" -Raw
$cats = [regex]::Matches($c, 'href="https://biharsay\.com/category/([^"/]+)/"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
Write-Host "Categories found on official site:"
$cats
