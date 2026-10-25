/* =====================================================================
   3M FASHION — shared core (i18n, header/footer, cart, helpers)
   Every i18n value is an array: [English, Arabic]
   ===================================================================== */
'use strict';

const I18N = {
  /* nav / chrome */
  'nav.home': ['Home', 'الرئيسية'],
  'nav.shop': ['Shop', 'المتجر'],
  'nav.gallery': ['Gallery', 'الجاليري'],
  'nav.summer': ['Summer', 'صيفي'],
  'nav.winter': ['Winter', 'شتوي'],
  'nav.eastern': ['Eastern', 'شرقي'],
  'brand.tagline': ['Home Wear & Eastern Clothes', 'ملابس منزلية وشرقية'],
  'topbar': ['Free delivery over {1} EGP · Cash on delivery across Egypt',
    'شحن مجاني فوق {1} جنيه · الدفع عند الاستلام لكل مصر'],

  /* home */
  'home.eyebrow': ['From the heart of Egypt', 'من قلب مصر'],
  'scroll.hint': ['Scroll to explore', 'اسحب للأسفل'],
  'hero.explore': ['Explore collections', 'استكشف المجموعات'],
  'home.collections.label': ['The Collections', 'المجموعات'],
  'home.collections.title': ['Two Seasons, One Standard of Elegance', 'موسمان… ومعيار واحد للأناقة'],
  'col.summer.label': ['Spring / Summer', 'ربيع / صيف'],
  'col.summer.name': ['The Summer Edit', 'مجموعة الصيف'],
  'col.summer.desc': ['Weightless cotton & viscose, in colours made for the sun.', 'قطن وفسكور خفيف ومريح — بألوان مصممة للشمس.'],
  'col.winter.label': ['Autumn / Winter', 'خريف / شتا'],
  'col.winter.name': ['The Winter Edit', 'مجموعة الشتا'],
  'col.winter.desc': ['Warm, soft layering for cold days at home.', 'طبقات دافئة وناعمة تليق بأمسيتك في البيت.'],
  'col.shop': ['Shop the collection', 'اكتشف المجموعة'],
  'home.featured.label': ['House Favourites', 'مختاراتنا'],
  'home.featured.title': ['Featured Pieces', 'موديلات مميزة'],
  'home.featured.more': ['View all', 'عرض كل الموديلات'],
  'home.story.label': ['The House', 'عن 3M'],
  'home.story.title': ['Elegance Woven Into Everyday Comfort', 'أناقة مصنوعة من راحة كل يوم'],
  'home.story.p1': ['Since its first day, 3MFashion has believed that what you wear at home deserves the same care as what you wear outside. We choose imported fabrics with an Egyptian heart — 100% pure cotton and the softest viscose, breathable and gentle on the skin.',
    'من أول يوم، 3M فيشن آمن إن اللي بتبسيه في بيتك يستاهل نفس العناية اللي بتحطها في لبسك بره. بنختار أجود الأقمشة المستوردة — قطن 100% وفسكور مريح، قابل للتنفس ولطيف على البشرة.'],
  'home.story.p2': ['Our designs are practical, generously sized (up to 140 kg), easy to wash and — above all — they never fade.',
    'تصميماتنا عملية، مقاساتها واسعة (لغاية 140 كيلو)، سهلة الغسيل — وفوق كل ده، ألوانها مش بتبهت أبداً.'],
  'home.story.btn': ['Discover our pieces', 'اكتشف موديلاتنا'],
  'home.services.1.t': ['Cash on delivery', 'الدفع عند الاستلام'],
  'home.services.1.d': ['Pay only when your order is in your hands.', 'ادفع لما المندوب يوصلك في إيدك.'],
  'home.services.2.t': ['Egypt-wide delivery', 'شحن لكل المحافظات'],
  'home.services.2.d': ['From Alexandria to Aswan, 2–4 working days.', 'من الإسكندرية لأسوان، خلال 2–4 أيام عمل.'],
  'home.services.3.t': ['Premium fabrics', 'أقمشة مميزة'],
  'home.services.3.d': ['Imported cotton & viscose that never fades.', 'قطن وفسكور مستورد… ألوان لا تبهت.'],
  'home.lookbook.label': ['Lookbook', 'البورفوليو'],
  'home.lookbook.title': ['A Gallery of Quiet Luxury', 'جاليري فخامة هايلة'],
  'home.lookbook.btn': ['Open the full gallery', 'افتح الجاليري كامل'],
  'news.label': ['The inner circle', 'حلقة الأقربين'],
  'news.title': ['Be first to see every new drop', 'اعرف الأول — أول ما ينزل موديل جديد'],
  'news.ph': ['your@email.com', 'بريدك الإلكتروني'],
  'news.btn': ['Join', 'انضمي'],
  'news.done': ['Welcome to the inner circle', 'أهلاً بيك في حلقة الأقربين'],

  /* shop */
  'shop.title': ['The Shop', 'المتجر'],
  'shop.sub': ['Every piece, in every colour', 'كل موديل… بكل ألوانه'],
  'shop.all': ['All', 'الكل'],
  'shop.homewear': ['Home Wear', 'منزلي'],
  'shop.eastern': ['Eastern', 'شرقي'],
  'shop.sort': ['Sort', 'ترتيب'],
  'shop.count': ['{1} piece(s)', 'عدد الموديلات: {1}'],
  'shop.search': ['Search…', 'بحث…'],
  'shop.empty.t': ['Nothing here yet', 'لسه مفيش هنا'],
  'shop.empty.d': ['New pieces are added regularly — this collection is being prepared.', 'بتزيد الموديلات باستمرار — المجموعة دي تحت التجهيز.'],
  'badge.new': ['New', 'جديد'],
  'badge.sale': ['Sale', 'عرض'],
  'quick.add': ['Add to bag', 'أضف للكارت'],
  'quick.view': ['Choose size', 'اختر المقاس'],

  /* product */
  'pd.title': ['Product', 'الموديل'],
  'pd.size': ['Select size', 'اختر المقاس'],
  'pd.qty': ['Qty', 'العدد'],
  'pd.add-cart': ['Add to bag', 'أضف للكارت'],
  'pd.buy-wa': ['Order via WhatsApp', 'اطلب واتساب'],
  'pd.stock.yes': ['In stock — ships in 24h', 'متوفر — يُشحن خلال 24 ساعة'],
  'pd.stock.no': ['Sold out', 'نفذت الكمية'],
  'pd.meta.1': ['100% pure cotton / imported viscose', 'قطن 100% / فسكور مستورد'],
  'pd.meta.2': ['Sizes up to 140 kg', 'مقاسات حتى 140 كيلو'],
  'pd.meta.3': ['Does not fade · easy to wash', 'لا تبهت · سهلة الغسيل'],
  'pd.meta.4': ['Cash on delivery all over Egypt', 'دفع عند الاستلام لكل مصر'],
  'pd.related': ['You may also love', 'قد يعجبك أيضاً'],
  'pd.notfound.t': ['Piece not found', 'الموديل مش موجود'],
  'pd.notfound.d': ['It may have been retired from the shop.', 'ممكن تكون اتسحبت من المتجر.'],

  /* cart & checkout */
  'cart.title': ['Shopping Bag', 'الكارت'],
  'ct.crumb': ['Home · Bag', 'الرئيسية · الكارت'],
  'cart.empty.t': ['Your bag is empty', 'كارتك فاضية'],
  'cart.empty.d': ['Fill it with something beautiful.', 'املأها بحاجة تليق بيك.'],
  'cart.empty.btn': ['Discover the shop', 'اكتشف المتجر'],
  'c.checkout': ['Checkout', 'إتمام الطلب'],
  'c.summary': ['Order summary', 'ملخص الطلب'],
  'c.subtotal': ['Subtotal', 'الإجمالي الفرعي'],
  'c.shipping': ['Shipping', 'الشحن'],
  'c.total': ['Total', 'الإجمالي'],
  'c.free': ['Free', 'مجاني'],
  'c.remove': ['Remove', 'حذف'],
  'steps.1': ['Bag', 'الكارت'],
  'steps.2': ['Details', 'بياناتك'],
  'steps.3': ['Confirm', 'تأكيد'],
  'co.title': ['Delivery details', 'بيانات التوصيل'],
  'co.pay': ['Payment method', 'طريقة الدفع'],
  'co.name': ['Full name', 'الاسم بالكامل'],
  'co.phone': ['Mobile number', 'رقم الموبايل'],
  'co.phone2': ['Alternate number (optional)', 'رقم إضافي (اختياري)'],
  'co.gov': ['Governorate', 'المحافظة'],
  'co.city': ['City / Area', 'المدينة / المنطقة'],
  'co.address': ['Full address', 'العنوان بالتفصيل'],
  'co.notes': ['Notes (optional)', 'ملاحظات (اختياري)'],
  'co.addressPh': ['Flat number, street, building, landmark…', 'رقم الشقة، الدور، الشارع، علامات مميزة…'],
  'pay.cod': ['Cash on delivery', 'الدفع عند الاستلام'],
  'pay.cod.d': ['Pay the courier when your order arrives.', 'ادفع للمندوب وقت ما يوصلك الطلب.'],
  'pay.instapay': ['Instapay / Bank transfer', 'Instapay / تحويل بنكي'],
  'pay.instapay.d': ['Transfer to the number below, then we confirm instantly.', 'حوّل على الرقم ده وهنأكدلك فوراً.'],
  'pay.online': ['Online card payment', 'الدفع أونلاين بالبطاقة'],
  'pay.online.d': ['Coming soon — we are adding a secure gateway.', 'قريباً — بنضيف بوابة دفع آمنة.'],
  'online.soon': ['Coming soon', 'قريباً'],
  'co.submit': ['Place order', 'أرسل الطلب'],
  'co.err.1': ['Please complete the highlighted fields.', 'من فضلك أكمل الحقول المطلوبة.'],

  'thanks.t': ['Thank you — your order is placed', 'شكراً — طلبك اتسجل بنجاح'],
  'thanks.d': ['We have received your order and will call you to confirm shortly.', 'وصلنا طلبك، وهنكلمك قريباً للتأكيد.'],
  'thanks.order': ['Order number', 'رقم الطلب'],
  'thanks.wa': ['Send order on WhatsApp', 'ابعت الطلب واتساب'],
  'thanks.home': ['Back to home', 'الرئيسية'],

  /* gallery */
  'gal.title': ['The Gallery', 'الجاليري'],
  'gal.sub': ['The lookbook of the house', 'معرض موديلات 3M'],
  'gal.all': ['Everything', 'كل الصور'],

  /* footer */
  'ft.blurb': ['Home wear & eastern clothes made with imported fabrics and an Egyptian attention to detail.',
    'ملابس منزلية وشرقية من أقمشة مستوردة… ولمسة مصرية في كل تفاصيل.'],
  'ft.links': ['Explore', 'استكشف'],
  'ft.contact': ['Contact', 'تواصل'],
  'ft.follow': ['Follow us', 'تابعنا'],
  'ft.rights': ['© 2026 3M Fashion. All rights reserved.', '© 2026 3M فيشن — جميع الحقوق محفوظة'],
  'ft.pay.hint': ['Cash on delivery · Instapay · Online payments (soon)', 'دفع عند الاستلام · Instapay · دفع أونلاين قريباً'],
  'ft.admin': ['Admin', 'الأدمن'],

  /* toasts */
  't.added': ['Added to your bag', 'اتضاف للكارت'],
  't.select': ['Please select a size first', 'اختار المقاس الأول'],
  't.removed': ['Removed', 'تم الحذف'],
  't.error': ['Something went wrong', 'حصل خطأ… حاول تاني'],
  't.lang': ['Language switched', 'تم تغيير اللغة'],
  't.copied': ['Copied', 'تم النسخ'],
};

let LANG = localStorage.getItem('3m_lang') ||
  (navigator.language && navigator.language.startsWith('ar') ? 'ar' : 'en') || 'en';

function t(key, reps) {
  let v = I18N[key] !== undefined ? I18N[key] : key;
  if (Array.isArray(v)) v = (LANG === 'ar' ? v[1] : v[0]) ?? v[0] ?? key;
  if (reps) reps.forEach((r, i) => { v = String(v).split('{' + (i + 1) + '}').join(r); });
  return v;
}
function money(n) {
  n = Number(n) || 0;
  const num = n % 1 === 0 ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  return LANG === 'ar' ? `${num} ج.م` : `${num} EGP`;
}
function applyI18n() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}

/* ---------------------------------------------------------------- utils */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
  return data;
}

let toastTimer = null;
function toast(msg, isErr) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.toggle('err', !!isErr);
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function revealInit() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ----------------------------------------------------------------- cart */
const CART_KEY = '3m_cart_v1';
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function setCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateBadge(); }
function cartAdd(id, qty = 1, size = '') {
  const c = getCart();
  const ex = c.find(i => i.id === id && i.size === size);
  if (ex) ex.qty = Math.min(99, ex.qty + qty);
  else c.push({ id, qty, size });
  setCart(c);
  toast(t('t.added'));
}
function cartRemove(id, size) {
  setCart(getCart().filter(i => !(i.id === id && i.size === size)));
  toast(t('t.removed'));
}
function cartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }
function updateBadge() {
  $$('.cart-badge').forEach(b => {
    const n = cartCount();
    b.textContent = n > 99 ? '99+' : n;
    b.style.display = n ? 'grid' : 'none';
  });
}

/* ------------------------------------------------------- product cards */
function productCard(p) {
  const name = (LANG === 'ar' ? p.nameAr : p.nameEn) || p.nameEn || p.nameAr;
  const isSale = p.oldPrice && p.oldPrice > p.price;
  const img = (p.images && p.images[0]) || '';
  const hasSizes = p.sizes && p.sizes.length;
  return `<a class="p-card reveal" href="/product/${p.id}" data-pid="${p.id}">
    <div class="p-media">
      <img src="${esc(img)}" alt="${esc(name)}" loading="lazy" width="600" height="750">
      ${isSale ? `<span class="badge sale">${esc(t('badge.sale'))}</span>` : (p.featured ? `<span class="badge">${esc(t('badge.new'))}</span>` : '')}
      <button class="quick" data-quick type="button">${esc(t('quick.view'))}</button>
    </div>
    <div class="p-info">
      <h3>${esc(name)}</h3>
      <p class="price">${isSale ? `<span class="old">${money(p.oldPrice)}</span>` : ''}${money(p.price)}</p>
    </div>
  </a>`;
}
function bindQuickAdd(scope = document) {
  scope.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const pid = btn.closest('[data-pid]').dataset.pid;
      api('/api/products/' + pid).then(p => {
        if (p.sizes && p.sizes.length) location.href = '/product/' + pid;
        else cartAdd(pid, 1, '');
      });
    });
  });
}
function renderProductGrid(list, selector) {
  const box = typeof selector === 'string' ? $(selector) : selector;
  if (!box) return;
  if (!list || !list.length) { box.closest('section')?.classList.add('rendered'); return; }
  box.innerHTML = list.map(productCard).join('');
  bindQuickAdd(box);
  revealInit();
}

/* governorates of Egypt */
const GOVS = [['Giza', 'الجيزة'], ['Cairo', 'القاهرة'], ['Alexandria', 'الإسكندرية'], ['Qalyubia', 'القليوبية'], ['Sharqia', 'الشرقية'], ['Dakahlia', 'الدقهلية'], ['Gharbia', 'الغربية'], ['Monufia', 'المنوفية'], ['Beheira', 'البحيرة'], ['Kafr El Sheikh', 'كفر الشيخ'], ['Damietta', 'دمياط'], ['Port Said', 'بورسعيد'], ['Ismailia', 'الإسماعيلية'], ['Suez', 'السويس'], ['North Sinai', 'شمال سيناء'], ['South Sinai', 'جنوب سيناء'], ['Faiyum', 'الفيوم'], ['Beni Suef', 'بني سويف'], ['Minya', 'المنيا'], ['Asyut', 'أسيوط'], ['Sohag', 'سوهاج'], ['Qena', 'قنا'], ['Luxor', 'الأقصر'], ['Aswan', 'أسوان'], ['Red Sea', 'البحر الأحمر'], ['New Valley', 'الوادي الجديد'], ['Matrouh', 'مطروح']];
function govOptions() {
  return GOVS.map(([en, ar]) => `<option value="${esc(en)}">${esc(LANG === 'ar' ? ar : en)}</option>`).join('');
}

/* ------------------------------------------------------------ settings */
let SETTINGS = null;
async function loadSettings() {
  if (SETTINGS) return SETTINGS;
  try { SETTINGS = await api('/api/settings'); } catch { SETTINGS = {}; }
  return SETTINGS;
}

/* ------------------------------------------------------------ chrome */
function ico(name) {
  const P = {
    cart: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1.2 12.2a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.8 9.5c-.3 2.6 3.1 6 5.7 5.7.8-.1 1.5-.7 1.5-1.3 0-.9-1.1-1.4-2-1-.7.3-1.4-.2-1.9-.8-.5-.6-.9-1.3-.5-1.9.4-.8-.1-1.8-1-1.9-.7 0-1.6.5-1.8 1.2Z" fill="currentColor" stroke="none"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M2 6h11v11H2zM13 9h4l4 4v4h-8"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17.5" cy="17.5" r="1.7"/></svg>',
    cotton: '<svg viewBox="0 0 24 24"><path d="M12 3c2.5 0 4 1.6 4.2 3.5 2 .3 3.8 1.8 3.8 4 0 2.3-2 4-4.4 4H8.4C5.9 14.5 4 12.9 4 10.6c0-2.2 1.7-3.8 3.8-4C8 4.6 9.5 3 12 3Z"/><path d="M12 14.5v6.5"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M14 8.5V7a1 1 0 0 1 1-1h1.5V3.5H15A4 4 0 0 0 11 7.5V10H9v3h2v7.5h3V13h2.2l.8-3H14Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  };
  return P[name] || '';
}

function renderChrome() {
  const head = $('#site-head');
  if (head) {
    head.innerHTML = `
    <div class="topbar" id="topbar"></div>
    <header class="site-header" id="shead">
      <div class="wrap header-inner">
        <a href="/" class="brand-logo" aria-label="3M Fashion">
          <img src="/img/logo.jpeg" alt="3M Fashion">
          <span class="b-name"><b>3MFashion</b><span data-i18n="brand.tagline"></span></span>
        </a>
        <nav class="main-nav" id="mainNav">
          <button class="drawer-close" id="navClose" aria-label="close">✕</button>
          <a href="/" data-i18n="nav.home" data-nav="home"></a>
          <a href="/shop" data-i18n="nav.shop" data-nav="shop"></a>
          <a href="/shop?season=summer" data-i18n="nav.summer" data-nav="summer"></a>
          <a href="/shop?season=winter" data-i18n="nav.winter" data-nav="winter"></a>
          <a href="/gallery" data-i18n="nav.gallery" data-nav="gallery"></a>
        </nav>
        <div class="header-icons">
          <button class="lang-toggle" id="langToggle" title="Language">${LANG === 'ar' ? 'EN' : 'ع'}</button>
          <button class="nav-burger icon-btn" id="navBurger" aria-label="menu">${ico('menu')}</button>
          <a class="icon-btn" href="/cart" aria-label="cart">${ico('cart')}<span class="cart-badge" style="display:none"></span></a>
        </div>
      </div>
    </header>`;
    const page = document.body.dataset.page || '';
    $$('#mainNav a[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === page));
    $('#langToggle').addEventListener('click', () => {
      localStorage.setItem('3m_lang', LANG === 'ar' ? 'en' : 'ar');
      location.reload();
    });
    $('#navBurger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#navClose').addEventListener('click', () => document.body.classList.remove('nav-open'));
    window.addEventListener('scroll', () => {
      $('#shead').classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  const foot = $('#site-foot');
  if (foot) {
    foot.innerHTML = `
    <footer class="site-footer">
      <div class="wrap footer-top">
        <div class="footer-brand">
          <img src="/img/logo.jpeg" alt="3M Fashion">
          <h5>3M Fashion</h5>
          <p data-i18n="ft.blurb"></p>
          <p class="social" style="display:flex;gap:.6rem;margin-top:1.1rem" id="socialRow"></p>
        </div>
        <div>
          <h5 data-i18n="ft.links"></h5>
          <div class="f-links">
            <a href="/shop" data-i18n="nav.shop"></a>
            <a href="/shop?season=summer" data-i18n="nav.summer"></a>
            <a href="/shop?season=winter" data-i18n="nav.winter"></a>
            <a href="/gallery" data-i18n="nav.gallery"></a>
            <a href="/cart" data-i18n="cart.title"></a>
          </div>
        </div>
        <div>
          <h5 data-i18n="ft.follow"></h5>
          <div class="f-links" id="footLinks"></div>
        </div>
        <div>
          <h5 data-i18n="ft.contact"></h5>
          <div class="f-contact" id="footContact"></div>
        </div>
      </div>
      <div class="wrap footer-bottom">
        <span data-i18n="ft.rights"></span>
        <span data-i18n="ft.pay.hint"></span>
      </div>
    </footer>`;
  }
}

async function hydrateChrome() {
  const s = await loadSettings();
  if (!s) return;
  const tb = $('#topbar');
  if (tb) tb.textContent = t('topbar', [s.freeShippingOver || 2500]);
  const social = $('#socialRow');
  if (social && s.facebook) {
    social.innerHTML = `<a href="${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ico('fb')}</a>`;
    const fl = $('#footLinks');
    if (fl) fl.innerHTML = `<a href="${esc(s.facebook)}" target="_blank" rel="noopener">Facebook</a>${s.whatsapp ? `<a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}`;
  }
  const fc = $('#footContact');
  if (fc) {
    fc.innerHTML = `
      ${s.whatsapp ? `<div class="row">${ico('phone')}<a href="tel:+${esc(s.whatsapp)}" dir="ltr">+${esc(s.whatsapp)}</a></div>
      <div class="row">${ico('wa')}<a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">${LANG === 'ar' ? 'واتساب مباشر' : 'WhatsApp us'}</a></div>` : ''}
      <div class="row">${ico('pin')}<span>${LANG === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span></div>`;
  }
}

function initPage() {
  renderChrome();
  applyI18n();
  updateBadge();
  hydrateChrome();
  revealInit();
}
window.addEventListener('DOMContentLoaded', initPage);
