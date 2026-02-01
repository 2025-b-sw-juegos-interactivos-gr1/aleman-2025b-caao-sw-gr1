/**
 * UIManager - Observer que actualiza la interfaz de usuario
 */
class UIManager {
    constructor() {
        this.gameManager = GameManager.getInstance();
    }

    onDeliveryEvent(event, data) {
        switch (event) {
            case 'pedidoRecogido':
                this.mostrarMensaje(`🍔 ¡Pedido de ${data.restaurante}!\nLlévalo a: ${this.gameManager.destinoActual.nombre}`);
                this.actualizarUI();
                break;
            case 'pedidoEntregado':
                this.mostrarMensaje(`✅ ¡Entrega #${data.entregasCompletadas} completada!\n+${10 + data.entregasCompletadas * 2} puntos`);
                this.actualizarUI();
                break;
        }
    }

    actualizarUI() {
        const estadoPedido = document.getElementById("estadoPedido");
        const contadorEntregas = document.getElementById("contadorEntregas");
        const destinoUI = document.getElementById("destinoActual");

        if (this.gameManager.paqueteEnMano) {
            estadoPedido.textContent = "En camino 🛵";
            estadoPedido.className = "estado-valor tiene-pedido";
            destinoUI.textContent = this.gameManager.destinoActual ? this.gameManager.destinoActual.nombre : "---";
        } else {
            estadoPedido.textContent = "Sin recoger";
            estadoPedido.className = "estado-valor sin-pedido";
            destinoUI.textContent = this.gameManager.restauranteActual ? "→ " + this.gameManager.restauranteActual.nombre : "---";
        }

        contadorEntregas.textContent = this.gameManager.entregasCompletadas;
    }

    actualizarVelocimetro() {
        const velocidadKmh = Math.abs(Math.round(this.gameManager.velocidadActual * 250));
        document.getElementById("velocidadActual").textContent = velocidadKmh;
    }

    actualizarDistancia() {
        const distanciaUI = document.getElementById("distanciaDestino");
        if (!this.gameManager.jugador) return;

        let objetivo = null;
        if (!this.gameManager.paqueteEnMano && this.gameManager.restauranteActual) {
            objetivo = this.gameManager.restauranteActual.posicion;
        } else if (this.gameManager.paqueteEnMano && this.gameManager.destinoActual) {
            objetivo = this.gameManager.destinoActual.posicion;
        }

        if (objetivo) {
            const dist = Math.round(BABYLON.Vector3.Distance(this.gameManager.jugador.position, objetivo));
            distanciaUI.textContent = dist + " m";
        } else {
            distanciaUI.textContent = "---";
        }
    }

    mostrarMensaje(texto) {
        const mensaje = document.getElementById("mensajeCentral");
        mensaje.innerHTML = texto.replace(/\n/g, "<br>");
        mensaje.style.display = "block";

        setTimeout(() => {
            mensaje.style.display = "none";
        }, 3000);
    }

    actualizarCarga(porcentaje, texto) {
        document.getElementById("loadingProgress").style.width = porcentaje + "%";
        document.getElementById("loadingText").textContent = texto;
    }
}