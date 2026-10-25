/**
 * 3M Fashion — Home Wear & Eastern Clothes
 * Zero-dependency Node.js server (no npm install required).
 *   Run:  node server.js   →  http://localhost:3000
 *   Admin: /admin  (default password: 3m-admin — change it in Admin ▸ Settings)
 *
 * PAYMENT GATEWAY NOTE:
 *   Orders are saved to data/orders.json and marked "cash_on_delivery".
 *   When you attach a gateway later, hook into POST /api/orders at the
 *   comment marked:  /* === PAYMENT GATEWAY HOOK === *​/
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const ASSETS = path.join(ROOT, 'assets');
const DATA = path.join(ROOT, 'data');
const UPLOADS = path.join(PUBLIC, 'uploads');
const PORT = process.env.PORT || 3000;

for (const d of [DATA, UPLOADS]) fs.mkdirSync(d, { recursive: true });

/* ---------------------------------------------------------------- files -- */
function readFileJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeFileJSON(file, obj) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, file);
}
const lock = {};
function withLock(name, fn) { // tiny async-less mutex for JSON save ops
  while (lock[name]) { /* next tick */ }
  lock[name] = true;
  try { return fn(); }
  finally { lock[name] = false; }
}
function saveProducts(l = products) { withLock('products', () => writeFileJSON(path.join(DATA, 'products.json'), l)); }
function saveOrders(l = orders) { withLock('orders', () => writeFileJSON(path.join(DATA, 'orders.json'), l)); }
function saveSettings() { withLock('settings', () => writeFileJSON(path.join(DATA, 'settings.json'), settings)); }
let products = readFileJSON(path.join(DATA, 'products.json'), null);
let orders = readFileJSON(path.join(DATA, 'orders.json'), []);
let settings = readFileJSON(path.join(DATA, 'settings.json'), null);

/* ------------------------------------------------------------- settings -- */
const DEFAULT_SETTINGS = {
  brand: '3M Fashion',
  whatsapp: '',                 // e.g. 201012345678 — set in admin settings
  facebook: 'https://www.facebook.com/3mhomewear/',
  shippingFee: 60,              // EGP
  freeShippingOver: 2500,       // EGP, 0 = disabled
  payment: {
    cashOnDelivery: true,
    instapay: { enabled: false, number: '' },
    online: { enabled: false, note: 'Online card payments are coming soon.' }, // gateway placeholder
  },
  hero: {
    titleEn: 'Dress your home in elegance',
    subEn: 'Premium home wear & eastern clothes — pure cotton, timeless cuts.',
    titleAr: 'أناقة تليق بمنزلك',
    subAr: 'ملابس منزلية وشرقية من أجود الأقمشة — قطن 100% بتصميمات عملية وأنيقة.',
  },
  adminPasswordHash: crypto.createHash('sha256').update('3m-admin').digest('hex'),
};
function normalizeSettings(s) {
  const out = {
    ...DEFAULT_SETTINGS, ...s,
    payment: { ...DEFAULT_SETTINGS.payment, ...(s.payment || {}) },
    hero: { ...DEFAULT_SETTINGS.hero, ...(s.hero || {}) },
  };
  out.payment.instapay = { ...DEFAULT_SETTINGS.payment.instapay, ...(s.payment?.instapay || {}) };
  out.payment.online = { ...DEFAULT_SETTINGS.payment.online, ...(s.payment?.online || {}) };
  return out;
}
if (settings === null) { settings = normalizeSettings({}); saveSettings(); }

/* ------------------------------------------------------ product seeding -- */
const COLOR_WORDS = {
  black: 'Black', blue: 'Blue', green: 'Green', grey: 'Grey', mint: 'Mint',
  navy: 'Navy', purple: 'Purple', red: 'Red', rose: 'Rose', white: 'White', viscous: 'Viscose',
};
function productNameFrom(file, i, prefix = 'Summer Set') {
  const base = path.basename(file).replace(/\.[^.]+$/, '');
  for (const [k, v] of Object.entries(COLOR_WORDS)) if (base.toLowerCase().includes(k)) return `${prefix} ${String(i).padStart(2, '0')} · ${v}`;
  return `${prefix} ${String(i).padStart(2, '0')}`;
}
function scanImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const sub = dir === ASSETS ? '' : path.basename(dir);
  return fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map(f => '/' + ['assets', sub, f].filter(Boolean).map(encodeURIComponent).join('/'));
}
function seedProducts() {
  const real = scanImages(path.join(ASSETS, 'موديلات_صيفي'));
  const ai = scanImages(path.join(ASSETS, 'ai_generated_summer_models'));
  const out = [];
  let n = 1, m = 1;
  const mk = (img, name, ai) => out.push({
    id: 'p' + crypto.randomBytes(6).toString('hex'),
    nameEn: name, nameAr: '',
    descEn: 'Imported viscose, 100% cotton-touch — soft on the skin, breathable and very comfortable. Practical, elegant design; easy to wash and the colours never fade. Sizes up to 140 kg.',
    descAr: 'فسكور مستورد قطن 100% — ناعم على البشرة، قابل للتهوية ومريح جداً. تصميم عملي وأنيق، سهل الغسيل ولا يبهت. مقاسات حتى 140 كيلو.',
    price: 350, oldPrice: 0, images: [img], sizes: ['M', 'L', 'XL', '2XL', '3XL'],
    colors: '', category: 'homewear', season: 'summer', stock: true,
    featured: ai ? 1 : 0, visible: !!ai, ai, createdAt: Date.now() + out.length,
  });
  for (const img of real) mk(img, productNameFrom(decodeURIComponent(img), n++, 'Summer Set'), false);
  for (const img of ai) mk(img, productNameFrom(decodeURIComponent(img), m++, 'Summer Bloom'), true);
  for (const prd of out) prd.nameAr = summerArName(prd);
  return out;
}
function summerArName(prd) {
  const isBloom = /^Summer Bloom/.test(prd.nameEn);
  const no = String(prd.nameEn).match(/^Summer (?:Set|Bloom) (\d+)/)?.[1] || '01';
  const colorAr = { Black: 'أسود', Blue: 'أزرق', Green: 'أخضر', Grey: 'رمادي', Mint: 'مينت', Navy: 'كحلي', Purple: 'موف', Red: 'أحمر', Rose: 'زهري', White: 'أبيض', Viscose: 'فسكور' };
  const en = String(prd.nameEn).split('·')[1]?.trim();
  return `${isBloom ? 'قنلة زهور' : 'قنلة صيفي'} رقم ${no}${colorAr[en] ? ' — ' + colorAr[en] : ''}`;
}
if (products === null) { products = seedProducts(); saveProducts(); }

function get(id) { return products.find(p => p.id === id); }
function publicProduct(p) { return p; }

/* ----------------------------------------------------------- HE L PERS -- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
function send(res, code, body, headers = {}) {
  res.writeHead(code, { 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
}
function json(res, code, obj) { send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' }); }
function safeJoin(base, target) {
  const p = path.normalize(path.join(base, target));
  if (!p.startsWith(base + path.sep) && p !== base) return null;
  return p;
}
function readBody(req, limit = 30 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('Payload too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach(s => { const i = s.indexOf('='); if (i > -1) out[s.slice(0, i).trim()] = decodeURIComponent(s.slice(i + 1).trim()); });
  return out;
}
function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

/* ----------------------------------------------------------- sessions --- */
const sessions = new Map(); // token -> expires(ms), in-memory; admins re-login after restart
function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + 7 * 24 * 3600 * 1000);
  return token;
}
function isAuthed(req) {
  const t = parseCookies(req).adminToken;
  if (!t) return false;
  const exp = sessions.get(t);
  if (!exp || exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}

/* ------------------------------------------------------- rate limiting -- */
const attempts = new Map();
function tooMany(ip) {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter(t => now - t < 5 * 60 * 1000);
  attempts.set(ip, arr);
  return arr.length >= 5;
}
function noteAttempt(ip) {
  const arr = attempts.get(ip) || [];
  arr.push(Date.now());
  attempts.set(ip, arr);
}

/* --------------------------------------------------- static file send --- */
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const isImg = /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(ext);
  fs.readFile(filePath, (err, data) => {
    if (err) return page404(res);
    send(res, 200, data, {
      'Content-Type': mime,
      'Cache-Control': isImg || ext === '.css' || ext === '.js'
        ? 'public, max-age=3600'
        : 'no-cache',
    });
  });
}
const REWRITE = [
  [/^\/$/, 'index.html'],
  [/^\/shop$/, 'shop.html'],
  [/^\/gallery$/, 'gallery.html'],
  [/^\/cart$/, 'cart.html'],
  [/^\/admin$/, 'admin.html'],
  [/^\/home$/, 'index.html'],
  [/^\/product\/[^/]+$/, 'product.html'],
];
function page404(res) {
  send(res, 404, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>3M Fashion — 404</title>
  <link rel="stylesheet" href="/css/style.css">
  <style>body{display:grid;place-items:center;min-height:100vh;margin:0;font-family:Georgia,serif;background:#0b0b0c;color:#f7f4ee;text-align:center;padding:2rem}
  h1{font-size:clamp(3rem,8vw,7rem);margin:0 0 .5rem;font-weight:400;letter-spacing:.05em}
  a{color:#b9975b;text-decoration:none;letter-spacing:.25em;text-transform:uppercase;font-size:.8rem;border:1px solid #b9975b;padding:1rem 2rem;border-radius:999px}
  </style></head><body><div><h1>404</h1><p style="letter-spacing:.2em;opacity:.6;margin-bottom:2.5rem">THE PAGE YOU SEEK DOES NOT EXIST</p><a href="/">Back to 3M</a></div></body></html>`,
    { 'Content-Type': 'text/html; charset=utf-8' });
}

/* ------------------------------------------------------------ API routes */
async function handleApi(req, res, pathname) {
  const ip = req.socket.remoteAddress || 'x';

  /* ---- LOGIN ---- */
  if (pathname === '/api/login' && req.method === 'POST') {
    if (tooMany(ip)) return json(res, 429, { error: 'Too many attempts. Wait 5 minutes.' });
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (sha256(String(body.password || '')) === settings.adminPasswordHash) {
      const token = createSession();
      res.setHeader('Set-Cookie', `adminToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
      return json(res, 200, { ok: true });
    }
    noteAttempt(ip);
    return json(res, 401, { error: 'Wrong password' });
  }
  if (pathname === '/api/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', 'adminToken=; HttpOnly; Path=/; Max-Age=0');
    return json(res, 200, { ok: true });
  }

  /* ---- PUBLIC: settings ---- */
  if (pathname === '/api/settings' && req.method === 'GET') {
    const { adminPasswordHash, ...pub } = settings;
    return json(res, 200, pub);
  }
  if (pathname === '/api/settings' && req.method === 'PUT') {
    if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const next = normalizeSettings(body);
    // password change
    if (body.newPassword) {
      if (!body.currentPassword || sha256(body.currentPassword) !== settings.adminPasswordHash)
        return json(res, 403, { error: 'Current password is wrong' });
      next.adminPasswordHash = sha256(body.newPassword);
    }
    settings = next; saveSettings();
    return json(res, 200, { ok: true });
  }

  /* ---- PUBLIC: products ---- */
  const mProd = pathname.match(/^\/api\/products\/?([^/]*)$/);
  if (mProd && req.method === 'GET') {
    const adminView = isAuthed(req);
    let list = products.filter(p => adminView || p.visible);
    const q = new URL(req.url, 'http://x').searchParams;
    const { season, category, q: term, featured, ids, sort } = Object.fromEntries(q);
    if (season && season !== 'all') list = list.filter(p => p.season === season);
    if (category) list = list.filter(p => p.category === category);
    if (featured === '1') list = list.filter(p => p.featured);
    if (ids) { const set = new Set(ids.split(',')); list = list.filter(p => set.has(p.id)); }
    if (term) {
      const t = term.toLowerCase();
      list = list.filter(p => (p.nameEn + ' ' + p.nameAr + ' ' + p.descEn + ' ' + p.descAr).toLowerCase().includes(t));
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (b.featured - a.featured) || (b.createdAt - a.createdAt));
    if (mProd[1]) {
      const one = products.find(p => p.id === mProd[1] && (p.visible || isAuthed(req)));
      if (!one) return json(res, 404, { error: 'Not found' });
      return json(res, 200, one);
    }
    return json(res, 200, list);
  }

  /* ---- ADMIN: products ---- */
  if (pathname.startsWith('/api/products') && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });
    const id = decodeURIComponent(pathname.split('/')[3] || '');

    if (req.method === 'POST') { // create
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const p = {
        id: body.id && !get(body.id) ? body.id : 'p' + crypto.randomBytes(6).toString('hex'),
        nameEn: String(body.nameEn || '').trim(), nameAr: String(body.nameAr || '').trim(),
        descEn: String(body.descEn || ''), descAr: String(body.descAr || ''),
        price: Number(body.price) || 0, oldPrice: Number(body.oldPrice) || 0,
        images: Array.isArray(body.images) ? body.images.slice(0, 10) : [],
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        colors: String(body.colors || ''),
        category: ['homewear', 'eastern'].includes(body.category) ? body.category : 'homewear',
        season: ['summer', 'winter', 'all'].includes(body.season) ? body.season : 'all',
        stock: body.stock !== false, featured: body.featured ? 1 : 0, visible: body.visible !== false,
        createdAt: Date.now(),
      };
      if (!p.nameEn && !p.nameAr) return json(res, 400, { error: 'Name is required' });
      products.push(p); saveProducts();
      return json(res, 201, p);
    }
    if (req.method === 'PUT') {
      const p = get(id);
      if (!p) return json(res, 404, { error: 'Not found' });
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const fields = ['nameEn', 'nameAr', 'descEn', 'descAr', 'colors'];
      for (const f of fields) if (typeof body[f] === 'string') p[f] = String(body[f]);
      for (const f of ['price', 'oldPrice']) if (body[f] !== undefined) p[f] = Number(body[f]) || 0;
      if (Array.isArray(body.images)) p.images = body.images.slice(0, 10);
      if (Array.isArray(body.sizes)) p.sizes = body.sizes;
      if (['homewear', 'eastern'].includes(body.category)) p.category = body.category;
      if (['summer', 'winter', 'all'].includes(body.season)) p.season = body.season;
      if (typeof body.stock === 'boolean') p.stock = body.stock;
      if (body.featured !== undefined) p.featured = body.featured ? 1 : 0;
      if (typeof body.visible === 'boolean') p.visible = body.visible;
      saveProducts();
      return json(res, 200, p);
    }
    if (req.method === 'DELETE') {
      const before = products.length;
      products = products.filter(p => p.id !== id);
      if (products.length === before) return json(res, 404, { error: 'Not found' });
      saveProducts();
      return json(res, 200, { ok: true });
    }
  }

  /* ---- ADMIN: uploads (base64 JSON — works without multer) ---- */
  if (pathname === '/api/upload' && req.method === 'POST') {
    if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const files = Array.isArray(body.files) ? body.files : [];
    if (!files.length) return json(res, 400, { error: 'No files' });
    const urls = [];
    for (const f of files.slice(0, 10)) {
      const m = String(f.data || '').match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/);
      if (!m) continue;
      const ext = m[1].replace('image/', '').replace('jpeg', 'jpg');
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 15 * 1024 * 1024) continue;
      const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS, name), buf);
      urls.push('/uploads/' + name);
    }
    if (!urls.length) return json(res, 400, { error: 'Unsupported files. Use PNG / JPG / WEBP.' });
    return json(res, 201, { urls });
  }

  /* ---- PUBLIC: orders ---- */
  if (pathname === '/api/orders' && req.method === 'POST') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const items = Array.isArray(body.items) ? body.items : [];
    const cust = body.customer || {};
    const valid = items.filter(it => {
      const p = get(it.id);
      return p && Number(it.qty) > 0 && Number(it.qty) < 100;
    }).map(it => {
      const p = get(it.id);
      return { id: p.id, nameEn: p.nameEn, nameAr: p.nameAr, price: p.price, qty: Math.floor(Number(it.qty)), size: String(it.size || '').slice(0, 12) };
    });
    const name = String(cust.name || '').trim().slice(0, 80);
    const phone = String(cust.phone || '').trim().slice(0, 20);
    const address = String(cust.address || '').trim().slice(0, 300);
    if (!valid.length) return json(res, 400, { error: 'Cart is empty' });
    if (name.length < 3) return json(res, 400, { error: 'Please enter your full name' });
    if (!/^0?1\d{8,9}$/.test(phone.replace(/[\s-]/g, ''))) return json(res, 400, { error: 'Please enter a valid Egyptian phone number' });
    if (address.length < 8) return json(res, 400, { error: 'Please enter your full address' });

    const subtotal = valid.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = settings.freeShippingOver > 0 && subtotal >= settings.freeShippingOver ? 0 : settings.shippingFee;
    const total = subtotal + shipping;

    /* === PAYMENT GATEWAY HOOK =========================================
       When you attach your gateway (Paymob / Stripe / Fawry ...):
       1) create the payment session here with `total` and order below
       2) return its redirect/payment_url in the response `paymentUrl`
       3) add /api/payment/callback to confirm the order & set status.   */

    const seq = orders.length + 1;
    const order = {
      id: '3M-' + String(1000 + seq),
      status: 'new',
      paymentMethod: settings.payment.cashOnDelivery ? 'cash_on_delivery' : 'manual',
      customer: {
        name, phone,
        governorate: String(cust.governorate || '').slice(0, 60),
        city: String(cust.city || '').slice(0, 60),
        address,
        notes: String(cust.notes || '').slice(0, 300),
      },
      items: valid, subtotal, shipping, total, createdAt: Date.now(),
    };
    orders.push(order); saveOrders();
    return json(res, 201, { id: order.id, subtotal, shipping, total, paymentUrl: null });
  }

  /* ---- ADMIN: orders ---- */
  if (pathname === '/api/orders' && req.method === 'GET') {
    if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, orders.slice().sort((a, b) => b.createdAt - a.createdAt));
  }
  const mOrd = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (mOrd && req.method === 'PUT') {
    if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });
    const o = orders.find(o => o.id === mOrd[1]);
    if (!o) return json(res, 404, { error: 'Not found' });
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (['new', 'confirmed', 'delivered', 'cancelled'].includes(body.status)) {
      o.status = body.status; o.updatedAt = Date.now(); saveOrders();
    }
    return json(res, 200, o);
  }

  return json(res, 404, { error: 'Unknown API route' });
}

/* ------------------------------------------------------------ server --- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname.replace(/\/{2,}/g, '/'));

  try {
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);

    // rewrite pretty URLs → pages
    for (const [re, file] of REWRITE) {
      if (re.test(pathname)) { pathname = '/' + file; break; }
    }

    // static roots
    if (pathname.startsWith('/assets/')) {
      const f = safeJoin(ASSETS, pathname.slice('/assets/'.length));
      if (f) return serveFile(res, f);
      return page404(res);
    }
    if (pathname.startsWith('/uploads/')) {
      const f = safeJoin(UPLOADS, pathname.slice('/uploads/'.length));
      if (f) return serveFile(res, f);
      return page404(res);
    }

    // public pages & files (with /product/* fallback for product.html assets)
    const clean = pathname.replace(/^\/+/, '');
    let f = safeJoin(PUBLIC, clean);
    if (!clean.includes('/') || /\.(html|css|js|json|png|jpe?g|webp|svg|ico|txt|woff2|gif)$/i.test(clean)) {
      if (f && fs.existsSync(f) && fs.statSync(f).isFile()) return serveFile(res, f);
    }
    return page404(res);
  } catch (e) {
    console.error(`[error] ${req.method} ${pathname}`, e);
    if (pathname.startsWith('/api/')) return json(res, 500, { error: 'Server error' });
    return page404(res);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  3 ♥ M  FASHION — Home Wear & Eastern Clothes');
  console.log(`  • Store      →  http://localhost:${PORT}`);
  console.log(`  • Admin      →  http://localhost:${PORT}/admin   (password: 3m-admin — change it!)`);
  console.log(`  • Products   →  ${products.length} seeded`);
  console.log('');
});
