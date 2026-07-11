const WHATSAPP_NUMERO = "18095551234"; // EDITAR: coloca aquí tu número de WhatsApp (código de país + número, sin espacios ni símbolos)

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || {};

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(valor) {
  return "RD$ " + valor.toLocaleString("es-DO");
}

function renderProductos() {
  const grid = document.getElementById("productos-grid");
  grid.innerHTML = productos.map(p => `
    <div class="producto-card">
      <div class="producto-emoji">${p.emoji}</div>
      <h3>${p.nombre}</h3>
      <p class="descripcion">${p.descripcion}</p>
      <p class="producto-precio">${formatearPrecio(p.precio)} / ${p.unidad}</p>
      <button class="add-btn" data-id="${p.id}">Agregar</button>
    </div>
  `).join("");

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => agregarAlCarrito(btn.dataset.id));
  });
}

function agregarAlCarrito(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  guardarCarrito();
  renderCarrito();
  abrirCarrito();
}

function cambiarCantidad(id, delta) {
  if (!carrito[id]) return;
  carrito[id] += delta;
  if (carrito[id] <= 0) {
    delete carrito[id];
  }
  guardarCarrito();
  renderCarrito();
}

function calcularTotal() {
  return Object.entries(carrito).reduce((total, [id, cantidad]) => {
    const producto = productos.find(p => p.id === id);
    return total + (producto ? producto.precio * cantidad : 0);
  }, 0);
}

function renderCarrito() {
  const contenedor = document.getElementById("cart-items");
  const entradas = Object.entries(carrito);

  if (entradas.length === 0) {
    contenedor.innerHTML = `<p class="empty-cart">Tu carrito está vacío 🧺</p>`;
  } else {
    contenedor.innerHTML = entradas.map(([id, cantidad]) => {
      const producto = productos.find(p => p.id === id);
      if (!producto) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <strong>${producto.emoji} ${producto.nombre}</strong>
            <span>${formatearPrecio(producto.precio)} / ${producto.unidad}</span>
          </div>
          <div class="cart-item-controls">
            <button data-id="${id}" data-delta="-1">−</button>
            <span>${cantidad}</span>
            <button data-id="${id}" data-delta="1">+</button>
          </div>
        </div>
      `;
    }).join("");

    contenedor.querySelectorAll("button[data-delta]").forEach(btn => {
      btn.addEventListener("click", () => {
        cambiarCantidad(btn.dataset.id, parseInt(btn.dataset.delta, 10));
      });
    });
  }

  document.getElementById("cart-total").innerText = formatearPrecio(calcularTotal());
  const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0);
  document.getElementById("cart-count").innerText = totalItems;
}

function abrirCarrito() {
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}

function cerrarCarrito() {
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

function generarMensajeWhatsApp() {
  const entradas = Object.entries(carrito);
  if (entradas.length === 0) return null;

  let lineas = ["¡Hola! Quisiera hacer el siguiente pedido de fruta:", ""];
  entradas.forEach(([id, cantidad]) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      lineas.push(`- ${producto.nombre} x${cantidad} (${producto.unidad}) — ${formatearPrecio(producto.precio * cantidad)}`);
    }
  });
  lineas.push("", `Total: ${formatearPrecio(calcularTotal())}`);

  return lineas.join("\n");
}

function pedirPorWhatsApp() {
  const mensaje = generarMensajeWhatsApp();
  if (!mensaje) {
    alert("Tu carrito está vacío. Agrega productos antes de pedir.");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

document.getElementById("cart-toggle").addEventListener("click", abrirCarrito);
document.getElementById("cart-close").addEventListener("click", cerrarCarrito);
document.getElementById("cart-overlay").addEventListener("click", cerrarCarrito);
document.getElementById("checkout-btn").addEventListener("click", pedirPorWhatsApp);
document.getElementById("telefono-contacto").innerText = "+" + WHATSAPP_NUMERO;

fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderProductos();
    renderCarrito();
  });
