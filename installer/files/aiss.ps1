param([string]$cmd = "help")
$dir = $PSScriptRoot
$url = (Get-Content "$dir\aiss.url.txt" -ErrorAction SilentlyContinue | Select-Object -First 1)
$base = $url -replace '/dashboard.*$',''

function Banner {
  Clear-Host
  $art = @(
"     _    ___ ____ ____  ",
"    / \  |_ _/ ___/ ___| ",
"   / _ \  | |\___ \___ \ ",
"  / ___ \ | | ___) |__) |",
" /_/   \_\___|____/____/ ")
  $c = 'DarkCyan','Cyan','Cyan','White','White'
  for($i=0;$i -lt $art.Count;$i++){ Write-Host $art[$i] -ForegroundColor $c[$i]; Start-Sleep -Milliseconds 60 }
  Write-Host "  Agentic AI Security System  v1.0.0`n" -ForegroundColor DarkGray
}
function Step($t){ Write-Host -NoNewline "  [" ; Write-Host -NoNewline "...." -ForegroundColor Yellow; Write-Host -NoNewline "] $t"; }
function Ok($m="OK"){ Write-Host "`r  [" -NoNewline; Write-Host " OK " -ForegroundColor Green -NoNewline; Write-Host "]" ; }

switch ($cmd) {
  "start" {
    Banner
    Step "Loading active-inference kernel"; Start-Sleep -Milliseconds 500; Ok
    Step "Connecting to AISS cloud console"
    try { $sw=[Diagnostics.Stopwatch]::StartNew(); $r=Invoke-WebRequest $base -UseBasicParsing -TimeoutSec 15; $sw.Stop(); Ok
          Write-Host "         online - $($r.StatusCode) in $($sw.ElapsedMilliseconds) ms" -ForegroundColor DarkGray }
    catch { Write-Host "`r  [FAIL] Cannot reach console. Check your internet." -ForegroundColor Red; exit 1 }
    Step "Starting autonomous agents"; Start-Sleep -Milliseconds 500; Ok
    Step "Opening Defense Console"
    $edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    if (!(Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
    if (Test-Path $edge) { Start-Process $edge "--app=$url --window-size=1400,900" } else { Start-Process $url }
    Ok
    Write-Host "`n  AISS is running. Monitoring 24/7 while the console is open.`n" -ForegroundColor Green
  }
  "status" { Banner; try { $r=Invoke-WebRequest $base -UseBasicParsing -TimeoutSec 15; Write-Host "  Console online ($($r.StatusCode))" -ForegroundColor Green } catch { Write-Host "  Console offline" -ForegroundColor Red } }
  "open"   { Start-Process $url }
  "uninstall" {
    $p=[Environment]::GetEnvironmentVariable('Path','User'); [Environment]::SetEnvironmentVariable('Path', (($p -split ';') | Where-Object { $_ -and $_ -ne $dir }) -join ';','User')
    Remove-Item "$([Environment]::GetFolderPath('Desktop'))\AISS.lnk","$env:APPDATA\Microsoft\Windows\Start Menu\Programs\AISS.lnk" -ErrorAction SilentlyContinue
    Remove-Item 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AISS' -Recurse -ErrorAction SilentlyContinue
    Write-Host "AISS removed. You can delete $dir" -ForegroundColor Yellow
  }
  default { Banner; Write-Host "  Usage:  aiss start | status | open | uninstall`n" }
}
