# Wii Menu Linker

Wii Menu Program Linker for Wallpaper Engine Wii Menu

## 📋 Descripción

Wii Menu Linker es una aplicación de escritorio que permite crear menús interactivos estilo Wii para Wallpaper Engine. Con esta herramienta puedes:

- **Configurar hasta 12 programas/juegos** en un grid 3x4
- **Detectar automáticamente juegos** de Steam y Epic Games
- **Generar scripts** para Wallpaper Engine
- **Ejecutar scripts en segundo plano** para lanzar programas
- **Configurar inicio automático** en Windows
- **Gestionar layouts** personalizados

## 🚀 Características

### ✨ Funcionalidades Principales
- **Interfaz gráfica intuitiva** con diseño estilo Wii
- **Detección automática** de bibliotecas Steam y Epic Games
- **Búsqueda en el menú inicio** de Windows
- **Navegador de archivos** para programas personalizados
- **Generación de scripts** para Wallpaper Engine
- **Ejecución en segundo plano** con scripts ocultos
- **Configuración de inicio automático** en Windows
- **Gestión de layouts** personalizados

### 🎮 Compatibilidad
- **Steam**: Detección automática de juegos instalados
- **Epic Games**: Soporte para juegos de Epic Games Store
- **Programas locales**: Cualquier ejecutable (.exe)
- **Enlaces web**: URLs directas
- **Accesos directos**: Archivos .lnk y .url

## 📦 Instalación

### Requisitos del Sistema
- **Windows 10/11** (64-bit)
- **Node.js 18.x** o superior
- **Permisos de administrador** (para configuración de inicio automático)

### Instalación desde Código Fuente

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/angeliust/WiiMenuLinker.git
   cd WiiMenuLinker
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta la aplicación**
   ```bash
   npm start
   ```

## 🛠️ Desarrollo

### Estructura del Proyecto
```
WiiMenuLinker/
├── index.js              # Aplicación principal
├── package.json          # Dependencias y scripts
├── assets/              # Imágenes e iconos
├── layouts/             # Configuraciones de layouts
├── scripts/             # Scripts generados
├── config.json          # Configuración de la aplicación
└── README.md           # Documentación
```

### Scripts Disponibles
- `npm start` - Ejecuta la aplicación
- `npm install` - Instala dependencias

### Dependencias Principales
- `@nodegui/nodegui` - Framework de UI nativo
- `steam-game-path` - Detección de juegos Steam
- `open` - Apertura de archivos y URLs

## 📦 Crear tu Propia Build

### Opción 1: Build Manual (Recomendado)

1. **Prepara el entorno**
   ```bash
   # Clona el repositorio
   git clone https://github.com/angeliust/WiiMenuLinker.git
   cd WiiMenuLinker
   
   # Instala dependencias
   npm install
   ```

2. **Descarga Node.js portable**
   ```bash
   # Descarga Node.js v18.20.8 para Windows x64
   # Desde: https://nodejs.org/dist/v18.20.8/node-v18.20.8-win-x64.zip
   ```

3. **Crea la carpeta de build**
   ```bash
   mkdir WiiMenuLinker-Build
   cd WiiMenuLinker-Build
   ```

4. **Copia los archivos necesarios**
   ```bash
   # Copia la aplicación
   cp -r ../WiiMenuLinker/* .
   
   # Extrae Node.js portable
   # Descomprime node-v18.20.8-win-x64.zip
   # Copia node.exe y archivos relacionados a la raíz
   ```

5. **Crea el launcher**
   ```bash
   # Crea run_hidden.vbs
   echo 'Set WshShell = CreateObject("WScript.Shell")' > run_hidden.vbs
   echo 'WshShell.Run "node.exe index.js", 0, False' >> run_hidden.vbs
   echo 'Set WshShell = Nothing' >> run_hidden.vbs
   
   # Crea WiiMenuLinker.bat
   echo '@echo off' > WiiMenuLinker.bat
   echo 'cd /d "%~dp0"' >> WiiMenuLinker.bat
   echo 'node.exe index.js' >> WiiMenuLinker.bat
   ```

### Opción 2: Build con Inno Setup

1. **Instala Inno Setup**
   - Descarga desde: https://jrsoftware.org/isdl.php
   - Instala Inno Setup 6

2. **Crea el script de instalación**
   ```ini
   [Setup]
   AppName=Wii Menu Linker
   AppVersion=1.0.0
   AppPublisher=Tu Nombre
   DefaultDirName={pf}\WiiMenuLinker
   DefaultGroupName=Wii Menu Linker
   OutputDir=installer
   OutputBaseFilename=WiiMenuLinker-Setup
   Compression=lzma
   SolidCompression=yes
   PrivilegesRequired=admin

   [Files]
   Source: "node.exe"; DestDir: "{app}"; Flags: ignoreversion
   Source: "index.js"; DestDir: "{app}"; Flags: ignoreversion
   Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
   Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs
   Source: "layouts\*"; DestDir: "{app}\layouts"; Flags: ignoreversion recursesubdirs
   Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs
   Source: "run_hidden.vbs"; DestDir: "{app}"; Flags: ignoreversion

   [Icons]
   Name: "{group}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"
   Name: "{group}\Wii Menu Linker (Hidden)"; Filename: "wscript.exe"; Parameters: "{app}\run_hidden.vbs"; WorkingDir: "{app}"
   Name: "{commondesktop}\Wii Menu Linker"; Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"

   [Run]
   Filename: "{app}\node.exe"; Parameters: "index.js"; WorkingDir: "{app}"; Description: "Launch Wii Menu Linker"; Flags: nowait postinstall skipifsilent
   ```

3. **Compila el instalador**
   ```bash
   # Usa ISCC.exe de Inno Setup
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
   ```

### Opción 3: Build con Electron (Avanzado)

1. **Instala Electron**
   ```bash
   npm install --save-dev electron
   ```

2. **Crea main.js para Electron**
   ```javascript
   const { app, BrowserWindow } = require('electron');
   const path = require('path');

   function createWindow() {
     const win = new BrowserWindow({
       width: 1024,
       height: 768,
       webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
       }
     });

     win.loadFile('index.html');
   }

   app.whenReady().then(createWindow);
   ```

3. **Configura package.json**
   ```json
   {
     "main": "main.js",
     "scripts": {
       "start": "electron .",
       "build": "electron-builder"
     }
   }
   ```

## 🎯 Uso

### Configuración Inicial
1. **Ejecuta la aplicación**
2. **Selecciona carpetas de Steam** (opcional)
3. **Configura los slots** con tus programas favoritos
4. **Guarda tu layout** personalizado

### Generación de Scripts
1. **Configura los slots** con tus programas
2. **Haz clic en "Generate Config File"**
3. **Guarda el script** en la carpeta de Wallpaper Engine
4. **Configura Wallpaper Engine** para usar el script

### Ejecución en Segundo Plano
1. **Selecciona un script** generado
2. **Haz clic en "Start Script"**
3. **Configura inicio automático** (opcional)

## 🔧 Configuración

### Archivos de Configuración
- `config.json` - Configuración de la aplicación
- `layouts/` - Layouts guardados
- `scripts/` - Scripts generados

### Carpetas de Steam
- **Detección automática**: `C:\Program Files (x86)\Steam`
- **Bibliotecas adicionales**: Configurables desde la interfaz

## 🐛 Solución de Problemas

### Problemas Comunes
1. **"Node.js no encontrado"**
   - Asegúrate de tener Node.js instalado
   - Verifica que `node.exe` esté en el PATH

2. **"Script no funciona"**
   - Verifica que Wallpaper Engine esté configurado correctamente
   - Revisa los logs en `C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\log.txt`

3. **"No se detectan juegos"**
   - Verifica que Steam esté instalado
   - Configura las carpetas de biblioteca correctamente

### Logs y Debugging
- **Log de la aplicación**: `app.log`
- **Log de Wallpaper Engine**: `C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\log.txt`

## 🤝 Contribuir

### Cómo Contribuir
1. **Fork el repositorio**
2. **Crea una rama** para tu feature
3. **Haz tus cambios**
4. **Envía un Pull Request**

### Reportar Bugs
- Usa las **Issues** de GitHub
- Incluye información del sistema
- Adjunta logs si es posible

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **NodeGUI** por el framework de UI nativo
- **Steam** por la API de detección de juegos
- **Wallpaper Engine** por la integración

---

**¡Disfruta creando tus menús estilo Wii! 🎮**
