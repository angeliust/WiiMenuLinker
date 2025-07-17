# Wii Menu Linker 🎮

<div align="center">
  <img src="https://i.imgur.com/umCKV5i.png" alt="Wii Menu Linker Banner" width="600"/>
  <br/>
  <img src="https://i.imgur.com/mt56kM7.png" alt="Wii Menu Linker Icon" width="96"/>
  <br/>
  <a href="https://github.com/angeliust/WiiMenuLinker"><img src="https://img.shields.io/badge/Windows-10-blue?logo=windows"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-v18.12.1-green?logo=node.js"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg"/></a>
</div>

## 📖 Overview

**Wii Menu Linker** is a NodeGui-based desktop application that creates an interactive Wii-style menu for launching your favorite games and programs through Wallpaper Engine. Transform your desktop into a nostalgic Wii interface with customizable slots for games, applications, and web links.

## ✨ Features

- 🎮 **Wii-Style Interface**: 12 customizable slots with a nostalgic Wii menu design
- 🎯 **Smart Game Detection**: Automatic detection of Steam and Epic Games libraries
- 🔍 **Start Menu Integration**: Search and add programs from Windows Start Menu
- 📁 **File Browser**: Browse and add any executable or shortcut
- 🌐 **Web Links**: Add custom web links to your menu
- 💾 **Layout Management**: Save and load custom layouts
- 🎨 **Wallpaper Engine Integration**: Generate scripts compatible with Wallpaper Engine
- 🔄 **Background Execution**: Run scripts in the background with hidden launcher
- 🚀 **Auto-Startup**: Configure scripts to run on Windows startup
- 🛠️ **Process Management**: Built-in tools to stop all running scripts

## 🎯 Use Cases

- **Gaming Setup**: Create a custom game launcher for your favorite titles
- **Productivity**: Quick access to frequently used applications
- **Streaming**: Professional overlay for game streaming
- **Customization**: Personalize your desktop with a unique interface

## 🚀 Installation

### Option 1: Download Installer (Recommended)
1. Download the latest installer from [Releases](https://github.com/angeliust/WiiMenuLinker/releases)
2. Run `WiiMenuLinker-Setup-v1.0.exe` as Administrator
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Option 2: Portable Version
1. Download the portable package and extract to any folder
2. Run `WiiMenuLinker.bat` or `run_hidden.vbs` for hidden mode

## 📋 Requirements

- **OS**: Windows 10/11 (64-bit)
- **Node.js**: Included in the package (no separate installation needed)
- **Wallpaper Engine**: For full integration (optional)

## 🎮 Quick Start Guide

### 1. Launch the Application

Start Menu → Wii Menu Linker

### 2. Configure Your Slots
- Click any slot to configure it
- Choose from:
  - **Search Start Menu**: Find installed applications
  - **Search Games**: Browse Steam/Epic Games
  - **Browse for File**: Select any executable
  - **Add Web Link**: Add custom URLs

### 3. Save Your Layout
- Click "Save Current Layout" to preserve your configuration
- Use "Manage Layouts" to load previous configurations

### 4. Generate Wallpaper Engine Script
- Click "Generate Config File" → Export as .js Script
- Save the script for Wallpaper Engine integration

### 5. Run in Background (Optional)
- Select your script and click "Start Script"
- Use "Run on Windows Startup" for automatic execution

## 🛠️ Advanced Features

### Steam Library Configuration
- Click "Select Steam Library Folder(s)" to configure multiple Steam directories
- The app automatically detects games from configured libraries

### Script Management
- **Start Script**: Run selected script in background
- **Stop Script**: Terminate running script
- **Stop All Scripts**: Force close all related processes
- **Kill Startup Script**: Remove auto-startup scripts

### Layout System
- Save multiple layouts for different use cases
- Export layouts as JavaScript files for Wallpaper Engine
- Import/export layout configurations

## 📁 File Structure

```
WiiMenuLinker/
├── index.js              # Main application
├── config.json           # User configuration
├── app.log               # Application logs
├── assets/               # Images and icons
├── layouts/              # Saved layouts
├── scripts/              # Generated scripts
├── run_hidden.vbs        # Hidden launcher
└── stop-all-scripts.bat  # Process killer
```

## 🔧 Configuration

### Steam Library Paths
The app automatically saves your last selected Steam library paths in `config.json`:

```json
{
  "steamLibraryFolders": [
    "D:\\SteamLibrary",
    "C:\\Program Files (x86)\\Steam"
  ],
  "lastSteamFolderPath": "C:\\"
}
```

### Script Generation
Generated scripts monitor Wallpaper Engine's log file and launch applications based on user interactions.

## 🐛 Troubleshooting

### Common Issues

**Script won't start:**
- Check if Node.js is properly included in the package
- Run as Administrator for startup tasks
- Check `app.log` for error details

**Games not detected:**
- Verify Steam/Epic Games installation paths
- Use "Select Steam Library Folder(s)" to add custom paths
- Check if game manifests exist in Steam directories

**Wallpaper Engine integration:**
- Ensure the log file path is correct in generated scripts
- Verify Wallpaper Engine is running
- Check script permissions and execution

### Log Files
- **Application Log**: `app.log` - Contains detailed error information
- **Script Logs**: Check console output for generated scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NodeGui**: For the cross-platform GUI framework
- **Wallpaper Engine**: For the wallpaper integration capabilities
- **Steam/Epic Games**: For game library access

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/angeliust/WiiMenuLinker/issues)
- **Documentation**: Check the `app.log` file for detailed error information
- **Community**: Join discussions in the GitHub repository

---

<div align="center">
  <p>Made with ❤️ for the gaming community</p>
  <p>Transform your desktop into a nostalgic Wii experience! 🎮</p>
</div>
