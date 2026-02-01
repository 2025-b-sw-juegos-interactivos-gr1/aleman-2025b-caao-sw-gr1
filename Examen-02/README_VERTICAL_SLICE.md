# 🛵 Uber Eats Delivery - Vertical Slice Técnico v5.0

Un juego de entregas 3D desarrollado con **Babylon.js** que implementa arquitectura de software profesional, física realista y feedback visual impactante.

## 🏗️ Arquitectura de Software

### Patrón Singleton Estricto
- **GameManager**: Implementa un Singleton estricto que previene múltiples instancias
- Control centralizado del estado global del juego
- Acceso único a través de `GameManager.getInstance()`

### Patrón Observer
- **DeliveryManager**: Actúa como Subject notificando eventos de entrega
- **UIManager**: Observer suscrito que actualiza el HUD sin acoplamiento directo
- Eventos: `pedidoRecogido`, `pedidoEntregado`

### Separación de Responsabilidades
Cada manager tiene una responsabilidad única y bien definida:

| Manager | Responsabilidad |
|---------|----------------|
| **GameManager** | Estado global, coordinación de managers |
| **DeliveryManager** | Lógica de recogida y entrega de pedidos |
| **UIManager** | Actualización de interfaz de usuario |
| **CameraManager** | Control de cámara dinámica y FOV |
| **PhysicsManager** | Física del vehículo e inercia |
| **ParticleManager** | Efectos visuales de partículas |
| **AudioManager** | Audio procedural del motor |

## 🎥 Cámara Dinámica

### FollowCamera Cinematográfica
- Seguimiento suave desde atrás de la moto
- Radio: 12 unidades para perspectiva amplia
- Altura: 5 unidades con ajuste dinámico
- Aceleración suave: 0.05 para movimiento cinematográfico

### FOV Dinámico
- **FOV Base**: 60° (π/3)
- **FOV Máximo**: 82° (π/2.2) a velocidad máxima
- Incremento **lineal** con la velocidad
- Interpolación adaptativa:
  - Más rápida al acelerar (0.08)
  - Más lenta al frenar (0.04)
- **Efecto**: Sensación de urgencia visual que aumenta con la velocidad

## 🏍️ Física y Manejo (Feel)

### Inercia Refinada
- Deceleración progresiva con fricción dinámica cuadrática
- Resistencia del aire simulada: `fricción * (1 + velocidad² * 0.8)`
- Umbral de detención para evitar drift (0.001)
- Frenado 2x más efectivo que aceleración en reversa

### Sistema de Maniobrabilidad (Riesgo vs Recompensa)
La maniobrabilidad disminuye dramáticamente con la velocidad:

```javascript
Maniobrabilidad = Base * (1 - velocidadNorm * 0.7)
```

- **A velocidad baja**: Giros precisos y responsivos
- **A velocidad máxima**: Maniobrabilidad cae al 30%
  - Giros más amplios y difíciles
  - 50% menos responsividad
  - Mayor riesgo de colisión

**Mecánica de Riesgo vs Recompensa**: 
- Alta velocidad = entregas rápidas pero control reducido
- Baja velocidad = control total pero entregas lentas

## ✨ Feedback Visual y Sonoro (Juice)

### Sistema de Partículas
Estallido verde brillante al completar entregas:

- **500 partículas** con emisión explosiva
- Colores verde neón brillante (RGBA: 0.3, 1, 0.3, 1)
- Tamaño: 0.3 - 0.9 unidades
- Potencia: 6-12 unidades (estallido impactante)
- Duración: 0.6 segundos de emisión
- Gravedad aumentada (-12) para caída natural
- Rotación angular para dinamismo
- Blend mode aditivo para efecto luminoso

### Audio Procedural
Motor sintético con variación de pitch:

- **Oscilador**: Onda sawtooth (sonido de motor)
- **Pitch Base**: 0.8 (120 Hz)
- **Pitch Máximo**: 2.8 a velocidad máxima
- **Variación**: Lineal con interpolación suave
  - Acelera rápido (lerp 0.12)
  - Desacelera lento (lerp 0.06)
- **Volumen**: 0.06 - 0.14 según velocidad
- Transiciones suaves con `linearRampToValueAtTime`

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **W** | Acelerar |
| **S** | Frenar / Reversa |
| **A/D** | Girar (maniobrabilidad variable) |
| **ESPACIO** | Recoger / Entregar pedido |

## 📊 Mecánicas de Juego

### Ciclo de Entrega
1. **Pickup**: Navega al restaurante marcado (flecha verde)
2. **Recogida**: Presiona ESPACIO cerca del restaurante
3. **Delivery**: Navega a la casa destino (flecha amarilla)
4. **Entrega**: Presiona ESPACIO cerca de la casa
5. **Recompensa**: Partículas verdes + puntos incrementales

### Sistema de Puntuación
- Puntos por entrega: `10 + (entregasCompletadas * 2)`
- Incremento progresivo por entregas sucesivas

## 🔧 Implementación Técnica

### Sin Variables Globales
Todo el código está encapsulado en clases y managers:
- ✅ Funciones auxiliares movidas a GameManager
- ✅ Estado compartido a través de Singleton
- ✅ Comunicación mediante patrón Observer
- ✅ Código modular y mantenible

### Optimizaciones
- Pooling de partículas (dispose automático)
- Interpolación Lerp para transiciones suaves
- Update loop centralizado en GameManager
- Carga asíncrona de assets con progreso

## 🚀 Cómo Ejecutar

```bash
# Servidor local (Python)
python -m http.server 8000

# Abrir en navegador
http://localhost:8000
```

### Requisitos
- Navegador moderno con WebGL 2.0
- Audio habilitado para efectos de sonido

## 📁 Estructura de Archivos

```
Examen-02/
├── index.html              # HTML y lógica de escena
├── GameManager.js          # Singleton, estado global
├── DeliveryManager.js      # Observer Subject, lógica de entregas
├── UIManager.js            # Observer, actualización de UI
├── CameraManager.js        # Cámara dinámica, FOV
├── PhysicsManager.js       # Física, inercia, maniobrabilidad
├── ParticleManager.js      # Efectos de partículas
├── AudioManager.js         # Audio procedural
├── textures/               # Texturas del juego
├── models/                 # Modelos 3D (GLB)
└── README.md              # Este archivo
```

## 🎯 Características del Vertical Slice

### ✅ Arquitectura
- [x] GameManager como Singleton estricto
- [x] DeliveryManager como Observer Subject
- [x] UIManager suscrito a eventos sin acoplamiento

### ✅ Cámara Dinámica
- [x] FollowCamera con seguimiento desde atrás
- [x] FOV aumenta linealmente con velocidad
- [x] Sensación de urgencia visual

### ✅ Físicas y Manejo
- [x] Inercia refinada con deceleración progresiva
- [x] Maniobrabilidad que disminuye con velocidad
- [x] Mecánica Riesgo vs Recompensa implementada

### ✅ Feedback Visual (Juice)
- [x] Partículas verdes brillantes en dropoffs
- [x] Pitch del motor varía con velocidad
- [x] Transiciones suaves y naturales

### ✅ Refactorización
- [x] Código modular sin variables globales
- [x] Managers con responsabilidades únicas
- [x] Arquitectura escalable y mantenible

## 👨‍💻 Desarrollo

Desarrollado siguiendo principios de:
- **SOLID**: Responsabilidad única, Open/Closed
- **Design Patterns**: Singleton, Observer
- **Clean Code**: Nombres descriptivos, funciones pequeñas
- **Game Feel**: Juice, feedback inmediato, respuesta satisfactoria

---

**Versión**: 5.0 - Vertical Slice Técnico  
**Engine**: Babylon.js 6.x  
**Patrones**: Singleton, Observer  
**Estado**: ✅ Completo
