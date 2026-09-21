try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/story/bharatnet-to-bring-fiber-internet-to-bihar-villages' -UseBasicParsing -TimeoutSec 5
    Write-Host "Status: $($r.StatusCode)"
} catch {
    Write-Host "Exception: $($_.Exception.Message)"
}
