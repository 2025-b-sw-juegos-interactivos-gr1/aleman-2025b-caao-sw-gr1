/**
 * DeliveryManager - Observer Subject que maneja la lógica de entregas
 */
class DeliveryManager {
    constructor() {
        this.observers = [];
        this.gameManager = GameManager.getInstance();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(event, data) {
        this.observers.forEach(observer => {
            if (typeof observer.onDeliveryEvent === 'function') {
                observer.onDeliveryEvent(event, data);
            }
        });
    }

    intentarRecogerPedido() {
        if (this.gameManager.paqueteEnMano || !this.gameManager.restauranteActual) {
            return false;
        }

        const distancia = BABYLON.Vector3.Distance(
            this.gameManager.jugador.position,
            this.gameManager.restauranteActual.posicion
        );

        if (distancia < 5) {
            this.recogerPedido();
            return true;
        }
        return false;
    }

    recogerPedido() {
        console.log("🍔 ¡Pedido recogido!");

        // Ocultar bolsa del restaurante
        if (this.gameManager.bolsaEnRestaurante) {
            this.gameManager.bolsaEnRestaurante.setEnabled(false);
        }

        // Mostrar bolsa en la moto
        this.gameManager.paquete.parent = this.gameManager.jugador;
        this.gameManager.paquete.position = new BABYLON.Vector3(0, 1.2, -0.6);
        this.gameManager.paquete.rotation = new BABYLON.Vector3(0, 0, 0);
        this.gameManager.paquete.setEnabled(true);

        if (this.gameManager.modeloBolsa) {
            this.gameManager.modeloBolsa.setEnabled(true);
        }

        this.gameManager.paqueteEnMano = true;
        this.seleccionarNuevoDestino();

        this.notify('pedidoRecogido', {
            restaurante: this.gameManager.restauranteActual.nombre
        });
    }

    intentarEntregarPedido() {
        if (!this.gameManager.paqueteEnMano || !this.gameManager.destinoActual) {
            return false;
        }

        const distancia = BABYLON.Vector3.Distance(
            this.gameManager.jugador.position,
            this.gameManager.destinoActual.posicion
        );

        if (distancia < 5) {
            this.entregarPedido();
            return true;
        }
        return false;
    }

    entregarPedido() {
        console.log("✅ ¡Pedido entregado!");

        this.gameManager.paquete.parent = null;
        this.gameManager.paquete.setEnabled(false);
        this.gameManager.destinoActual.marcador.isVisible = false;

        this.gameManager.paqueteEnMano = false;
        this.gameManager.entregasCompletadas++;

        // Crear partículas de celebración
        this.gameManager.particleManager.createDeliveryParticles(
            this.gameManager.destinoActual.posicion
        );

        this.notify('pedidoEntregado', {
            destino: this.gameManager.destinoActual.nombre,
            entregasCompletadas: this.gameManager.entregasCompletadas
        });

        // Actualización inmediata del objetivo para mejor feedback
        this.gameManager.destinoActual = null;
        this.seleccionarNuevoRestaurante();
        this.gameManager.particleManager.actualizarBolsaRestaurante();
    }

    seleccionarNuevoRestaurante() {
        const index = Math.floor(Math.random() * this.gameManager.restaurantes.length);
        this.gameManager.restauranteActual = this.gameManager.restaurantes[index];
        console.log("📍 Nuevo pedido en: " + this.gameManager.restauranteActual.nombre);
        this.gameManager.particleManager.actualizarBolsaRestaurante();
    }

    seleccionarNuevoDestino() {
        const index = Math.floor(Math.random() * this.gameManager.casas.length);
        this.gameManager.destinoActual = this.gameManager.casas[index];
        this.gameManager.destinoActual.marcador.isVisible = true;
        console.log("🏠 Entregar en: " + this.gameManager.destinoActual.nombre);
    }
}