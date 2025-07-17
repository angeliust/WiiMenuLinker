; Wii Menu Linker - Inno Setup Script Example
; This is an example script for creating an installer
; Copy this file and modify it according to your needs

[Setup]
AppName=Wii Menu Linker
AppVersion=1.0.0
AppPublisher=Your Name
AppPublisherURL=https://github.com/yourusername/WiiMenuLinker
DefaultDirName={pf}\WiiMenuLinker
DefaultGroupName=Wii Menu Linker
OutputDir=installer
OutputBaseFilename=WiiMenuLinker-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
; Node.js runtime (you need to include node.exe and related files)
Source: "node.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "node.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "*.dll"; DestDir: "{app}"; Flags: ignoreversion

; Application files
Source: "index.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "config.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "layouts\*"; DestDir: "{app}\layouts"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs

; Hidden script launcher
Source: "run_hidden.vbs"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"
Name: "{group}\Wii Menu Linker (Hidden)"; Filename: "wscript.exe"; Parameters: "{app}\run_hidden.vbs"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"
Name: "{group}\Uninstall Wii Menu Linker"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"; Tasks: quicklaunchicon

[Run]
; Launch application after installation
Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,Wii Menu Linker}"; Flags: nowait postinstall skipifsilent

; Instructions for using this script:
; 1. Install Inno Setup from https://jrsoftware.org/isdl.php
; 2. Download Node.js portable from https://nodejs.org/dist/v18.20.8/node-v18.20.8-win-x64.zip
; 3. Extract node.exe and related files to your project folder
; 4. Create run_hidden.vbs with the content from README.md
; 5. Run: "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer-example.iss 