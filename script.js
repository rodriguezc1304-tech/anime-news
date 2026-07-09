const CATEGORY_ART = {
  pelo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 12c-16 0-24 14-22 30 1 10-4 16-6 24 6-2 10-6 12-12 2 10 4 18 2 26 6-4 9-12 10-20 2 8 5 15 4 22 6-5 8-13 8-22 3 7 6 13 5 21 6-6 8-15 7-24 2-8-2-22-20-45z" fill="#5c3a21"/>
    <path d="M50 12c-16 0-24 14-22 30 1 10-4 16-6 24 6-2 10-6 12-12 2 10 4 18 2 26 6-4 9-12 10-20 2 8 5 15 4 22 6-5 8-13 8-22 3 7 6 13 5 21 6-6 8-15 7-24 2-8-2-22-20-45z" fill="none" stroke="#3d2716" stroke-width="1.5"/>
    <ellipse cx="50" cy="20" rx="10" ry="6" fill="#ff6f59"/>
  </svg>`,
  lenceria: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 30c14 6 22 18 24 32 2-4 4-8 4-8s2 4 4 8c2-14 10-26 24-32-2 16-10 26-20 30-3 1-5 5-8 5s-5-4-8-5c-10-4-18-14-20-30z" fill="#ff8fb3"/>
    <path d="M42 62l8 0" stroke="#e8608a" stroke-width="2" stroke-linecap="round"/>
    <path d="M4 34c4-6 8-8 10-8M96 34c-4-6-8-8-10-8" stroke="#0fb9b1" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  ropa: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 18l15 8 15-8 15 12-8 12-7-4v42H35V38l-7 4-8-12z" fill="#2ec4b6"/>
    <path d="M35 18l15 8 15-8" fill="none" stroke="#0e8f8f" stroke-width="2"/>
  </svg>`,
  zapatillas: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 65c0-6 6-10 14-12l20-6c6-2 10-6 16-10l14-8c6-4 12 0 12 6v10c10 2 14 8 14 14v6H10z" fill="#ff6f59"/>
    <path d="M10 65h80" stroke="#c94a36" stroke-width="3"/>
    <path d="M44 47l10 4M56 43l9 5" stroke="#ffffff" stroke-width="2"/>
  </svg>`,
  bolsos: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M36 36c0-10 6-16 14-16s14 6 14 16" fill="none" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/>
    <rect x="20" y="36" width="60" height="42" rx="4" fill="#ffb98a"/>
    <rect x="20" y="36" width="60" height="10" rx="2" fill="#ff9a5c"/>
    <rect x="46" y="50" width="8" height="8" rx="1.5" fill="#c9702f"/>
  </svg>`,
  perfumes: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="12" width="20" height="12" rx="3" fill="#0e8f8f"/>
    <rect x="45" y="6" width="10" height="8" rx="2" fill="#134e4a"/>
    <path d="M32 24h36l4 8v46a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V32z" fill="#93ecd3"/>
    <path d="M32 24h36l4 8H28z" fill="#5fd6c8"/>
  </svg>`
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
      <div class="card-image cat-${product.category}">${CATEGORY_ART[product.category] || ""}</div>
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
