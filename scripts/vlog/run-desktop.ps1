# Run `node <args>` in the logged-in desktop session (ssh sessions have no desktop) and wait.
param([string]$NodeArgs, [int]$WaitSec = 1800)
$dir = "$env:USERPROFILE\vlog\rec"
$cmd = "cmd /c cd /d $dir && set PATH=$env:LOCALAPPDATA\nvm\v22.21.1;$env:LOCALAPPDATA\Microsoft\WinGet\Links;%PATH% && node $NodeArgs > $dir\desktop.out 2>&1"
schtasks /create /tn vlogrec /tr $cmd /sc once /st 23:59 /it /f | Out-Null
schtasks /run /tn vlogrec | Out-Null
$t = 0
do { Start-Sleep 3; $t += 3; $s = (schtasks /query /tn vlogrec /fo csv /nh) -split ',' } while ($s[2] -match 'Running' -and $t -lt $WaitSec)
Get-Content "$dir\desktop.out" -Tail 40
