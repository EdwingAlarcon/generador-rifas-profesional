# 🎉 Generador de Rifas Profesional

Una aplicación web moderna, elegante e intuitiva para realizar sorteos con nombres o números. Ideal para rifas, concursos, sorteos de premios y cualquier evento que requiera selección aleatoria de ganadores.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ Características Principales

### 🎯 Funcionalidades Core
- **Dos modos de sorteo:**
  - 🔤 **Modo Nombres:** Ingresa una lista de participantes por nombre
  - 🔢 **Modo Números:** Define un rango numérico para el sorteo
  
- **Sorteos flexibles:**
  - Selección múltiple de ganadores
  - Opción de permitir o no repetidos
  - Animaciones visuales durante el sorteo
  - Efectos de sonido personalizables

### 🎨 Interfaz y Diseño
- ✅ Diseño moderno y responsive (adaptable a móviles, tablets y desktop)
- 🌓 Modo oscuro/claro con cambio dinámico
- 🎭 Animaciones suaves y profesionales
- 🎊 Efectos de confeti al anunciar ganadores
- 📊 Panel de estadísticas en tiempo real

### 📈 Funcionalidades Avanzadas
- 📜 **Historial de sorteos:** Mantiene registro de los últimos 10 sorteos
- 💾 **Persistencia de datos:** Guarda historial y configuraciones en localStorage
- 📥 **Exportación de resultados:** Descarga los ganadores en formato TXT
- 🔗 **Compartir resultados:** Comparte directamente o copia al portapapeles
- 🔊 **Efectos de sonido:** Sonidos generados con Web Audio API

### 📊 Estadísticas
- Total de participantes actuales
- Total de ganadores históricos
- Total de sorteos realizados

## 🚀 Inicio Rápido

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- No requiere instalación de dependencias
- No requiere servidor (funciona como archivo local)

### Instalación

1. **Descarga los archivos:**
   ```bash
   git clone https://github.com/tu-usuario/generador-rifas.git
   cd generador-rifas
   ```

2. **Abre la aplicación:**
   - Simplemente abre el archivo `index.html` en tu navegador
   - O arrastra el archivo al navegador
   - O usa un servidor local:
     ```bash
     # Con Python 3
     python -m http.server 8000
     
     # Con Node.js (http-server)
     npx http-server
     ```

3. **¡Listo para usar!** 🎉

## 📖 Guía de Uso

### Modo Nombres

1. Selecciona la opción "**Nombres**" en el selector de modo
2. Ingresa los nombres de los participantes:
   - Separa cada nombre con una línea nueva
   - O separa los nombres con comas
   - Ejemplo:
     ```
     Juan Pérez
     María García
     Pedro López
     ```
3. Configura la cantidad de ganadores
4. Marca "Permitir repetidos" si deseas que un mismo nombre pueda salir varias veces
5. Haz clic en "**Iniciar Sorteo**"
6. ¡Observa la animación y descubre al ganador!

### Modo Números

1. Selecciona la opción "**Números**" en el selector de modo
2. Define el rango:
   - **Desde:** Número inicial (ej: 1)
   - **Hasta:** Número final (ej: 100)
3. Configura la cantidad de ganadores
4. Marca "Permitir repetidos" si deseas que un mismo número pueda salir varias veces
5. Haz clic en "**Iniciar Sorteo**"
6. ¡Disfruta la animación y conoce los números ganadores!

### Funciones Adicionales

#### 🔊 Control de Sonido
- Activa/desactiva los efectos de sonido desde la casilla "Sonidos activados"

#### 📋 Cargar Ejemplo
- En modo nombres, usa el botón "Cargar ejemplo" para ver una demostración rápida

#### 🌓 Cambiar Tema
- Haz clic en el icono de luna/sol en la esquina superior derecha
- Alterna entre modo claro y oscuro según tu preferencia

#### 📥 Exportar Resultados
- Después de un sorteo, haz clic en "Exportar Resultados"
- Se descargará un archivo TXT con los ganadores y detalles del sorteo

#### 🔗 Compartir Resultados
- Usa el botón "Compartir" para:
  - Compartir mediante la API nativa del navegador (móviles)
  - Copiar al portapapeles (desktop)

#### 📜 Historial
- Revisa los últimos 10 sorteos realizados
- Limpia el historial con el botón "Limpiar" si es necesario

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica y moderna
- **CSS3:** Diseño responsive con variables CSS, flexbox y grid
- **JavaScript (ES6+):** Programación orientada a objetos y modular
- **Font Awesome:** Iconografía profesional
- **Web Audio API:** Efectos de sonido sin dependencias externas
- **LocalStorage API:** Persistencia de datos del lado del cliente
- **Web Share API:** Compartir resultados nativamente

## 🎨 Características Técnicas

### Arquitectura
```
generador-rifas-profesional/
│
├── index.html              # Estructura HTML principal
├── README.md               # Documentación principal
├── LICENSE                 # Licencia MIT
├── .gitignore             # Configuración Git
│
├── css/
│   └── styles.css         # Estilos y animaciones
│
├── js/
│   └── app.js             # Lógica de la aplicación
│
├── docs/
│   ├── INSTRUCCIONES_GITHUB.md  # Guía para GitHub
│   └── RESUMEN_PROYECTO.md      # Resumen ejecutivo
│
└── assets/                # Recursos adicionales (imágenes, etc.)
```

### Clase Principal: RaffleApp

```javascript
class RaffleApp {
    // Gestión de modos (nombres/números)
    // Animaciones de sorteo
    // Gestión de ganadores
    // Historial y estadísticas
    // Persistencia de datos
    // Temas claro/oscuro
    // Exportación y compartir
}
```

### Características de Código
- ✅ Programación orientada a objetos
- ✅ Código modular y reutilizable
- ✅ Manejo de eventos eficiente
- ✅ Animaciones suaves con CSS y JavaScript
- ✅ Responsive design con media queries
- ✅ Accesibilidad considerada
- ✅ Performance optimizado

## 🎯 Casos de Uso

1. **Sorteos en vivo:** Eventos presenciales o virtuales
2. **Rifas benéficas:** Organizaciones sin fines de lucro
3. **Concursos en redes sociales:** Selección de ganadores de manera transparente
4. **Eventos corporativos:** Dinámicas de equipo o sorteos de premios
5. **Educación:** Selección aleatoria de estudiantes
6. **Juegos de azar regulados:** Loterías pequeñas o sorteos comunitarios

## 🔐 Privacidad y Seguridad

- ✅ Todo funciona localmente en el navegador
- ✅ No se envían datos a servidores externos
- ✅ Los datos se guardan solo en el localStorage del navegador
- ✅ Sin tracking ni analytics
- ✅ Sin cookies de terceros

## 🌐 Compatibilidad de Navegadores

| Navegador | Versión Mínima | Soporte |
|-----------|----------------|---------|
| Chrome    | 80+            | ✅ Full |
| Firefox   | 75+            | ✅ Full |
| Safari    | 13+            | ✅ Full |
| Edge      | 80+            | ✅ Full |
| Opera     | 67+            | ✅ Full |

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🚧 Próximas Mejoras (Roadmap)

- [ ] Modo PWA (Progressive Web App)
- [ ] Exportación en PDF con diseño personalizado
- [ ] Múltiples idiomas (inglés, portugués)
- [ ] Temas personalizables (colores)
- [ ] Integración con Google Sheets
- [ ] Modo presentación (pantalla completa)
- [ ] Animaciones adicionales de sorteo
- [ ] Importar participantes desde CSV/Excel
- [ ] Historial ilimitado con búsqueda
- [ ] Estadísticas avanzadas con gráficos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar esta aplicación:

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por un apasionado del desarrollo web

## 🙏 Agradecimientos

- Font Awesome por los íconos
- La comunidad de desarrolladores web
- Todos los que usan y mejoran esta aplicación

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
- 🐛 Reporta bugs en [Issues](https://github.com/tu-usuario/generador-rifas/issues)
- 💡 Sugiere mejoras en [Discussions](https://github.com/tu-usuario/generador-rifas/discussions)
- ⭐ Dale una estrella al proyecto si te gusta

---

**¡Que tengas sorteos exitosos! 🎉🍀**
