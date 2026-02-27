# Portfolio - Mario (p0wn3d)

Portfolio personal con asistente IA integrado.

## 🚀 Configuración Local

### Prerequisitos
- Git
- API Key de Google Gemini (obtén una en [AI Studio](https://aistudio.google.com/app/apikey))

### Setup

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/p0wn3d13/p0wn3d13.github.io.git
   cd p0wn3d13.github.io
   ```

2. **Crea tu archivo de configuración:**
   ```bash
   cp config.example.js config.js
   ```

3. **Edita `config.js` y agrega tu API key:**
   ```javascript
   const CONFIG = {
       GEMINI_API_KEY: "tu_api_key_aqui"
   };
   ```

4. **Abre `index.html` en tu navegador** o sirve localmente:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (si tienes http-server instalado)
   npx http-server
   ```

## 🔒 Seguridad

- `config.js` está en `.gitignore` y **NUNCA** se sube a GitHub
- Solo comparte `config.example.js` como referencia
- Tu API key siempre permanece local y privada

## 📝 Archivos Importantes

- `index.html` - Estructura principal
- `styles.css` - Estilos
- `config.example.js` - Plantilla de configuración
- `.gitignore` - Archivos excluidos de Git

## 🤖 Asistente IA

El portfolio incluye un asistente virtual basado en Gemini que responde preguntas sobre tu experiencia, habilidades y certificaciones.

---

**© 2026 Mario (p0wn3d)**
