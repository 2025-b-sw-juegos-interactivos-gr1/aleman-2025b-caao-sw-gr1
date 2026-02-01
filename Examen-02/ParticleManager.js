/**
 * ParticleManager - Maneja efectos de partículas
 */
class ParticleManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.scene = null;
    }

    initialize(scene) {
        this.scene = scene;
    }

    createDeliveryParticles(position) {
        if (!this.scene) {
            console.warn("Scene no inicializada en ParticleManager");
            return;
        }

        // VERTICAL SLICE: Sistema de partículas verde para estallido de celebración (JUICE)
        const particleSystem = new BABYLON.ParticleSystem("deliveryParticles", 500, this.scene);

        // Crear una textura circular para las partículas
        const particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png", 
            this.scene
        );
        particleSystem.particleTexture = particleTexture;

        // Posición del emisor (en el punto de entrega)
        particleSystem.emitter = position.clone();
        particleSystem.emitter.y += 2;

        // FEEDBACK VISUAL: Configuración de colores - estallido verde brillante ultra impactante
        particleSystem.color1 = new BABYLON.Color4(0.3, 1, 0.3, 1); // Verde brillante intenso
        particleSystem.color2 = new BABYLON.Color4(0, 1, 0.4, 1); // Verde neón
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0.7, 0.2, 0); // Fade a transparente con tinte verde

        // Tamaño de partículas más grande para efecto "juice" más visible
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.9;

        // Vida de las partículas
        particleSystem.minLifeTime = 0.6;
        particleSystem.maxLifeTime = 1.8;

        // Tasa de emisión muy alta para estallido espectacular
        particleSystem.emitRate = 400;

        // Dirección de emisión explosiva (360 grados) más dramática
        particleSystem.direction1 = new BABYLON.Vector3(-3, 3, -3);
        particleSystem.direction2 = new BABYLON.Vector3(3, 6, 3);

        // Potencia de emisión aumentada para estallido más impactante
        particleSystem.minEmitPower = 6;
        particleSystem.maxEmitPower = 12;

        // Gravedad para que las partículas caigan de forma más natural
        particleSystem.gravity = new BABYLON.Vector3(0, -12, 0);

        particleSystem.updateSpeed = 0.01;

        // Blending aditivo para efecto brillante y luminoso
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        // Añadir rotación a las partículas para más dinamismo
        particleSystem.minAngularSpeed = -Math.PI;
        particleSystem.maxAngularSpeed = Math.PI;

        // Iniciar emisión por tiempo limitado (estallido rápido y contundente)
        particleSystem.start();
        
        setTimeout(() => {
            particleSystem.stop();
            // Limpiar el sistema después de que todas las partículas mueran
            setTimeout(() => {
                particleSystem.dispose();
            }, 2500);
        }, 600); // Emisión por 0.6 segundos para efecto más prolongado y visible
        
        console.log("✨ ¡Estallido de partículas verdes creado!");
    }

    actualizarBolsaRestaurante() {
        if (this.gameManager.bolsaEnRestaurante && this.gameManager.restauranteActual) {
            this.gameManager.bolsaEnRestaurante.position = this.gameManager.restauranteActual.posicion.clone();
            this.gameManager.bolsaEnRestaurante.position.y = 0.5;
            this.gameManager.bolsaEnRestaurante.setEnabled(true);
            console.log("📦 Bolsa posicionada en: " + this.gameManager.restauranteActual.nombre);
        }
    }
}