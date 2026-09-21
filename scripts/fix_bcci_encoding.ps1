$filePath = "src\data\articles.json"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Replace corrupted apostrophe characters
$content = $content.Replace("Bihar?Ts", "Bihar's")
$content = $content.Replace("Bihar?T", "Bihar'")
$content = $content.Replace("East Champaran?Ts", "East Champaran's")

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Encoding fixed successfully."