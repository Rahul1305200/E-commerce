const SITE_ROOT = (() => {
  if (window.location.protocol !== 'file:') return `${window.location.origin}/`;
  const path = decodeURIComponent(window.location.pathname.replace(/\\/g, '/'));
  const marker = '/standalone-site/';
  const index = path.toLowerCase().lastIndexOf(marker);
  const rootPath = index >= 0 ? path.slice(0, index + marker.length) : path.slice(0, path.lastIndexOf('/') + 1);
  return `file://${rootPath}`;
})();

const siteUrl = path => {
  const value = String(path || '').replace(/^\/+/, '');
  const [pathname, suffix = ''] = value.split(/(?=[?#])/);
  const file = !pathname || pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  return new URL(file + suffix, SITE_ROOT).href;
};

const ICONS = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  return: '<path d="m9 5-5 5 5 5"/><path d="M4 10h10a6 6 0 0 1 6 6v3"/>'
};

const uiIcon = (name, className = 'ui-icon') => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

const PRODUCTS = [
  {id:786,name:'Natural Hair Growth Serum',price:69.99,kind:'oil',color:'#5d6d55'},
  {id:784,name:'Rosemary Hair Growth Oil',price:64.99,kind:'oil',color:'#8a6b37'},
  {id:782,name:'Long-Lasting Hair & Body Mist',price:54.99,kind:'mist',color:'#b98574'},
  {id:779,name:'Natural Twist & Lock Hair Styling Gel',price:49.99,kind:'jar',color:'#394138'},
  {id:777,name:'Plant-Based Crystal Repair Hair Oil',price:44.99,kind:'oil',color:'#71846a'},
  {id:775,name:'Crystal Repair Hair Oil',price:34.99,kind:'oil',color:'#a4683f'},
  {id:773,name:'Long Lasting Women’s Cologne Mist',price:29.99,kind:'mist',color:'#8d7387'},
  {id:771,name:'Refreshing Hair Perfume Mist',price:19.99,kind:'mist',color:'#b76f69'},
  {id:769,name:'Organic Strong Hold Hair Styling Gel',price:14.99,kind:'jar',color:'#596450'},
  {id:766,name:'Strong Hold Hair Slick Stick',price:9.99,kind:'stick',color:'#8a5a3b',url:'/product/strong-hold-hair-slick-stick/'},
  {id:641,name:'Natural Vitamin E Oil – Skin & Hair Care',price:59.99,kind:'oil',color:'#a77835'},
  {id:634,name:'Jojoba Oil Natural Liquid Gold for Skin, Hair, and Beyond',price:39.99,kind:'oil',color:'#9a713e'},
  {id:628,name:'Honey Infused Hair Oil – Hydrating, Repairing, Frizz Control',price:24.99,kind:'oil',color:'#a56f28'},
  {id:622,name:'Natural Hair Growth Oil – Organic Honey Treatment',price:7.99,kind:'oil',color:'#76623f'}
];
const PRODUCT_ROUTES = {
  786:'natural-hair-growth-serum', 784:'rosemary-hair-growth-oil', 782:'long-lasting-hair-body-mist',
  779:'natural-twist-lock-hair-styling-gel', 777:'plant-based-crystal-repair-hair-oil',
  775:'crystal-repair-hair-oil', 773:'long-lasting-womens-cologne-mist',
  771:'refreshing-hair-perfume-mist', 769:'organic-strong-hold-hair-styling-gel',
  766:'strong-hold-hair-slick-stick', 641:'natural-vitamin-e-oil-skin-hair-care',
  634:'jojoba-oil-natural-liquid-gold-for-skin-hair-and-beyond',
  628:'honey-infused-hair-oil-hydrating-repairing-frizz-control',
  622:'natural-hair-growth-oil-organic-honey-treatment'
};

const money = value => `$${value.toFixed(2)}`;
const CART_KEY = 'mhs-static-cart';
const sanitizeCart = value => Object.fromEntries(Object.entries(value || {})
  .filter(([id, qty]) => PRODUCTS.some(product => product.id === Number(id)) && Number.isInteger(Number(qty)) && Number(qty) > 0)
  .map(([id, qty]) => [id, Math.min(Number(qty), 99)]));
const readStoredCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '{}'); }
  catch { return {}; }
};
const readUrlCart = () => {
  try { return JSON.parse(new URLSearchParams(location.search).get('cart') || 'null'); }
  catch { return null; }
};
let cartState = sanitizeCart(readUrlCart() || readStoredCart());
const getCart = () => ({ ...cartState });
const saveCart = cart => {
  cartState = sanitizeCart(cart);
  try { localStorage.setItem(CART_KEY, JSON.stringify(cartState)); } catch { /* File URLs may block storage. */ }
  updateCartCount();
  updatePortableCartLinks();
};
const cartCount = () => Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);

function sharedLayout() {
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');
  if (header) header.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="utility"><div class="wrap utility-row">
      <div class="utility-contact-group"><a class="utility-item" href="tel:+18008137430">${uiIcon('phone')}<span>+1 (800) 813-7430</span></a><span class="utility-divider" aria-hidden="true"></span><a class="utility-item" href="mailto:contact@myhairskin.local">${uiIcon('mail')}<span>contact@myhairskin.local</span></a></div>
      <a class="utility-item" href="${siteUrl('contact/')}">${uiIcon('user')}<span>Contact</span></a>
    </div></div>
    <header class="site-header"><div class="wrap header-row">
      <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-primary-nav"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path class="menu-icon-lines" d="M4 6h16M4 12h16M4 18h16"/><path class="menu-icon-close" d="M5 5l14 14M19 5 5 19"/></svg></button>
      <nav class="nav" id="site-primary-nav" aria-label="Primary"><a href="${siteUrl('')}">Home</a><a href="${siteUrl('shop/')}">Products</a><a href="${siteUrl('contact/')}">Contact</a><a href="${siteUrl('ingredients/')}">Ingredients</a></nav>
      <a class="brand" href="${siteUrl('')}"><img src="${siteUrl('assets/images/logo.svg')}" alt=""><span><span class="brand-name">MyHairSkins</span><span class="brand-tag">Hair &amp; skin care</span></span></a>
      <div class="header-tools">
        <a class="cart-link" aria-label="Cart, 0 items" href="${siteUrl('cart/')}">${uiIcon('bag')}<span class="cart-count">0</span></a>
      </div>
    </div></header>`;
  if (footer) footer.innerHTML = `
    <footer class="site-footer">
      <div class="wrap footer-live-layout">
        <div class="footer-live-main">
          <div class="payment-badges"><img class="footer-payment-image" src="${siteUrl('assets/images/footer-payments.webp')}" alt="Visa, Mastercard, Discover, Apple Pay, and Google Pay"></div>
          <div class="footer-signature"><img src="${siteUrl('assets/images/logo.svg')}" alt=""><div><strong>MyHairSkins</strong><span>Hair and skin care</span></div></div>
          <div class="footer-contact-list"><div>${uiIcon('pin')}<span>3128 Walton Blvd, Suite 111, Rochester Hills, MI 48309</span></div><a href="tel:+18008137430">${uiIcon('phone')}<span>+1 (800) 813-7430</span></a><a href="mailto:contact@myhairskin.local">${uiIcon('mail')}<span>contact@myhairskin.local</span></a><div>${uiIcon('truck')}<span>Shipping within 7 days with USPS</span></div></div>
          <p class="footer-disclaimer"><strong>Important:</strong> The products and statements shown on this demonstration website have not been evaluated to diagnose, treat, cure, or prevent any condition. The material is provided for general information and should not replace advice from a qualified medical professional. Read all product packaging and labels carefully before use. If you have a health concern or suspect a medical problem, contact an appropriate healthcare provider. Individual experiences and results may vary.</p>
        </div>
        <nav class="footer-live-links" aria-label="Footer information"><div class="footer-title">Information</div><div class="footer-links"><a href="${siteUrl('privacy-policy/')}">Privacy policy</a><a href="${siteUrl('terms-conditions/')}">Terms &amp; conditions</a><a href="${siteUrl('contact/')}">Contact</a></div></nav>
      </div>
      <div class="wrap footer-newsletter-row"><form class="footer-subscribe" data-demo-form><label for="footer-email">Email updates</label><div><input id="footer-email" type="email" placeholder="Email" required><button type="submit">Send</button></div><p class="notice">This is a static demonstration. Your email was not submitted.</p></form></div>
      <div class="wrap footer-bottom">© ${new Date().getFullYear()} MyHairSkins. All rights reserved.</div>
    </footer>`;
  const menu = document.querySelector('.menu-button');
  if (header) {
    const syncHeaderHeight = () => document.documentElement.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    syncHeaderHeight();
    if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
    else window.addEventListener('resize', syncHeaderHeight);
  }
  document.querySelectorAll('[data-icon]').forEach(element => {
    element.innerHTML = uiIcon(element.dataset.icon);
  });
  menu?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-expanded', String(open));
  });
}

function productCard(product, showCartButton = true) {
  const label = product.kind === 'jar' ? 'Styling gel' : product.kind === 'mist' ? 'Hair mist' : product.kind === 'stick' ? 'Slick stick' : 'Hair oil';
  const destination = `product/${PRODUCT_ROUTES[product.id]}/index.html`;
  const name = `<a class="product-name" href="${siteUrl(destination)}">${product.name}</a>`;
  return `<article class="product-card">
    <a class="product-art" href="${siteUrl(destination)}" aria-label="View ${product.name}"><span class="pack pack--${product.kind}" style="--pack:${product.color}" data-label="${label}"></span></a>
    <div class="product-meta">${name}<span class="product-price">${money(product.price)}</span>${showCartButton ? `<button class="add-button" type="button" data-add="${product.id}">Add to cart</button>` : ''}</div>
  </article>`;
}

function renderProducts() {
  const query = (new URLSearchParams(window.location.search).get('q') || '').trim().toLocaleLowerCase();
  document.querySelectorAll('[data-product-grid]').forEach(grid => {
    const limit = Number(grid.dataset.limit || PRODUCTS.length);
    const matches = query ? PRODUCTS.filter(product => product.name.toLocaleLowerCase().includes(query)) : PRODUCTS;
    grid.innerHTML = matches.length
      ? matches.slice(0, limit).map(product => productCard(product)).join('')
      : `<p class="empty-search">No products found for “${query.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]))}”.</p>`;

    if (grid.hasAttribute('data-infinite') && matches.length) {
      enableInfiniteProducts(grid, matches);
    }
  });
}

function setupFeaturedCarousel() {
  const viewport = document.querySelector('[data-featured-carousel]');
  const previous = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (!viewport || !previous || !next) return;

  const move = direction => {
    const card = viewport.querySelector('.product-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(viewport.querySelector('.featured-grid')).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const left = direction > 0
      ? (viewport.scrollLeft >= end - 2 ? 0 : Math.min(viewport.scrollLeft + step, end))
      : (viewport.scrollLeft <= 2 ? end : Math.max(viewport.scrollLeft - step, 0));
    viewport.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
}

function enableInfiniteProducts(grid, products) {
  const status = document.querySelector('[data-infinite-status]');
  if (!status || !('IntersectionObserver' in window)) return;

  let loading = false;
  let loop = 1;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || loading) return;
    loading = true;
    status.classList.add('is-loading');
    status.lastChild.textContent = 'Loading more products';

    window.setTimeout(() => {
      const batch = document.createDocumentFragment();
      const template = document.createElement('template');
      template.innerHTML = products.map(product => productCard(product)).join('');
      batch.append(...template.content.childNodes);
      grid.appendChild(batch);
      loop += 1;
      status.dataset.loop = String(loop);
      status.lastChild.textContent = 'Scroll to continue browsing';
      status.classList.remove('is-loading');
      loading = false;
    }, 120);
  }, { rootMargin: '500px 0px', threshold: 0 });

  observer.observe(status);
}

function addToCart(id, quantity = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + quantity;
  saveCart(cart);
  document.querySelectorAll(`[data-add="${id}"]`).forEach(button => {
    const original = button.textContent;
    button.textContent = 'Added';
    setTimeout(() => button.textContent = original, 900);
  });
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = String(cartCount()));
  document.querySelectorAll('.cart-link').forEach(el => el.setAttribute('aria-label', `Cart, ${cartCount()} items`));
}

function renderCart() {
  const list = document.querySelector('[data-cart-list]');
  const cart = getCart();
  const entries = Object.entries(cart).filter(([id,qty]) => qty > 0 && PRODUCTS.some(item => item.id === Number(id)));
  const coupon = document.querySelector('[data-cart-coupon-form]');
  if (coupon) coupon.hidden = !entries.length;
  if (list) {
    if (!entries.length) {
      list.innerHTML = `<div class="empty-cart"><p>Your cart is currently empty.</p><a class="button" href="${siteUrl('shop/')}">Return to products</a></div>`;
    } else {
      list.innerHTML = entries.map(([id,qty]) => {
        const product = PRODUCTS.find(item => item.id === Number(id));
        return `<div class="cart-item"><div class="cart-thumb"><span style="background:${product.color}"></span></div><div><h3>${product.name}</h3><p>Quantity: ${qty}</p><button class="remove-item" type="button" data-remove="${id}">Remove</button></div><strong>${money(product.price * qty)}</strong></div>`;
      }).join('');
    }
  }
  const total = entries.reduce((sum,[id,qty]) => sum + PRODUCTS.find(item => item.id === Number(id)).price * qty, 0);
  document.querySelectorAll('[data-cart-total]').forEach(el => el.textContent = money(total));
  renderCheckoutSummary(entries, total);
  updatePortableCartLinks();
}

function renderCheckoutSummary(entries, total) {
  const list = document.querySelector('[data-checkout-items]');
  if (!list) return;
  list.innerHTML = entries.length
    ? entries.map(([id, qty]) => {
      const product = PRODUCTS.find(item => item.id === Number(id));
      const thumbnail = product.id === 766
        ? '<img src="' + siteUrl('assets/images/slick-stick-product.png') + '" alt="">'
        : '<span style="background:' + product.color + '"></span>';
      return `<div class="checkout-item"><span><span class="checkout-thumb">${thumbnail}<small>${qty}</small></span>${product.name}</span><strong>${money(product.price * qty)}</strong></div>`;
    }).join('')
    : `<p class="checkout-empty">Your cart is empty. <a href="${siteUrl('shop/')}">Browse products</a></p>`;
  document.querySelectorAll('[data-place-total]').forEach(el => el.textContent = money(total));
}

function renderProductDetail() {
  const mount = document.querySelector('[data-product-detail]');
  if (!mount) return;
  const id = Number(mount.dataset.productId || new URLSearchParams(location.search).get('id'));
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) {
    mount.innerHTML = `<p>Product not found. <a href="${siteUrl('shop/')}">Return to products</a></p>`;
    return;
  }
  const label = product.kind === 'jar' ? 'Styling gel' : product.kind === 'mist' ? 'Hair mist' : product.kind === 'stick' ? 'Slick stick' : 'Hair oil';
  const content = typeof PRODUCT_CONTENT === 'undefined' ? {} : PRODUCT_CONTENT[String(id)] || {};
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const photograph = id === 784 ? 'assets/images/rosemary-product.png' : id === 766 ? 'assets/images/slick-stick-product.png' : '';
  const mainImage = photograph
    ? `<img src="${siteUrl(photograph)}" alt="${escapeHtml(product.name)} product photograph">`
    : `<div class="product-art product-art--detail" role="img" aria-label="${escapeHtml(product.name)} product illustration"><span class="pack pack--${product.kind}" style="--pack:${product.color}" data-label="${label}"></span></div>`;
  const details = [
    ...(content.description || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`),
    content.ingredients ? `<h2>Product Ingredients</h2><p class="product-ingredients">${escapeHtml(content.ingredients)}</p>` : '',
    ...(content.attributes?.length ? [`<h2>Product details</h2><ul class="product-attributes">${content.attributes.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`] : []),
    content.net ? `<p class="product-net">Net. ${escapeHtml(content.net)}</p>` : ''
  ].join('');
  document.title = `${product.name} — MyHairSkins`;
  mount.innerHTML = `<div class="product-gallery">
      <div class="product-gallery-stage"><div class="product-gallery-panel" data-gallery-panel="0">${mainImage}</div><div class="product-gallery-panel" data-gallery-panel="1" hidden><img src="${siteUrl('assets/images/sample-product-label.svg')}" alt="Sample product label"></div><button class="gallery-zoom" type="button" data-gallery-zoom aria-label="View full-screen image gallery"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 6 6"/></svg></button></div>
      <div class="product-gallery-thumbs" aria-label="Product images"><button type="button" data-gallery-thumb="0" aria-label="Show product photograph" aria-pressed="true">${mainImage}</button><button type="button" data-gallery-thumb="1" aria-label="Show sample label" aria-pressed="false"><img src="${siteUrl('assets/images/sample-product-label.svg')}" alt=""></button></div>
      <dialog class="product-lightbox"><button class="product-lightbox-close" type="button" aria-label="Close image gallery">×</button><div class="product-lightbox-body"></div></dialog>
    </div>
    <div class="product-detail-copy"><p class="kicker">${label}</p><h1>${escapeHtml(product.name)}</h1><div class="price-large">${money(product.price)} <small>USD</small></div>
      <div class="quantity-row"><label class="field"><span>Quantity</span><input data-quantity type="number" min="1" max="99" value="1"></label><button class="button" type="button" data-add="${product.id}">Add to cart</button></div>
      <p class="product-feedback" data-cart-feedback role="status" aria-live="polite"></p>
      <div class="product-payment"><img src="${siteUrl('assets/images/footer-payments.webp')}" alt="Visa, Mastercard, Discover, Apple Pay, and Google Pay"></div>
      <div class="product-shipping"><span>Shipping within 7 days with USPS.</span>${uiIcon('truck')}</div>
      <div class="product-description">${details}</div>
    </div>`;
  const related = document.querySelector('[data-related-products]');
  if (related) related.innerHTML = PRODUCTS.slice(0, 4).map(item => productCard(item, false)).join('');
}

document.addEventListener('click', event => {
  const thumbnail = event.target.closest('[data-gallery-thumb]');
  if (thumbnail) {
    const gallery = thumbnail.closest('.product-gallery');
    gallery.querySelectorAll('[data-gallery-panel]').forEach(panel => { panel.hidden = panel.dataset.galleryPanel !== thumbnail.dataset.galleryThumb; });
    gallery.querySelectorAll('[data-gallery-thumb]').forEach(button => button.setAttribute('aria-pressed', String(button === thumbnail)));
  }
  const zoom = event.target.closest('[data-gallery-zoom]');
  if (zoom) {
    const gallery = zoom.closest('.product-gallery');
    const active = gallery.querySelector('[data-gallery-panel]:not([hidden])');
    const body = gallery.querySelector('.product-lightbox-body');
    body.replaceChildren(active.firstElementChild.cloneNode(true));
    body.firstElementChild.classList.add('product-lightbox-content');
    gallery.querySelector('.product-lightbox').showModal();
  }
  const closeGallery = event.target.closest('.product-lightbox-close');
  if (closeGallery) closeGallery.closest('dialog').close();
  const apartment = event.target.closest('[data-apartment-toggle]');
  if (apartment) {
    const field = document.querySelector('[data-apartment-field]');
    field.hidden = !field.hidden;
    apartment.setAttribute('aria-expanded', String(!field.hidden));
  }
  const coupon = event.target.closest('[data-coupon-toggle]');
  if (coupon) {
    const panel = document.querySelector('[data-coupon-panel]');
    panel.hidden = !panel.hidden;
    coupon.setAttribute('aria-expanded', String(!panel.hidden));
  }
  if (event.target.closest('[data-coupon-apply]')) {
    document.querySelector('[data-coupon-panel] .notice')?.classList.add('is-visible');
  }
  const add = event.target.closest('[data-add]');
  if (add) {
    const qty = Number(document.querySelector('[data-quantity]')?.value || 1);
    addToCart(Number(add.dataset.add), Math.max(1, Math.min(99, qty || 1)));
    const feedback = document.querySelector('[data-cart-feedback]');
    if (feedback) feedback.innerHTML = `Added to your cart. <a href="${siteUrl('cart/')}">View cart</a>`;
    updatePortableCartLinks();
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    const cart = getCart(); delete cart[remove.dataset.remove]; saveCart(cart); renderCart();
  }
});

document.addEventListener('submit', event => {
  if (event.target.matches('[data-coupon-form], [data-cart-coupon-form]')) {
    event.preventDefault();
    event.target.querySelector('.notice')?.classList.add('is-visible');
    return;
  }
  if (event.target.matches('[data-demo-form]')) {
    event.preventDefault();
    event.target.querySelector('.notice')?.classList.add('is-visible');
  }
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-billing-toggle]')) {
    const details = document.querySelector('[data-billing-fields]');
    if (details) {
      details.hidden = !event.target.checked;
      details.querySelectorAll('[name="billing_address_1"], [name="billing_city"], [name="billing_postcode"]').forEach(input => {
        input.required = event.target.checked;
      });
    }
  }
});

function makeDocumentLinksPortable() {
  document.querySelectorAll('a[href^="/"]').forEach(anchor => {
    anchor.href = siteUrl(anchor.getAttribute('href'));
  });
}

function updatePortableCartLinks() {
  if (location.protocol !== 'file:') return;
  document.querySelectorAll('a[href]').forEach(anchor => {
    const target = new URL(anchor.href, location.href);
    if (target.protocol !== 'file:' || !target.pathname.toLowerCase().includes('/standalone-site/')) return;
    target.searchParams.set('cart', JSON.stringify(cartState));
    anchor.href = target.href;
  });
  try {
    const current = new URL(location.href);
    current.searchParams.set('cart', JSON.stringify(cartState));
    history.replaceState(null, '', current.href);
  } catch { /* Page links still carry the cart when file history is restricted. */ }
}

function animateEntryElements() {
  const selector = '.utility-item, .brand, .nav a, .cart-link, .hero-copy-inner > *, .strip span, .section-head .kicker, .section-head h2, .section-head > .text-link, .page-head .wrap > *, .product-card, .feature-copy > *, .product-gallery-stage, .product-gallery-thumbs > *, .product-detail-copy > *, .product-related .kicker, .product-related h2, .contact-list li, .contact-grid .field, .account-grid h2, .account-grid p, .account-grid .field, .checkout-progress > *, .checkout-card h1, .checkout-card h2, .checkout-card .field, .checkout-choice, .checkout-payment-head, .checkout-item, .checkout-order .summary-line, .checkout-agreement, .checkout-submit, .cart-item, .cart-coupon, .summary > *, .ingredient-product-card, .prose > *, .footer-payment-image, .footer-signature, .footer-contact-list > *, .footer-disclaimer, .footer-live-links .footer-links a, .footer-subscribe > *';
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('entry-fade');
    element.style.setProperty('--entry-delay', `${Math.min(index % 8, 7) * 55}ms`);
  });
}

function populateStates() {
  const states = 'AL:Alabama,AK:Alaska,AZ:Arizona,AR:Arkansas,CA:California,CO:Colorado,CT:Connecticut,DE:Delaware,FL:Florida,GA:Georgia,HI:Hawaii,ID:Idaho,IL:Illinois,IN:Indiana,IA:Iowa,KS:Kansas,KY:Kentucky,LA:Louisiana,ME:Maine,MD:Maryland,MA:Massachusetts,MI:Michigan,MN:Minnesota,MS:Mississippi,MO:Missouri,MT:Montana,NE:Nebraska,NV:Nevada,NH:New Hampshire,NJ:New Jersey,NM:New Mexico,NY:New York,NC:North Carolina,ND:North Dakota,OH:Ohio,OK:Oklahoma,OR:Oregon,PA:Pennsylvania,RI:Rhode Island,SC:South Carolina,SD:South Dakota,TN:Tennessee,TX:Texas,UT:Utah,VT:Vermont,VA:Virginia,WA:Washington,WV:West Virginia,WI:Wisconsin,WY:Wyoming';
  document.querySelectorAll('[data-us-states]').forEach(select => {
    select.innerHTML = '<option value="">Select a state</option>' + states.split(',').map(pair => {
      const [code, name] = pair.split(':');
      return `<option value="${code}"${select.dataset.default === code ? ' selected' : ''}>${name}</option>`;
    }).join('');
  });
}

sharedLayout();
renderProducts();
setupFeaturedCarousel();
renderProductDetail();
populateStates();
makeDocumentLinksPortable();
updateCartCount();
renderCart();
updatePortableCartLinks();
animateEntryElements();
