# AISS Setup Wizard (Windows) - Next / Back / Install / Finish
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$AppUrl  = "https://id-preview--e29e95db-cfa4-4824-a4cf-e19e630f3fd7.lovable.app/dashboard"
$Version = "1.0.0"
$state = @{ Dir = "$env:LOCALAPPDATA\Programs\AISS"; Path = $true; Desktop = $true; StartMenu = $true; Launch = $true; Accept = $false }

$form = New-Object Windows.Forms.Form
$form.Text = "AISS Setup $Version"; $form.Size = '640,460'; $form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'; $form.MaximizeBox = $false; $form.BackColor = 'White'

$banner = New-Object Windows.Forms.Panel; $banner.Dock = 'Top'; $banner.Height = 70; $banner.BackColor = [Drawing.Color]::FromArgb(10,10,14)
$title = New-Object Windows.Forms.Label; $title.ForeColor = 'White'; $title.Font = New-Object Drawing.Font("Segoe UI",14,[Drawing.FontStyle]::Bold); $title.Location='20,10'; $title.AutoSize=$true
$sub = New-Object Windows.Forms.Label; $sub.ForeColor = 'Silver'; $sub.Font = New-Object Drawing.Font("Segoe UI",9); $sub.Location='22,42'; $sub.AutoSize=$true
$banner.Controls.AddRange(@($title,$sub)); $form.Controls.Add($banner)

$body = New-Object Windows.Forms.Panel; $body.Location='0,70'; $body.Size='640,300'; $form.Controls.Add($body)
$back = New-Object Windows.Forms.Button; $back.Text='< Back'; $back.Location='330,380'; $back.Size='85,28'
$next = New-Object Windows.Forms.Button; $next.Text='Next >'; $next.Location='420,380'; $next.Size='85,28'
$cancel = New-Object Windows.Forms.Button; $cancel.Text='Cancel'; $cancel.Location='520,380'; $cancel.Size='85,28'
$form.Controls.AddRange(@($back,$next,$cancel))
$cancel.Add_Click({ if ([Windows.Forms.MessageBox]::Show("Exit AISS Setup?","AISS Setup","YesNo") -eq 'Yes') { $form.Close() } })

function L($text,$x,$y,$w=580,$h=40){ $l=New-Object Windows.Forms.Label; $l.Text=$text; $l.Location="$x,$y"; $l.Size="$w,$h"; $l.Font=New-Object Drawing.Font("Segoe UI",9.5); $l }
function C($text,$y,$key){ $c=New-Object Windows.Forms.CheckBox; $c.Text=$text; $c.Location="40,$y"; $c.Size='540,24'; $c.Checked=$state[$key]; $c.Add_CheckedChanged({ $state[$key]=$this.Checked }.GetNewClosure()); $c }

$page = 0
function Show-Page {
  $body.Controls.Clear(); $back.Enabled = ($page -gt 0 -and $page -lt 4); $next.Text = 'Next >'; $next.Enabled = $true
  switch ($page) {
    0 { $title.Text="Welcome to the AISS Setup Wizard"; $sub.Text="Agentic AI Security System $Version"
        $body.Controls.Add((L "This wizard will install AISS - the active-inference cyber defense console - on your computer.`n`nIt is recommended that you close all other applications before continuing.`n`nClick Next to continue, or Cancel to exit Setup." 30 30 580 160)) }
    1 { $title.Text="License Agreement"; $sub.Text="Please read the following agreement."
        $t=New-Object Windows.Forms.TextBox; $t.Multiline=$true; $t.ReadOnly=$true; $t.ScrollBars='Vertical'; $t.Location='30,15'; $t.Size='570,200'
        $t.Text="AISS End User License`r`n`r`nAISS is provided as-is for security monitoring and education. The USB test uses the harmless industry-standard EICAR test file. You agree not to use AISS for unlawful purposes.`r`n`r`nAISS connects to its cloud console to run scans and AI analysis."
        $r=New-Object Windows.Forms.CheckBox; $r.Text="I accept the agreement"; $r.Location='30,230'; $r.Size='300,24'; $r.Checked=$state.Accept
        $r.Add_CheckedChanged({ $state.Accept=$this.Checked; $next.Enabled=$this.Checked })
        $body.Controls.AddRange(@($t,$r)); $next.Enabled=$state.Accept }
    2 { $title.Text="Select Destination Location"; $sub.Text="Where should AISS be installed?"
        $body.Controls.Add((L "Setup will install AISS into the following folder. To pick a different folder, click Browse." 30 30))
        $tb=New-Object Windows.Forms.TextBox; $tb.Location='30,80'; $tb.Size='460,24'; $tb.Text=$state.Dir; $tb.Add_TextChanged({ $state.Dir=$this.Text })
        $b=New-Object Windows.Forms.Button; $b.Text='Browse...'; $b.Location='500,78'; $b.Size='90,26'
        $b.Add_Click({ $d=New-Object Windows.Forms.FolderBrowserDialog; if($d.ShowDialog() -eq 'OK'){ $tb.Text = Join-Path $d.SelectedPath 'AISS' } })
        $body.Controls.AddRange(@($tb,$b)); $body.Controls.Add((L "At least 1 MB of free disk space is required." 30 120)) }
    3 { $title.Text="Select Additional Tasks"; $sub.Text="Which additional tasks should be performed?"
        $body.Controls.AddRange(@((C "Add 'aiss' command to PATH (run from any terminal)" 30 'Path'), (C "Create a desktop shortcut" 60 'Desktop'), (C "Create a Start Menu shortcut" 90 'StartMenu')))
        $body.Controls.Add((L "Destination: $($state.Dir)" 40 140)); $next.Text='Install' }
    4 { $title.Text="Installing"; $sub.Text="Please wait while Setup installs AISS."
        $pb=New-Object Windows.Forms.ProgressBar; $pb.Location='30,60'; $pb.Size='570,24'; $st=L "" 30 95
        $body.Controls.AddRange(@($pb,$st)); $back.Enabled=$false; $next.Enabled=$false; $form.Refresh()
        $steps = @(
          @{ m="Creating folder..."; a={ New-Item -ItemType Directory -Force -Path $state.Dir | Out-Null } },
          @{ m="Copying files..."; a={ Copy-Item "$PSScriptRoot\files\*" $state.Dir -Recurse -Force; Set-Content "$($state.Dir)\aiss.url.txt" $AppUrl } },
          @{ m="Updating PATH..."; a={ if($state.Path){ $p=[Environment]::GetEnvironmentVariable('Path','User'); if($p -notlike "*$($state.Dir)*"){ [Environment]::SetEnvironmentVariable('Path',"$p;$($state.Dir)",'User') } } } },
          @{ m="Creating shortcuts..."; a={ $ws=New-Object -ComObject WScript.Shell
               $mk={ param($lnk) $s=$ws.CreateShortcut($lnk); $s.TargetPath="$($state.Dir)\aiss.cmd"; $s.Arguments="start"; $s.WorkingDirectory=$state.Dir; $s.Save() }
               if($state.Desktop){ & $mk "$([Environment]::GetFolderPath('Desktop'))\AISS.lnk" }
               if($state.StartMenu){ & $mk "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\AISS.lnk" } } },
          @{ m="Registering uninstaller..."; a={ $k='HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AISS'; New-Item $k -Force | Out-Null
               Set-ItemProperty $k DisplayName 'AISS'; Set-ItemProperty $k DisplayVersion $Version; Set-ItemProperty $k Publisher 'AISS'
               Set-ItemProperty $k UninstallString "cmd /c `"$($state.Dir)\aiss.cmd`" uninstall" } }
        )
        $i=0; foreach($s in $steps){ $st.Text=$s.m; $form.Refresh(); try { & $s.a } catch { [Windows.Forms.MessageBox]::Show("Error: $_") }; $i++; $pb.Value=[int](100*$i/$steps.Count); Start-Sleep -Milliseconds 400 }
        $script:page=5; Show-Page }
    5 { $title.Text="Completing the AISS Setup Wizard"; $sub.Text="Setup has finished installing AISS."
        $body.Controls.Add((L "AISS is installed in:`n$($state.Dir)`n`nOpen a NEW Command Prompt and run:`n`n      aiss start" 30 30 580 140))
        $body.Controls.Add((C "Launch AISS now" 180 'Launch')); $next.Text='Finish'; $back.Enabled=$false; $cancel.Enabled=$false }
  }
}
$back.Add_Click({ $script:page--; Show-Page })
$next.Add_Click({ if($page -eq 5){ if($state.Launch){ Start-Process "$($state.Dir)\aiss.cmd" "start" }; $form.Close(); return }
  if($page -eq 2 -and -not $state.Dir){ return }; $script:page++; Show-Page })
Show-Page
[void]$form.ShowDialog()
