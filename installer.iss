[Setup]
AppName=Wii Menu Linker
AppVersion=1.0.0
AppPublisher=Wii Menu Linker Team
AppPublisherURL=https://github.com/your-repo
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
; Node.js runtime
Source: "nodejs\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Application files
Source: "index.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "layouts\*"; DestDir: "{app}\layouts"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "config.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "stop-all-scripts.bat"; DestDir: "{app}"; Flags: ignoreversion
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