@echo off
echo Wii Menu Linker - Build Script Example
echo ======================================

REM Create build directory
if exist "WiiMenuLinker-Build" (
    echo Removing existing build directory...
    rmdir /s /q "WiiMenuLinker-Build"
)

echo Creating build directory...
mkdir "WiiMenuLinker-Build"
cd "WiiMenuLinker-Build"

REM Copy application files
echo Copying application files...
xcopy "..\index.js" "." /Y
xcopy "..\package.json" "." /Y
xcopy "..\config.json" "." /Y
xcopy "..\assets" "assets\" /E /I /Y
xcopy "..\layouts" "layouts\" /E /I /Y
xcopy "..\node_modules" "node_modules\" /E /I /Y

REM Create run_hidden.vbs
echo Creating run_hidden.vbs...
echo Set WshShell = CreateObject("WScript.Shell") > run_hidden.vbs
echo WshShell.Run "node.exe index.js", 0, False >> run_hidden.vbs
echo Set WshShell = Nothing >> run_hidden.vbs

REM Create launcher batch file
echo Creating WiiMenuLinker.bat...
echo @echo off > WiiMenuLinker.bat
echo cd /d "%%~dp0" >> WiiMenuLinker.bat
echo node.exe index.js >> WiiMenuLinker.bat

REM Create README for the build
echo Creating README.txt...
echo Wii Menu Linker - Build Package > README.txt
echo ================================ >> README.txt
echo. >> README.txt
echo This is a portable build of Wii Menu Linker. >> README.txt
echo. >> README.txt
echo To use: >> README.txt
echo 1. Download Node.js portable from: >> README.txt
echo    https://nodejs.org/dist/v18.20.8/node-v18.20.8-win-x64.zip >> README.txt
echo 2. Extract node.exe and related files to this folder >> README.txt
echo 3. Run WiiMenuLinker.bat or double-click run_hidden.vbs >> README.txt
echo. >> README.txt
echo Note: You need to include node.exe and related DLL files >> README.txt
echo for this build to work properly. >> README.txt

echo.
echo Build completed successfully!
echo.
echo Next steps:
echo 1. Download Node.js portable from nodejs.org
echo 2. Extract node.exe and DLL files to this folder
echo 3. Test the application by running WiiMenuLinker.bat
echo.
pause 