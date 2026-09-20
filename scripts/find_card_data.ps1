$jsonFiles = Get-ChildItem -Path 'd:\biharsay' -Recurse -Filter '*.json' -Exclude 'node_modules', '.next'
foreach ($f in $jsonFiles) {
    if ($f.FullName -like '*node_modules*' -or $f.FullName -like '*.next*') { continue }
    $content = Get-Content $f.FullName -Raw
    if ($content -like '*57 new Kendriya Vidyalayas*' -or $content -like '*AIIMS Patna Hosts Breast Cancer Awareness*') {
        Write-Output "Found in: $($f.FullName)"
    }
}
