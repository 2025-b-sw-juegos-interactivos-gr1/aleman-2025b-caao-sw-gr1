/**
 * CameraManager - Maneja la cámara que sigue a la moto
 * GAME FEEL: Camera shake para sensación de velocidad
 */
class CameraManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.camera = null;
        this.FOV_BASE = Math.PI / 3; // 60 grados
        this.FOV_MAX = Math.PI / 2.2; // 82 grados (más dramático)
        
        // Camera shake procedural
        this.shakeIntensity = 0;
        this.shakeOffset = { x: 0, y: 0, z: 0 };
        this.shakeTime = 0;
    }

    initialize(scene) {
        console.log("Inicializando CameraManager...");
        
        if (!this.gameManager.jugador) {
            console.error("Error: Jugador no existe al inicializar cámara");
            return null;
        }
        
        // Crear FollowCamera que sigue desde atrás de forma cinematográfica
        this.camera = new BABYLON.FollowCamera(
            "followCamera",
            new BABYLON.Vector3(0, 5, -10),
            scene
        );

        // Asignar el jugador como objetivo (lockedTarget)
        this.camera.lockedTarget = this.gameManager.jugador;

        // Configurar la cámara para seguimiento suave y dinámico
        this.camera.radius = 12; // Distancia detrás de la moto (más alejada para mejor perspectiva)
        this.camera.heightOffset = 5; // Altura sobre la moto (mayor para ver mejor el entorno)
        this.camera.rotationOffset = 180; // 180 grados = vista desde atrás
        this.camera.cameraAcceleration = 0.05; // Aceleración más suave para movimiento cinematográfico
        this.camera.maxCameraSpeed = 30; // Velocidad máxima aumentada para seguir bien a alta velocidad

        // FOV dinámico inicial
        this.camera.fov = this.FOV_BASE;

        // Adjuntar controles de la cámara al canvas
        this.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        console.log("✅ CameraManager inicializado correctamente");
        console.log("Cámara:", this.camera);
        return this.camera;
    }

    update(deltaTime) {
        if (!this.camera || !this.gameManager.jugador) return;

        // FOV dinámico basado en velocidad (aumenta linealmente con la velocidad)
        // VERTICAL SLICE: La urgencia aumenta visualmente con la velocidad
        const velocidadNorm = this.gameManager.getVelocidadNormalizada();
        const fovDinamico = this.FOV_BASE + (this.FOV_MAX - this.FOV_BASE) * velocidadNorm;
        
        // Suavizar la transición del FOV para efecto cinematográfico
        // Factor de interpolación adaptativo: más rápido al acelerar, más lento al frenar
        const lerpFactor = velocidadNorm > 0.5 ? 0.08 : 0.04;
        this.camera.fov = BABYLON.Scalar.Lerp(this.camera.fov, fovDinamico, lerpFactor);
        
        // Ajustar ligeramente la altura de la cámara con la velocidad para más dramatismo
        const heightOffset = 5 + velocidadNorm * 1.5; // Sube ligeramente a alta velocidad
        this.camera.heightOffset = BABYLON.Scalar.Lerp(this.camera.heightOffset, heightOffset, 0.03);
        
        // GAME FEEL: Camera Shake cuando velocidad > 0.8 (sutil)
        if (velocidadNorm > 0.8) {
            this.shakeIntensity = (velocidadNorm - 0.8) * 3; // Reducido de 5 a 3
            this.shakeTime += deltaTime * 20;
            
            // Shake procedural sutil usando senos
            this.shakeOffset.x = Math.sin(this.shakeTime * 2.1) * this.shakeIntensity * 0.08;
            this.shakeOffset.y = Math.sin(this.shakeTime * 1.7) * this.shakeIntensity * 0.05;
            this.shakeOffset.z = Math.sin(this.shakeTime * 2.3) * this.shakeIntensity * 0.08;
            
            // Aplicar shake a la posición de la cámara de forma muy sutil
            if (this.camera.position) {
                this.camera.position.x += this.shakeOffset.x * deltaTime * 0.5;
                this.camera.position.y += this.shakeOffset.y * deltaTime * 0.5;
                this.camera.position.z += this.shakeOffset.z * deltaTime * 0.5;
            }
        } else {
            // Reducir shake gradualmente cuando baja la velocidad
            this.shakeIntensity = BABYLON.Scalar.Lerp(this.shakeIntensity, 0, 0.1);
        }
    }
    
    /**
     * EVENTO: Llamado cuando hay una colisión para shake adicional
     */
    onCollision(impactForce) {
        this.shakeIntensity = Math.min(this.shakeIntensity + impactForce * 3, 2.0);
        this.shakeTime = 0; // Resetear para nuevo patrón
    }
}