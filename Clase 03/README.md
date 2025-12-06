# BabylonJS - Texturas locales

Proyecto mínimo para cargar texturas locales desde `assets/textures` y servir el proyecto con Vite o http-server.

## Instrucciones rápidas

1. **Descarga las texturas** desde fuentes públicas gratuitas:
   - [Wood texture](https://dl.polyhaven.com/file/ph-assets/Textures/jpg/1k/wood_floor_001/wood_floor_001_diff_1k.jpg) → guarda como `assets/textures/wood.jpg`
   - [Marble texture](https://dl.polyhaven.com/file/ph-assets/Textures/jpg/1k/marble_01/marble_01_diff_1k.jpg) → guarda como `assets/textures/marble.jpg`
   - [Metal texture](https://dl.polyhaven.com/file/ph-assets/Textures/jpg/1k/metal_plate/metal_plate_diff_1k.jpg) → guarda como `assets/textures/metal.jpg`
   - [Brick texture](https://dl.polyhaven.com/file/ph-assets/Textures/jpg/1k/brick_wall_001/brick_wall_001_diff_1k.jpg) → guarda como `assets/textures/brick.jpg`
   - [Grass texture](https://dl.polyhaven.com/file/ph-assets/Textures/jpg/1k/ground_003/ground_003_diff_1k.jpg) → guarda como `assets/textures/grass.jpg`

   O usa otras fuentes como [FreePBR](https://freepbr.com/) o [OpenGameArt](https://opengameart.org/).

2. **Instala dependencias**:

   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**:

   ```bash
   npm run dev
   ```
   Abre en navegador: `http://localhost:5173`

   O usa http-server:

   ```bash
   npm run serve
   ```
   Abre en navegador: `http://localhost:8080`

## Notas

- Las texturas deben estar en `assets/textures/` con los nombres exactos.
- Si cambias los nombres, actualiza las rutas en `src/scene.js`.
- Para producción: `npm run build` y `npm run preview`.
