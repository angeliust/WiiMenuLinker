@echo off
REM ======================================================================
REM  Ultimate Wii Wallpaper Uninstaller
REM  Purpose: Forcefully terminates all related processes (lillywallpaper.exe
REM           and ALL node.exe instances) and removes the startup task.
REM ======================================================================

:: Request administrator privileges
:-------------------------------------
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------

cls
echo =========================================
echo    Ultimate Wii Wallpaper Cleaner
echo =========================================
echo.
echo WARNING: This script will forcefully terminate:
echo   - lillywallpaper.exe
echo   - ALL running instances of Node.js (node.exe)
echo   - The "WiiWallpaper" startup task.
echo.

pause

REM --- Step 1: Kill lillywallpaper.exe ---
echo.
echo --- Stopping lillywallpaper.exe process... ---
taskkill /IM lillywallpaper.exe /F > nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Process "lillywallpaper.exe" was found and terminated.
) else (
    echo INFO: Process "lillywallpaper.exe" not found.
)

REM --- Step 2: Kill ALL node.exe processes ---
echo.
echo --- Stopping Node.js listener script (node.exe)... ---
taskkill /IM node.exe /F > nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: All "node.exe" processes were found and terminated.
) else (
    echo INFO: Process "node.exe" not found.
)

REM --- Step 3: Delete the scheduled task ---
echo.
echo --- Deleting the "WiiWallpaper" scheduled task... ---
schtasks /Delete /TN "WiiWallpaper" /F > nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Scheduled task "WiiWallpaper" was deleted.
) else (
    echo INFO: Scheduled task "WiiWallpaper" not found.
)

REM --- Step 4: Final user action ---
echo.
echo =========================================================
echo                  CLEANUP COMPLETE
echo =========================================================
echo.
echo All processes and startup tasks have been removed.
echo.
echo.
echo An Explorer window will now open for you.
echo Please CLOSE THIS BLACK WINDOW.
echo.

explorer .

echo.
pause
exit