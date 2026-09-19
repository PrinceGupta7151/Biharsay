$dates = @("2026/09", "2026/08", "2026/01", "2026/02", "2026/03", "2025/12", "2025/11", "2025/10", "2025/09")
$numbers = 1..100

foreach ($d in $dates) {
    foreach ($n in $numbers) {
        $url = "https://biharsay.com/wp-content/uploads/$d/Bihar-Say-Website-$n.png"
        try {
            $req = [System.Net.WebRequest]::Create($url)
            $req.Method = "HEAD"
            $req.Timeout = 2000
            $resp = $req.GetResponse()
            if ($resp.StatusCode -eq 200) {
                Write-Host "FOUND: $url (Size: $($resp.ContentLength))"
            }
            $resp.Close()
        } catch {
            # Not found
        }
    }
}
