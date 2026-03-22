/* ============================================================
   EtherX — script.js  |  Full SPA with Router
   ============================================================ */

const API = "http://localhost:3001/api";

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
let authToken   = localStorage.getItem("etherx_token") || null;
let authUser    = JSON.parse(localStorage.getItem("etherx_user") || "null");
let localCart   = JSON.parse(localStorage.getItem("etherx_cart")  || "[]");
let wishlistIds = new Set();
let _currentRoute = "/";

// ─────────────────────────────────────────────────────────────
//  API HELPER
// ─────────────────────────────────────────────────────────────
async function api(method, path, body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (authToken) opts.headers["Authorization"] = `Bearer ${authToken}`;
  if (body)      opts.body = JSON.stringify(body);
  const res  = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg, type = "default") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ─────────────────────────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────────────────────────
function navigate(href, push = true) {
  const url = new URL(href, window.location.origin);
  if (push) history.pushState({}, "", url.pathname + url.search);
  _currentRoute = url.pathname;
  dispatch(url.pathname, url.searchParams);
  updateNavLinks(url.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("mobile-menu").classList.remove("open");
}

window.addEventListener("popstate", () => {
  const url = new URL(window.location.href);
  _currentRoute = url.pathname;
  dispatch(url.pathname, url.searchParams);
  updateNavLinks(url.pathname);
  window.scrollTo(0, 0);
});

function dispatch(path, params = new URLSearchParams()) {
  const home  = document.getElementById("app-root");
  const pview = document.getElementById("page-view");
  const footer = document.getElementById("app-footer");

  // Match route
  if (path === "/") {
    pview.style.display = "none";
    home.style.display  = "";
    footer.style.display = "";
    // Re-load product grids
    Promise.all([
      renderGrid("featured-grid", { type: "featured", limit: 8 }),
      renderGrid("arrivals-grid", { type: "new_arrival", limit: 4 }),
    ]);
    return;
  }

  home.style.display   = "none";
  pview.style.display  = "";
  footer.style.display = "";

  // Product detail  /product/:id
  const prodMatch = path.match(/^\/product\/(\d+)$/);
  if (prodMatch) { renderProductPage(parseInt(prodMatch[1]), pview); return; }
  // Order confirm   /order-confirm/:id
  const ocMatch = path.match(/^\/order-confirm\/(\d+)$/);
  if (ocMatch)  { renderOrderConfirmPage(parseInt(ocMatch[1]), pview); return; }

  switch (path) {
    case "/shop":     renderShopPage(params, pview);     break;
    case "/cart":     renderCartPage(pview);              break;
    case "/checkout": renderCheckoutPage(pview);          break;
    case "/orders":   renderOrdersPage(pview);            break;
    case "/wishlist": renderWishlistPage(pview);          break;
    case "/profile":  renderProfilePage(pview);           break;
    case "/about":    renderAboutPage(pview);             break;
    case "/support":  renderSupportPage(pview);           break;
    default:          render404(pview);
  }
}

function updateNavLinks(path) {
  document.querySelectorAll(".nav-link, .mobile-link").forEach(a => {
    const route = a.getAttribute("data-route") || a.getAttribute("href");
    a.classList.toggle("active", route === path);
  });
}

// Wire all [data-route] elements
document.addEventListener("click", e => {
  const el = e.target.closest("[data-route]");
  if (!el) return;
  // Skip if it's a form submit button inside a form
  if (el.form) return;
  e.preventDefault();
  const route = el.getAttribute("data-route");
  if (route) navigate(route);
});

// ─────────────────────────────────────────────────────────────
//  NAVBAR
// ─────────────────────────────────────────────────────────────
window.addEventListener("scroll", () =>
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40)
);

document.getElementById("hamburger").addEventListener("click", () =>
  document.getElementById("mobile-menu").classList.toggle("open")
);

// ── Search bar ──
const searchToggle = document.getElementById("search-toggle");
const searchBar    = document.getElementById("search-bar");
const searchInput  = document.getElementById("search-input");
const searchSubmit = document.getElementById("search-submit");

searchToggle.addEventListener("click", () => {
  const isOpen = searchBar.classList.toggle("open");
  if (isOpen) searchInput.focus();
});
document.addEventListener("click", e => {
  if (!document.getElementById("search-wrap").contains(e.target))
    searchBar.classList.remove("open");
});
function doSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  navigate(`/shop?search=${encodeURIComponent(q)}`);
  searchBar.classList.remove("open");
  searchInput.value = "";
}
searchSubmit.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });

// ── Auth Area ──
function renderAuthArea() {
  const area = document.getElementById("auth-area");
  if (authUser) {
    const initials = authUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    area.innerHTML = `
      <div class="user-dropdown-wrap">
        <div class="user-chip" id="user-chip">
          <div class="user-avatar">${initials}</div>
          <span>${authUser.name.split(" ")[0]}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-dropdown-item" data-route="/profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </div>
          <div class="user-dropdown-item" data-route="/orders">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            My Orders
          </div>
          <div class="user-dropdown-item" data-route="/wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Wishlist
          </div>
          <div class="user-dropdown-sep"></div>
          <div class="user-dropdown-item danger" id="dropdown-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </div>
        </div>
      </div>`;
    document.getElementById("user-chip").addEventListener("click", e => {
      e.stopPropagation();
      document.getElementById("user-dropdown").classList.toggle("open");
    });
    document.getElementById("dropdown-logout").addEventListener("click", logout);
    document.addEventListener("click", () =>
      document.getElementById("user-dropdown")?.classList.remove("open"), { once: false }
    );
    // wire dropdown nav items
    area.querySelectorAll("[data-route]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("user-dropdown")?.classList.remove("open");
        navigate(el.getAttribute("data-route"));
      });
    });
  } else {
    area.innerHTML = `<button class="btn-primary btn-sm" id="login-trigger">Sign In</button>`;
    document.getElementById("login-trigger").addEventListener("click", () => openModal("login"));
  }
}

function saveAuth(token, user) {
  authToken = token; authUser = user;
  localStorage.setItem("etherx_token", token);
  localStorage.setItem("etherx_user", JSON.stringify(user));
}
function logout() {
  authToken = null; authUser = null; wishlistIds.clear();
  localStorage.removeItem("etherx_token"); localStorage.removeItem("etherx_user");
  renderAuthArea(); renderCartBadge();
  showToast("👋 Signed out");
  if (_currentRoute !== "/") navigate("/");
}

// ─────────────────────────────────────────────────────────────
//  AUTH MODAL
// ─────────────────────────────────────────────────────────────
function openModal(tab = "login") {
  document.getElementById("auth-modal").classList.add("open");
  switchTab(tab);
  document.body.style.overflow = "hidden";
}
function closeModal() {
  document.getElementById("auth-modal").classList.remove("open");
  document.body.style.overflow = "";
  ["li-error","reg-error","otp-error"].forEach(id => document.getElementById(id).textContent = "");
  document.getElementById("otp-step").classList.add("hidden");
  document.getElementById("otp-input").value = "";
  _otpResendClear();
}
function switchTab(tab) {
  document.querySelectorAll(".modal-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("register-form").classList.toggle("hidden", tab !== "register");
  document.getElementById("otp-step").classList.add("hidden");
  document.querySelectorAll(".modal-tab").forEach(t => t.style.display = "");
}
document.getElementById("auth-close").addEventListener("click", closeModal);
document.getElementById("auth-modal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });
document.querySelectorAll(".modal-tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));

document.getElementById("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("li-email").value.trim();
  const password = document.getElementById("li-pass").value;
  const errEl = document.getElementById("li-error");
  const btn = document.getElementById("li-btn");
  errEl.textContent = ""; btn.textContent = "Signing in…"; btn.disabled = true;
  try {
    const data = await api("POST", "/auth/login", { email, password });
    saveAuth(data.token, data.user);
    closeModal(); renderAuthArea();
    showToast(`👋 Welcome back, ${data.user.name.split(" ")[0]}!`);
    await syncLocalCartToServer(); await refreshCart(); await loadWishlist();
  } catch (err) { errEl.textContent = err.message; }
  finally { btn.textContent = "Sign In"; btn.disabled = false; }
});

// ─────────────────────────────────────────────────────────────
//  OTP HELPERS
// ─────────────────────────────────────────────────────────────
let _otpCountdownTimer = null;
function _otpResendClear() { clearInterval(_otpCountdownTimer); _otpCountdownTimer = null; }

function showOTPStep(email) {
  document.getElementById("register-form").classList.add("hidden");
  document.querySelectorAll(".modal-tab").forEach(t => t.style.display = "none");
  document.getElementById("otp-email-display").textContent = email;
  document.getElementById("otp-error").textContent = "";
  document.getElementById("otp-input").value = "";
  document.getElementById("otp-step").classList.remove("hidden");
  document.getElementById("otp-input").focus();
  startResendCooldown();
}

function startResendCooldown() {
  _otpResendClear();
  let secs = 60;
  const resendBtn  = document.getElementById("otp-resend-btn");
  const timerSpan  = document.getElementById("otp-resend-timer");
  const countdown  = document.getElementById("otp-countdown");
  resendBtn.disabled = true;
  resendBtn.style.opacity = ".4";
  timerSpan.style.display = "";
  countdown.textContent = secs;
  _otpCountdownTimer = setInterval(() => {
    secs--;
    countdown.textContent = secs;
    if (secs <= 0) {
      _otpResendClear();
      resendBtn.disabled = false;
      resendBtn.style.opacity = "1";
      timerSpan.style.display = "none";
    }
  }, 1000);
}

document.getElementById("register-form").addEventListener("submit", async e => {
  e.preventDefault();
  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pass").value;
  const errEl    = document.getElementById("reg-error");
  const btn      = document.getElementById("reg-btn");
  errEl.textContent = "";
  btn.textContent = "Sending code…"; btn.disabled = true;
  try {
    await api("POST", "/auth/send-otp", { name, email, password });
    showOTPStep(email);
  } catch (err) { errEl.textContent = err.message; }
  finally { btn.textContent = "Create Account"; btn.disabled = false; }
});

// OTP verify
document.getElementById("otp-verify-btn").addEventListener("click", async () => {
  const email    = document.getElementById("otp-email-display").textContent;
  const otp      = document.getElementById("otp-input").value.trim();
  const errEl    = document.getElementById("otp-error");
  const btn      = document.getElementById("otp-verify-btn");
  errEl.textContent = "";
  btn.textContent = "Verifying…"; btn.disabled = true;
  try {
    const data = await api("POST", "/auth/verify-otp", { email, otp });
    saveAuth(data.token, data.user);
    closeModal(); renderAuthArea();
    showToast(`Welcome to EtherX, ${data.user.name.split(" ")[0]}!`);
    await refreshCart();
  } catch (err) { errEl.textContent = err.message; }
  finally { btn.textContent = "Verify & Create Account"; btn.disabled = false; }
});

// OTP digit-only filter
document.getElementById("otp-input").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
});
// Auto-submit when 6 digits entered
document.getElementById("otp-input").addEventListener("input", e => {
  if (e.target.value.length === 6) document.getElementById("otp-verify-btn").click();
});

// Resend OTP
document.getElementById("otp-resend-btn").addEventListener("click", async () => {
  const email    = document.getElementById("otp-email-display").textContent;
  const errEl    = document.getElementById("otp-error");
  errEl.textContent = "";
  try {
    // Get original form values from hidden reg fields if still filled, else ask user to go back
    const name     = document.getElementById("reg-name").value.trim()     || "User";
    const password = document.getElementById("reg-pass").value            || "placeholder";
    await api("POST", "/auth/send-otp", { name, email, password });
    showToast("📧 New code sent!"); startResendCooldown();
  } catch (err) { errEl.textContent = err.message; }
});

// Back to register form
document.getElementById("otp-back-btn").addEventListener("click", () => {
  _otpResendClear();
  document.getElementById("otp-step").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
  document.querySelectorAll(".modal-tab").forEach(t => t.style.display = "");
});

// ─────────────────────────────────────────────────────────────
//  CART BADGE + DRAWER
// ─────────────────────────────────────────────────────────────
function renderCartBadge(count = 0) {
  const badge = document.getElementById("cart-count");
  badge.textContent = count;
  badge.classList.toggle("show", count > 0);
}
function openCart()  {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("drawer-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("drawer-overlay").classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("cart-btn").addEventListener("click", () => { openCart(); refreshCart(); });
document.getElementById("drawer-close").addEventListener("click", closeCart);
document.getElementById("drawer-overlay").addEventListener("click", closeCart);

function renderCartDrawer(cartData) {
  const empty = document.getElementById("cart-empty");
  const list  = document.getElementById("cart-items-list");
  const footer = document.getElementById("cart-footer");
  list.innerHTML = "";
  const items = cartData?.items || [];
  const summ  = cartData?.summary || {};
  renderCartBadge(summ.itemCount || 0);
  if (items.length === 0) { empty.style.display = "flex"; footer.style.display = "none"; return; }
  empty.style.display = "none"; footer.style.display = "block";
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="ci-img"><img src="${item.img}" alt="${item.name}" /></div>
      <div class="ci-info">
        <p class="ci-brand">${item.brand}</p>
        <p class="ci-name">${item.name}</p>
        <div class="ci-controls">
          <div class="qty-controls">
            <button class="qty-btn qty-dec" data-id="${item.cartItemId}" data-qty="${item.quantity}">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn qty-inc" data-id="${item.cartItemId}" data-qty="${item.quantity}">+</button>
          </div>
          <span class="ci-price">$${item.lineTotal.toFixed(2)}</span>
        </div>
        <button class="ci-remove" data-id="${item.cartItemId}">Remove</button>
      </div>`;
    list.appendChild(div);
  });
  list.querySelectorAll(".qty-dec").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, +btn.dataset.qty - 1))
  );
  list.querySelectorAll(".qty-inc").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, +btn.dataset.qty + 1))
  );
  list.querySelectorAll(".ci-remove").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, 0))
  );
  const ship = summ.shipping === 0 ? "Free" : `$${(summ.shipping||0).toFixed(2)}`;
  document.getElementById("ct-sub").textContent   = `$${(summ.subtotal||0).toFixed(2)}`;
  document.getElementById("ct-ship").textContent  = ship;
  document.getElementById("ct-tax").textContent   = `$${(summ.tax||0).toFixed(2)}`;
  document.getElementById("ct-total").textContent = `$${(summ.total||0).toFixed(2)}`;
}

async function refreshCart() {
  if (authToken) {
    try { const data = await api("GET", "/cart"); renderCartDrawer(data); } catch {}
  } else {
    renderCartDrawer(buildLocalCartDisplay());
  }
}
async function addToCart(productId, productName) {
  if (authToken) {
    try {
      const data = await api("POST", "/cart", { productId, quantity: 1 });
      renderCartDrawer(data);
      showToast(`Added "${productName}" to cart`);
    } catch (err) { showToast(`${err.message}`); }
  } else {
    const existing = localCart.find(i => i.id === productId);
    if (existing) existing.qty += 1;
    else localCart.push({ id: productId, name: productName, qty: 1 });
    saveLocalCart(); renderCartDrawer(buildLocalCartDisplay());
    showToast(`Added "${productName}" to cart`);
  }
}
async function updateCartItem(cartItemId, qty) {
  if (authToken) {
    try {
      const data = qty <= 0
        ? await api("DELETE", `/cart/${cartItemId}`)
        : await api("PUT",    `/cart/${cartItemId}`, { quantity: qty });
      renderCartDrawer(data);
      // If on cart page, re-render it too
      if (_currentRoute === "/cart") renderCartPage(document.getElementById("page-view"));
    } catch (err) { showToast(`${err.message}`); }
  } else {
    if (qty <= 0) localCart = localCart.filter(i => i.id !== parseInt(cartItemId));
    else { const item = localCart.find(i => i.id === parseInt(cartItemId)); if (item) item.qty = qty; }
    saveLocalCart(); renderCartDrawer(buildLocalCartDisplay());
  }
}
function saveLocalCart() {
  localStorage.setItem("etherx_cart", JSON.stringify(localCart));
  renderCartBadge(localCart.reduce((s, i) => s + i.qty, 0));
}
function buildLocalCartDisplay() {
  const sub = localCart.reduce((s, i) => s + (i.price||0) * i.qty, 0);
  return {
    items: localCart.map(i => ({
      cartItemId: i.id, productId: i.id, brand: i.brand||"EtherX", name: i.name,
      price: i.price||0, img: i.img||"", quantity: i.qty, lineTotal: (i.price||0)*i.qty,
    })),
    summary: {
      itemCount: localCart.reduce((s,i) => s+i.qty, 0), subtotal: sub,
      shipping: sub>=50?0:9.99, tax: sub*.08, total: sub+(sub>=50?0:9.99)+sub*.08,
    }
  };
}
async function syncLocalCartToServer() {
  if (!authToken || localCart.length === 0) return;
  for (const item of localCart) {
    try { await api("POST", "/cart", { productId: item.id, quantity: item.qty }); } catch {}
  }
  localCart = []; saveLocalCart();
}

document.getElementById("checkout-btn").addEventListener("click", () => {
  closeCart();
  if (!authToken) { openModal("login"); showToast("Please sign in to checkout"); return; }
  navigate("/checkout");
});
document.getElementById("view-cart-btn").addEventListener("click", () => { closeCart(); navigate("/cart"); });

// ─────────────────────────────────────────────────────────────
//  WISHLIST
// ─────────────────────────────────────────────────────────────
async function loadWishlist() {
  if (!authToken) return;
  try {
    const data = await api("GET", "/wishlist");
    wishlistIds = new Set(data.wishlist.map(i => i.id));
    applyWishlistState();
  } catch {}
}
function applyWishlistState() {
  document.querySelectorAll(".wish-btn").forEach(btn => {
    const liked = wishlistIds.has(parseInt(btn.dataset.id));
    btn.classList.toggle("liked", liked);
    const path = btn.querySelector(".heart-path");
    if (path) { path.setAttribute("fill", liked?"#FF3B30":"none"); if (liked) path.style.stroke="#FF3B30"; else path.style.stroke=""; }
  });
}
async function toggleWishlist(productId, btn) {
  if (!authToken) { openModal("login"); showToast("Please sign in to save items"); return; }
  try {
    const data  = await api("POST", `/wishlist/${productId}`);
    const liked = data.action === "added";
    wishlistIds[liked ? "add" : "delete"](productId);
    if (btn) {
      btn.classList.toggle("liked", liked);
      const path = btn.querySelector(".heart-path");
      if (path) { path.setAttribute("fill", liked?"#FF3B30":"none"); path.style.stroke = liked?"#FF3B30":""; }
    }
    showToast(liked ? "Added to wishlist" : "Removed from wishlist");
    // If on wishlist page, re-render
    if (_currentRoute === "/wishlist") renderWishlistPage(document.getElementById("page-view"));
  } catch (err) { showToast(`${err.message}`); }
}

// ─────────────────────────────────────────────────────────────
//  PRODUCT CARD BUILDER
// ─────────────────────────────────────────────────────────────
function starsHTML(rating) {
  return Array.from({length:5},(_,i)=>`<span class="s ${i<rating?"filled":"empty"}">★</span>`).join("");
}
function buildCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = p.id;
  const old = p.oldPrice || p.old_price;
  card.innerHTML = `
    <div class="p-img-wrap">
      <img src="${p.img||p.image_url}" alt="${p.name}" loading="lazy" />
      ${p.tag ? `<span class="p-tag tag-${p.tag}">${p.tag.toUpperCase()}</span>` : ""}
      <button class="wish-btn" data-id="${p.id}" title="Wishlist">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" class="heart-path"/>
        </svg>
      </button>
    </div>
    <div class="p-body">
      <p class="p-brand">${p.brand}</p>
      <h4 class="p-name">${p.name}</h4>
      <div class="p-stars"><div class="stars-row">${starsHTML(p.rating)}</div><span class="p-rev">(${(p.reviews||p.review_count||0).toLocaleString()})</span></div>
      <div class="p-foot">
        <div class="p-price">${old?`<span class="p-old">$${old}</span>`:""} $${p.price}</div>
        <button class="add-btn" data-id="${p.id}" data-name="${p.name}" title="Add to cart">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>`;
  // Click on card body → product detail
  card.addEventListener("click", e => {
    if (e.target.closest(".wish-btn") || e.target.closest(".add-btn")) return;
    openProductModal(p.id);
  });
  // Wishlist
  card.querySelector(".wish-btn").addEventListener("click", e => {
    e.stopPropagation();
    toggleWishlist(p.id, card.querySelector(".wish-btn"));
  });
  // Add to cart
  card.querySelector(".add-btn").addEventListener("click", async e => {
    e.stopPropagation();
    await addToCart(p.id, p.name);
    const btn = card.querySelector(".add-btn");
    btn.style.background = "#34C759";
    setTimeout(() => (btn.style.background = ""), 900);
  });
  // Apply wishlist state
  if (wishlistIds.has(p.id)) {
    const wb = card.querySelector(".wish-btn");
    wb.classList.add("liked");
    const ph = wb.querySelector(".heart-path");
    if (ph) { ph.setAttribute("fill","#FF3B30"); ph.style.stroke="#FF3B30"; }
  }
  return card;
}

async function renderGrid(gridId, params) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--text-sec);font-size:15px;">Loading…</div>`;
  try {
    const data = await api("GET", `/products?${new URLSearchParams(params)}`);
    grid.innerHTML = "";
    data.products.forEach(p => grid.appendChild(buildCard(p)));
    applyWishlistState();
  } catch { renderFallbackGrids(); }
}

// ─────────────────────────────────────────────────────────────
//  FALLBACK
// ─────────────────────────────────────────────────────────────
const FALLBACK_FEATURED = [
  {id:1,brand:"Apple",name:"AirPods Pro (2nd Gen)",price:249,rating:5,reviews:2840,tag:"hot",img:"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80"},
  {id:2,brand:"Apple",name:"Apple Watch Ultra 2",price:799,oldPrice:999,rating:5,reviews:1290,tag:"sale",img:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80"},
  {id:3,brand:"Apple",name:"MagSafe Charger 15W",price:39,rating:4,reviews:5100,tag:"new",img:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"},
  {id:4,brand:"Apple",name:'iPad Air M2 11"',price:599,rating:5,reviews:3400,tag:"new",img:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80"},
  {id:5,brand:"Beats",name:"Studio Pro Headphones",price:349,oldPrice:449,rating:4,reviews:890,tag:"sale",img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"},
  {id:6,brand:"Apple",name:'MacBook Air 13" M3',price:1299,rating:5,reviews:2100,tag:"new",img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80"},
  {id:7,brand:"Apple",name:"iPhone 15 Pro Case",price:59,rating:4,reviews:7600,tag:"hot",img:"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80"},
  {id:8,brand:"Belkin",name:"MagSafe 3-in-1 Stand",price:149,oldPrice:179,rating:4,reviews:640,tag:"sale",img:"https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80"},
];
const FALLBACK_ARRIVALS = [
  {id:9,brand:"Apple",name:"Apple Pencil Pro",price:129,rating:5,reviews:1890,tag:"new",img:"https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80"},
  {id:10,brand:"Nomad",name:"Sport Band Ultra",price:59,rating:4,reviews:430,tag:"new",img:"https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400&q=80"},
  {id:11,brand:"JBL",name:"Flip 6 Speaker",price:129,oldPrice:149,rating:4,reviews:2200,tag:"hot",img:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80"},
  {id:12,brand:"Apple",name:"HomePod mini",price:99,rating:5,reviews:3100,tag:"new",img:"https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80"},
];
function renderFallbackGrids() {
  const fg = document.getElementById("featured-grid");
  const ag = document.getElementById("arrivals-grid");
  if (!fg || !ag) return;
  fg.innerHTML = ""; ag.innerHTML = "";
  FALLBACK_FEATURED.forEach(p => fg.appendChild(buildCard(p)));
  FALLBACK_ARRIVALS.forEach(p => ag.appendChild(buildCard(p)));
}

// ─────────────────────────────────────────────────────────────
//  NEWSLETTER
// ─────────────────────────────────────────────────────────────
document.getElementById("nl-btn").addEventListener("click", async () => {
  const input = document.getElementById("nl-input");
  const email = input.value.trim();
  const btn   = document.getElementById("nl-btn");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast("Please enter a valid email"); input.focus(); return; }
  btn.textContent = "Subscribing…"; btn.disabled = true;
  try {
    const data = await api("POST", "/newsletter/subscribe", { email });
    showToast(`${data.message}`); input.value = "";
  } catch (err) {
    showToast(err.message.includes("already") ? "Already subscribed!" : `${err.message}`);
  } finally { btn.textContent = "Subscribe"; btn.disabled = false; }
});

// Hero CTA
document.querySelector("#hero .btn-primary")?.addEventListener("click", () => navigate("/shop"));
document.querySelector("#hero .btn-ghost")?.addEventListener("click",   () =>
  document.getElementById("featured")?.scrollIntoView({ behavior:"smooth" })
);

// ─────────────────────────────────────────────────────────────
//  PRODUCT DETAIL MODAL
// ─────────────────────────────────────────────────────────────
document.getElementById("product-modal-close").addEventListener("click", closeProductModal);
document.getElementById("product-modal").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeProductModal();
});
function closeProductModal() {
  document.getElementById("product-modal").classList.remove("open");
  document.body.style.overflow = "";
}
async function openProductModal(productId) {
  const modal = document.getElementById("product-modal");
  const body  = document.getElementById("product-modal-body");
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  body.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  try {
    const data = await api("GET", `/products/${productId}`);
    const p = data.product;
    const related = data.related || [];
    const old = p.oldPrice;
    const stockClass = p.stock > 10 ? "in-stock" : p.stock > 0 ? "low-stock" : "no-stock";
    const stockText  = p.stock > 10 ? `✓ In Stock` : p.stock > 0 ? `Only ${p.stock} left` : `✗ Out of Stock`;
    const isWishlisted = wishlistIds.has(p.id);
    body.innerHTML = `
      <div class="pm-gallery">
        <div class="pm-main-img"><img src="${p.img}" alt="${p.name}" id="pm-main-img" /></div>
      </div>
      <div class="pm-info">
        <p class="pm-brand">${p.brand}</p>
        <h2 class="pm-name">${p.name}</h2>
        <div class="pm-price-row">
          <span class="pm-price">$${p.price}</span>
          ${old?`<span class="pm-old-price">$${old}</span>`:""}
          ${p.tag?`<span class="pm-tag tag-${p.tag}">${p.tag.toUpperCase()}</span>`:""}
        </div>
        <div class="pm-stars">
          <div class="stars-row">${starsHTML(p.rating)}</div>
          <span>${(p.reviews||0).toLocaleString()} reviews</span>
        </div>
        ${p.description?`<p class="pm-desc">${p.description}</p>`:""}
        <p class="pm-stock ${stockClass}">${stockText}</p>
        <div class="pm-actions">
          <button class="btn-primary" id="pm-add-cart" ${p.stock===0?"disabled":""}>
            ${p.stock===0?"Out of Stock":"Add to Cart"}
          </button>
          <button class="pm-wish-btn ${isWishlisted?"liked":""}" id="pm-wish">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted?"#FF3B30":"none"}" stroke="${isWishlisted?"#FF3B30":"currentColor"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" class="heart-path"/>
            </svg>
          </button>
        </div>
        ${related.length ? `
          <div class="pm-related">
            <p class="pm-related-title">Related Products</p>
            <div class="pm-related-row">
              ${related.map(r=>`
                <div class="pm-rel-card" data-id="${r.id}">
                  <img src="${r.img}" alt="${r.name}" />
                  <p>${r.name}</p>
                </div>`).join("")}
            </div>
          </div>` : ""}
      </div>`;
    body.querySelector("#pm-add-cart").addEventListener("click", async () => {
      if (p.stock === 0) return;
      await addToCart(p.id, p.name);
    });
    body.querySelector("#pm-wish").addEventListener("click", e =>
      toggleWishlist(p.id, e.currentTarget)
    );
    body.querySelectorAll(".pm-rel-card").forEach(card => {
      card.addEventListener("click", () => openProductModal(parseInt(card.dataset.id)));
    });
  } catch (err) {
    body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-sec);">Could not load product. ${err.message}</div>`;
  }
}

// ─────────────────────────────────────────────────────────────
//  VIEW: PRODUCT PAGE (standalone)
// ─────────────────────────────────────────────────────────────
function renderProductPage(id, container) {
  openProductModal(id);
  // Show home as background
  document.getElementById("app-root").style.display = "";
  container.style.display = "none";
  history.replaceState({}, "", `/product/${id}`);
}

// ─────────────────────────────────────────────────────────────
//  VIEW: SHOP PAGE
// ─────────────────────────────────────────────────────────────
async function renderShopPage(params, container) {
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  const category = params.get("category") || "";
  const tag      = params.get("tag")      || "";
  const search   = params.get("search")   || "";
  const sort     = params.get("sort")     || "";
  let   page     = parseInt(params.get("page") || "1");

  let categories = [];
  try { const cd = await api("GET","/products/categories"); categories = cd.categories; } catch {}

  async function loadProducts(p) {
    const qp = new URLSearchParams({ limit: 12, page: p });
    if (category) qp.set("category", category);
    if (tag)      qp.set("tag",      tag);
    if (search)   qp.set("search",   search);
    if (sort)     qp.set("sort",     sort);
    return await api("GET", `/products?${qp}`);
  }

  let data;
  try { data = await loadProducts(page); } catch { data = { products:[], pagination:{total:0,page:1,totalPages:1} }; }

  const pageTitle = search ? `Search: "${search}"` : category ? (categories.find(c=>c.slug===category)?.name||category) : tag ? tag.charAt(0).toUpperCase()+tag.slice(1)+" Products" : "All Products";

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb">
        <a href="/" data-route="/">Home</a> <span>›</span>
        <a href="/shop" data-route="/shop">Shop</a>
        ${category||tag||search ? `<span>›</span><span>${pageTitle}</span>` : ""}
      </div>
      <div class="shop-layout">
        <aside class="shop-sidebar">
          <div class="sidebar-section">
            <p class="sidebar-title">Categories</p>
            <div class="sidebar-cat-item ${!category?"active":""}" data-cat="">All Products</div>
            ${categories.map(c=>`
              <div class="sidebar-cat-item ${category===c.slug?"active":""}" data-cat="${c.slug}">${c.name}</div>`).join("")}
          </div>
          <div class="sidebar-section">
            <p class="sidebar-title">Tags</p>
            <div class="sidebar-tags">
              <div class="sidebar-tag-item ${!tag?"active":""}" data-tag="">All</div>
              <div class="sidebar-tag-item ${tag==="new"?"active":""}"  data-tag="new">🆕 New</div>
              <div class="sidebar-tag-item ${tag==="hot"?"active":""}"  data-tag="hot">🔥 Hot</div>
              <div class="sidebar-tag-item ${tag==="sale"?"active":""}" data-tag="sale">💸 Sale</div>
            </div>
          </div>
        </aside>
        <div class="shop-main">
          <div class="shop-toolbar">
            <p class="shop-result-count">
              Showing <strong id="result-count">${data.pagination.total}</strong> products
              ${pageTitle !== "All Products" ? `in <strong>${pageTitle}</strong>` : ""}
            </p>
            <div class="shop-sort">
              <span>Sort:</span>
              <select id="shop-sort-sel">
                <option value=""       ${!sort?"selected":""}>Featured</option>
                <option value="newest" ${sort==="newest"?"selected":""}>Newest</option>
                <option value="price_asc" ${sort==="price_asc"?"selected":""}>Price: Low → High</option>
                <option value="price_desc" ${sort==="price_desc"?"selected":""}>Price: High → Low</option>
                <option value="rating" ${sort==="rating"?"selected":""}>Top Rated</option>
              </select>
            </div>
          </div>
          <div class="shop-grid" id="shop-grid"></div>
          <div class="shop-pagination" id="shop-pagination"></div>
        </div>
      </div>
    </div>`;

  // Render products
  const grid = container.querySelector("#shop-grid");
  if (data.products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-sec);">No products found. <a href="/shop" data-route="/shop" style="color:var(--blue);">Clear filters</a></div>`;
  } else {
    data.products.forEach(p => grid.appendChild(buildCard(p)));
    applyWishlistState();
  }

  // Pagination
  const pg = container.querySelector("#shop-pagination");
  if (data.pagination.totalPages > 1) {
    for (let i = 1; i <= data.pagination.totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `page-btn ${i===page?"active":""}`;
      btn.textContent = i;
      btn.addEventListener("click", () => {
        const np = new URLSearchParams(params);
        np.set("page", i);
        navigate(`/shop?${np}`);
      });
      pg.appendChild(btn);
    }
  }

  // Sidebar filters
  container.querySelectorAll(".sidebar-cat-item").forEach(el => {
    el.addEventListener("click", () => {
      const np = new URLSearchParams(params);
      if (el.dataset.cat) np.set("category", el.dataset.cat); else np.delete("category");
      np.delete("page");
      navigate(`/shop?${np}`);
    });
  });
  container.querySelectorAll(".sidebar-tag-item").forEach(el => {
    el.addEventListener("click", () => {
      const np = new URLSearchParams(params);
      if (el.dataset.tag) np.set("tag", el.dataset.tag); else np.delete("tag");
      np.delete("page");
      navigate(`/shop?${np}`);
    });
  });

  // Sort
  container.querySelector("#shop-sort-sel").addEventListener("change", e => {
    const np = new URLSearchParams(params);
    if (e.target.value) np.set("sort", e.target.value); else np.delete("sort");
    np.delete("page");
    navigate(`/shop?${np}`);
  });
}

// ─────────────────────────────────────────────────────────────
//  VIEW: CART PAGE
// ─────────────────────────────────────────────────────────────
async function renderCartPage(container) {
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let cartData;
  if (authToken) {
    try { cartData = await api("GET","/cart"); } catch { cartData = buildLocalCartDisplay(); }
  } else { cartData = buildLocalCartDisplay(); }

  const items = cartData?.items || [];
  const summ  = cartData?.summary || {};

  if (items.length === 0) {
    container.innerHTML = `
      <div class="page-container page-enter">
        <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Cart</span></div>
        <div class="cart-page-empty">
          <div style="font-size:64px;margin-bottom:20px;"></div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button class="btn-primary" data-route="/shop">Start Shopping</button>
        </div>
      </div>`;
    return;
  }

  const ship = summ.shipping===0 ? "Free" : `$${(summ.shipping||0).toFixed(2)}`;
  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Cart</span></div>
      <div class="page-header"><h1>Shopping Cart</h1><p>${summ.itemCount||0} item${summ.itemCount!==1?"s":""}</p></div>
      <div class="cart-page-layout">
        <div>
          <div class="cart-page-items" id="cart-page-items">
            ${items.map(item=>`
              <div class="cart-page-item" data-cart-id="${item.cartItemId}">
                <div class="cpi-img"><img src="${item.img}" alt="${item.name}" /></div>
                <div class="cpi-info">
                  <p class="cpi-brand">${item.brand}</p>
                  <p class="cpi-name">${item.name}</p>
                  <div class="cpi-controls">
                    <div class="qty-controls">
                      <button class="qty-btn cpi-dec" data-id="${item.cartItemId}" data-qty="${item.quantity}">−</button>
                      <span class="qty-num">${item.quantity}</span>
                      <button class="qty-btn cpi-inc" data-id="${item.cartItemId}" data-qty="${item.quantity}">+</button>
                    </div>
                  </div>
                  <button class="cpi-remove-btn" data-id="${item.cartItemId}">Remove</button>
                </div>
                <div class="cpi-price-col">
                  <p class="cpi-line-total">$${item.lineTotal.toFixed(2)}</p>
                  <p style="font-size:13px;color:var(--text-sec);">$${item.price} each</p>
                </div>
              </div>`).join("")}
          </div>
        </div>
        <div class="cart-summary-box">
          <h3>Order Summary</h3>
          <div class="cart-totals">
            <div class="ct-row"><span>Subtotal</span><span>$${(summ.subtotal||0).toFixed(2)}</span></div>
            <div class="ct-row"><span>Shipping</span><span>${ship}</span></div>
            <div class="ct-row ct-tax"><span>Tax (8%)</span><span>$${(summ.tax||0).toFixed(2)}</span></div>
            <div class="ct-row ct-total"><span>Total</span><span>$${(summ.total||0).toFixed(2)}</span></div>
          </div>
          <button class="btn-primary w-full" id="cart-page-checkout" style="margin-top:20px;">Proceed to Checkout →</button>
          <button class="btn-secondary w-full" data-route="/shop" style="margin-top:10px;">Continue Shopping</button>
          <p class="cart-note" style="margin-top:14px;">Secure checkout · Free returns</p>
        </div>
      </div>
    </div>`;

  container.querySelectorAll(".cpi-dec").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, +btn.dataset.qty - 1))
  );
  container.querySelectorAll(".cpi-inc").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, +btn.dataset.qty + 1))
  );
  container.querySelectorAll(".cpi-remove-btn").forEach(btn =>
    btn.addEventListener("click", () => updateCartItem(btn.dataset.id, 0))
  );
  container.querySelector("#cart-page-checkout")?.addEventListener("click", () => {
    if (!authToken) { openModal("login"); return; }
    navigate("/checkout");
  });
}

// ─────────────────────────────────────────────────────────────
//  VIEW: CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────
async function renderCheckoutPage(container) {
  if (!authToken) { openModal("login"); navigate("/cart"); return; }
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let cartData;
  try { cartData = await api("GET","/cart"); } catch { navigate("/cart"); return; }
  const items = cartData?.items || [];
  if (items.length === 0) { navigate("/cart"); return; }
  const summ  = cartData?.summary || {};
  let selectedPayment = "card";

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb">
        <a href="/" data-route="/">Home</a><span>›</span>
        <a href="/cart" data-route="/cart">Cart</a><span>›</span><span>Checkout</span>
      </div>
      <div class="page-header"><h1>Checkout</h1></div>
      <div class="checkout-layout">
        <div>
          <div class="checkout-card">
            <h3>Shipping Information</h3>
            <form id="checkout-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" id="co-name" placeholder="Jane Appleseed" value="${authUser?.name||""}" required />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" id="co-email" placeholder="you@example.com" value="${authUser?.email||""}" />
                </div>
              </div>
              <div class="form-group">
                <label>Street Address *</label>
                <input type="text" id="co-address" placeholder="1 Apple Park Way" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City *</label>
                  <input type="text" id="co-city" placeholder="Cupertino" required />
                </div>
                <div class="form-group">
                  <label>ZIP / Postal Code *</label>
                  <input type="text" id="co-zip" placeholder="95014" required />
                </div>
              </div>
              <div class="form-group">
                <label>Order Notes (optional)</label>
                <textarea id="co-notes" placeholder="Any special instructions..."></textarea>
              </div>
            </form>
          </div>
          <div class="checkout-card" style="margin-top:20px;">
            <h3>Payment Method</h3>
            <div class="checkout-payment-methods">
              <div class="payment-method selected" data-method="card">
                <span class="payment-method-icon">💳</span>Credit Card
              </div>
              <div class="payment-method" data-method="apple_pay">
                <span class="payment-method-icon"> </span>Apple Pay
              </div>
              <div class="payment-method" data-method="paypal">
                <span class="payment-method-icon">🅿️</span>PayPal
              </div>
            </div>
            <div id="card-fields">
              <div class="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="4242 4242 4242 4242" maxlength="19" id="co-card" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" maxlength="5" />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="text" placeholder="123" maxlength="4" />
                </div>
              </div>
            </div>
          </div>
          <p id="checkout-err" style="color:var(--red);font-size:14px;margin-top:12px;"></p>
          <button class="btn-primary w-full" id="place-order-btn" style="margin-top:16px;padding:16px;">
            Place Order — $${(summ.total||0).toFixed(2)}
          </button>
        </div>
        <div class="checkout-order-summary">
          <h3>Your Order</h3>
          ${items.map(item=>`
            <div class="cos-item">
              <div class="cos-item-img"><img src="${item.img}" alt="${item.name}" /></div>
              <div class="cos-item-name">${item.name} <span style="color:var(--text-sec);">×${item.quantity}</span></div>
              <div class="cos-item-price">$${item.lineTotal.toFixed(2)}</div>
            </div>`).join("")}
          <div class="cart-totals" style="margin-top:16px;">
            <div class="ct-row"><span>Subtotal</span><span>$${(summ.subtotal||0).toFixed(2)}</span></div>
            <div class="ct-row"><span>Shipping</span><span>${summ.shipping===0?"Free":"$"+(summ.shipping||0).toFixed(2)}</span></div>
            <div class="ct-row ct-tax"><span>Tax (8%)</span><span>$${(summ.tax||0).toFixed(2)}</span></div>
            <div class="ct-row ct-total"><span>Total</span><span>$${(summ.total||0).toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>`;

  // Payment method selection
  container.querySelectorAll(".payment-method").forEach(el => {
    el.addEventListener("click", () => {
      container.querySelectorAll(".payment-method").forEach(e => e.classList.remove("selected"));
      el.classList.add("selected");
      selectedPayment = el.dataset.method;
      container.querySelector("#card-fields").style.display = selectedPayment === "card" ? "" : "none";
    });
  });

  // Card number formatting
  container.querySelector("#co-card")?.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g,"").substring(0,16);
    e.target.value = v.replace(/(.{4})/g,"$1 ").trim();
  });

  // Place order
  container.querySelector("#place-order-btn").addEventListener("click", async () => {
    const name    = document.getElementById("co-name")?.value.trim();
    const address = document.getElementById("co-address")?.value.trim();
    const city    = document.getElementById("co-city")?.value.trim();
    const zip     = document.getElementById("co-zip")?.value.trim();
    const notes   = document.getElementById("co-notes")?.value.trim();
    const errEl   = document.getElementById("checkout-err");
    const btn     = document.getElementById("place-order-btn");

    if (!name||!address||!city||!zip) { errEl.textContent = "Please fill in all required shipping fields."; return; }
    errEl.textContent = "";
    btn.textContent = "Placing order…"; btn.disabled = true;
    try {
      const data = await api("POST","/orders",{
        shippingName:name, shippingAddress:address, shippingCity:city,
        shippingZip:zip, paymentMethod:selectedPayment, notes,
      });
      await refreshCart();
      navigate(`/order-confirm/${data.order.id}`);
    } catch(err) {
      errEl.textContent = err.message;
      btn.textContent = `Place Order — $${(summ.total||0).toFixed(2)}`;
      btn.disabled = false;
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  VIEW: ORDER CONFIRMATION
// ─────────────────────────────────────────────────────────────
async function renderOrderConfirmPage(orderId, container) {
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let order;
  try { const d = await api("GET",`/orders/${orderId}`); order = d.order; } catch {
    container.innerHTML = `<div class="page-container"><h2>Order not found.</h2></div>`; return;
  }
  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="order-confirm-page">
        <div class="order-confirm-icon"></div>
        <h1>Order Confirmed!</h1>
        <p>Thank you, <strong>${order.shipping_name}</strong>! Your order has been placed successfully and will be shipped to <strong>${order.shipping_city}</strong>.</p>
        <div class="order-info-card">
          <div class="order-info-row"><span>Order #</span><strong>${order.id}</strong></div>
          <div class="order-info-row"><span>Status</span><strong><span class="order-status-badge status-confirmed">✓ Confirmed</span></strong></div>
          <div class="order-info-row"><span>Ship to</span><strong>${order.shipping_address}, ${order.shipping_city} ${order.shipping_zip}</strong></div>
          <div class="order-info-row"><span>Payment</span><strong>${order.payment_method==="card"?"💳 Credit Card":order.payment_method==="apple_pay"?" Apple Pay":"🅿️ PayPal"}</strong></div>
          <div class="order-info-row"><span>Total</span><strong>$${parseFloat(order.total_amount).toFixed(2)}</strong></div>
        </div>
        <div class="order-info-card">
          <h4 style="font-size:15px;font-weight:700;margin-bottom:16px;">Items Ordered</h4>
          ${(order.items||[]).map(i=>`
            <div class="order-info-row">
              <span>${i.product_name} <span style="color:var(--text-sec);">×${i.quantity}</span></span>
              <strong>$${(i.line_total||i.product_price*i.quantity).toFixed(2)}</strong>
            </div>`).join("")}
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn-primary" data-route="/orders">View My Orders</button>
          <button class="btn-secondary" data-route="/shop">Continue Shopping</button>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  VIEW: ORDERS PAGE
// ─────────────────────────────────────────────────────────────
async function renderOrdersPage(container) {
  if (!authToken) { openModal("login"); navigate("/"); return; }
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let orders = [];
  try { const d = await api("GET","/orders"); orders = d.orders; } catch {}

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="page-container page-enter">
        <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Orders</span></div>
        <div class="orders-empty">
          <div style="font-size:64px;margin-bottom:20px;">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here.</p>
          <button class="btn-primary" data-route="/shop">Start Shopping</button>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>My Orders</span></div>
      <div class="page-header"><h1>My Orders</h1><p>${orders.length} order${orders.length!==1?"s":""}</p></div>
      <div class="orders-list">
        ${orders.map(o=>`
          <div class="order-card" id="ocard-${o.id}">
            <div class="order-card-header" data-order="${o.id}">
              <div class="order-card-meta">
                <span class="order-id">Order #${o.id}</span>
                <span class="order-date">${new Date(o.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</span>
                <span class="order-status-badge status-${o.status}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span>
              </div>
              <span class="order-total">$${parseFloat(o.total_amount).toFixed(2)}</span>
            </div>
            <div class="order-card-items" id="oi-${o.id}">
              ${o.items.map(i=>`
                <div class="order-card-item">
                  <div style="flex:1;">
                    <span class="oci-name">${i.product_name}</span>
                  </div>
                  <span class="oci-qty">×${i.quantity}</span>
                  <span class="oci-price">$${(i.line_total||i.product_price*i.quantity).toFixed(2)}</span>
                </div>`).join("")}
              <div class="order-card-footer">
                <span style="font-size:13px;color:var(--text-sec);">Shipped to: ${o.shipping_city}, ${o.shipping_zip}</span>
                ${["pending","confirmed"].includes(o.status)?`<button class="cancel-order-btn" data-id="${o.id}">Cancel Order</button>`:""}
              </div>
            </div>
          </div>`).join("")}
      </div>
    </div>`;

  // Toggle order expand
  container.querySelectorAll(".order-card-header").forEach(h => {
    h.addEventListener("click", () => {
      const id  = h.dataset.order;
      const oi  = document.getElementById(`oi-${id}`);
      oi.classList.toggle("open");
    });
  });
  // Cancel buttons
  container.querySelectorAll(".cancel-order-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      if (!confirm("Cancel this order?")) return;
      try {
        await api("PUT", `/orders/${btn.dataset.id}/cancel`);
        showToast("Order cancelled");
        renderOrdersPage(container);
      } catch (err) { showToast(`${err.message}`); }
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  VIEW: WISHLIST PAGE
// ─────────────────────────────────────────────────────────────
async function renderWishlistPage(container) {
  if (!authToken) { openModal("login"); navigate("/"); return; }
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let wishlist = [];
  try { const d = await api("GET","/wishlist"); wishlist = d.wishlist; } catch {}

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="page-container page-enter">
        <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Wishlist</span></div>
        <div class="wishlist-empty">
          <h3>Your wishlist is empty</h3>
          <p>Save items you love by clicking the heart icon.</p>
          <button class="btn-primary" data-route="/shop">Explore Products</button>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Wishlist</span></div>
      <div class="page-header"><h1>My Wishlist</h1><p>${wishlist.length} saved item${wishlist.length!==1?"s":""}</p></div>
      <div class="wishlist-grid" id="wishlist-grid"></div>
    </div>`;

  const grid = container.querySelector("#wishlist-grid");
  wishlist.forEach(p => grid.appendChild(buildCard(p)));
  applyWishlistState();
}

// ─────────────────────────────────────────────────────────────
//  VIEW: PROFILE PAGE
// ─────────────────────────────────────────────────────────────
async function renderProfilePage(container) {
  if (!authToken) { openModal("login"); navigate("/"); return; }
  container.innerHTML = `<div class="page-spinner"><div class="spinner"></div></div>`;
  let orders = []; let wishlistCount = 0;
  try { const d = await api("GET","/orders"); orders = d.orders; } catch {}
  try { const d = await api("GET","/wishlist"); wishlistCount = d.wishlist.length; } catch {}
  const initials = authUser.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="breadcrumb"><a href="/" data-route="/">Home</a><span>›</span><span>Profile</span></div>
      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="profile-avatar">${initials}</div>
          <p class="profile-name">${authUser.name}</p>
          <p class="profile-email">${authUser.email}</p>
          <div class="profile-stat-row">
            <div class="profile-stat"><span class="profile-stat-num">${orders.length}</span><span class="profile-stat-label">Orders</span></div>
            <div class="profile-stat"><span class="profile-stat-num">${wishlistCount}</span><span class="profile-stat-label">Saved</span></div>
          </div>
          <nav class="profile-nav-links">
            <div class="profile-nav-link active" data-section="info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Info
            </div>
            <div class="profile-nav-link" data-section="security">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Security
            </div>
            <div class="profile-nav-link" data-route="/orders">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Orders
            </div>
            <div class="profile-nav-link" data-route="/wishlist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Wishlist
            </div>
          </nav>
        </aside>
        <div class="profile-main">
          <div class="profile-card" id="section-info">
            <h3>Personal Information</h3>
            <div class="form-group"><label>Full Name</label><input type="text" id="prof-name" value="${authUser.name}" /></div>
            <div class="form-group"><label>Email</label><input type="email" id="prof-email" value="${authUser.email}" /></div>
            <p id="prof-err" style="color:var(--red);font-size:14px;margin-bottom:8px;"></p>
            <button class="btn-primary save-btn" id="save-profile-btn">Save Changes</button>
          </div>
          <div class="profile-card" id="section-security" style="display:none;">
            <h3>Change Password</h3>
            <div class="form-group"><label>Current Password</label><input type="password" id="curr-pass" placeholder="••••••••" /></div>
            <div class="form-group"><label>New Password</label><input type="password" id="new-pass" placeholder="Min. 6 characters" /></div>
            <div class="form-group"><label>Confirm New Password</label><input type="password" id="conf-pass" placeholder="Repeat password" /></div>
            <p id="pass-err" style="color:var(--red);font-size:14px;margin-bottom:8px;"></p>
            <p id="pass-ok" style="color:var(--green);font-size:14px;margin-bottom:8px;"></p>
            <button class="btn-primary save-btn" id="change-pass-btn">Update Password</button>
          </div>
        </div>
      </div>
    </div>`;

  // Sidebar section navigation
  container.querySelectorAll(".profile-nav-link[data-section]").forEach(link => {
    link.addEventListener("click", () => {
      container.querySelectorAll(".profile-nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const sec = link.dataset.section;
      ["info","security"].forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = s === sec ? "" : "none";
      });
    });
  });

  // Save profile
  document.getElementById("save-profile-btn")?.addEventListener("click", async () => {
    const name  = document.getElementById("prof-name").value.trim();
    const email = document.getElementById("prof-email").value.trim();
    const errEl = document.getElementById("prof-err");
    errEl.textContent = "";
    if (!name || !email) { errEl.textContent = "Name and email are required."; return; }
    try {
      const data = await api("PUT","/auth/me",{name,email});
      authUser = data.user;
      localStorage.setItem("etherx_user", JSON.stringify(authUser));
      renderAuthArea();
      showToast("Profile updated!");
      renderProfilePage(container);
    } catch(err) { errEl.textContent = err.message; }
  });

  // Change password
  document.getElementById("change-pass-btn")?.addEventListener("click", async () => {
    const curr = document.getElementById("curr-pass").value;
    const nw   = document.getElementById("new-pass").value;
    const conf = document.getElementById("conf-pass").value;
    const errEl = document.getElementById("pass-err");
    const okEl  = document.getElementById("pass-ok");
    errEl.textContent = ""; okEl.textContent = "";
    if (!curr||!nw) { errEl.textContent = "Please fill in all fields."; return; }
    if (nw !== conf) { errEl.textContent = "Passwords do not match."; return; }
    if (nw.length < 6) { errEl.textContent = "Password must be at least 6 characters."; return; }
    try {
      await api("PUT","/auth/me",{currentPassword:curr,newPassword:nw});
      okEl.textContent = "Password changed successfully!";
      ["curr-pass","new-pass","conf-pass"].forEach(id => document.getElementById(id).value = "");
    } catch(err) { errEl.textContent = err.message; }
  });
}

// ─────────────────────────────────────────────────────────────
//  VIEW: ABOUT PAGE
// ─────────────────────────────────────────────────────────────
function renderAboutPage(container) {
  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="about-hero">
        <h1>We're EtherX</h1>
        <p>Building the future of Apple accessory retail — one premium product at a time.</p>
      </div>
      <div class="about-stats">
        <div class="about-stat"><span class="about-stat-num">500+</span><span class="about-stat-label">Products</span></div>
        <div class="about-stat"><span class="about-stat-num">50K+</span><span class="about-stat-label">Customers</span></div>
        <div class="about-stat"><span class="about-stat-num">4.9★</span><span class="about-stat-label">Avg Rating</span></div>
        <div class="about-stat"><span class="about-stat-num">99%</span><span class="about-stat-label">Satisfaction</span></div>
      </div>
      <div class="about-mission">
        <h2>Our Mission</h2>
        <p>At EtherX, we believe that the accessories you pair with your Apple devices should be as premium, thoughtful, and well-designed as the devices themselves. Founded in 2019 by a team of Apple enthusiasts, we curate and sell only the finest tech accessories that meet our strict quality standards — from MagSafe chargers to precision-engineered watch bands.</p>
        <p style="margin-top:16px;">Every product in our catalog is personally tested by our team. If it doesn't meet our standards, it doesn't make the cut. Simple as that.</p>
      </div>
      <div class="about-values">
        <div class="value-card">
          <div class="value-icon">🎯</div>
          <h4>Precision Quality</h4>
          <p>Every product is hand-selected and rigorously tested before it ever reaches our store.</p>
        </div>
        <div class="value-card">
          <div class="value-icon">🌱</div>
          <h4>Sustainability</h4>
          <p>We prioritize eco-friendly packaging and partner with brands committed to reducing their carbon footprint.</p>
        </div>
        <div class="value-card">
          <div class="value-icon">💙</div>
          <h4>Customer First</h4>
          <p>With 24/7 support and a 30-day hassle-free return policy, your satisfaction is always guaranteed.</p>
        </div>
        <div class="value-card">
          <div class="value-icon"></div>
          <h4>Innovation</h4>
          <p>We're always ahead of the curve, stocking the latest and greatest from the Apple ecosystem.</p>
        </div>
      </div>
      <div class="about-team">
        <h2>Meet the Team</h2>
        <div class="team-grid">
          ${[
            {name:"Alex Chen",role:"CEO & Co-Founder",img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"},
            {name:"Sarah Kim",role:"Head of Product",img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"},
            {name:"Marcus Liu",role:"Lead Designer",img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"},
            {name:"Emma Park",role:"Customer Success",img:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"},
          ].map(m=>`
            <div class="team-card">
              <div class="team-avatar"><img src="${m.img}" alt="${m.name}" /></div>
              <p class="team-name">${m.name}</p>
              <p class="team-role">${m.role}</p>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  VIEW: SUPPORT PAGE
// ─────────────────────────────────────────────────────────────
function renderSupportPage(container) {
  const faqs = [
    {q:"How long does shipping take?",a:"Standard shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout. Orders over $50 ship free via standard shipping."},
    {q:"What is your return policy?",a:"We offer a 30-day hassle-free return policy. Items must be in original condition with packaging. Simply initiate a return from your order history page and we'll email a prepaid return label."},
    {q:"Are your products Apple-certified?",a:"All Apple-branded products are genuine. Third-party accessories are carefully vetted and certified to work perfectly with Apple devices. MFi-certified products are clearly labeled."},
    {q:"How do I track my order?",a:"Once your order ships, you'll receive an email with a tracking number. You can also view order status anytime under My Account → My Orders."},
    {q:"Can I change or cancel my order?",a:"Orders can be cancelled within 1 hour of placement from the My Orders page. After that, the order has likely been processed and cannot be changed. Contact support if you need help."},
    {q:"Do you offer a warranty?",a:"Yes! All products come with a minimum 1-year manufacturer warranty. Premium products like Apple Watch and AirPods come with Apple's standard 2-year warranty. EtherX also offers extended warranty plans."},
    {q:"Is my payment information secure?",a:"Absolutely. We use industry-standard SSL encryption for all transactions. We never store your full card number. Payments are processed by Stripe, a PCI-DSS Level 1 certified provider."},
  ];

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="support-search">
        <h1>How can we help?</h1>
        <p>Search our knowledge base or browse topics below.</p>
        <div class="support-search-bar">
          <input type="text" id="faq-search" placeholder="e.g. returns, shipping, warranty…" />
          <button onclick="document.querySelectorAll('.faq-item').forEach(el=>{const q=el.querySelector('.faq-question span').textContent.toLowerCase();el.style.display=document.getElementById('faq-search').value&&!q.includes(document.getElementById('faq-search').value.toLowerCase())?'none':''})">Search</button>
        </div>
      </div>
      <div class="support-topics">
        ${[
          {icon:"📦",title:"Orders & Shipping",desc:"Track, modify, or cancel"},
          {icon:"🔄",title:"Returns & Refunds",desc:"30-day hassle-free policy"},
          {icon:"🛡️",title:"Warranty & Repairs",desc:"Coverage & claims"},
          {icon:"💳",title:"Payments",desc:"Billing, cards & receipts"},
          {icon:"📱",title:"Compatibility",desc:"Device & software checks"},
          {icon:"🎁",title:"Gift Cards",desc:"Buy, redeem, balance"},
        ].map(t=>`
          <div class="support-topic">
            <div class="support-topic-icon">${t.icon}</div>
            <h4>${t.title}</h4>
            <p>${t.desc}</p>
          </div>`).join("")}
      </div>
      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        ${faqs.map((f,i)=>`
          <div class="faq-item" id="faq-${i}">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('open')">
              <span>${f.q}</span>
              <svg class="faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="faq-answer"><p>${f.a}</p></div>
          </div>`).join("")}
      </div>
      <div class="contact-grid">
        <div class="contact-card">
          <div class="contact-icon">💬</div>
          <h4>Live Chat</h4>
          <p>Chat with our support team in real time, available 9am–10pm daily.</p>
          <button class="btn-primary" onclick="showToast('💬 Live chat coming soon!')">Start Chat</button>
        </div>
        <div class="contact-card">
          <div class="contact-icon">📧</div>
          <h4>Email Support</h4>
          <p>Send us an email and we'll get back to you within 24 hours.</p>
          <button class="btn-primary" onclick="showToast('📧 support@etherx-shop.com')">Send Email</button>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  VIEW: 404
// ─────────────────────────────────────────────────────────────
function render404(container) {
  container.innerHTML = `
    <div class="page-container page-enter" style="text-align:center;padding:80px 24px;">
      <div style="font-size:80px;margin-bottom:20px;">🔍</div>
      <h1 style="font-size:48px;font-weight:900;margin-bottom:12px;">404</h1>
      <p style="font-size:18px;color:var(--text-sec);margin-bottom:32px;">Page not found. It may have been moved or deleted.</p>
      <button class="btn-primary" data-route="/">Go Home</button>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  HOME CATEGORY PILLS (filter featured grid)
// ─────────────────────────────────────────────────────────────
document.querySelectorAll(".cat-pill").forEach(pill => {
  pill.addEventListener("click", function () {
    document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
    this.classList.add("active");
    const filter = this.dataset.filter;
    if (filter === "all") {
      renderGrid("featured-grid", { type:"featured", limit:8 });
    } else {
      renderGrid("featured-grid", { category:filter, limit:8 });
    }
  });
});

// ─────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────
async function init() {
  renderAuthArea();
  if (authToken) await loadWishlist();

  // Handle initial URL (e.g. direct nav to /shop, /orders etc.)
  const url = new URL(window.location.href);
  if (url.pathname && url.pathname !== "/") {
    dispatch(url.pathname, url.searchParams);
    updateNavLinks(url.pathname);
  } else {
    // Load home grids
    await Promise.all([
      renderGrid("featured-grid", { type:"featured", limit:8 }),
      renderGrid("arrivals-grid", { type:"new_arrival", limit:4 }),
    ]);
    if (!authToken) renderCartBadge(localCart.reduce((s,i)=>s+i.qty,0));
    else refreshCart();
  }
}

init();
