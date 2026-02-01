/**
 * GameManager - Singleton que maneja el estado global del juego
 * ARQUITECTURA: Implementación estricta del patrón Singleton
 */
class GameManager {
    static instance = null;

    constructor() {
        // Prevenir múltiples instancias
        if (GameManager.instance) {
            throw new Error("GameManager ya está inicializado. Use GameManager.getInstance()");
        }
        GameManager.instance = this;

        this.scene = null;
        this.engine = null;
        this.jugador = null;
        this.modeloMoto = null;
        this.paquete = null;
        this.modeloBolsa = null;
        this.bolsaEnRestaurante = null;
        this.flechaGuia = null;
        this.restaurantes = [];
        this.casas = [];
        this.edificiosColision = [];

        // Estado del juego
        this.paqueteEnMano = false;
        this.entregasCompletadas = 0;
        this.inputMap = {};
        this.restauranteActual = null;
        this.destinoActual = null;

        // Física del vehículo
        this.velocidadActual = 0;
        this.ACELERACION = 0.0015;
        this.FRENADO = 0.0015;
        this.FRICCION = 0.003;
        this.VELOCIDAD_MAX = 0.2;
        this.VELOCIDAD_MAX_REVERSA = 0.15;
        this.VELOCIDAD_GIRO = 0.04;
        this.MANIOBRABILIDAD_BASE = 1.0;

        // Mapa
        this.MAPA_TAMAÑO = 120;
        this.MAPA_LIMITE = this.MAPA_TAMAÑO / 2 - 5;

        // Assets
        this.RUTA_TEXTURAS = "./textures/";
        this.RUTA_MODELOS = "./models/";

        // Managers
        this.deliveryManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.physicsManager = null;
        this.particleManager = null;
        this.audioManager = null;
    }

    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    initialize(engine, scene) {
        this.engine = engine;
        this.scene = scene;

        // Inicializar managers
        this.deliveryManager = new DeliveryManager();
        this.uiManager = new UIManager();
        this.cameraManager = new CameraManager();
        this.physicsManager = new PhysicsManager();
        this.particleManager = new ParticleManager();
        this.audioManager = new AudioManager();

        // Suscribir UIManager a eventos de DeliveryManager
        this.deliveryManager.subscribe(this.uiManager);
    }

    update(deltaTime) {
        this.physicsManager.update(deltaTime);
        this.cameraManager.update(deltaTime);
        this.audioManager.update(deltaTime);
    }

    getVelocidadNormalizada() {
        return Math.abs(this.velocidadActual) / this.VELOCIDAD_MAX;
    }

    getManiobrabilidad() {
        // Disminuye con la velocidad para mayor dificultad
        // A velocidad máxima, la maniobrabilidad cae al 30% (giros muy amplios)
        const velocidadNorm = this.getVelocidadNormalizada();
        return this.MANIOBRABILIDAD_BASE * (1 - velocidadNorm * 0.7);
    }

    /**
     * REFACTORIZACIÓN: Mover funciones auxiliares al GameManager
     * para eliminar dependencias globales
     */
    crearMotoFallback(scene) {
        const matVehiculo = new BABYLON.StandardMaterial("matVehiculo", scene);
        matVehiculo.diffuseColor = new BABYLON.Color3(0.02, 0.75, 0.4);
        
        const matRuedas = new BABYLON.StandardMaterial("matRuedas", scene);
        matRuedas.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const cuerpo = BABYLON.MeshBuilder.CreateBox("cuerpoMoto", {
            width: 0.8, height: 0.5, depth: 2
        }, scene);
        cuerpo.position = new BABYLON.Vector3(0, 0.5, 0);
        cuerpo.material = matVehiculo;
        cuerpo.parent = this.jugador;

        const caja = BABYLON.MeshBuilder.CreateBox("cajaDelivery", {
            width: 1, height: 0.8, depth: 0.8
        }, scene);
        caja.position = new BABYLON.Vector3(0, 0.9, -0.8);
        caja.material = matVehiculo;
        caja.parent = this.jugador;

        const rueda1 = BABYLON.MeshBuilder.CreateCylinder("rueda1", {
            diameter: 0.5, height: 0.2
        }, scene);
        rueda1.position = new BABYLON.Vector3(0, 0.25, 0.8);
        rueda1.rotation.z = Math.PI / 2;
        rueda1.material = matRuedas;
        rueda1.parent = this.jugador;

        const rueda2 = BABYLON.MeshBuilder.CreateCylinder("rueda2", {
            diameter: 0.5, height: 0.2
        }, scene);
        rueda2.position = new BABYLON.Vector3(0, 0.25, -0.7);
        rueda2.rotation.z = Math.PI / 2;
        rueda2.material = matRuedas;
        rueda2.parent = this.jugador;
    }

    crearBolsaFallback(scene, material) {
        this.modeloBolsa = BABYLON.MeshBuilder.CreateBox("bolsaFallback", {
            width: 0.6, height: 0.7, depth: 0.5
        }, scene);
        
        const matBrown = new BABYLON.StandardMaterial("matBrown", scene);
        matBrown.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        
        this.modeloBolsa.material = matBrown;
        this.modeloBolsa.parent = this.paquete;
    }
    
    crearBolsaRestauranteFallback(scene, material) {
        this.bolsaEnRestaurante = BABYLON.MeshBuilder.CreateBox("bolsaRestFallback", {
            width: 0.8, height: 0.9, depth: 0.6
        }, scene);
        
        const matBrown = new BABYLON.StandardMaterial("matBrownRest", scene);
        matBrown.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        
        this.bolsaEnRestaurante.material = matBrown;
        this.bolsaEnRestaurante.position.y = 0.5;
    }

    actualizarFlechaGuia() {
        if (!this.jugador || !this.flechaGuia) return;

        let objetivo = null;

        if (!this.paqueteEnMano && this.restauranteActual) {
            objetivo = this.restauranteActual.posicion;
            this.flechaGuia.getChildren().forEach(child => {
                if (child.material) {
                    child.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                    child.material.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
                }
            });
        } else if (this.paqueteEnMano && this.destinoActual) {
            objetivo = this.destinoActual.posicion;
            this.flechaGuia.getChildren().forEach(child => {
                if (child.material) {
                    child.material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                    child.material.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0);
                }
            });
        }

        if (objetivo) {
            this.flechaGuia.position.x = this.jugador.position.x;
            this.flechaGuia.position.z = this.jugador.position.z;
            this.flechaGuia.position.y = 2.5;

            const direccion = objetivo.subtract(this.jugador.position);
            const angulo = Math.atan2(direccion.x, direccion.z);
            this.flechaGuia.rotation.y = angulo;

            this.flechaGuia.setEnabled(true);
        } else {
            this.flechaGuia.setEnabled(false);
        }
    }
}