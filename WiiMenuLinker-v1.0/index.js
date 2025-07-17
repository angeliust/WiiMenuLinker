// --- Imports ---
const {
    QMainWindow, QWidget, QPushButton, QGridLayout, QDialog,
    QLabel, QBoxLayout, Direction, QFileDialog, QInputDialog, QMessageBox,
    QListWidget, QListWidgetItem, QLineEdit, QVariant, QGroupBox, QCheckBox,
    QIcon, QPixmap, QPlainTextEdit
} = require('@nodegui/nodegui');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const open = require('open');

// Try to import steam-game-path, handle if not available
let steamGamePath = null;
try {
    steamGamePath = require('steam-game-path');
    console.log('steam-game-path module type:', typeof steamGamePath);
    console.log('steam-game-path methods:', Object.keys(steamGamePath || {}));
} catch (err) {
    console.warn('steam-game-path not available:', err.message);
}

// --- Logger Utility ---
const logFile = path.join(__dirname, 'app.log');
function log(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

// --- Global State ---
let runningScriptProcess = null;
let selectedScriptPath = null;
const layoutsDir = path.join(__dirname, 'layouts');
const configPath = path.join(__dirname, 'config.json');
const TASK_NAME = "WiiMenuLinkerStartupScript";

// --- Log File Path for Exported Scripts ---
// Always use double backslashes for Windows paths in generated scripts
const LOG_FILE_PATH_RAW = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt';

// UI Elements for script control
let selectedScriptLabel, scriptStatusLabel, startScriptButton, stopScriptButton, startupCheckBox, selectScriptButton;

let isUpdatingCheckboxState = false;

try {
    if (!fs.existsSync(layoutsDir)) {
        fs.mkdirSync(layoutsDir);
    }
} catch (err) {
    log("Fatal: Could not create layouts directory.");
}

const scriptsDir = path.join(__dirname, 'scripts');
try {
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir);
    }
} catch (err) {
    log("Fatal: Could not create scripts directory.");
}

// --- Add Steam Library Folder Selection ---
let steamLibraryFolders = [];
let lastSteamFolderPath = 'C:\\'; // Ruta por defecto

// Load Steam library folders from config.json or use defaults
function loadSteamLibraryFolders() {
    try {
        if (fs.existsSync(configPath)) {
            const state = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (Array.isArray(state.steamLibraryFolders) && state.steamLibraryFolders.length > 0) {
                steamLibraryFolders = state.steamLibraryFolders;
            }
            if (state.lastSteamFolderPath) {
                lastSteamFolderPath = state.lastSteamFolderPath;
            }
        }
    } catch (err) {
        log('Error loading Steam library folders: ' + err.stack);
    }
    // Defaults if not set
    if (steamLibraryFolders.length === 0) {
        steamLibraryFolders = [
            'D:\\SteamLibrary',
            'C:\\Program Files (x86)\\Steam'
        ];
    }
}

function saveSteamLibraryFolders() {
    try {
        let state = {};
        if (fs.existsSync(configPath)) {
            state = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        state.steamLibraryFolders = steamLibraryFolders;
        state.lastSteamFolderPath = lastSteamFolderPath;
        fs.writeFileSync(configPath, JSON.stringify(state, null, 4));
    } catch (err) {
        log('Error saving Steam library folders: ' + err.stack);
    }
}

// --- Main Window ---
const win = new QMainWindow();
win.setWindowTitle("Wii Menu Linker");
win.setMinimumSize(850, 850);

// Set application icon for window
try {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    if (fs.existsSync(iconPath)) {
        const icon = new QIcon(iconPath);
        win.setWindowIcon(icon);
    }
} catch (err) {
    log('Could not set window icon: ' + err.stack);
}

const centralWidget = new QWidget();
centralWidget.setObjectName("mainView");
const rootLayout = new QBoxLayout(Direction.TopToBottom);
centralWidget.setLayout(rootLayout);

// --- Banner Section ---
const bannerPath = path.join(__dirname, 'assets', 'banner.png');
if (fs.existsSync(bannerPath)) {
    const bannerLabel = new QLabel();
    const bannerPixmap = new QPixmap(bannerPath);
    bannerLabel.setPixmap(bannerPixmap);
    bannerLabel.setObjectName("banner");
    bannerLabel.setStyleSheet("#banner { margin: 10px; }");
    rootLayout.addWidget(bannerLabel);
}
// --- Grid for App Slots ---
const gridWidget = new QWidget();
const gridLayout = new QGridLayout();
gridWidget.setLayout(gridLayout);
gridLayout.setSpacing(25);
rootLayout.addWidget(gridWidget);

// --- SLOT GRID (3x4 for better fit) ---
const NUM_ROWS = 3;
const NUM_COLS = 4;
const slots = [];
for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
        const slotIndex = row * NUM_COLS + col;
        const button = new QPushButton();
        button.setMinimumSize(70, 50);
        button.setMaximumSize(120, 70);
        button.setSizePolicy(2, 2); // Expanding
        button.setObjectName("appSlot");
        slots[slotIndex] = { button, config: null };
        updateSlot(slotIndex, null);
        button.addEventListener('clicked', () => { openConfigDialog(slotIndex); });
        gridLayout.addWidget(button, row, col);
    }
}

// --- Control Panel ---
const controlGroupBox = new QGroupBox();
controlGroupBox.setTitle("Controls");
const controlLayout = new QGridLayout();
controlGroupBox.setLayout(controlLayout);
rootLayout.addWidget(controlGroupBox);

const manageLayoutsButton = new QPushButton();
manageLayoutsButton.setText("Manage Layouts");
manageLayoutsButton.setMinimumSize(70, 28);
manageLayoutsButton.setMaximumSize(120, 36);
manageLayoutsButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
manageLayoutsButton.addEventListener('clicked', openLayoutManagerDialog);

const saveLayoutButton = new QPushButton();
saveLayoutButton.setText("Save Current Layout");
saveLayoutButton.setMinimumSize(70, 28);
saveLayoutButton.setMaximumSize(120, 36);
saveLayoutButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
saveLayoutButton.addEventListener('clicked', saveLayout);

const generateScriptButton = new QPushButton();
generateScriptButton.setText("Generate Config File...");
generateScriptButton.setObjectName("generateButton");
generateScriptButton.setMinimumSize(70, 28);
generateScriptButton.setMaximumSize(140, 36);
generateScriptButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
generateScriptButton.addEventListener('clicked', openExportDialog);

const selectSteamFolderButton = new QPushButton();
selectSteamFolderButton.setText("Select Steam Library Folder(s)");
selectSteamFolderButton.setObjectName("selectSteamFolderButton");
selectSteamFolderButton.setToolTip("Choose one or more Steam library folders to scan for games");
selectSteamFolderButton.setMinimumSize(70, 28);
selectSteamFolderButton.setMaximumSize(140, 36);
selectSteamFolderButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
selectSteamFolderButton.addEventListener('clicked', () => {
    const dialog = new QFileDialog();
    dialog.setFileMode(4); // Directory mode, allow multiple
    dialog.setOption(16, true); // Show directories only
    dialog.setWindowTitle("Select Steam Library Folder(s)");
    dialog.setNameFilter("Folders");
    // Nota: setDirectory no está disponible en NodeGUI, se omite
    dialog.addEventListener('filesSelected', (folders) => {
        if (folders && folders.length > 0) {
            steamLibraryFolders = folders;
            // Guardar la última carpeta seleccionada
            if (folders.length > 0) {
                lastSteamFolderPath = path.dirname(folders[0]);
            }
            saveSteamLibraryFolders();
            showNotification("Success", "Steam library folders updated.\nYou may need to reopen the Search Games dialog.");
        }
    });
    dialog.exec();
});

controlLayout.addWidget(manageLayoutsButton, 0, 0);
controlLayout.addWidget(saveLayoutButton, 0, 1);
controlLayout.addWidget(generateScriptButton, 0, 2);
controlLayout.addWidget(selectSteamFolderButton, 1, 0, 1, 3);

// --- Script Execution & Automation Panel ---
const executionGroupBox = new QGroupBox();
executionGroupBox.setTitle("Script Execution & Automation");
const executionLayout = new QGridLayout();
executionGroupBox.setLayout(executionLayout);
rootLayout.addWidget(executionGroupBox);

const selectedScriptTitleLabel = new QLabel();
selectedScriptTitleLabel.setText("<b>Selected Script:</b>");
selectedScriptLabel = new QLabel();
selectedScriptLabel.setText("None");
selectScriptButton = new QPushButton();
selectScriptButton.setText("Select Script...");
selectScriptButton.setMinimumSize(70, 28);
selectScriptButton.setMaximumSize(120, 36);
selectScriptButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
selectScriptButton.addEventListener('clicked', selectScript);

executionLayout.addWidget(selectedScriptTitleLabel, 0, 0);
executionLayout.addWidget(selectedScriptLabel, 0, 1, 1, 2);
executionLayout.addWidget(selectScriptButton, 0, 3);

startScriptButton = new QPushButton();
startScriptButton.setText("Start Script");
startScriptButton.setMinimumSize(70, 28);
startScriptButton.setMaximumSize(120, 36);
startScriptButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
startScriptButton.addEventListener('clicked', startScript);

stopScriptButton = new QPushButton();
stopScriptButton.setText("Stop Script");
stopScriptButton.setMinimumSize(70, 28);
stopScriptButton.setMaximumSize(120, 36);
stopScriptButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
stopScriptButton.addEventListener('clicked', stopScript);

scriptStatusLabel = new QLabel();
scriptStatusLabel.setObjectName("statusLabel");

startupCheckBox = new QCheckBox();
startupCheckBox.setText("Run on Windows Startup");
startupCheckBox.setStyleSheet("font-size: 12px;");
startupCheckBox.addEventListener('toggled', toggleStartupTask);

const applyLayoutButton = new QPushButton();
applyLayoutButton.setText("Apply Layout to Script");
applyLayoutButton.setObjectName("applyLayoutButton");
applyLayoutButton.setToolTip("Overwrite the selected script with the current layout");
applyLayoutButton.setMinimumSize(70, 28);
applyLayoutButton.setMaximumSize(140, 36);
applyLayoutButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
applyLayoutButton.addEventListener('clicked', () => {
    if (!selectedScriptPath || !fs.existsSync(selectedScriptPath)) {
        showNotification("No Script Selected", "Please select a script to overwrite with the current layout.");
        return;
    }
    try {
        // --- Export/Apply Layout Script Generation Block ---
        // Siempre usa doble backslash para logFilePath y slot paths en el script generado
        const logFilePathForScript = LOG_FILE_PATH_RAW.replace(/\\/g, '\\\\');

        let appMappings = '';
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const slotPath = (slot.config && typeof slot.config.path === 'string')
                ? slot.config.path.replace(/\\/g, '\\\\')
                : "";
            appMappings += `    app${i + 1}: "${slotPath}",\n`;
        }

        const scriptContent = `
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const logFilePath = '${logFilePathForScript}';
const apps = {
${appMappings}
};
console.log("Wii launcher script started. Watching...");
function checkWallpaperLog() {
    fs.watchFile(logFilePath, { interval: 100 }, () => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err || !data) return;
            const lines = data.trim().split(/\\r?\\n/); // <-- CORREGIDO, SIEMPRE EN UNA SOLA LÍNEA
            const lastLine = lines[lines.length - 1];
            const match = lastLine.match(/Log:\\s(app\\d+)/i);
            if (match) {
                const appKey = match[1].toLowerCase();
                if (apps[appKey] && apps[appKey] !== "") {
                    const appPath = apps[appKey];
                    console.log('Match for ' + appKey + '. Launching: ' + appPath);
                    fs.truncate(logFilePath, 0, (e) => {
                        if (e) console.error('Truncate Error:', e);
                        else {
                            const command = (appPath.startsWith('steam://') || appPath.startsWith('com.epicgames.launcher://'))
                                ? 'start \"\" \"' + appPath + '\"'
                                : 'start \"\" /D \"' + path.dirname(appPath) + '\" \"' + appPath + '\"';
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
`;
        fs.writeFileSync(selectedScriptPath, scriptContent);
        log('Layout applied to script: ' + selectedScriptPath);
        showNotification("Success!", "The current layout has been applied to the selected script.");
    } catch (err) {
        log('Error applying layout to script: ' + err.stack);
        showNotification("Error", "Failed to apply layout to script: " + err.message);
    }
});

executionLayout.addWidget(applyLayoutButton, 3, 0, 1, 4);

const stopAllScriptsButton = new QPushButton();
stopAllScriptsButton.setText("Stop All Scripts");
stopAllScriptsButton.setObjectName("stopAllScriptsButton");
stopAllScriptsButton.setToolTip("Forcefully stop all running scripts and related processes");
stopAllScriptsButton.setMinimumSize(70, 28);
stopAllScriptsButton.setMaximumSize(140, 36);
stopAllScriptsButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
// --- Detener script de inicio oculto (versión avanzada con PowerShell) ---
function stopStartupScriptProcess() {
    if (!selectedScriptPath) return;
    const scriptName = path.basename(selectedScriptPath).toLowerCase();
    const scriptPath = selectedScriptPath.replace(/\//g, '\\').toLowerCase();

    // Usar PowerShell para buscar y matar procesos de node, nodew Y qode
    const psCommand = `Get-WmiObject Win32_Process | Where-Object { ($_.Name -eq 'node.exe' -or $_.Name -eq 'nodew.exe' -or $_.Name -eq 'qode.exe') -and ($_.CommandLine -match '${scriptName}' -or $_.CommandLine -match '${scriptPath.replace(/\\/g, '\\\\')}') } | ForEach-Object { Write-Host "Matando proceso PID: $($_.ProcessId) - $($_.CommandLine)"; Stop-Process -Id $_.ProcessId -Force }`;
    
    exec(`powershell -Command "${psCommand}"`, (err, stdout, stderr) => {
        if (err) {
            log('Error usando PowerShell para matar procesos: ' + stderr);
            showNotification("Error", "No se pudo detener el script de inicio. Intenta ejecutar la app como administrador.");
        } else {
            if (stdout.trim()) {
                log('Procesos matados con PowerShell: ' + stdout);
                showNotification("Éxito", "Script de inicio detenido correctamente.");
            } else {
                log('No se encontraron procesos de node/nodew/qode ejecutando el script seleccionado.');
                showNotification("Info", "No se encontraron procesos del script de inicio ejecutándose.");
            }
        }
    });
}
stopAllScriptsButton.addEventListener('clicked', () => {
    // Detiene el script de inicio oculto
    stopStartupScriptProcess();

    const batPath = path.join(__dirname, 'stop-all-scripts.bat');
    try {
        if (fs.existsSync(batPath)) {
            open(batPath);
        } else {
            showNotification("File Not Found", "The batch file 'stop-all-scripts.bat' was not found in the app folder.");
        }
    } catch (err) {
        log('Error attempting to open stop-all-scripts.bat: ' + err.stack);
        showNotification("Error", "An error occurred while trying to run the stop-all-scripts.bat file. Please check the log for details.");
    }
});
executionLayout.addWidget(stopAllScriptsButton, 2, 0, 1, 4);

// --- Botón para matar el script de inicio oculto ---
const killStartupScriptButton = new QPushButton();
killStartupScriptButton.setText("Kill Startup Script");
killStartupScriptButton.setObjectName("killStartupScriptButton");
killStartupScriptButton.setToolTip("Forzar el cierre del script de inicio oculto (background)");
killStartupScriptButton.setMinimumSize(70, 28);
killStartupScriptButton.setMaximumSize(140, 36);
killStartupScriptButton.setStyleSheet("font-size: 12px; padding: 4px 10px;");
killStartupScriptButton.addEventListener('clicked', () => {
    stopStartupScriptProcess();
    showNotification("Kill Startup Script", "Se ha intentado detener el script de inicio oculto. Si el script estaba corriendo, ahora debería estar cerrado.");
});
executionLayout.addWidget(killStartupScriptButton, 4, 0, 1, 4);

executionLayout.addWidget(startScriptButton, 1, 0);
executionLayout.addWidget(stopScriptButton, 1, 1);
executionLayout.addWidget(scriptStatusLabel, 1, 2);
executionLayout.addWidget(startupCheckBox, 1, 3);

// --- Social Links Panel ---
// (REMOVED: Social Links section)

// --- ENHANCED GAME DETECTION ---

function getSteamGames() {
    const fs = require('fs');
    const path = require('path');
    let games = [];
    for (const lib of steamLibraryFolders) {
        const steamapps = path.join(lib, 'steamapps');
        if (fs.existsSync(steamapps)) {
            const files = fs.readdirSync(steamapps);
            for (const file of files) {
                if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
                    const manifestPath = path.join(steamapps, file);
                    const content = fs.readFileSync(manifestPath, 'utf8');
                    const nameMatch = content.match(/"name"\s+"([^"]+)"/);
                    const appidMatch = file.match(/appmanifest_(\d+)\.acf/);
                    if (nameMatch && appidMatch) {
                        games.push({
                            name: nameMatch[1],
                            path: `steam://run/${appidMatch[1]}`,
                            source: 'Steam'
                        });
                    }
                }
            }
        }
    }
    return games;
}

function getEpicGames() {
    const epicManifestPath = 'C:\\ProgramData\\Epic\\UnrealEngineLauncher\\LauncherInstalled.dat';
    try {
        if (!fs.existsSync(epicManifestPath)) {
            console.warn('Epic Games manifest not found');
            return [];
        }
        const data = fs.readFileSync(epicManifestPath, 'utf8');
        const manifest = JSON.parse(data);
        if (!manifest.InstallationList || !Array.isArray(manifest.InstallationList)) {
            return [];
        }
        return manifest.InstallationList.map(game => {
            let displayName = game.DisplayName || game.AppName;
            // Si el nombre es un hash, mostrar 'Unknown Game' o 'Epic Game'
            if (!game.DisplayName || /^[a-f0-9]{32,}$/.test(displayName)) {
                displayName = 'Epic Game';
                // Opcional: puedes poner displayName = 'Unknown Epic Game' o similar
            }
            return {
                name: displayName,
                path: `com.epicgames.launcher://apps/${game.AppName}?action=launch&silent=true`,
                source: 'Epic Games'
            };
        });
    } catch (err) {
        log('Error parsing Epic Games manifest: ' + err.stack);
        return [];
    }
}

async function getAllGames() {
    // getSteamGames is now synchronous, getEpicGames is sync too
    const steamGames = getSteamGames();
    const epicGames = getEpicGames();
    return [...steamGames, ...epicGames];
}

// --- CORE LOGIC ---

function openConfigDialog(index) {
    const dialog = new QDialog(win);
    dialog.setWindowTitle(`Configure Slot ${index + 1}`);
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);
    
    const searchButton = new QPushButton();
    searchButton.setText("Search Start Menu");
    searchButton.addEventListener('clicked', () => {
        dialog.close();
        openSearchDialog(index);
    });

    const gamesButton = new QPushButton();
    gamesButton.setText("Search Games (Steam/Epic)");
    gamesButton.addEventListener('clicked', () => {
        dialog.close();
        openGamesDialog(index);
    });

    const browseButton = new QPushButton();
    browseButton.setText("Browse for File...");
    browseButton.addEventListener('clicked', () => {
        dialog.close(); 
        const fileDialog = new QFileDialog();
        fileDialog.setFileMode(1);
        fileDialog.setNameFilter("Programs & Shortcuts (*.exe *.lnk *.url)");
        fileDialog.addEventListener('fileSelected', (filePath) => {
            if (!filePath) return;
            const baseName = path.basename(filePath, path.extname(filePath));
            const inputDialog = new QInputDialog();
            inputDialog.setLabelText(`Enter a name for this app:`);
            inputDialog.setTextValue(baseName);
            inputDialog.addEventListener('textValueSelected', (appName) => {
                if (appName) updateSlot(index, { name: appName, path: filePath });
            });
            inputDialog.exec();
        });
        fileDialog.exec();
    });

    const linkButton = new QPushButton();
    linkButton.setText("Add Web Link");
    linkButton.addEventListener('clicked', () => {
        dialog.close();
        const urlDialog = new QInputDialog();
        urlDialog.setLabelText("Enter the full URL:");
        urlDialog.addEventListener("textValueSelected", (url) => {
            if (url) {
                const nameDialog = new QInputDialog();
                nameDialog.setLabelText("Enter a name for this link:");
                nameDialog.setTextValue(url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]);
                nameDialog.addEventListener("textValueSelected", (name) => {
                    if (name) updateSlot(index, { name: name, path: url });
                });
                nameDialog.exec();
            }
        });
        urlDialog.exec();
    });

    const removeButton = new QPushButton();
    removeButton.setText("Clear Slot");
    removeButton.addEventListener('clicked', () => {
        updateSlot(index, null);
        dialog.close();
    });

    if (!slots[index].config) removeButton.hide();

    layout.addWidget(searchButton);
    layout.addWidget(gamesButton);
    layout.addWidget(browseButton);
    layout.addWidget(linkButton);
    layout.addWidget(removeButton);
    dialog.exec();
}

function openGamesDialog(index) {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Search Games");
    dialog.setMinimumSize(400, 500);
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);
    
    const searchInput = new QLineEdit();
    searchInput.setPlaceholderText("Type to search games...");
    layout.addWidget(searchInput);
    
    const listWidget = new QListWidget();
    layout.addWidget(listWidget);
    
    const statusLabel = new QLabel();
    statusLabel.setText("Loading games from Steam and Epic Games...");
    layout.addWidget(statusLabel);
    
    dialog.show();

    getAllGames().then(games => {
        statusLabel.hide();
        
        if (games.length === 0) {
            statusLabel.setText("No games found. Make sure Steam and/or Epic Games are installed.");
            statusLabel.show();
            return;
        }

        const populateList = (filteredGames) => {
            listWidget.clear();
            filteredGames.forEach(game => {
                const item = new QListWidgetItem(`${game.name} (${game.source})`);
                item.setData(32, new QVariant(game.path));
                item.setData(33, new QVariant(game.name));
                listWidget.addItem(item);
            });
        };

        populateList(games);

        searchInput.addEventListener('textChanged', (text) => {
            const filteredGames = games.filter(game => 
                game.name.toLowerCase().includes(text.toLowerCase())
            );
            populateList(filteredGames);
        });

        listWidget.addEventListener('itemDoubleClicked', (item) => {
            const gameName = item.data(33).toString();
            const gamePath = item.data(32).toString();
            updateSlot(index, { name: gameName, path: gamePath });
            dialog.close();
        });
    }).catch(err => {
        log('Error loading games: ' + err.stack);
        statusLabel.setText(`Error loading games: ${err.message}`);
        console.error('Error loading games:', err);
    });
}

function openSearchDialog(index) {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Search for an Application");
    dialog.setMinimumSize(400, 500);
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);
    const searchInput = new QLineEdit();
    searchInput.setPlaceholderText("Type to search...");
    layout.addWidget(searchInput);
    const listWidget = new QListWidget();
    layout.addWidget(listWidget);
    const statusLabel = new QLabel();
    statusLabel.setText("Loading installed apps, please wait...");
    layout.addWidget(statusLabel);
    dialog.show();

    const psCommand = `function Get-StartMenuItems{$folders=@("$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs","$env:ProgramData\\Microsoft\\Windows\\Start Menu\\Programs");Get-ChildItem -Path $folders -Recurse -Include *.lnk|ForEach-Object{try{$shell=New-Object -ComObject WScript.Shell;$shortcut=$shell.CreateShortcut($_.FullName);if($shortcut.TargetPath){[PSCustomObject]@{Name=$_.BaseName;Path=$shortcut.TargetPath}}}catch{}}};Get-StartMenuItems|ConvertTo-Json -Compress`;
    
    const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
    const ps = spawn('powershell.exe', ['-NoProfile', '-EncodedCommand', encodedCommand]);

    let outputData = '';
    ps.stdout.on('data', (data) => { outputData += data.toString(); });
    ps.stderr.on('data', (data) => { log(`PowerShell stderr: ${data}`); });

    ps.on('close', (code) => {
        statusLabel.hide();
        if (code !== 0) {
            statusLabel.setText(`PowerShell process exited with code ${code}`);
            statusLabel.show();
            return;
        }
        
        let allApps = [];
        try {
            if (outputData.trim() === '') {
                statusLabel.setText("No applications found in Start Menu.");
                statusLabel.show();
                return;
            };
            allApps = JSON.parse(outputData.trim());
            if (!Array.isArray(allApps)) allApps = [allApps];
        } catch (e) {
            log('Failed to parse PowerShell output: ' + e.stack);
            statusLabel.setText("Error: Could not parse app list.");
            statusLabel.show();
            return;
        }
        
        const populateList = (apps) => {
            listWidget.clear();
            apps.forEach(app => {
                if (app && app.Name) {
                    const item = new QListWidgetItem(app.Name);
                    item.setData(32, new QVariant(app.Path));
                    listWidget.addItem(item);
                }
            });
        };
        populateList(allApps);
        searchInput.addEventListener('textChanged', (text) => {
            const filteredApps = allApps.filter(app => app.Name.toLowerCase().includes(text.toLowerCase()));
            populateList(filteredApps);
        });
        
        listWidget.addEventListener('itemDoubleClicked', (item) => {
            const appName = item.text();
            const appPath = item.data(32).toString();
            updateSlot(index, { name: appName, path: appPath });
            dialog.close();
        });
    });
}

// --- Layout Manager Delete Fix ---
function openLayoutManagerDialog() {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Layout Manager");
    dialog.setMinimumSize(400, 300);
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);
    const listWidget = new QListWidget();
    layout.addWidget(listWidget);
    const refreshList = () => {
        listWidget.clear();
        try {
            const files = fs.readdirSync(layoutsDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const item = new QListWidgetItem(file);
                listWidget.addItem(item);
            });
        } catch(err) {
            log('Could not read layouts directory: ' + err.stack);
            showNotification("Error", `Failed to read layouts directory: ${err.message}`);
        }
    };
    refreshList();
    const loadButton = new QPushButton();
    loadButton.setText("Load Selected");
    loadButton.addEventListener('clicked', () => {
        const selectedItems = listWidget.selectedItems();
        if (selectedItems.length > 0) {
            loadLayoutFromFile(path.join(layoutsDir, selectedItems[0].text()));
            dialog.close();
        }
    });
    layout.addWidget(loadButton);
    dialog.exec();
}

function saveLayout() {
    const inputDialog = new QInputDialog();
    inputDialog.setLabelText("Enter layout name:");
    inputDialog.addEventListener('textValueSelected', (name) => {
        if (!name || name.trim().length === 0) {
            showNotification("Invalid Name", "Layout name cannot be empty.");
            return;
        };
        try {
            let fileName = name.endsWith('.json') ? name : `${name}.json`;
            const filePath = path.join(layoutsDir, fileName);
            
            const layoutData = slots.map(slot => slot.config);
            const jsonString = JSON.stringify(layoutData, null, 2);
            
            fs.writeFileSync(filePath, jsonString);

            showNotification("Layout Saved", `Successfully saved to ${fileName}`);
        } catch (err) {
            log('Error saving layout: ' + err.stack);
            showNotification("Error Saving Layout", `An error occurred: ${err.message}`);
        }
    });
    inputDialog.exec();
}

function loadLayoutFromFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            showNotification("Error Loading Layout", "File does not exist.");
            return;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const layoutData = JSON.parse(data);

        if (Array.isArray(layoutData) && layoutData.length === slots.length) {
            layoutData.forEach((config, index) => {
                updateSlot(index, config);
            });
            showNotification("Success", `Loaded layout from ${path.basename(filePath)}`);
        } else {
            showNotification("Invalid Layout File", "File does not seem to be a valid layout.");
        }
    } catch (e) {
        log('Error loading or parsing layout file: ' + e.stack);
        showNotification("Error Loading File", `Could not read or parse the layout file: ${e.message}`);
    }
}

function openExportDialog() {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Choose Export Format");
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);

    const jsButton = new QPushButton();
    jsButton.setText("Export as .js Script");
    jsButton.addEventListener('clicked', () => {
        dialog.close();
        exportAsJs();
    });

    const txtButton = new QPushButton();
    txtButton.setText("Export as info.txt");
    txtButton.addEventListener('clicked', () => {
        dialog.close();
        exportAsInfoTxt();
    });

    layout.addWidget(jsButton);
    layout.addWidget(txtButton);
    dialog.exec();
}

function exportAsInfoTxt() {
    const saveDialog = new QFileDialog();
    saveDialog.setFileMode(0);
    saveDialog.setAcceptMode(1);
    saveDialog.setNameFilter("Text files (*.txt)");
    saveDialog.addEventListener('fileSelected', (file) => {
        if (!file) return;
        try {
            let finalPath = file;
            if (!finalPath.toLowerCase().endsWith('.txt')) {
                finalPath += '.txt';
            }
            // Use the constant for log file path, but with single backslashes for info.txt
            const logFilePath = LOG_FILE_PATH_RAW.replace(/\\/g, '\\');
            let contentLines = [logFilePath];
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const slotPath = (slot.config && typeof slot.config.path === 'string') ? slot.config.path : "";
                contentLines.push(`app${i + 1}=${slotPath}`);
            }
            const fileContent = contentLines.join('\n');
            fs.writeFileSync(finalPath, fileContent);
            showNotification("Success!", `info.txt saved successfully to:\n${finalPath}`);
        } catch (err) {
            log('Error generating info.txt: ' + err.stack);
            showNotification("Error", `Failed to generate or save info.txt: ${err.message}`);
        }
    });
    saveDialog.exec();
}

function exportAsJs() {
    const saveDialog = new QFileDialog();
    saveDialog.setFileMode(0);
    saveDialog.setAcceptMode(1);
    saveDialog.setNameFilter("JavaScript files (*.js)");
    saveDialog.addEventListener('fileSelected', (file) => {
        if (!file) return;
        try {
            let finalPath = file;
            if (!finalPath.toLowerCase().endsWith('.js')) {
                finalPath += '.js';
            }
            // Usa doble backslash para el logFilePath en el script generado
            const logFilePath = LOG_FILE_PATH_RAW.replace(/\\/g, '\\\\');
            let appMappings = '';
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const slotPath = (slot.config && typeof slot.config.path === 'string')
                    ? slot.config.path.replace(/\\/g, '\\\\')
                    : "";
                appMappings += `    app${i + 1}: "${slotPath}",\n`;
            }
            const scriptContent = [
                "const fs = require('fs');",
                "const { exec } = require('child_process');",
                "const path = require('path');",
                `const logFilePath = "${logFilePath}";`,
                'const apps = {',
                appMappings,
                '};',
                'console.log("Wii launcher script started. Watching...");',
                'function checkWallpaperLog() {',
                '    fs.watchFile(logFilePath, { interval: 100 }, () => {',
                '        fs.readFile(logFilePath, \"utf8\", (err, data) => {',
                '            if (err || !data) return;',
                '            const lines = data.trim().split(/\\r?\\n/);',
                '            const lastLine = lines[lines.length - 1];',
                '            const match = lastLine.match(/Log:\\s(app\\d+)/i);',
                '            if (match) {',
                '                const appKey = match[1].toLowerCase();',
                '                if (apps[appKey] && apps[appKey] !== "") {',
                '                    const appPath = apps[appKey];',
                '                    console.log(\'Match for \'+appKey+\'. Launching: \'+appPath);',
                '                    fs.truncate(logFilePath, 0, (e) => {',
                '                        if (e) console.error(\'Truncate Error:\', e);',
                '                        else {',
                '                            const command = (appPath.startsWith(\'steam://\') || appPath.startsWith(\'com.epicgames.launcher://\'))',
                '                                ? \"start \"\" \"\" + appPath + \"\"\"',
                '                                : \"start \"\" /D \"\" + path.dirname(appPath) + \"\" \"\" + appPath + \"\"\";',
                '                            console.log(\'Command:\', command);',
                '                            exec(command, (e) => {',
                '                                if (e) console.error(\'Exec Error:\', e);',
                '                            });',
                '                        }',
                '                    });',
                '                }',
                '            }',
                '        });',
                '    });',
                '}',
                'checkWallpaperLog();',
            ].join('\n');
            fs.writeFileSync(finalPath, scriptContent);
            showNotification("Success!", `Script saved successfully to:\n${finalPath}`);
            selectedScriptPath = finalPath;
            saveState();
            checkStartupTaskState();
            updateControlStates();
        } catch (err) {
            log('Error generating wallpaper script: ' + err.stack);
            showNotification("Error", `Failed to generate or save script: ${err.message}`);
        }
    });
    saveDialog.exec();
}

function selectScript() {
    const fileDialog = new QFileDialog();
    fileDialog.setFileMode(1);
    fileDialog.setNameFilter("Wallpaper Scripts (*.js)");
    fileDialog.addEventListener('fileSelected', (filePath) => {
        if (!filePath || !fs.existsSync(filePath)) return;
        selectedScriptPath = filePath;
        saveState();
        checkStartupTaskState();
        updateControlStates();
        // NUEVO: actualiza el .vbs launcher
        createVbsLauncher(selectedScriptPath);
    });
    fileDialog.exec();
}

function startScript() {
    if (!selectedScriptPath || !fs.existsSync(selectedScriptPath)) {
        showNotification("Error", "Selected script not found. Please select a valid script file.");
        return;
    }
    if (runningScriptProcess) {
        showNotification("Info", "A script is already running.");
        return;
    }

    try {
        const options = {
            detached: true,
            stdio: 'ignore'
        };

        const child = spawn('node', [selectedScriptPath], options);
        child.unref();

        runningScriptProcess = child;
        log('Script started: ' + selectedScriptPath);
        
        showNotification("Script Started", "The script has started in the background and will continue running after this window is closed.");
        
        updateControlStates();
        
        child.on('exit', (code, signal) => {
            log(`Script process exited with code ${code}, signal ${signal}`);
            runningScriptProcess = null;
            updateControlStates();
        });

        child.on('error', (err) => {
            log('Script process error: ' + err.stack);
            showNotification("Script Error", `Failed to start the script: ${err.message}`);
            runningScriptProcess = null;
            updateControlStates();
        });

    } catch (err) {
        log('Error spawning script process: ' + err.stack);
        showNotification("Error", `Could not launch the script process: ${err.message}`);
    }
}

function stopScript() {
    if (!runningScriptProcess) {
        showNotification("Info", "No script is currently running that was started by this session.");
        return;
    }
    if (runningScriptProcess.isExternal) {
        showNotification("Action Required", "This script was started outside of this session (e.g., on startup). Please stop it using the Windows Task Manager.");
        return;
    }

    const pid = runningScriptProcess.pid;
    if (!pid) {
        showNotification("Error", "Could not find the Process ID of the script to stop.");
        return;
    }

    const command = `taskkill /PID ${pid} /F`;

    exec(command, (err, stdout, stderr) => {
        if (err && !stderr.toLowerCase().includes("not found")) {
            log(`Failed to kill process with PID ${pid}: ` + stderr);
            showNotification("Error", `Failed to stop the script. You may need to use the Task Manager.\n\nDetails: ${stderr}`);
            return;
        }

        log(`Successfully stopped script with PID ${pid}.`);
        showNotification("Success", "The script has been stopped.");
        runningScriptProcess = null;
        updateControlStates();
    });
}

// --- VBS Launcher Utility ---
function createVbsLauncher(scriptPath) {
    // Usa node.exe o nodew.exe según disponibilidad
    const nodewPath = path.join(path.dirname(process.execPath), 'nodew.exe');
    const nodeExe = fs.existsSync(nodewPath) ? nodewPath : process.execPath;
    // Escapa las rutas para Windows
    const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """${nodeExe}"" ""${scriptPath}""", 0
Set WshShell = Nothing
`;
    const vbsPath = path.join(__dirname, 'run_hidden.vbs');
    fs.writeFileSync(vbsPath, vbsContent, 'utf8');
    return vbsPath;
}

function toggleStartupTask(isChecked) {
    if (isUpdatingCheckboxState) {
        return;
    }

    if (!selectedScriptPath) {
        showNotification("Action Required", "Please select a script before configuring startup.");
        startupCheckBox.setChecked(false);
        return;
    }

    // NUEVO: crea el .vbs launcher
    const vbsPath = createVbsLauncher(selectedScriptPath);

    if (isChecked) {
        // Usa el .vbs como comando de la tarea
        const createTaskCommand = `schtasks /create /TN "${TASK_NAME}" /TR "wscript.exe \"${vbsPath}\"" /SC ONLOGON /RL HIGHEST /F`;
        exec(createTaskCommand, (err, stdout, stderr) => {
            if (err) {
                showNotification("Error: Administrator Privileges Required", `Failed to create the startup task. Please run this application as an Administrator.\n\nDetails: ${stderr}`);
                startupCheckBox.setChecked(false);
            } else {
                showNotification("Success", "Startup task created successfully.");
            }
        });
    } else {
        const deleteTaskCommand = `schtasks /delete /TN "${TASK_NAME}" /F`;
        exec(deleteTaskCommand, (err, stdout, stderr) => {
            if (err) {
                if (stderr && stderr.includes("cannot find the file specified")) {
                    showNotification("Info", "Startup task was already removed.");
                    startupCheckBox.setChecked(false);
                } else {
                    showNotification("Error: Administrator Privileges Required", `Failed to delete the startup task. Please run this application as an Administrator.\n\nDetails: ${stderr}`);
                    startupCheckBox.setChecked(true);
                }
            } else {
                showNotification("Success", "Startup task removed successfully.");
            }
        });
    }
}

function checkStartupTaskState() {
    if (!selectedScriptPath) return;

    isUpdatingCheckboxState = true;
    
    const queryCommand = `schtasks /query /TN "${TASK_NAME}"`;
    exec(queryCommand, (err, stdout, stderr) => {
        if (err) {
            startupCheckBox.setChecked(false);
        } else {
            if (stdout.includes(selectedScriptPath)) {
                startupCheckBox.setChecked(true);
            } else {
                startupCheckBox.setChecked(false);
            }
        }
        isUpdatingCheckboxState = false;
    });
}

function updateControlStates() {
    const scriptIsSelected = !!selectedScriptPath;
    const scriptIsRunning = !!runningScriptProcess;

    selectedScriptLabel.setText(scriptIsSelected ? path.basename(selectedScriptPath) : "None");
    startScriptButton.setEnabled(scriptIsSelected && !scriptIsRunning);
    stopScriptButton.setEnabled(scriptIsRunning && !runningScriptProcess?.isExternal);
    startupCheckBox.setEnabled(scriptIsSelected);

    if (scriptIsRunning) {
        scriptStatusLabel.setText("<b>Status:</b> <font color='green'>Running</font>");
    } else if (scriptIsSelected) {
        scriptStatusLabel.setText("<b>Status:</b> <font color='red'>Stopped</font>");
    } else {
        scriptStatusLabel.setText("<b>Status:</b> Not Selected");
    }
}

function saveState() {
    try {
        const state = {
            lastSelectedScriptPath: selectedScriptPath
        };
        fs.writeFileSync(configPath, JSON.stringify(state, null, 4));
    } catch (err) {
        log('Could not save state to config.json: ' + err.stack);
    }
}

async function loadInitialState() {
    if (!fs.existsSync(configPath)) {
        updateControlStates();
        return;
    }
    
    try {
        const state = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const lastScript = state.lastSelectedScriptPath;

        if (lastScript && fs.existsSync(lastScript)) {
            selectedScriptPath = lastScript;
            const isRunning = await checkIfScriptIsRunningExternally(lastScript);
            if (isRunning) {
                runningScriptProcess = { isExternal: true };
            }
        }
    } catch (err) {
        log('Could not load or parse config.json: ' + err.stack);
    }

    updateControlStates();
    checkStartupTaskState();
}

function checkIfScriptIsRunningExternally(scriptPath) {
    return new Promise((resolve) => {
        const command = `tasklist /FI "IMAGENAME eq node.exe" /V /FO CSV`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                log('Failed to execute tasklist: ' + stderr);
                resolve(false);
                return;
            }
            const isRunning = stdout.split('\n').some(line => line.includes(path.basename(scriptPath)));
            resolve(isRunning);
        });
    });
}

function showNotification(title, text) {
    const messageBox = new QMessageBox(win);
    messageBox.setText(title);
    messageBox.setInformativeText(text);

    const okButton = new QPushButton(win);
    okButton.setText('OK');
    messageBox.addButton(okButton);
    
    messageBox.exec();
}

// Custom confirm dialog for NodeGUI
function confirm(message) {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Confirmation");
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);
    const label = new QLabel();
    label.setText(message);
    layout.addWidget(label);
    const buttonLayout = new QBoxLayout(Direction.LeftToRight);
    const yesButton = new QPushButton();
    yesButton.setText('Yes');
    const noButton = new QPushButton();
    noButton.setText('No');
    let result = false;
    yesButton.addEventListener('clicked', () => {
        result = true;
        dialog.close();
    });
    noButton.addEventListener('clicked', () => {
        result = false;
        dialog.close();
    });
    buttonLayout.addWidget(yesButton);
    buttonLayout.addWidget(noButton);
    layout.addWidget(buttonLayout);
    dialog.exec();
    return result;
}

function updateSlot(index, newConfig) {
    const slot = slots[index];
    slot.config = newConfig;
    if (newConfig && newConfig.name) {
        slot.button.setText(newConfig.name);
        slot.button.setStyleSheet(`#appSlot{font-size:16px;font-weight:bold;color:white;background-color:rgba(0,0,0,.6);border:3px solid rgba(0,0,0,.2);border-radius:20px;text-align:center;padding:5px}#appSlot:hover{border-color:#0099ff}`);
    } else {
        slot.button.setText("+");
        slot.button.setStyleSheet(`#appSlot{font-size:80px;color:rgba(0,0,0,.2);background-color:rgba(255,255,255,.7);border:3px solid rgba(0,0,0,.2);border-radius:20px}#appSlot:hover{border-color:#0099ff}`);
    }
}

// --- FINAL SETUP ---
// Permite maximizar la ventana y ajusta el tamaño mínimo para pantallas pequeñas
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
win.setMinimumSize(MIN_WIDTH, MIN_HEIGHT);
win.resize(1024, 768); // Tamaño inicial sugerido

const styleSheet = `
    #mainView {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
            stop:0 #f7fafd, stop:1 #e3f2fd);
        padding: 16px 0 0 0;
    }
    QGroupBox {
        margin-top: 16px;
        border: 2px solid #e0e0e0;
        border-radius: 14px;
        background: #fffff8;
        font-size: 15px;
        font-weight: bold;
        padding: 16px 8px 16px 8px;
    }
    QPushButton {
        border-radius: 10px;
        font-size: 14px;
        padding: 8px 16px;
        background-color: #42a5f5;
        color: #fff;
        border: none;
        margin: 0 6px 0 0;
        font-weight: 500;
        letter-spacing: 0.5px;
        min-width: 80px;
        min-height: 28px;
        max-width: 160px;
        max-height: 36px;
    }
    QPushButton:hover {
        background-color: #1976d2;
    }
    #appSlot {
        font-size: 14px;
        font-weight: bold;
        color: #1976d2;
        background: #ffffffcc;
        border: 2px solid #b0bec5;
        border-radius: 14px;
        text-align: center;
        padding: 6px;
        min-width: 70px;
        min-height: 50px;
        max-width: 120px;
        max-height: 70px;
        margin: 4px;
    }
    #appSlot:hover {
        border-color: #42a5f5;
        background: #e3f2fd;
    }
    #generateButton {
        font-size: 14px;
        font-weight: bold;
        color: white;
        background-color: #43e97b;
        height: 32px;
        border-radius: 10px;
        margin: 0 6px;
    }
    #generateButton:hover {
        background-color: #38f9d7;
    }
    #statusLabel {
        font-size: 13px;
        color: #1976d2;
    }
    #socialButton {
        background-color: #fff;
        color: #42a5f5;
        min-width: 32px;
        min-height: 32px;
        border-radius: 16px;
        border: 2px solid #42a5f5;
        margin: 0 4px;
    }
    #socialButton:hover {
        background-color: #42a5f5;
        color: #fff;
    }
    QLabel#banner {
        border-radius: 12px;
        margin: 12px 0;
    }
    QLabel#bannerBg {
        qproperty-alignment: 'AlignCenter';
        opacity: 0.15; /* Esto no es soportado, pero si tu PNG es transparente, funcionará visualmente */
        margin-bottom: -320px;
    }
`;
win.setStyleSheet(styleSheet);

// Layout spacing and margins for all main sections
rootLayout.setSpacing(12);
rootLayout.setContentsMargins(16, 8, 16, 8);
gridLayout.setSpacing(8);
gridLayout.setContentsMargins(0, 0, 0, 0);
controlLayout.setSpacing(6);
controlLayout.setContentsMargins(6, 4, 6, 4);
executionLayout.setSpacing(6);
executionLayout.setContentsMargins(6, 4, 6, 4);

win.setCentralWidget(centralWidget);
win.show();
global.win = win;

loadInitialState();

process.on('beforeExit', (code) => {
    log('Process beforeExit event with code: ' + code);
    if (runningScriptProcess) {
        log('Warning: Script process still running at exit. PID: ' + runningScriptProcess.pid);
    }
});
process.on('exit', (code) => {
    log('Process exit event with code: ' + code);
});
process.on('uncaughtException', (err) => {
    log('Uncaught Exception: ' + err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection: ' + reason);
});