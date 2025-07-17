
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const logFilePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt';
const apps = {
    app1: "C:/Users/angel/AppData/Local/Discord/app-1.0.9199/Discord.exe",
    app2: "steam://run/322170",
    app3: "D:\\topaz gigapixel\\Topaz Gigapixel AI.exe",
    app4: "C:\\MultiMC\\MultiMC.exe",
    app5: "C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe",
    app6: "C:/Windows/explorer.exe",
    app7: "C:\\Program Files\\Adobe\\Adobe Photoshop 2025\\Photoshop.exe",
    app8: "C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\AfterFX.exe",
    app9: "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2025\\Adobe Premiere Pro.exe",
    app10: "com.epicgames.launcher://apps/963137e4c29d4c79a81323b8fab03a40?action=launch&silent=true",
    app11: "https://www.google.com",
    app12: "C:\\Users\\angel\\AppData\\Local\\Programs\\youtube-music-desktop-app\\YouTube Music Desktop App.exe",

};
console.log("Wii launcher script started. Watching...");
function checkWallpaperLog() {
    fs.watchFile(logFilePath, { interval: 100 }, () => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err || !data) return;
            const lines = data.trim().split(/\r?\n/); // <-- CORREGIDO, SIEMPRE EN UNA SOLA LÍNEA
            const lastLine = lines[lines.length - 1];
            const match = lastLine.match(/Log:\s(app\d+)/i);
            if (match) {
                const appKey = match[1].toLowerCase();
                if (apps[appKey] && apps[appKey] !== "") {
                    const appPath = apps[appKey];
                    console.log('Match for ' + appKey + '. Launching: ' + appPath);
                    fs.truncate(logFilePath, 0, (e) => {
                        if (e) console.error('Truncate Error:', e);
                        else {
                            const command = (appPath.startsWith('steam://') || appPath.startsWith('com.epicgames.launcher://'))
                                ? 'start "" "' + appPath + '"'
                                : 'start "" /D "' + path.dirname(appPath) + '" "' + appPath + '"';
                            console.log('Command:', command);
                            exec(command, (e) => {
                                if (e) console.error('Exec Error:', e);
                            });
                        }
                    });
                }
            }
        });
    });
}
checkWallpaperLog();
