# AVESCUELA

**Descubre las aves, aprende a valorarlas y comprométete a protegerlas**

Prototipo educativo para una hackatón. Explora un paisaje *ilustrado* inspirado en Cristo Rey (Cali), descubre aves, resuelve tres decisiones de conservación y carga fotografías para obtener una identificación **orientativa** mediante Gemini.

## Desarrollo en GitHub Codespaces

1. `npm install`
2. Crear `.env` copiando `.env.example` y sustituyendo el valor de `GEMINI_API_KEY` por tu clave (nunca la publiques).
3. `npm run dev:full` (o `npx netlify dev --port 8888`).
4. Abrir el puerto **8888**, no el 5173, para que funcionen las funciones de IA.

## Producción

Conectar el repositorio a Netlify. Build: `npm run build`, publicación: `dist`. En **Site configuration > Environment variables**, añadir `GEMINI_API_KEY` y habilitar su alcance para Functions. No usar prefijo `VITE_` para la clave. La aplicación usa `/.netlify/functions/identificar-ave`.

## Notas

- Las imágenes enviadas para identificar se transmiten a Gemini; no enviar fotografías de personas ni información privada.
- El resultado puede ser incorrecto y debe contrastarse con guías de campo. La simulación no es un mapa real ni demuestra presencia local de especies.
- Antes de publicar a gran escala, añadir controles de abuso y límites de solicitudes en la función.
- Los avances se guardan solo en el navegador; se migra el progreso anterior de `alas-cali-progress`.
