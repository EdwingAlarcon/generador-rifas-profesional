# Instrucciones para subir el proyecto a GitHub

## Opción 1: Crear un nuevo repositorio en GitHub (Recomendado)

1. **Ve a GitHub:** https://github.com/new

2. **Configura el nuevo repositorio:**
   - Repository name: `generador-rifas-profesional`
   - Description: `🎉 Aplicación web moderna para realizar sorteos con nombres o números. Interfaz intuitiva, animaciones, modo oscuro y más!`
   - Visibilidad: Público o Privado (tu elección)
   - **NO marques** "Initialize this repository with a README"
   - **NO agregues** .gitignore ni license (ya los tenemos)

3. **Ejecuta estos comandos en la terminal:**
   ```bash
   cd "c:\Users\bdp_u\Downloads\Generardor Rifas con Nombres o números"
   git remote add origin https://github.com/TU-USUARIO/generador-rifas-profesional.git
   git push -u origin main
   ```

4. **Si te pide autenticación:**
   - Usa tu nombre de usuario de GitHub
   - Para la contraseña, usa un **Personal Access Token** (no tu contraseña de GitHub)
   - Cómo crear un token: https://github.com/settings/tokens
     - Click en "Generate new token (classic)"
     - Marca el scope "repo"
     - Genera y copia el token

## Opción 2: Usar GitHub CLI (si lo tienes instalado)

```bash
cd "c:\Users\bdp_u\Downloads\Generardor Rifas con Nombres o números"
gh repo create generador-rifas-profesional --public --source=. --remote=origin --push
```

## Opción 3: Usar GitHub Desktop

1. Abre GitHub Desktop
2. File > Add Local Repository
3. Selecciona la carpeta del proyecto
4. Click en "Publish repository"
5. Configura el nombre y visibilidad
6. Click en "Publish Repository"

## Verificar que todo funcionó

Una vez subido, verifica en:
- https://github.com/TU-USUARIO/generador-rifas-profesional

## Configurar GitHub Pages (Opcional - Para hosting gratuito)

1. Ve a tu repositorio en GitHub
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Save

Tu aplicación estará disponible en:
`https://TU-USUARIO.github.io/generador-rifas-profesional/`

## Estado Actual del Proyecto

✅ Repositorio Git inicializado
✅ Commit inicial realizado
✅ Rama renombrada a 'main'
✅ 6 archivos listos para subir:
   - index.html (Interfaz principal)
   - styles.css (Estilos y animaciones)
   - app.js (Lógica de la aplicación)
   - README.md (Documentación completa)
   - LICENSE (Licencia MIT)
   - .gitignore (Archivos a ignorar)

## Próximos pasos después de subir

1. Agregar topics al repositorio: `raffle`, `lottery`, `javascript`, `webapp`, `sorteo`
2. Agregar el link de GitHub Pages en About
3. Compartir el proyecto
4. Agregar screenshots al README
5. ⭐ Darle una estrella a tu propio proyecto

---

**¡Tu proyecto está listo para ser compartido con el mundo! 🚀**
