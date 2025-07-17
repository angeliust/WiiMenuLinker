[Setup]
AppName=Wii Menu Linker
AppVersion=1.0.0
AppPublisher=angeliust
AppPublisherURL=https://github.com/angeliust/WiiMenuLinker
DefaultDirName={pf}\WiiMenuLinker
DefaultGroupName=Wii Menu Linker
OutputDir=..
OutputBaseFilename=WiiMenuLinker-Setup-v1.0
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
Source: "node.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "index.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "config.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "layouts\*"; DestDir: "{app}\layouts"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "wiimenulinker.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "run_hidden.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"
Name: "{group}\Wii Menu Linker (Hidden)"; Filename: "wscript.exe"; Parameters: "{app}\run_hidden.vbs"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"
Name: "{group}\Uninstall Wii Menu Linker"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.png"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,Wii Menu Linker}"; Flags: nowait postinstall skipifsilent 