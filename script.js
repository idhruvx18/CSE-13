/* =========================================================
   QuickCart — script.js
   Covers: Arrays, Functions, DOM Manipulation,
           Event Handling, Search Logic, Cart Logic
   ========================================================= */

/* ─────────────────────────────────────────────────────────
   ARRAYS
   products[] holds all catalog items.
   Each object has: id, name, category, price, emoji.
   emoji is used as the product "image" (no external assets).
   ───────────────────────────────────────────────────────── */
const products = [
  { id: 1,  name: "Wireless Headphones",    category: "Electronics",  price: 2499, emoji: "🎧" },
  { id: 2,  name: "Mechanical Keyboard",    category: "Electronics",  price: 3799, emoji: "⌨️" },
  { id: 3,  name: "Running Shoes",          category: "Footwear",     price: 1999, emoji: "👟" },
  { id: 4,  name: "Stainless Water Bottle", category: "Lifestyle",    price: 599,  emoji: "🍶" },
  { id: 5,  name: "Smart Watch",            category: "Electronics",  price: 5499, emoji: "⌚" },
  { id: 6,  name: "Yoga Mat",               category: "Fitness",      price: 849,  emoji: "🧘" },
  { id: 7,  name: "Desk Lamp",              category: "Home & Office", price: 999,  emoji: "🪔" },
  { id: 8,  name: "Leather Wallet",         category: "Accessories",  price: 749,  emoji: "👜" },
  { id: 9,  name: "Portable Charger",       category: "Electronics",  price: 1299, emoji: "🔋" },
  { id: 10, name: "Sunglasses",             category: "Accessories",  price: 1149, emoji: "🕶️" },
];

/* ─────────────────────────────────────────────────────────
   CART STATE
   cart[] stores objects: { ...product, qty }
   We mutate this array and re-render the sidebar on changes.
   ───────────────────────────────────────────────────────── */
let cart = [];

/* ─────────────────────────────────────────────────────────
   DOM MANIPULATION — grab elements once and reuse
   ───────────────────────────────────────────────────────── */
const productGrid    = document.getElementById("productGrid");
const cartItemsEl    = document.getElementById("cartItems");
const cartCountEl    = document.getElementById("cartCount");
const cartTotalEl    = document.getElementById("cartTotal");
const cartEmptyEl    = document.getElementById("cartEmpty");
const cartFooterEl   = document.getElementById("cartFooter");
const searchInput    = document.getElementById("searchInput");
const resultInfoEl   = document.getElementById("resultInfo");
const cartSidebar    = document.getElementById("cartSidebar");
const cartToggleBtn  = document.getElementById("cartToggleBtn");
const cartCloseBtn   = document.getElementById("cartCloseBtn");
const cartOverlay    = document.getElementById("cartOverlay");

/* ─────────────────────────────────────────────────────────
   FUNCTION: formatPrice
   Converts a number to Indian Rupee string, e.g. ₹2,499
   ───────────────────────────────────────────────────────── */
function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

/* ─────────────────────────────────────────────────────────
   FUNCTION: renderProducts
   DOM Manipulation — clears productGrid and injects fresh
   product cards for each item in the given list array.
   ───────────────────────────────────────────────────────── */
function renderProducts(list) {
  // Clear previous cards
  productGrid.innerHTML = "";

  // Handle empty search results
  if (list.length === 0) {
    productGrid.innerHTML = `
      <div class="no-results">
        <span>🔍</span>
        <p>No products match your search.</p>
      </div>`;
    resultInfoEl.textContent = "0 results";
    return;
  }

  // Update result count info text
  resultInfoEl.textContent =
    list.length === products.length ? "" : `${list.length} result${list.length !== 1 ? "s" : ""}`;

  // Arrays: iterate with forEach to build one card per product
  list.forEach(function (product) {
    // Check whether this product is already in the cart
    const inCart = cart.some(function (item) { return item.id === product.id; });

    // DOM Manipulation — build a card element programmatically
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;   // store id for event delegation

    card.innerHTML = `
      <div class="product-img-wrap">${product.emoji}</div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <p  class="product-name">${product.name}</p>
        <p  class="product-price">${formatPrice(product.price)}</p>
      </div>
      <button
        class="add-btn ${inCart ? "added" : ""}"
        data-id="${product.id}"
        aria-label="Add ${product.name} to cart"
      >${inCart ? "✓ Added" : "Add to Cart"}</button>`;

    productGrid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────────────
   FUNCTION: renderCart
   DOM Manipulation — rebuilds the entire cart sidebar
   based on the current cart[] array state.
   ───────────────────────────────────────────────────────── */
function renderCart() {
  // Clear current cart items (keep the empty-state div)
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    // Show empty state, hide footer total/checkout
    cartItemsEl.appendChild(cartEmptyEl);
    cartFooterEl.style.display = "none";
    return;
  }

  // Hide empty placeholder, show footer
  cartFooterEl.style.display = "flex";

  // Arrays: iterate cart to build each cart row
  cart.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.id;

    row.innerHTML = `
      <span class="cart-item-emoji">${item.emoji}</span>
      <div class="cart-item-details">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price * item.qty)}</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
      </div>
      <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>`;

    cartItemsEl.appendChild(row);
  });
}

/* ─────────────────────────────────────────────────────────
   FUNCTION: updateCartMeta
   DOM Manipulation — updates the cart count badge and
   the total price in the cart footer after every change.
   ───────────────────────────────────────────────────────── */
function updateCartMeta() {
  // Arrays: reduce to sum all qty values
  const totalQty = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);

  // Arrays: reduce to compute total price
  const totalPrice = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);

  // DOM: update badge number and visibility
  cartCountEl.textContent = totalQty;
  cartCountEl.classList.toggle("visible", totalQty > 0);

  // DOM: update total price text
  cartTotalEl.textContent = formatPrice(totalPrice);
}

/* ─────────────────────────────────────────────────────────
   CART LOGIC — addToCart
   Adds a product to cart[] or increments its qty.
   Then re-renders cart and refreshes product cards.
   ───────────────────────────────────────────────────────── */
function addToCart(productId) {
  // Arrays: find if already in cart
  const existing = cart.find(function (item) { return item.id === productId; });

  if (existing) {
    existing.qty += 1;                  // already present — just bump qty
  } else {
    // Arrays: find the product in the catalog
    const product = products.find(function (p) { return p.id === productId; });
    if (!product) return;
    cart.push({ ...product, qty: 1 });  // spread to avoid mutating the source object
  }

  renderCart();
  updateCartMeta();
  refreshAddButtons();   // visually mark the card button as "Added"
}

/* ─────────────────────────────────────────────────────────
   CART LOGIC — removeFromCart
   Removes a product entirely from cart[].
   ───────────────────────────────────────────────────────── */
function removeFromCart(productId) {
  // Arrays: filter out the item with the matching id
  cart = cart.filter(function (item) { return item.id !== productId; });

  renderCart();
  updateCartMeta();
  refreshAddButtons();   // reset card button state
}

/* ─────────────────────────────────────────────────────────
   CART LOGIC — changeQty
   Increments or decrements a cart item's quantity.
   Removes the item when qty would drop below 1.
   ───────────────────────────────────────────────────────── */
function changeQty(productId, delta) {
  const item = cart.find(function (i) { return i.id === productId; });
  if (!item) return;

  item.qty += delta;

  if (item.qty < 1) {
    removeFromCart(productId);   // delegate to remove for full cleanup
  } else {
    renderCart();
    updateCartMeta();
  }
}

/* ─────────────────────────────────────────────────────────
   FUNCTION: refreshAddButtons
   DOM Manipulation — after any cart change, find every
   "Add to Cart" button in the product grid and toggle its
   appearance based on whether its product is in the cart.
   ───────────────────────────────────────────────────────── */
function refreshAddButtons() {
  const buttons = productGrid.querySelectorAll(".add-btn");
  buttons.forEach(function (btn) {
    const id = parseInt(btn.dataset.id);
    const inCart = cart.some(function (item) { return item.id === id; });
    btn.classList.toggle("added", inCart);
    btn.textContent = inCart ? "✓ Added" : "Add to Cart";
  });
}

/* ─────────────────────────────────────────────────────────
   SEARCH LOGIC — filterProducts
   Converts query and product names to lowercase, then
   filters the products array to those whose name includes
   the query string. Returns the filtered array.
   ───────────────────────────────────────────────────────── */
function filterProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;            // empty query → show all

  return products.filter(function (p) {
    return p.name.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q);
  });
}

/* ─────────────────────────────────────────────────────────
   FUNCTION: openCart / closeCart
   Toggle the cart sidebar open/close state.
   ───────────────────────────────────────────────────────── */
function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";  // prevent background scroll
}
function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

/* ─────────────────────────────────────────────────────────
   EVENT HANDLING — Product Grid (Event Delegation)
   Instead of attaching a listener to every button,
   we listen on the parent grid and check the event target.
   This also works for cards rendered after page load.
   ───────────────────────────────────────────────────────── */
productGrid.addEventListener("click", function (event) {
  // Walk up the DOM to find the closest .add-btn
  const btn = event.target.closest(".add-btn");
  if (!btn) return;                         // clicked elsewhere on card

  const productId = parseInt(btn.dataset.id);
  addToCart(productId);
  openCart();   // auto-open cart when an item is added
});

/* ─────────────────────────────────────────────────────────
   EVENT HANDLING — Cart Sidebar (Event Delegation)
   One listener handles remove buttons and qty buttons.
   ───────────────────────────────────────────────────────── */
cartItemsEl.addEventListener("click", function (event) {
  // Remove button
  const removeBtn = event.target.closest(".remove-btn");
  if (removeBtn) {
    removeFromCart(parseInt(removeBtn.dataset.id));
    return;
  }

  // Quantity +/- buttons
  const qtyBtn = event.target.closest(".qty-btn");
  if (qtyBtn) {
    const id     = parseInt(qtyBtn.dataset.id);
    const action = qtyBtn.dataset.action;    // "inc" or "dec"
    changeQty(id, action === "inc" ? 1 : -1);
  }
});

/* ─────────────────────────────────────────────────────────
   EVENT HANDLING — Search Input
   'input' fires on every keystroke, giving live filtering.
   ───────────────────────────────────────────────────────── */
searchInput.addEventListener("input", function () {
  const filtered = filterProducts(searchInput.value);
  renderProducts(filtered);
});

/* ─────────────────────────────────────────────────────────
   EVENT HANDLING — Cart open/close triggers
   ───────────────────────────────────────────────────────── */
cartToggleBtn.addEventListener("click", function () {
  cartSidebar.classList.contains("open") ? closeCart() : openCart();
});
cartCloseBtn.addEventListener("click",  closeCart);
cartOverlay.addEventListener("click",   closeCart);

/* Close cart with Escape key */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeCart();
});

/* ─────────────────────────────────────────────────────────
   INITIALISE — render all products on page load
   ───────────────────────────────────────────────────────── */
renderProducts(products);
cartFooterEl.style.display = "none";   // hide footer until items are added
