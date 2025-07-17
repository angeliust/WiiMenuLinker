# Wii Menu Linker - Instalador

## 📦 Instalador Automático

Se ha creado un instalador automático que incluye todo lo necesario para ejecutar Wii Menu Linker:

### **Archivo del Instalador**
- **Ubicación**: `installer/WiiMenuLinker-Setup.exe`
- **Tamaño**: ~109 MB
- **Incluye**: Node.js + Aplicación completa

### **¿Qué hace el instalador?**

1. **Instala Node.js automáticamente** (si no está presente)
2. **Copia todos los archivos de la aplicación** a `C:\Program Files\WiiMenuLinker\`
3. **Crea accesos directos** en:
   - Menú Inicio
   - Escritorio (opcional)
   - Barra de tareas (opcional)
4. **Configura la aplicación** para ejecutarse correctamente

### **Requisitos del Sistema**
- Windows 10/11 (64-bit)
- Permisos de administrador (para la instalación)
- ~200 MB de espacio libre

### **Instrucciones de Instalación**

1. **Descargar el instalador**: `WiiMenuLinker-Setup.exe`
2. **Ejecutar como administrador**: Click derecho → "Ejecutar como administrador"
3. **Seguir el asistente de instalación**:
   - Aceptar la ubicación por defecto o elegir otra
   - Opcional: Crear accesos directos en escritorio
   - Opcional: Crear accesos directos en barra de tareas
4. **Completar la instalación**

### **Después de la Instalación**

✅ **La aplicación estará disponible en**:
- Menú Inicio → "Wii Menu Linker"
- Escritorio (si se seleccionó)
- `C:\Program Files\WiiMenuLinker\`

✅ **Funcionalidades incluidas**:
- Interfaz gráfica completa
- Detección automática de juegos Steam/Epic
- Generación de scripts para Wallpaper Engine
- Gestión de layouts
- Ejecución de scripts en segundo plano
- Configuración de inicio automático

### **Desinstalación**

Para desinstalar:
1. **Panel de Control** → **Programas y características**
2. **Buscar "Wii Menu Linker"**
3. **Click en "Desinstalar"**

### **Solución de Problemas**

#### **Error: "No se puede ejecutar el instalador"**
- Asegúrate de ejecutar como administrador
- Verifica que tienes permisos de administrador

#### **Error: "Node.js no se instaló correctamente"**
- El instalador incluye Node.js automáticamente
- Si falla, instala Node.js manualmente desde nodejs.org

#### **La aplicación no se ejecuta después de instalar**
- Verifica que Node.js esté instalado: `node --version`
- Reinstala la aplicación como administrador

### **Archivos del Proyecto**

```
wii-programs-linker/
├── installer/
│   └── WiiMenuLinker-Setup.exe    # Instalador principal
├── installer.iss                   # Script de Inno Setup
├── node-win-x64.zip               # Node.js incluido
└── README-INSTALLER.md           # Este archivo
```

### **Distribución**

Para distribuir la aplicación:
1. **Compartir**: `installer/WiiMenuLinker-Setup.exe`
2. **Tamaño**: ~109 MB (incluye Node.js)
3. **Compatible**: Windows 10/11 (64-bit)

---

**¡Listo!** El instalador incluye todo lo necesario para que Wii Menu Linker funcione en cualquier PC con Windows. 