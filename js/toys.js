// ═══════════════════════════════════════════════════════
//  PEHCHAN TOYS — JavaScript
// ═══════════════════════════════════════════════════════

// ─── Product Data ────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Remote Control Cars
  { id: 1,  name: "Speed Racer RC Car",   price: 24.99, category: "rc-cars",     rating: 4.5, reviews: 128, label: "New",  colors: ["red","blue"],             emoji: "🏎",  bg: "linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  { id: 2,  name: "Monster Truck RC",     price: 34.99, category: "rc-cars",     rating: 4.8, reviews: 95,  label: "Sale", colors: ["green","black"],          emoji: "🚙",  bg: "linear-gradient(135deg,#56AB2F,#A8E063)" },
  { id: 3,  name: "Formula One RC",       price: 29.99, category: "rc-cars",     rating: 4.3, reviews: 67,  label: null,   colors: ["red","white"],            emoji: "🏎",  bg: "linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { id: 4,  name: "Off-road RC Buggy",    price: 27.99, category: "rc-cars",     rating: 4.6, reviews: 84,  label: "New",  colors: ["orange","yellow"],        emoji: "🚐",  bg: "linear-gradient(135deg,#F7971E,#FFD200)" },
  // Helicopters
  { id: 5,  name: "Sky Hawk Helicopter",  price: 39.99, category: "helicopters", rating: 4.7, reviews: 112, label: "New",  colors: ["blue","white"],           emoji: "🚁",  bg: "linear-gradient(135deg,#4776E6,#8E54E9)" },
  { id: 6,  name: "Mini Drone Copter",    price: 29.99, category: "helicopters", rating: 4.4, reviews: 73,  label: null,   colors: ["black","red"],            emoji: "🛸",  bg: "linear-gradient(135deg,#485563,#29323C)" },
  { id: 7,  name: "Military Helicopter",  price: 44.99, category: "helicopters", rating: 4.9, reviews: 156, label: "Sale", colors: ["green"],                  emoji: "🚁",  bg: "linear-gradient(135deg,#134E5E,#71B280)" },
  { id: 8,  name: "Rescue Helicopter",    price: 34.99, category: "helicopters", rating: 4.5, reviews: 89,  label: null,   colors: ["orange","white"],         emoji: "🚁",  bg: "linear-gradient(135deg,#F09819,#EDDE5D)" },
  // Trucks
  { id: 9,  name: "Big Rig Truck",        price: 19.99, category: "trucks",      rating: 4.2, reviews: 54,  label: null,   colors: ["red","silver"],           emoji: "🚛",  bg: "linear-gradient(135deg,#C94B4B,#4B134F)" },
  { id: 10, name: "Fire Truck",           price: 22.99, category: "trucks",      rating: 4.6, reviews: 107, label: "New",  colors: ["red"],                    emoji: "🚒",  bg: "linear-gradient(135deg,#FF512F,#F09819)" },
  { id: 11, name: "Dump Truck",           price: 17.99, category: "trucks",      rating: 4.1, reviews: 45,  label: null,   colors: ["yellow"],                 emoji: "🚜",  bg: "linear-gradient(135deg,#F7971E,#FFD200)" },
  { id: 12, name: "Construction Truck",   price: 21.99, category: "trucks",      rating: 4.4, reviews: 78,  label: "Sale", colors: ["yellow","orange"],        emoji: "🏗",  bg: "linear-gradient(135deg,#F09819,#EDDE5D)" },
  // Educational
  { id: 13, name: "Building Blocks Set",  price: 24.99, category: "educational", rating: 4.8, reviews: 203, label: "New",  colors: ["red","blue","green","yellow"], emoji: "🧱", bg: "linear-gradient(135deg,#11998E,#38EF7D)" },
  { id: 14, name: "Science Kit",          price: 34.99, category: "educational", rating: 4.7, reviews: 134, label: null,   colors: ["blue","white"],           emoji: "🔬",  bg: "linear-gradient(135deg,#1CB5E0,#000851)" },
  { id: 15, name: "Math Puzzle Board",    price: 19.99, category: "educational", rating: 4.5, reviews: 92,  label: null,   colors: ["yellow","red"],           emoji: "🧩",  bg: "linear-gradient(135deg,#F7971E,#FFD200)" },
  { id: 16, name: "Art & Craft Kit",      price: 27.99, category: "educational", rating: 4.6, reviews: 118, label: "Sale", colors: ["pink","purple"],          emoji: "🎨",  bg: "linear-gradient(135deg,#DA4453,#89216B)" },
  // Dolls
  { id: 17, name: "Princess Doll",        price: 24.99, category: "dolls",       rating: 4.7, reviews: 167, label: "New",  colors: ["pink","purple"],          emoji: "👸",  bg: "linear-gradient(135deg,#F953C6,#B91D73)" },
  { id: 18, name: "Fashion Doll Set",     price: 29.99, category: "dolls",       rating: 4.5, reviews: 89,  label: null,   colors: ["pink","yellow"],          emoji: "🪆",  bg: "linear-gradient(135deg,#FF758C,#FF7EB3)" },
  { id: 19, name: "Baby Doll",            price: 19.99, category: "dolls",       rating: 4.3, reviews: 62,  label: null,   colors: ["pink","white"],           emoji: "👶",  bg: "linear-gradient(135deg,#FCCB90,#D57EEB)" },
  { id: 20, name: "Superhero Doll",       price: 22.99, category: "dolls",       rating: 4.8, reviews: 143, label: "Sale", colors: ["blue","red"],             emoji: "🦸",  bg: "linear-gradient(135deg,#4776E6,#8E54E9)" },
];

const COLOR_MAP = {
  red: "#FF6B6B", blue: "#4ECDC4", green: "#56AB2F", yellow: "#FFD200",
  pink: "#FF758C", orange: "#F09819", purple: "#8E54E9", white: "#F8F9FA",
  black: "#2D3436", silver: "#B2BEC3"
};

const WHATSAPP_NUMBER = "923001234567";
const TOTAL_SLIDES = 3;

// ─── State ───────────────────────────────────────────────────────────────────
let cart        = JSON.parse(localStorage.getItem("pehchan-cart") || "[]");
let activeFilter = "all";
let searchQuery  = "";
let maxPrice     = 50;
let activeColor  = null;
let currentSlide = 0;
let sliderInterval = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function saveCart() {
  localStorage.setItem("pehchan-cart", JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = `toast show ${type}`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartSidebar();
  renderFullCart();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartSidebar();
  renderFullCart();
  renderCheckoutSummary();
}

function updateCartUI() {
  const count = getCartCount();
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent    = count;
    badge.style.display  = count > 0 ? "flex" : "none";
  }
  renderCartSidebar();
  renderFullCart();
}

function renderCartSidebar() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML =
      `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = "$0.00";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join("");

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
}

function renderFullCart() {
  const container = document.getElementById("full-cart-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="full-cart-empty">
        <div style="font-size:64px">🛒</div>
        <p>Your cart is empty</p>
        <button class="btn btn-primary" onclick="closeFullCart();document.getElementById('shop').scrollIntoView({behavior:'smooth'})">
          Continue Shopping
        </button>
      </div>`;
    ["full-cart-subtotal","full-cart-total"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "$0.00";
    });
    return;
  }

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${cart.map(item => `
          <tr>
            <td class="cart-product-cell">
              <span class="cart-product-emoji">${item.emoji}</span>
              <span>${item.name}</span>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
              <div class="qty-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id},-1)">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id},1)">+</button>
              </div>
            </td>
            <td>$${(item.price * item.qty).toFixed(2)}</td>
            <td><button class="remove-btn" onclick="removeFromCart(${item.id})">🗑</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;

  const total = getCartTotal();
  const subEl  = document.getElementById("full-cart-subtotal");
  const totEl  = document.getElementById("full-cart-total");
  if (subEl) subEl.textContent = `$${total.toFixed(2)}`;
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
}

// ─── Cart Panel ───────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById("cart-sidebar").classList.add("open");
  document.getElementById("cart-overlay").classList.add("visible");
  renderCartSidebar();
}

function closeCart() {
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("visible");
}

function openFullCart() {
  document.getElementById("full-cart-modal").classList.add("visible");
  renderFullCart();
}

function closeFullCart() {
  document.getElementById("full-cart-modal").classList.remove("visible");
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }
  renderCheckoutSummary();
  document.getElementById("checkout-modal").classList.add("visible");
}

function closeCheckout() {
  document.getElementById("checkout-modal").classList.remove("visible");
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkout-items-list");
  if (!container) return;
  container.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join("");
  const totalEl = document.getElementById("checkout-total-display");
  if (totalEl) totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
}

function placeOrder(e) {
  e.preventDefault();
  const name    = document.getElementById("checkout-name").value.trim();
  const phone   = document.getElementById("checkout-phone").value.trim();
  const address = document.getElementById("checkout-address").value.trim();

  if (!name || !phone) {
    showToast("Please fill in the required fields!", "error");
    return;
  }

  const itemsList = cart.map(item =>
    `• ${item.name} × ${item.qty} = $${(item.price * item.qty).toFixed(2)}`
  ).join("\n");

  const message = encodeURIComponent(
    `🧸 *New Order — Pehchan Toys*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    (address ? `📍 *Address:* ${address}\n` : "") +
    `\n🛒 *Order Details:*\n${itemsList}\n\n` +
    `💰 *Total: $${getCartTotal().toFixed(2)}*\n\n` +
    `Thank you for shopping at Pehchan Toys! 🎉`
  );

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function goToSlide(index) {
  currentSlide = ((index % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;
  const wrapper = document.getElementById("slides-wrapper");
  if (wrapper) wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startSliderAuto() {
  stopSliderAuto();
  sliderInterval = setInterval(nextSlide, 5000);
}

function stopSliderAuto() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────
function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    const matchCat    = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice  = p.price <= maxPrice;
    const matchColor  = !activeColor || p.colors.includes(activeColor);
    return matchCat && matchSearch && matchPrice && matchColor;
  });
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const filtered = getFilteredProducts();
  const countEl  = document.getElementById("product-count");
  if (countEl) countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <div style="font-size:48px">😕</div>
        <p>No products found matching your criteria.</p>
        <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => renderProductCard(p)).join("");
}

function renderProductCard(p) {
  const stars    = renderStars(p.rating);
  const labelHTML = p.label
    ? `<div class="product-label ${p.label.toLowerCase()}">${p.label}</div>`
    : "";

  return `
    <article class="product-card" data-id="${p.id}">
      ${labelHTML}
      <div class="product-img" style="background:${p.bg}">
        <div class="product-emoji">${p.emoji}</div>
      </div>
      <div class="product-info">
        <h4 class="product-name">${p.name}</h4>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="review-count">(${p.reviews})</span>
        </div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
          <button class="btn btn-ghost btn-sm" onclick="openQuickView(${p.id})">👁 Quick View</button>
        </div>
      </div>
    </article>`;
}

// ─── Quick View ───────────────────────────────────────────────────────────────
function openQuickView(productId) {
  const p = PRODUCTS.find(prod => prod.id === productId);
  if (!p) return;

  const colorDots = p.colors.map(c =>
    `<span class="qv-color-dot" style="background:${COLOR_MAP[c] || c}" title="${c}"></span>`
  ).join("");

  document.getElementById("quick-view-content").innerHTML = `
    <div class="quick-view-layout">
      <div class="quick-view-img" style="background:${p.bg}">
        <div style="font-size:80px">${p.emoji}</div>
      </div>
      <div class="quick-view-details">
        ${p.label ? `<div class="product-label ${p.label.toLowerCase()}">${p.label}</div>` : ""}
        <h2 class="qv-title">${p.name}</h2>
        <div class="product-rating" style="margin-bottom:12px">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="review-count">${p.rating} (${p.reviews} reviews)</span>
        </div>
        <div class="qv-price">$${p.price.toFixed(2)}</div>
        <p class="qv-desc">A high-quality toy designed for fun and learning. Crafted with safe, child-friendly materials. Built to last and bring endless joy.</p>
        <div class="qv-colors">
          <strong>Available Colors:</strong>
          <div class="qv-color-row">${colorDots}</div>
        </div>
        <button class="btn btn-primary qv-cart-btn" onclick="addToCart(${p.id});closeQuickView()">
          🛒 Add to Cart
        </button>
      </div>
    </div>`;

  document.getElementById("quick-view-modal").classList.add("visible");
}

function closeQuickView() {
  document.getElementById("quick-view-modal").classList.remove("visible");
}

// ─── Top Rated Sidebar ────────────────────────────────────────────────────────
function renderTopRated() {
  const container = document.getElementById("top-rated-list");
  if (!container) return;

  const topRated = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  container.innerHTML = topRated.map(p => `
    <div class="top-rated-item" onclick="openQuickView(${p.id})" role="button" tabindex="0">
      <div class="top-rated-img" style="background:${p.bg}">${p.emoji}</div>
      <div class="top-rated-info">
        <div class="top-rated-name">${p.name}</div>
        <div class="top-rated-rating">★ ${p.rating}</div>
        <div class="top-rated-price">$${p.price.toFixed(2)}</div>
      </div>
    </div>`
  ).join("");
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function setCategory(cat) {
  activeFilter = cat;

  document.querySelectorAll(".cat-link").forEach(link => {
    link.classList.toggle("active", link.dataset.cat === cat);
  });
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === cat);
  });

  renderProducts();
}

function clearFilters() {
  activeFilter = "all";
  searchQuery  = "";
  maxPrice     = 50;
  activeColor  = null;

  const searchEl = document.getElementById("product-search");
  const priceEl  = document.getElementById("price-range");
  const priceDisp = document.getElementById("price-display");

  if (searchEl)  searchEl.value = "";
  if (priceEl)   priceEl.value  = 50;
  if (priceDisp) priceDisp.textContent = "$50";

  document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
  setCategory("all");
}

function scrollToShop(category) {
  if (category) setCategory(category);
  const shopEl = document.getElementById("shop");
  if (shopEl) shopEl.scrollIntoView({ behavior: "smooth" });
}

// ─── Scroll Effects ───────────────────────────────────────────────────────────
function handleScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 80);

  const sections = ["home","about","services","shop","testimonials","contact"];
  const scrollPos = window.scrollY + 120;

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const top    = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (scrollPos >= top && scrollPos < bottom) {
      document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById("mobile-menu").classList.toggle("open");
  document.getElementById("mobile-menu-btn").classList.toggle("open");
}

function closeMobileMenu() {
  document.getElementById("mobile-menu").classList.remove("open");
  document.getElementById("mobile-menu-btn").classList.remove("open");
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderTopRated();
  updateCartUI();
  startSliderAuto();

  // Slider controls
  document.getElementById("slider-prev").addEventListener("click", () => {
    stopSliderAuto(); prevSlide(); startSliderAuto();
  });
  document.getElementById("slider-next").addEventListener("click", () => {
    stopSliderAuto(); nextSlide(); startSliderAuto();
  });
  document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () => {
      stopSliderAuto();
      goToSlide(parseInt(dot.dataset.slide));
      startSliderAuto();
    });
  });

  // Cart sidebar
  document.getElementById("btn-cart").addEventListener("click", openCart);
  document.getElementById("close-cart").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("btn-checkout").addEventListener("click", () => { closeCart(); openCheckout(); });
  document.getElementById("btn-view-full-cart").addEventListener("click", () => { closeCart(); openFullCart(); });

  // Full cart modal
  document.getElementById("close-full-cart").addEventListener("click", closeFullCart);
  document.getElementById("full-cart-modal").addEventListener("click", e => {
    if (e.target === document.getElementById("full-cart-modal")) closeFullCart();
  });
  document.getElementById("btn-checkout-from-full").addEventListener("click", () => {
    closeFullCart(); openCheckout();
  });

  // Checkout modal
  document.getElementById("close-checkout").addEventListener("click", closeCheckout);
  document.getElementById("checkout-modal").addEventListener("click", e => {
    if (e.target === document.getElementById("checkout-modal")) closeCheckout();
  });
  document.getElementById("checkout-form").addEventListener("submit", placeOrder);

  // Quick view modal
  document.getElementById("close-quick-view").addEventListener("click", closeQuickView);
  document.getElementById("quick-view-modal").addEventListener("click", e => {
    if (e.target === document.getElementById("quick-view-modal")) closeQuickView();
  });

  // Search
  document.getElementById("product-search").addEventListener("input", e => {
    searchQuery = e.target.value;
    renderProducts();
  });

  // Price range
  document.getElementById("price-range").addEventListener("input", e => {
    maxPrice = parseInt(e.target.value);
    document.getElementById("price-display").textContent = `$${maxPrice}`;
    renderProducts();
  });

  // Color filter
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const color = dot.dataset.color;
      if (activeColor === color) {
        activeColor = null;
        dot.classList.remove("active");
      } else {
        activeColor = color;
        document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
      }
      renderProducts();
    });
  });

  // Sidebar category links
  document.querySelectorAll(".cat-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      setCategory(link.dataset.cat);
    });
  });

  // Tab buttons (main area)
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => setCategory(btn.dataset.tab));
  });

  // Mobile menu
  document.getElementById("mobile-menu-btn").addEventListener("click", toggleMobileMenu);
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Login / Wishlist placeholders
  document.getElementById("btn-login").addEventListener("click", () =>
    showToast("Login feature coming soon! 🔐", "info")
  );
  document.getElementById("btn-wishlist").addEventListener("click", () =>
    showToast("Wishlist feature coming soon! ❤️", "info")
  );

  // Scroll effects
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Escape key closes open modals
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeCart();
      closeFullCart();
      closeCheckout();
      closeQuickView();
    }
  });
});
