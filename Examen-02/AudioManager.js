/**
 * AudioManager - Maneja el audio del juego con pitch dinámico
 * VERTICAL SLICE: Audio procedural con variación de pitch según velocidad
 */
class AudioManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
        this.scene = null;
        this.engineSound = null;
        this.basePitch = 0.8; // Pitch base más bajo para mejor rango
        this.maxPitch = 2.8; // Mayor rango para efecto más dramático
        this.baseFrequency = 120; // Frecuencia base del motor más grave
        this.isInitialized = false;
        this.currentPitch = this.basePitch; // Track current pitch para suavizado
    }

    initialize(scene) {
        this.scene = scene;
        this.createEngineSound();
    }

    createEngineSound() {
        try {
            // Crear un sonido procedural para el motor
            if (BABYLON.Engine.audioEngine && BABYLON.Engine.audioEngine.unlocked) {
                const audioContext = BABYLON.Engine.audioEngine.audioContext;
                if (audioContext && audioContext.state === 'running') {
                    // Crear oscilador para simular motor
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    // Configurar oscilador con forma de onda cuadrada para sonido de motor
                    oscillator.type = 'sawtooth'; // Sonido más parecido a un motor
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.setValueAtTime(this.baseFrequency, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // Volumen bajo

                    oscillator.start();
                    this.engineSound = { oscillator, gainNode, audioContext };
                    this.isInitialized = true;
                    console.log("✅ Audio del motor inicializado");
                }
            }
        } catch (error) {
            console.warn("No se pudo inicializar el audio:", error);
        }
    }

    update(deltaTime) {
        if (!this.isInitialized || !this.engineSound) return;

        try {
            const velocidadNorm = this.gameManager.getVelocidadNormalizada();
            
            // FEEDBACK DE AUDIO: Pitch aumenta linealmente con la velocidad (FEEL)
            const targetPitch = this.basePitch + (this.maxPitch - this.basePitch) * velocidadNorm;
            
            // Suavizar el cambio de pitch para transiciones más naturales
            // Pitch cambia más rápido al acelerar, más lento al frenar (más realista)
            const lerpFactor = velocidadNorm > this.currentPitch ? 0.12 : 0.06;
            this.currentPitch = BABYLON.Scalar.Lerp(this.currentPitch, targetPitch, lerpFactor);
            
            // Volumen también aumenta con la velocidad para reforzar sensación
            const targetVolume = 0.06 + velocidadNorm * 0.08;
            const currentVolume = this.engineSound.gainNode.gain.value;
            const newVolume = BABYLON.Scalar.Lerp(currentVolume, targetVolume, 0.1);

            if (this.engineSound.oscillator && this.engineSound.audioContext) {
                const currentTime = this.engineSound.audioContext.currentTime;
                
                // Actualizar frecuencia (pitch) suavemente con rampa para evitar clicks
                this.engineSound.oscillator.frequency.linearRampToValueAtTime(
                    this.baseFrequency * this.currentPitch,
                    currentTime + 0.05
                );
                
                // Actualizar volumen suavemente
                this.engineSound.gainNode.gain.linearRampToValueAtTime(newVolume, currentTime + 0.05);
            }
        } catch (error) {
            console.warn("Error actualizando audio:", error);
        }
    }

    dispose() {
        if (this.engineSound) {
            try {
                if (this.engineSound.oscillator) {
                    this.engineSound.oscillator.stop();
                    this.engineSound.oscillator.disconnect();
                }
                if (this.engineSound.gainNode) {
                    this.engineSound.gainNode.disconnect();
                }
            } catch (error) {
                console.warn("Error al limpiar audio:", error);
            }
            this.engineSound = null;
            this.isInitialized = false;
        }
    }
    
    /**
     * EVENTO: Respuesta de audio a colisiones
     */
    onCollision(impactForce) {
        if (!this.isInitialized || !this.engineSound) return;
        
        try {
            const audioContext = this.engineSound.audioContext;
            if (!audioContext) return;
            
            // Crear un burst de ruido blanco para simular impacto
            const bufferSize = audioContext.sampleRate * 0.1; // 100ms
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generar ruido con decay
            for (let i = 0; i < bufferSize; i++) {
                const decay = 1 - (i / bufferSize);
                data[i] = (Math.random() * 2 - 1) * impactForce * 0.3 * decay;
            }
            
            // Reproducir el impacto
            const source = audioContext.createBufferSource();
            const impactGain = audioContext.createGain();
            source.buffer = buffer;
            source.connect(impactGain);
            impactGain.connect(audioContext.destination);
            impactGain.gain.setValueAtTime(Math.min(impactForce * 0.5, 0.3), audioContext.currentTime);
            source.start();
        } catch (error) {
            console.warn("Error en audio de colisión:", error);
        }
    }
}