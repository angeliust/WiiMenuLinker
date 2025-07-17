Set WshShell = CreateObject(WScript.Shell")
WshShell.Run node.exe index.js", 0, False
Set WshShell = Nothing 