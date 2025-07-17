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
- **Enlaces web** para sitios y aplicaciones online
- **Gestión de layouts** con guardado/carga de configuraciones

### 🔧 Scripts y Automatización
- **Generación de scripts** para Wallpaper Engine
- **Ejecución en segundo plano** sin ventanas de terminal
- **Configuración de inicio automático** en Windows
- **Control de procesos** con detección y terminación
- **Logs detallados** para debugging

### 🎮 Compatibilidad
- **Steam**: Detección automática de juegos instalados
- **Epic Games**: Soporte para juegos de Epic Games Store
- **Programas Windows**: Cualquier ejecutable (.exe)
- **Accesos directos**: Archivos .lnk del menú inicio
- **Enlaces web**: URLs para navegador

## 📦 Instalación

### Opción 1: Instalador Automático (Recomendado)
1. Descarga el instalador desde [Releases](https://github.com/angeliust/WiiMenuLinker/releases)
2. Ejecuta `WiiMenuLinker-Setup.exe` como administrador
3. Sigue el asistente de instalación
4. ¡Listo! La aplicación estará disponible en el menú inicio

### Opción 2: Desarrollo Local
```bash
# Clonar el repositorio
git clone https://github.com/angeliust/WiiMenuLinker.git
cd WiiMenuLinker

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

## 🛠️ Uso

### Configuración Básica
1. **Abrir la aplicación** desde el menú inicio
2. **Hacer clic en cualquier slot** para configurar
3. **Elegir fuente**:
   - "Search Games" para Steam/Epic
   - "Search Start Menu" para programas Windows
   - "Browse for File" para archivos específicos
   - "Add Web Link" para enlaces web
4. **Guardar layout** con "Save Current Layout"

### Generación de Scripts
1. **Configurar todos los slots** deseados
2. **Hacer clic en "Generate Config File"**
3. **Elegir formato**:
   - `.js` para script de Node.js
   - `.txt` para archivo de configuración
4. **Seleccionar ubicación** para guardar

### Ejecución de Scripts
1. **Seleccionar script** con "Select Script"
2. **Iniciar script** con "Start Script"
3. **Configurar inicio automático** (opcional)
4. **Usar "Wii Menu Linker (Hidden)"** para ejecución oculta

## 📁 Estructura del Proyecto

```
wii-programs-linker/
├── index.js              # Aplicación principal
├── package.json          # Dependencias
├── assets/              # Imágenes e iconos
├── layouts/             # Configuraciones guardadas
├── scripts/             # Scripts generados
├── installer.iss        # Script de instalación
├── run_hidden.vbs       # Launcher oculto
└── README.md           # Este archivo
```

## 🔧 Configuración

### Archivos de Configuración
- `config.json`: Configuración de la aplicación
- `layouts/*.json`: Layouts guardados
- `scripts/*.js`: Scripts generados para Wallpaper Engine

### Logs
- `app.log`: Logs de la aplicación
- Logs de scripts en la ubicación especificada

## 🎯 Casos de Uso

### Wallpaper Engine
1. Crear un wallpaper interactivo con 12 botones
2. Configurar Wii Menu Linker con tus programas
3. Generar script y configurar Wallpaper Engine
4. ¡Hacer clic en los botones del wallpaper para lanzar programas!

### Menú de Juegos
- Organizar juegos favoritos en un menú visual
- Acceso rápido a Steam y Epic Games
- Lanzamiento con un clic desde el wallpaper

### Herramientas de Productividad
- Acceso rápido a programas de trabajo
- Enlaces a sitios web frecuentes
- Scripts automatizados para tareas repetitivas

## 🐛 Solución de Problemas

### La aplicación no se ejecuta
- Verificar que Node.js esté instalado
- Ejecutar como administrador si es necesario
- Revisar logs en `app.log`

### Scripts no funcionan
- Verificar que Wallpaper Engine esté configurado correctamente
- Comprobar permisos de escritura en la carpeta de logs
- Revisar que los programas especificados existan

### Juegos no se detectan
- Verificar que Steam/Epic Games estén instalados
- Comprobar rutas de bibliotecas en configuración
- Actualizar rutas con "Select Steam Library Folder(s)"

## 📄 Licencia

Este proyecto está bajo la licencia [GPL-3.0](LICENSE).

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
- Abrir un [Issue](https://github.com/angeliust/WiiMenuLinker/issues)
- Revisar los logs en `app.log`
- Verificar la configuración en `config.json`

---

**¡Disfruta creando tus menús estilo Wii para Wallpaper Engine!** 🎮✨
