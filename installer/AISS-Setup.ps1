# AISS Setup Wizard (Windows) - Modern Design
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$AppUrl  = "http://127.0.0.1:8179"
$Version = "1.0.0"
$state = @{ Dir = "$env:LOCALAPPDATA\Programs\AISS"; Path = $true; Desktop = $true; StartMenu = $true; Service = $false; Launch = $true; Accept = $false }

# Modern color scheme
$primaryColor = [Drawing.Color]::FromArgb(0, 212, 170)
$darkBg = [Drawing.Color]::FromArgb(13, 13, 15)
$cardBg = [Drawing.Color]::FromArgb(19, 19, 26)
$textColor = [Drawing.Color]::FromArgb(232, 232, 240)
$mutedColor = [Drawing.Color]::FromArgb(136, 136, 160)

$form = New-Object Windows.Forms.Form
$form.Text = "AISS Setup $Version"
$form.Size = '700,520'
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.BackColor = $darkBg
$form.Font = New-Object Drawing.Font("Segoe UI", 9.5)

# Modern banner
$banner = New-Object Windows.Forms.Panel
$banner.Dock = 'Top'
$banner.Height = 90
$banner.BackColor = $cardBg
$form.Controls.Add($banner)

# Logo placeholder
$logoPanel = New-Object Windows.Forms.Panel
$logoPanel.Location = '20,15'
$logoPanel.Size = '60,60'
$logoPanel.BackColor = $primaryColor
$logoPanel.Anchor = 'Top,Left'
$banner.Controls.Add($logoPanel)

# Logo text
$logoText = New-Object Windows.Forms.Label
$logoText.Text = "AISS"
$logoText.ForeColor = [Drawing.Color]::Black
$logoText.Font = New-Object Drawing.Font("Segoe UI", 20, [Drawing.FontStyle]::Bold)
$logoText.Location = '12,10'
$logoText.AutoSize = $true
$logoPanel.Controls.Add($logoText)

$title = New-Object Windows.Forms.Label
$title.Text = "Agentic AI Security System"
$title.ForeColor = $textColor
$title.Font = New-Object Drawing.Font("Segoe UI", 16, [Drawing.FontStyle]::Bold)
$title.Location = '95,20'
$title.AutoSize = $true
$banner.Controls.Add($title)

$sub = New-Object Windows.Forms.Label
$sub.Text = "v$Version · Intelligence Designed To Defend"
$sub.ForeColor = $mutedColor
$sub.Font = New-Object Drawing.Font("Segoe UI", 9)
$sub.Location = '95,52'
$sub.AutoSize = $true
$banner.Controls.Add($sub)

$body = New-Object Windows.Forms.Panel
$body.Location = '0,90'
$body.Size = '700,360'
$body.BackColor = $darkBg
$form.Controls.Add($body)

# Modern buttons
$back = New-Object Windows.Forms.Button
$back.Text = '← Back'
$back.Location = '380,450'
$back.Size = '100,32'
$back.BackColor = $cardBg
$back.ForeColor = $textColor
$back.FlatStyle = 'Flat'
$back.FlatAppearance.BorderSize = 0
$back.Font = New-Object Drawing.Font("Segoe UI", 9.5)
$next = New-Object Windows.Forms.Button
$next.Text = 'Next →'
$next.Location = '490,450'
$next.Size = '100,32'
$next.BackColor = $primaryColor
$next.ForeColor = [Drawing.Color]::Black
$next.FlatStyle = 'Flat'
$next.FlatAppearance.BorderSize = 0
$next.Font = New-Object Drawing.Font("Segoe UI", 9.5, [Drawing.FontStyle]::Bold)
$cancel = New-Object Windows.Forms.Button
$cancel.Text = 'Cancel'
$cancel.Location = '600,450'
$cancel.Size = '80,32'
$cancel.BackColor = $cardBg
$cancel.ForeColor = $mutedColor
$cancel.FlatStyle = 'Flat'
$cancel.FlatAppearance.BorderSize = 0
$cancel.Font = New-Object Drawing.Font("Segoe UI", 9.5)

$form.Controls.AddRange(@($back,$next,$cancel))
$cancel.Add_Click({ if ([Windows.Forms.MessageBox]::Show("Exit AISS Setup?","AISS Setup","YesNo","Question") -eq 'Yes') { $form.Close() } })

function L($text,$x,$y,$w=640,$h=40){
  $l=New-Object Windows.Forms.Label
  $l.Text=$text
  $l.Location="$x,$y"
  $l.Size="$w,$h"
  $l.ForeColor = $textColor
  $l.Font = New-Object Drawing.Font("Segoe UI", 9.5)
  $l
}

function C($text,$y,$key){
  $c=New-Object Windows.Forms.CheckBox
  $c.Text=$text
  $c.Location="40,$y"
  $c.Size='600,28'
  $c.Checked=$state[$key]
  $c.ForeColor = $textColor
  $c.BackColor = $darkBg
  $c.Add_CheckedChanged({ $state[$key]=$this.Checked }.GetNewClosure())
  $c
}

function Card($x,$y,$w,$h){
  $p=New-Object Windows.Forms.Panel
  $p.Location="$x,$y"
  $p.Size="$w,$h"
  $p.BackColor = $cardBg
  $p
}

$page = 0
function Show-Page {
  $body.Controls.Clear()
  $back.Enabled = ($page -gt 0 -and $page -lt 4)
  $next.Text = 'Next →'
  $next.Enabled = $true
  $next.BackColor = $primaryColor
  $next.ForeColor = [Drawing.Color]::Black

  switch ($page) {
    0 {
      $title.Text = "Welcome"
      $sub.Text = "Agentic AI Security System $Version"
      
      # Feature cards
      $card1 = Card 30 30 620 80
      $body.Controls.Add($card1)
      $card1.Controls.Add((L "🛡️  Real-Time Monitoring" 20 15 580 24))
      $card1.Controls.Add((L "Watch processes, network connections, and files as they happen" 20 45 580 28))
      
      $card2 = Card 30 120 620 80
      $body.Controls.Add($card2)
      $card2.Controls.Add((L "🧠  AI-Powered Analysis" 20 15 580 24))
      $card2.Controls.Add((L "Active inference engine learns your system's normal behavior" 20 45 580 28))
      
      $card3 = Card 30 210 620 80
      $body.Controls.Add($card3)
      $card3.Controls.Add((L "🔒  Privacy First" 20 15 580 24))
      $card3.Controls.Add((L "All data stays on your machine. No telemetry, no cloud uploads" 20 45 580 28))
      
      $body.Controls.Add((L "Click Next to begin installation, or Cancel to exit." 30 310 620 40))
    }
    1 {
      $title.Text = "License Agreement"
      $sub.Text = "Please read and accept the license"
      
      $licenseCard = Card 30 30 620 260
      $body.Controls.Add($licenseCard)
      
      $t=New-Object Windows.Forms.TextBox
      $t.Multiline=$true
      $t.ReadOnly=$true
      $t.ScrollBars='Vertical'
      $t.Location='15,15'
      $t.Size='590,200'
      $t.BackColor = $darkBg
      $t.ForeColor = $mutedColor
      $t.BorderStyle = 'None'
      $t.Font = New-Object Drawing.Font("Consolas", 9)
      $t.Text="AISS END USER LICENSE AGREEMENT`r`n`r`nAISS is provided as-is for security monitoring and education purposes.`r`n`r`nBy using AISS, you agree to:`r`n1. Use AISS only for legitimate security monitoring`r`n2. Not use AISS for unlawful purposes`r`n3. Understand that the EICAR test file is harmless`r`n4. Acknowledge that AISS is provided without warranty`r`n`r`nAISS is open source software under the MIT License."
      $licenseCard.Controls.Add($t)
      
      $r=New-Object Windows.Forms.CheckBox
      $r.Text="I accept the license agreement"
      $r.Location='40,305'
      $r.Size='600,28'
      $r.Checked=$state.Accept
      $r.ForeColor = $textColor
      $r.BackColor = $darkBg
      $r.Add_CheckedChanged({ $state.Accept=$this.Checked; $next.Enabled=$this.Checked })
      $body.Controls.Add($r)
      $next.Enabled=$state.Accept
    }
    2 {
      $title.Text = "Installation Location"
      $sub.Text = "Choose where to install AISS"
      
      $card = Card 30 30 620 120
      $body.Controls.Add($card)
      $card.Controls.Add((L "AISS will be installed in the following folder:" 20 20 580 24))
      
      $tb=New-Object Windows.Forms.TextBox
      $tb.Location='20,55'
      $tb.Size='470,28'
      $tb.Text=$state.Dir
      $tb.BackColor = $darkBg
      $tb.ForeColor = $textColor
      $tb.BorderStyle = 'FixedSingle'
      $tb.Add_TextChanged({ $state.Dir=$this.Text })
      $card.Controls.Add($tb)
      
      $b=New-Object Windows.Forms.Button
      $b.Text='Browse...'
      $b.Location='500,52'
      $b.Size='90,32'
      $b.BackColor = $cardBg
      $b.ForeColor = $textColor
      $b.FlatStyle = 'Flat'
      $b.FlatAppearance.BorderSize = 0
      $b.Add_Click({ $d=New-Object Windows.Forms.FolderBrowserDialog; if($d.ShowDialog() -eq 'OK'){ $tb.Text = Join-Path $d.SelectedPath 'AISS' } })
      $card.Controls.Add($b)
      
      $card.Controls.Add((L "Disk space required: ~500 MB" 20 95 580 24))
    }
    3 {
      $title.Text = "Additional Tasks"
      $sub.Text = "Select optional installation tasks"
      
      $card = Card 30 30 620 220
      $body.Controls.Add($card)
      $card.Controls.AddRange(@(
        (C "Add 'aiss' command to PATH (run from any terminal)" 20 'Path'),
        (C "Create desktop shortcut" 55 'Desktop'),
        (C "Create Start Menu shortcut" 90 'StartMenu'),
        (C "Install as Windows Service (auto-start on boot)" 125 'Service')
      ))
      
      $body.Controls.Add((L "Installation folder: $($state.Dir)" 30 270 620 28))
      $next.Text = 'Install →'
      $next.BackColor = $primaryColor
    }
    4 {
      $title.Text = "Installing"
      $sub.Text = "Please wait while AISS is being installed..."
      
      $pb=New-Object Windows.Forms.ProgressBar
      $pb.Location='30,60'
      $pb.Size='620,28'
      $pb.BackColor = $cardBg
      $pb.ForeColor = $primaryColor
      $st=L "" 30 100
      $body.Controls.AddRange(@($pb,$st))
      $back.Enabled=$false
      $next.Enabled=$false
      $next.BackColor = $cardBg
      $next.ForeColor = $mutedColor
      $form.Refresh()
      
      $steps = @(
        @{ m="Creating installation folder..."; a={ New-Item -ItemType Directory -Force -Path $state.Dir | Out-Null } },
        @{ m="Copying AISS files..."; a={ Copy-Item "$PSScriptRoot\files\*" $state.Dir -Recurse -Force; Set-Content "$($state.Dir)\aiss.url.txt" $AppUrl } },
        @{ m="Updating system PATH..."; a={ if($state.Path){ $p=[Environment]::GetEnvironmentVariable('Path','User'); if($p -notlike "*$($state.Dir)*"){ [Environment]::SetEnvironmentVariable('Path',"$p;$($state.Dir)",'User') } } } },
        @{ m="Creating shortcuts..."; a={ $ws=New-Object -ComObject WScript.Shell
             $mk={ param($lnk) $s=$ws.CreateShortcut($lnk); $s.TargetPath="$($state.Dir)\aiss.cmd"; $s.Arguments="start"; $s.WorkingDirectory=$state.Dir; $s.Save() }
             if($state.Desktop){ & $mk "$([Environment]::GetFolderPath('Desktop'))\AISS.lnk" }
             if($state.StartMenu){ & $mk "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\AISS.lnk" } } },
        @{ m="Installing Windows Service..."; a={ if($state.Service){ Start-Process -FilePath "cmd" -ArgumentList "/c `"$($state.Dir)\aiss.cmd`" install" -Wait -Verb RunAs } } },
        @{ m="Registering uninstaller..."; a={ $k='HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AISS'; New-Item $k -Force | Out-Null
             Set-ItemProperty $k DisplayName 'AISS'; Set-ItemProperty $k DisplayVersion $Version; Set-ItemProperty $k Publisher 'AISS'
             Set-ItemProperty $k UninstallString "cmd /c `"$($state.Dir)\aiss.cmd`" uninstall" } }
      )
      $i=0; foreach($s in $steps){ $st.Text=$s.m; $form.Refresh(); try { & $s.a } catch { [Windows.Forms.MessageBox]::Show("Error: $_","Installation Error","OK","Error") }; $i++; $pb.Value=[int](100*$i/$steps.Count); Start-Sleep -Milliseconds 500 }
      $script:page=5; Show-Page
    }
    5 {
      $title.Text = "Installation Complete"
      $sub.Text = "AISS has been successfully installed"
      
      $card = Card 30 30 620 180
      $body.Controls.Add($card)
      $card.Controls.Add((L "✓ AISS installed to: $($state.Dir)`r`n`r`nTo start AISS, open a NEW Command Prompt and run:`r`n`r`n    aiss`r`n`r`nThe dashboard will open automatically at http://127.0.0.1:8179" 20 20 580 150))
      
      $body.Controls.Add((C "Launch AISS now" 240 'Launch'))
      $next.Text = 'Finish'
      $next.BackColor = $primaryColor
      $next.ForeColor = [Drawing.Color]::Black
      $back.Enabled=$false
      $cancel.Enabled=$false
    }
  }
}

$back.Add_Click({ $script:page--; Show-Page })
$next.Add_Click({ 
  if($page -eq 5){ 
    if($state.Launch){ Start-Process "$($state.Dir)\aiss.cmd" "start" }; 
    $form.Close(); 
    return 
  }
  if($page -eq 2 -and -not $state.Dir){ return }; 
  $script:page++; 
  Show-Page 
})

Show-Page
[void]$form.ShowDialog()
