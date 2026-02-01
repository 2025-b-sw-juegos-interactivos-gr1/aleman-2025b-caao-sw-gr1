/**
 * PhysicsManager - Maneja la física del vehículo con inercia refinada y maniobrabilidad
 * GAME FEEL: Sistema de colisiones punitivo con rebote vectorial
 */
class PhysicsManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.lastCollisionTime = 0;
        this.collisionCooldown = 0.5; // Segundos entre colisiones procesadas
    }

    update(deltaTime) {
        this.actualizarFisicaVehiculo();
        this.actualizarColisiones();
        this.actualizarLimitesMapa();
    }

    actualizarFisicaVehiculo() {
        const gm = this.gameManager;

        // Aceleración y frenado con inercia mejorada
        if (gm.inputMap["w"]) {
            gm.velocidadActual += gm.ACELERACION;
            if (gm.velocidadActual > gm.VELOCIDAD_MAX) gm.velocidadActual = gm.VELOCIDAD_MAX;
        } else if (gm.inputMap["s"]) {
            // Frenado más efectivo que aceleración en reversa
            const factorFrenado = gm.velocidadActual > 0 ? 2.0 : 1.0;
            gm.velocidadActual -= gm.FRENADO * factorFrenado;
            if (gm.velocidadActual < -gm.VELOCIDAD_MAX_REVERSA) gm.velocidadActual = -gm.VELOCIDAD_MAX_REVERSA;
        } else {
            // VERTICAL SLICE: Inercia refinada con deceleración progresiva más realista
            // La fricción aumenta cuadráticamente con la velocidad para simular resistencia del aire
            const velocidadNorm = Math.abs(gm.velocidadActual) / gm.VELOCIDAD_MAX;
            const friccionDinamica = gm.FRICCION * (1 + velocidadNorm * velocidadNorm * 0.8);
            
            if (gm.velocidadActual > 0) {
                gm.velocidadActual -= friccionDinamica;
                if (gm.velocidadActual < 0.001) gm.velocidadActual = 0; // Umbral para evitar drift
            } else if (gm.velocidadActual < 0) {
                gm.velocidadActual += friccionDinamica;
                if (gm.velocidadActual > -0.001) gm.velocidadActual = 0; // Umbral para evitar drift
            }
        }

        // Giro con maniobrabilidad que disminuye con velocidad (Riesgo vs Recompensa)
        // VERTICAL SLICE: A mayor velocidad, menor maniobrabilidad = giros más amplios y difíciles
        const maniobrabilidad = gm.getManiobrabilidad();
        const velocidadAbs = Math.abs(gm.velocidadActual);
        const velocidadNorm = gm.getVelocidadNormalizada();
        
        // Factor de giro que disminuye dramáticamente a alta velocidad
        // A velocidad máxima, la maniobrabilidad es mínima (30% de la base)
        const factorGiro = (velocidadAbs / gm.VELOCIDAD_MAX) * maniobrabilidad;
        
        // Añadir un factor de respuesta que hace los giros menos responsivos a alta velocidad
        const responsividad = 1 - velocidadNorm * 0.5; // 50% menos responsivo a velocidad máxima

        if (gm.inputMap["a"] && velocidadAbs > 0.01) {
            const giro = gm.VELOCIDAD_GIRO * factorGiro * responsividad * Math.sign(gm.velocidadActual);
            gm.jugador.rotation.y -= giro;
        }
        if (gm.inputMap["d"] && velocidadAbs > 0.01) {
            const giro = gm.VELOCIDAD_GIRO * factorGiro * responsividad * Math.sign(gm.velocidadActual);
            gm.jugador.rotation.y += giro;
        }

        // Calcular nueva posición
        const adelante = new BABYLON.Vector3(
            Math.sin(gm.jugador.rotation.y),
            0,
            Math.cos(gm.jugador.rotation.y)
        );

        const nuevaPosicion = gm.jugador.position.add(adelante.scale(gm.velocidadActual));

        // GAME FEEL: Verificar colisiones con respuesta punitiva
        let hayColision = false;
        let edificioColisionado = null;
        
        for (const edificio of gm.edificiosColision) {
            const distancia = Math.sqrt(
                Math.pow(nuevaPosicion.x - edificio.x, 2) +
                Math.pow(nuevaPosicion.z - edificio.z, 2)
            );

            if (distancia < edificio.radioColision) {
                hayColision = true;
                edificioColisionado = edificio;
                
                // FEEDBACK DE COLISIÓN: Reducción 50% velocidad instantánea (punitivo)
                const velocidadPrevia = Math.abs(gm.velocidadActual);
                gm.velocidadActual *= -0.5; // 50% reducción + rebote
                
                // Calcular vector normal de colisión
                const normalX = (gm.jugador.position.x - edificio.x) / distancia;
                const normalZ = (gm.jugador.position.z - edificio.z) / distancia;
                
                // Rebote vectorial opuesto a la normal
                const fuerzaRebote = velocidadPrevia * 0.3;
                gm.jugador.position.x += normalX * fuerzaRebote;
                gm.jugador.position.z += normalZ * fuerzaRebote;
                
                // EVENTO: Disparar onCollision para que otros managers reaccionen
                const currentTime = Date.now() / 1000;
                if (currentTime - this.lastCollisionTime > this.collisionCooldown) {
                    this.onCollisionDetected(velocidadPrevia, { x: normalX, z: normalZ });
                    this.lastCollisionTime = currentTime;
                }
                
                break;
            }
        }

        // Aplicar movimiento si no hay colisión
        if (!hayColision) {
            gm.jugador.position = nuevaPosicion;
        }
    }

    actualizarColisiones() {
        // Las colisiones ya se manejan en actualizarFisicaVehiculo
    }

    actualizarLimitesMapa() {
        const gm = this.gameManager;
        gm.jugador.position.x = Math.max(-gm.MAPA_LIMITE, Math.min(gm.MAPA_LIMITE, gm.jugador.position.x));
        gm.jugador.position.z = Math.max(-gm.MAPA_LIMITE, Math.min(gm.MAPA_LIMITE, gm.jugador.position.z));
    }
    
    /**
     * EVENTO: Colisión detectada - notifica a otros managers
     */
    onCollisionDetected(impactForce, normal) {
        const gm = this.gameManager;
        
        // Notificar a CameraManager para shake
        if (gm.cameraManager && gm.cameraManager.onCollision) {
            gm.cameraManager.onCollision(impactForce);
        }
        
        // Notificar a AudioManager para efecto de impacto
        if (gm.audioManager && gm.audioManager.onCollision) {
            gm.audioManager.onCollision(impactForce);
        }
        
        console.log(`💥 Colisión! Fuerza: ${impactForce.toFixed(2)}`);
    }
}