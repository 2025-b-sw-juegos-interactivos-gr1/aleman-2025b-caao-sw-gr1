# 🛵 Uber Eats Delivery - Juego 3D con Babylon.js

## Descripción del Proyecto
Juego 3D desarrollado con **Babylon.js** donde el jugador controla una moto de delivery de Uber Eats. La mecánica principal consiste en recoger pedidos de múltiples restaurantes y entregarlos en diferentes casas de clientes. El juego incluye física realista con fricción, sistema de colisiones, cámara isométrica que sigue al vehículo, y un sistema de guía con flechas direccionales.

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **W** | Acelerar (hacia adelante) |
| **S** | Frenar / Reversa |
| **A** | Girar a la izquierda (solo con velocidad) |
| **D** | Girar a la derecha (solo con velocidad) |
| **ESPACIO** | Recoger / Entregar pedido |

## ✨ Características del Juego

- **Física realista**: Aceleración gradual, fricción natural y sistema de colisiones
- **Cámara isométrica**: Vista desde ángulo de 45° que sigue suavemente a la moto
- **Mapa expandido**: 120x120 unidades con calles y áreas verdes
- **4 Restaurantes**: Pizza Palace, Burger King, Sushi House, Taco Loco
- **6 Casas destino**: Diferentes colores y ubicaciones estratégicas
- **Sistema de guía**: Flecha direccional que apunta al objetivo actual
- **Velocímetro**: Muestra la velocidad actual en km/h
- **Distancia al destino**: Actualización en tiempo real
- **Modelos 3D**: Moto y bolsa de delivery en formato GLB
- **Texturas**: Asfalto, césped, ladrillos, tejas y más

## 🏗️ Estructura del Código

El código está organizado en **9 secciones principales**:

### Sección 1: Estilos CSS
- Estilos para el canvas de renderizado
- Panel de instrucciones (esquina superior izquierda)
- Panel de estado del juego (esquina superior derecha)
- Velocímetro (esquina inferior izquierda)
- Mensajes centrales animados
- Pantalla de carga

### Sección 2: Librerías de Babylon.js
- `babylon.js` - Motor principal de renderizado 3D
- `babylonjs.loaders.min.js` - Cargador de modelos externos (GLB/GLTF)

### Sección 3: Configuración Inicial
Variables de estado del juego:
- `paqueteEnMano`: Boolean que indica si el jugador tiene un pedido
- `entregasCompletadas`: Contador de entregas exitosas
- `inputMap`: Mapa de teclas presionadas
- `restauranteActual`: Referencia al restaurante actual
- `destinoActual`: Referencia a la casa destino

Constantes de física:
- `ACELERACION`: Tasa de aceleración (0.008)
- `FRENADO`: Tasa de frenado (0.015)
- `FRICCION`: Fricción natural (0.003)
- `VELOCIDAD_MAX`: Límite de velocidad (0.4)
- `VELOCIDAD_GIRO`: Velocidad de rotación (0.04)

### Sección 4: Función Principal `createScene()`

#### 4.1 Cámara y Luces
```javascript
// Cámara isométrica que sigue al jugador
const camera = new BABYLON.ArcRotateCamera(
    "camera", 
    -Math.PI / 4,      // Ángulo horizontal (45 grados)
    Math.PI / 4,       // Ángulo vertical (45 grados)
    35,                // Distancia de la cámara
    BABYLON.Vector3.Zero(), 
    scene
);
```
- **HemisphericLight**: Luz ambiental general
- **DirectionalLight**: Simula la luz del sol con sombras

#### 4.2 Texturas y Materiales
- Textura de asfalto para calles
- Textura de césped para áreas verdes
- Textura de ladrillo rojo (restaurantes)
- Textura de ladrillo beige (edificios)
- Textura de concreto (edificios modernos)
- Textura de tejas (techos)
- Textura de madera

#### 4.3 Crear el Escenario
- Suelo de 120x120 unidades con textura de asfalto
- Red de calles con líneas discontinuas amarillas
- 16 bloques de césped distribuidos simétricamente

#### 4.4 Sistema de Colisiones
```javascript
const crearEdificio = (nombre, x, z, ancho, alto, profundo, material) => {
    const edificio = BABYLON.MeshBuilder.CreateBox(nombre, {...}, scene);
    edificio.checkCollisions = true;
    edificiosColision.push({
        mesh: edificio,
        radioColision: Math.max(ancho, profundo) / 2 + 1.5
    });
    return edificio;
};
```

#### 4.5 Crear Restaurantes
```javascript
const datosRestaurantes = [
    { nombre: "🍕 Pizza Palace", x: -40, z: 40 },
    { nombre: "🍔 Burger King", x: 40, z: 40 },
    { nombre: "🍣 Sushi House", x: -40, z: -10 },
    { nombre: "🌮 Taco Loco", x: 40, z: -10 }
];
```
Cada restaurante incluye:
- Edificio con textura de ladrillo rojo
- Techo con textura de tejas
- Zona de recogida (círculo verde)
- Marcador flotante

#### 4.6 Crear Casas
6 casas con diferentes materiales y ubicaciones:
- Casa Roja, Azul, Verde, Amarilla
- Apartamento 1 y 2 (concreto)

#### 4.7 Cargar Modelo de Moto
```javascript
const resultado = await BABYLON.SceneLoader.ImportMeshAsync(
    "", RUTA_MODELOS, "moto.glb", scene
);
modeloMoto = resultado.meshes[0];
modeloMoto.parent = jugador;
```

#### 4.8 Cargar Modelo de Bolsa
Se cargan dos instancias de la bolsa:
- Una para mostrar en el punto de recogida del restaurante
- Una para mostrar en la moto cuando se recoge el pedido

#### 4.9 Flecha Guía Direccional
```javascript
// Calcular dirección hacia el objetivo
const direccion = objetivo.subtract(jugador.position);
const angulo = Math.atan2(direccion.x, direccion.z);
flechaGuia.rotation.y = angulo;
```
- **Verde**: Apunta al restaurante (sin pedido)
- **Amarilla**: Apunta a la casa destino (con pedido)

#### 4.10 Sistema de Input (Teclado)
```javascript
scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (evt) => { inputMap[evt.sourceEvent.key.toLowerCase()] = true; }
    )
);
```

#### 4.11 Mecánica de Recoger y Entregar
**Concepto clave: PARENTING**

Para **recoger** el paquete:
```javascript
paquete.parent = jugador;  // El paquete se mueve con el jugador
paquete.position = new BABYLON.Vector3(0, 1.2, -0.6);  // Posición relativa
paquete.setEnabled(true);
```

Para **entregar** el paquete:
```javascript
paquete.parent = null;  // Rompe la relación padre-hijo
paquete.setEnabled(false);  // Ocultar paquete
```

**Detección de proximidad:**
```javascript
const distancia = BABYLON.Vector3.Distance(jugador.position, restauranteActual.posicion);
if (distancia < 5) {
    // Permitir recoger/entregar
}
```

#### 4.12 Game Loop - Física del Vehículo
```javascript
scene.onBeforeRenderObservable.add(() => {
    // ACELERACIÓN
    if (inputMap["w"]) {
        velocidadActual += ACELERACION;
        if (velocidadActual > VELOCIDAD_MAX) velocidadActual = VELOCIDAD_MAX;
    }

    // FRICCIÓN NATURAL
    velocidadActual -= FRICCION * Math.sign(velocidadActual);

    // GIRO (proporcional a la velocidad)
    const factorGiro = Math.abs(velocidadActual) / VELOCIDAD_MAX;
    if (inputMap["a"]) jugador.rotation.y -= VELOCIDAD_GIRO * factorGiro;

    // VERIFICAR COLISIONES
    for (const edificio of edificiosColision) {
        if (distancia < edificio.radioColision) {
            velocidadActual *= -0.3; // Rebote
        }
    }

    // CÁMARA ISOMÉTRICA SIGUE AL JUGADOR
    camera.target = BABYLON.Vector3.Lerp(camera.target, jugador.position, 0.1);
});
```

### Sección 5: Funciones Fallback
- `crearMotoFallback()`: Crea moto básica si falla la carga del modelo
- `crearBolsaFallback()`: Crea bolsa básica si falla la carga del modelo
- `crearBolsaRestauranteFallback()`: Crea bolsa para punto de recogida

### Sección 6: Funciones de Selección
- `seleccionarNuevoRestaurante()`: Elige restaurante aleatorio
- `seleccionarNuevoDestino()`: Elige casa destino aleatoria
- `actualizarBolsaRestaurante()`: Posiciona la bolsa en el restaurante actual

### Sección 7: Sistema de Flecha Guía
- `actualizarFlechaGuia()`: Posiciona y rota la flecha hacia el objetivo

### Sección 8: Funciones de UI
- `actualizarCarga()`: Actualiza barra de progreso de carga
- `actualizarUI()`: Actualiza panel de estado
- `actualizarVelocimetro()`: Muestra velocidad en km/h
- `actualizarDistancia()`: Muestra distancia al objetivo
- `mostrarMensaje()`: Muestra mensajes centrales animados

### Sección 9: Inicialización del Juego
- Creación asíncrona de la escena
- Inicio del bucle de renderizado
- Manejo del redimensionamiento de ventana

## 📋 Requisitos Implementados

| Requisito | Implementación |
|-----------|----------------|
| ✅ Un Jugador | Moto de delivery con modelo 3D y física realista |
| ✅ Un Paquete | Bolsa de comida visible en restaurante y moto |
| ✅ Zona de Recogida | 4 zonas verdes en diferentes restaurantes |
| ✅ Zona de Entrega | 6 zonas amarillas en diferentes casas |
| ✅ Mecánica de Recogida | Parenting con tecla ESPACIO |
| ✅ Mecánica de Entrega | Unparenting y contador de puntos |
| ✅ Estado del Juego | Variables de estado + UI completa |
| ✅ Colisiones | Sistema de colisión con edificios |
| ✅ Cámara | Vista isométrica que sigue al jugador |

## 🎨 Características Visuales

- **Cámara isométrica**: Vista desde 45° que sigue suavemente la moto
- **Física con fricción**: El vehículo desacelera gradualmente
- **Sistema de colisiones**: Rebote al chocar con edificios
- **4 Restaurantes** con texturas distintivas
- **6 Casas destino** distribuidas estratégicamente
- **Edificios decorativos** sin overlapping
- **Flechas guía**: Verde (restaurante) / Amarilla (destino)
- **Bolsa visible**: En punto de recogida y en la moto
- **Velocímetro** en pantalla
- **Distancia al objetivo** en tiempo real
- Colores temáticos de Uber Eats (#06C167)
- Interfaz de usuario intuitiva

## 📁 Estructura de Archivos

```
Examen-01/
├── index.html          # Archivo principal del juego
├── README.md           # Documentación
├── models/
│   ├── moto.glb        # Modelo 3D de la moto
│   └── bolsa.glb       # Modelo 3D de la bolsa
└── textures/
    ├── asfalto.jpg     # Textura de calles
    ├── cesped.jpg      # Textura de áreas verdes
    ├── ladrillo_rojo.jpg
    ├── ladrillo_beige.jpg
    ├── concreto.jpg
    ├── tejas.jpg
    ├── madera.jpg
    ├── pared_azul.jpg
    └── pared_amarilla.jpg
```

## 🚀 Cómo Ejecutar

1. Abre el archivo `index.html` en un navegador web moderno (Chrome, Firefox, Edge)
2. Espera a que carguen los recursos (barra de progreso)
3. ¡Listo! Usa las teclas W, A, S, D para moverte y ESPACIO para interactuar

## 🛠️ Tecnologías Utilizadas

- **Babylon.js 6.x** - Motor de juegos 3D para web
- **WebGL** - Renderizado de gráficos 3D
- **HTML5** - Estructura del documento
- **CSS3** - Estilos y animaciones
- **JavaScript ES6+** - Lógica del juego (async/await)

---
**Autor:** Estudiante  
**Fecha:** Diciembre 2025  
**Materia:** Software - Gráficos 3D con Babylon.js
