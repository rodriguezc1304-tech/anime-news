const CATEGORY_ICONS = {
  pelo: "💇‍♀️",
  lenceria: "👙",
  ropa: "👕",
  zapatillas: "👟",
  bolsos: "👜",
  perfumes: "🌸"
};

let STORE = null;
let PRODUCTS = [];
let activeCategory = "todos";
const compareSet = new Set();

function money(n) {
  return "RD$" + n.toLocaleString("es-DO");
}

function whatsappLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function selectedOptionsText(card) {
  const selects = card.querySelectorAll("select");
  const parts = [];
  selects.forEach(sel => parts.push(`${sel.dataset.label}: ${sel.value}`));
  return parts.length ? ` (${parts.join(", ")})` : "";
}

function renderFilters() {
  const row = document.getElementById("category-filters");
  STORE.categoriesUsed.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      activeCategory = cat.id;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts();
    });
    row.appendChild(btn);
  });

  row.querySelector('[data-category="todos"]').addEventListener("click", (e) => {
    activeCategory = "todos";
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    renderProducts();
  });
}

function priceHtml(product) {
  if (product.price == null) {
    return `<p class="price consultar">Consultar precio 💬</p>`;
  }
  if (product.priceMax) {
    return `<p class="price">${money(product.price)} - ${money(product.priceMax)}</p>`;
  }
  return `<p class="price">${money(product.price)}</p>`;
}

function renderProducts() {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  const list = PRODUCTS.filter(p => activeCategory === "todos" || p.category === activeCategory);
  const categoryLabel = id => STORE.categoriesUsed.find(c => c.id === id)?.label || id;

  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = product.id;

    let optionsHtml = "";
    Object.entries(product.options || {}).forEach(([label, values]) => {
      optionsHtml += `
        <div class="option-group">
          <label>${label}</label>
          <select data-label="${label}">
            ${values.map(v => `<option value="${v}">${v}</option>`).join("")}
          </select>
        </div>`;
    });

    card.innerHTML = `
      <div class="card-image">${CATEGORY_ICONS[product.category] || "🛍️"}</div>
      <span class="category-tag">${categoryLabel(product.category)}</span>
      <h2>${product.name}</h2>
      ${priceHtml(product)}
      ${product.note ? `<p class="note">${product.note}</p>` : ""}
      ${optionsHtml}
      <label class="compare-check">
        <input type="checkbox" class="compare-input" ${compareSet.has(product.id) ? "checked" : ""}>
        Comparar
      </label>
      <div class="card-actions">
        <a class="btn btn-ask" target="_blank">💬 Preguntar</a>
        <a class="btn btn-reserve" target="_blank">🛒 Reservar</a>
      </div>
    `;

    const askBtn = card.querySelector(".btn-ask");
    const reserveBtn = card.querySelector(".btn-reserve");

    function updateLinks() {
      const opts = selectedOptionsText(card);
      askBtn.href = whatsappLink(
        STORE.whatsapp,
        `Hola D'Fashion Cristal, tengo una pregunta sobre: ${product.name}${opts}`
      );
      reserveBtn.href = whatsappLink(
        STORE.whatsapp,
        `Hola, quiero reservar: ${product.name}${opts}`
      );
    }
    updateLinks();
    card.querySelectorAll("select").forEach(sel => sel.addEventListener("change", updateLinks));

    card.querySelector(".compare-input").addEventListener("change", (e) => {
      if (e.target.checked) {
        if (compareSet.size >= 3) {
          e.target.checked = false;
          alert("Puedes comparar hasta 3 productos a la vez.");
          return;
        }
        compareSet.add(product.id);
      } else {
        compareSet.delete(product.id);
      }
      updateCompareBar();
    });

    container.appendChild(card);
  });
}

function updateCompareBar() {
  const bar = document.getElementById("compare-bar");
  const count = document.getElementById("compare-count");
  if (compareSet.size >= 2) {
    bar.classList.add("visible");
    count.textContent = `${compareSet.size} productos seleccionados`;
  } else {
    bar.classList.remove("visible");
  }
}

function openCompareModal() {
  const modal = document.getElementById("compare-modal");
  const table = document.getElementById("compare-table");
  const items = PRODUCTS.filter(p => compareSet.has(p.id));

  const rows = [
    ["Producto", ...items.map(p => p.name)],
    ["Categoría", ...items.map(p => p.category)],
    ["Precio", ...items.map(p => p.price == null ? "Consultar" : money(p.price) + (p.priceMax ? ` - ${money(p.priceMax)}` : ""))],
  ];

  table.innerHTML = rows.map((row, i) => `
    <tr>${row.map(cell => `<${i === 0 ? "th" : "td"}>${cell}</${i === 0 ? "th" : "td"}>`).join("")}</tr>
  `).join("");

  modal.classList.add("visible");
}

function init() {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      STORE = data.store;
      PRODUCTS = data.products;
      STORE.categoriesUsed = data.categories;

      document.getElementById("store-name").textContent = STORE.name;
      document.getElementById("footer-store-name").textContent = STORE.name;
      document.getElementById("store-tagline").textContent = STORE.tagline;
      document.getElementById("store-address").textContent = `📍 ${STORE.address}`;
      document.getElementById("footer-address").textContent = STORE.address;
      document.querySelector("footer p:last-child").textContent = `© 2026 ${STORE.name}`;

      const waLink = whatsappLink(STORE.whatsapp, `Hola ${STORE.name}, quisiera más información.`);
      document.getElementById("whatsapp-float").href = waLink;
      document.getElementById("footer-whatsapp").href = waLink;

      renderFilters();
      renderProducts();
    });

  document.getElementById("compare-btn").addEventListener("click", openCompareModal);
  document.getElementById("compare-clear").addEventListener("click", () => {
    compareSet.clear();
    updateCompareBar();
    renderProducts();
  });
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("compare-modal").classList.remove("visible");
  });
}

init();
