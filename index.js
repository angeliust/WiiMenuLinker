// --- Imports ---
const {
    QMainWindow, QWidget, QPushButton, QGridLayout, QDialog,
    QLabel, QBoxLayout, Direction, QFileDialog, QInputDialog, QMessageBox,
    QListWidget, QListWidgetItem, QLineEdit, QVariant, QGroupBox
} = require('@nodegui/nodegui');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// --- Global State ---
const layoutsDir = path.join(__dirname, 'layouts');
if (!fs.existsSync(layoutsDir)) fs.mkdirSync(layoutsDir);
let logFilePath = `C:\\\\Program Files (x86)\\\\Steam\\\\steamapps\\\\common\\\\wallpaper_engine\\\\log.txt`;

// --- Main Window & Layout ---
const win = new QMainWindow();
win.setWindowTitle("Wii Menu Linker");
win.setMinimumSize(850, 700);
const centralWidget = new QWidget();
centralWidget.setObjectName("mainView");
const rootLayout = new QBoxLayout(Direction.TopToBottom);
centralWidget.setLayout(rootLayout);

// --- Grid for App Slots ---
const gridWidget = new QWidget();
const gridLayout = new QGridLayout();
gridWidget.setLayout(gridLayout);
gridLayout.setSpacing(25);
rootLayout.addWidget(gridWidget);

const NUM_ROWS = 3;
const NUM_COLS = 4;
const slots = [];
for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
        const slotIndex = row * NUM_COLS + col;
        const button = new QPushButton();
        button.setFixedSize(200, 130);
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
manageLayoutsButton.addEventListener('clicked', openLayoutManagerDialog);
const saveLayoutButton = new QPushButton();
saveLayoutButton.setText("Save Current Layout");
saveLayoutButton.addEventListener('clicked', saveLayout);
controlLayout.addWidget(manageLayoutsButton, 0, 0);
controlLayout.addWidget(saveLayoutButton, 0, 1);

const exportButton = new QPushButton();
exportButton.setText("Export Config for Wallpaper");
exportButton.setObjectName("generateButton");
exportButton.addEventListener('clicked', openExportDialog);
controlLayout.addWidget(exportButton, 0, 2);

const setLogPathButton = new QPushButton();
setLogPathButton.setText("Set Log File Path");
setLogPathButton.addEventListener('clicked', setLogFilePath);
controlLayout.addWidget(setLogPathButton, 0, 3);

// --- CORE LOGIC ---

function setLogFilePath() {
    const file = QFileDialog.getOpenFileName(win, "Select log.txt", __dirname, "Text files (*.txt)");
    if (file) {
        logFilePath = file.replace(/\\/g, '\\\\');
        showNotification("Success", `Log file path set to:\n${logFilePath}`);
    }
}

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

    const browseButton = new QPushButton();
    browseButton.setText("Browse for File...");
    browseButton.addEventListener('clicked', () => {
        dialog.close();
        const filePath = QFileDialog.getOpenFileName(win, "Select Program", __dirname, "Programs (*.exe *.lnk *.url)");
        if (!filePath) return;
        const baseName = path.basename(filePath, path.extname(filePath));
        const appName = QInputDialog.getText(win, "Enter App Name", `Enter a name for this app:`, 0, baseName);
        if (appName) {
            updateSlot(index, { name: appName, path: filePath });
        }
    });

    const linkButton = new QPushButton();
    linkButton.setText("Add Web Link");
    linkButton.addEventListener('clicked', () => {
        dialog.close();
        const url = QInputDialog.getText(win, "Add Web Link", "Enter the full URL:");
        if (url) {
            const suggestedName = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
            const name = QInputDialog.getText(win, "Enter Link Name", "Enter a name for this link:", 0, suggestedName);
            if (name) {
                updateSlot(index, { name: name, path: url });
            }
        }
    });

    const removeButton = new QPushButton();
    removeButton.setText("Clear Slot");
    removeButton.addEventListener('clicked', () => {
        updateSlot(index, null);
        dialog.close();
    });

    if (!slots[index].config) removeButton.hide();

    layout.addWidget(searchButton);
    layout.addWidget(browseButton);
    layout.addWidget(linkButton);
    layout.addWidget(removeButton);
    dialog.exec();
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
    ps.stderr.on('data', (data) => { console.error(`PowerShell stderr: ${data}`); });

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
        } catch (e).
            console.error("Failed to parse PowerShell output:", e, "\nRaw output:", outputData);
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
            console.error("Could not read layouts directory:", err);
            showNotification("Error", `Could not read layouts directory:\n${err.message}`);
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

    const deleteButton = new QPushButton();
    deleteButton.setText("Delete Selected");
    deleteButton.addEventListener('clicked', () => {
        const selectedItems = listWidget.selectedItems();
        if (selectedItems.length > 0) {
            if(confirm("Confirmation", "Are you sure you want to delete this layout?")) {
                const filePath = path.join(layoutsDir, selectedItems[0].text());
                try {
                    fs.unlinkSync(filePath);
                    showNotification("Success", "Layout deleted.");
                    refreshList();
                } catch (err) {
                    showNotification("Error", `Failed to delete layout: ${err.message}`);
                }
            }
        }
    });

    layout.addWidget(loadButton);
    layout.addWidget(deleteButton);
    dialog.exec();
}


function saveLayout() {
    const name = QInputDialog.getText(win, "Save Layout", "Enter a name for this layout:");
    if (!name) return;

    let fileName = name.endsWith('.json') ? name : `${name}.json`;
    const filePath = path.join(layoutsDir, fileName);

    const layoutData = slots.map(slot => slot.config);
    fs.writeFile(filePath, JSON.stringify(layoutData, null, 2), (err) => {
        showNotification(err ? "Error Saving Layout" : "Layout Saved", err ? err.message : `Successfully saved to ${filePath}`);
    });
}

function loadLayoutFromFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            showNotification("Error Loading Layout", err.message);
            return;
        }
        try {
            const layoutData = JSON.parse(data);
            if (Array.isArray(layoutData) && layoutData.length === slots.length) {
                layoutData.forEach((config, index) => {
                    updateSlot(index, config);
                });
                showNotification("Success", `Layout "${path.basename(filePath)}" loaded.`);
            } else {
                showNotification("Invalid Layout File", "File does not seem to be a valid layout.");
            }
        } catch (e) {
            showNotification("Error Parsing File", "Could not read the layout file. Is it corrupted?");
        }
    });
}

function openExportDialog() {
    const dialog = new QDialog(win);
    dialog.setWindowTitle("Choose Export Format");
    const layout = new QBoxLayout(Direction.TopToBottom, dialog);
    dialog.setLayout(layout);

    const generateJsButton = new QPushButton();
    generateJsButton.setText("Generate .js Script");
    generateJsButton.addEventListener('clicked', () => {
        dialog.close();
        generateFile('js');
    });

    const generateTxtButton = new QPushButton();
    generateTxtButton.setText("Generate info.txt File");
    generateTxtButton.addEventListener('clicked', () => {
        dialog.close();
        generateFile('txt');
    });

    layout.addWidget(generateJsButton);
    layout.addWidget(generateTxtButton);
    dialog.exec();
}

function generateFile(format) {
    let filter, defaultFileName, extension;
    if (format === 'js') {
        filter = "JavaScript files (*.js)";
        defaultFileName = "wii-menu-script.js";
        extension = ".js";
    } else {
        filter = "Text files (*.txt)";
        defaultFileName = "info.txt";
        extension = ".txt";
    }

    const file = QFileDialog.getSaveFileName(win, "Save File", __dirname, filter);

    if (!file) return;

    let finalPath = file;
    if (!finalPath.toLowerCase().endsWith(extension)) {
        finalPath += extension;
    }

    let fileContent = '';
    if (format === 'js') {
        if (logFilePath === `C:\\\\Program Files (x86)\\\\Steam\\\\steamapps\\\\common\\\\wallpaper_engine\\\\log.txt`) {
            showNotification("Notice", "You are using the default log file path. If Wallpaper Engine is installed elsewhere, please set the correct path using the 'Set Log File Path' button.");
        }
        let appMappings = '';
        for (let i = 0; i < slots.length; i++) {
            const p = slots[i].config ? slots[i].config.path.replace(/\\/g, '\\\\') : "";
            appMappings += `    app${i + 1}: \`"${p}"\`,\n`;
        }
        fileContent = `const fs=require('fs');const{exec}=require('child_process');const path=require('path');const logFilePath='${logFilePath}';const apps={${appMappings}};console.log("Wii launcher script started. Watching...");function checkWallpaperLog(){fs.watchFile(logFilePath,{interval:100},()=>{fs.readFile(logFilePath,'utf8',(err,data)=>{if(err||!data)return;const lines=data.trim().split(/\\r?\\n/);const lastLine=lines[lines.length-1];const match=lastLine.match(/Log:\\s(app\\d+)/i);if(match){const appKey=match[1].toLowerCase();if(apps[appKey]&&apps[appKey]!=='\`""\`'){const appPath=apps[appKey].replace(/"/g,'');console.log(\`Match for \${appKey}. Launching: \${appPath}\`);fs.truncate(logFilePath,0,(e)=>{if(e)console.error('Truncate Error:',e);else{const command=\`start "" /D "\${path.dirname(appPath)}" "\${path.basename(appPath)}"\`;exec(command,(e)=>{if(e)console.error('Exec Error:',e)})}})}}})})}checkWallpaperLog();`;
    } else {
        const lines = [];
        lines.push(logFilePath.replace(/\\\\/g, '\\'));
        for (let i = 0; i < slots.length; i++) {
            const path = slots[i].config ? slots[i].config.path : "";
            lines.push(`app${i + 1}=${path}`);
        }
        fileContent = lines.join('\n');
    }

    fs.writeFile(finalPath, fileContent, (err) => {
        showNotification(err ? "Error" : "Success!", err ? `Failed to save file: ${err.message}` : `File saved successfully to:\n${finalPath}`);
    });
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

// --- HELPER FUNCTIONS ---
function showNotification(title, text) {
    const msgBox = new QMessageBox();
    msgBox.setText(title);
    msgBox.setInformativeText(text);
    // This is the correct, simple, and stable way to show a notification.
    msgBox.setStandardButtons(QMessageBox.StandardButton.Ok);
    msgBox.exec();
}

function confirm(title, text) {
    // This is the correct, simple, and stable way to ask a question.
    const buttons = QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No;
    const result = QMessageBox.question(win, title, text, buttons);
    return result === QMessageBox.StandardButton.Yes;
}


// --- FINAL SETUP ---
const styleSheet = `#mainView{background-color:#E8E8E8;padding-top:10px}QGroupBox{margin-top:15px}QPushButton{border-radius:5px;font-size:14px;padding:10px}#generateButton,#uninstallButton{font-size:16px;font-weight:bold;color:white;height:40px}#generateButton{background-color:#27ae60}#generateButton:hover{background-color:#2ecc71}#uninstallButton{background-color:#c0392b}#uninstallButton:hover{background-color:#e74c3c}`;
win.setCentralWidget(centralWidget);
win.setStyleSheet(styleSheet);
win.show();
global.win = win;
