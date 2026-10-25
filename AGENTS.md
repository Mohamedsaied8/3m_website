# AGENTS.md — 3M Fashion online store

Handover notes for any AI agent or developer continuing this project.
Read this first, then `README.md` (written for the shop owner, not developers).

Last updated: 2026-10-25

---

## 1. What this is

A bilingual (English / Arabic, RTL-aware) e-commerce site for **3M Fashion — Home Wear & Eastern Clothes**,
an Egyptian women's home-wear brand. Prices are in EGP. Customers check out with cash on delivery
(Instapay optional). The shop owner manages products, orders and settings in `/admin`.

- **Stack:** one zero-dependency Node.js server (`server.js`, Node ≥ 18) + plain HTML/CSS/vanilla JS in `public/`.
- **No build step, no npm, no framework, no database.** Data is JSON files in `data/`.
- **Keep it that way** unless the owner asks. "Copy the folder and run `node server.js`" is a core requirement
  (the owner runs it on Windows via `start.bat`).

## 2. Run it

```bash
node server.js              # http://localhost:3000   (or ./start.sh, or start.bat on Windows)
PORT=8080 node server.js    # other port
```

- Store: `/`  · Shop: `/shop` · Product: `/product/<id>` · Bag & checkout: `/cart` · Gallery: `/gallery` · Admin: `/admin`
- Admin password default: **`3m-admin`** (sha256 hash in `data/settings.json`; changed from Admin ▸ Settings).
- Admin sessions live in memory, so you have to log in again after every server restart.

## 3. File map

| Path | What it is |
|---|---|
| `server.js` | The whole backend: static files, pretty-URL rewrites, JSON API, auth, uploads, orders. ~490 lines. |
| `public/index.html` `shop.html` `product.html` `cart.html` `gallery.html` `admin.html` | Page shells. Header/footer are injected by JS into `#site-head` / `#site-foot`. |
| `public/js/app.js` | **Shared core, loaded on every page first:** `I18N` dictionary, `t()`, `money()`, `applyI18n()`, `api()`, `toast()`, cart (localStorage), `productCard()`, header/footer rendering, `loadSettings()`, Egyptian governorates list. |
| `public/js/home.js` `shop.js` `product.js` `cart.js` `gallery.js` `admin.js` | One script per page, loaded after `app.js`. |
| `public/css/style.css` | All styles (~34 KB). Design tokens on `:root` (`--ink`, `--paper`, `--gold`, `--gold-2`, `--logo-red`, …). |
| `public/img/logo.jpeg` | Brand logo (black · ivory · gold · red). |
| `public/uploads/` | Photos uploaded through admin. Git-ignored, so **back up separately**. |
| `assets/موديلات_صيفي/` | Owner's original summer product photos (the 31 live products use these). |
| `assets/ai_generated_summer_models/` | 7 AI-generated images, **not used** by current products. |
| `data/products.json` | Product catalogue (the source of truth, edited by admin). |
| `data/settings.json` | Store settings + admin password hash. |
| `data/orders.json` | Customer orders: personal data, **git-ignored, never commit**. Created on first order. |
| `start.sh` / `start.bat` | Launchers. |

## 4. Data model

**Product** (`data/products.json`, array):
```js
{ id: 'p<12 hex>', nameEn, nameAr, descEn, descAr,
  price: 350, oldPrice: 0,            // oldPrice > price ⇒ "Sale" badge
  images: ['/assets/...', '/uploads/...'],   // first = cover, max 10
  sizes: ['M','L','XL','2XL','3XL'], colors: '',
  category: 'homewear' | 'eastern',
  season: 'summer' | 'winter' | 'all',   // shown as "Group" in admin
  stock: true,        // false ⇒ "Sold out", still browseable, cannot be ordered
  featured: 0 | 1,    // home-page grid; shows "New" badge
  visible: true,      // false ⇒ hidden from store, still listed in admin
  createdAt: <ms> }
```
If `products.json` is missing, `seedProducts()` rebuilds it from the photos in `assets/`.

**Order** (`data/orders.json`): `{ id: '3M-1001', status: 'new'|'confirmed'|'delivered'|'cancelled', paymentMethod: 'cash_on_delivery'|'instapay', customer: { name, phone, altPhone, governorate, city, address, notes }, items: [{ id, nameEn, nameAr, price, qty, size }], subtotal, shipping, total, createdAt, updatedAt? }`.
Prices are always re-read from the server's product data. The client's prices are never trusted.

**Settings** (`data/settings.json`): `whatsapp` (digits, e.g. `2010…`), `facebook`, `shippingFee`, `freeShippingOver` (0 = off), `payment.{cashOnDelivery, instapay:{enabled,number}, online:{enabled,note}}`, `hero.{titleEn,subEn,titleAr,subAr}`, `adminPasswordHash`.
`normalizeSettings()` merges with `DEFAULT_SETTINGS`, so new keys get defaults automatically.

## 5. API (all JSON)

| Method & path | Auth | Notes |
|---|---|---|
| `POST /api/login` `{password}` | | Sets `adminToken` HttpOnly cookie (7 days). Rate limit: 5 failures / 5 min / IP. |
| `POST /api/logout` | | Ends the session server-side and clears the cookie. |
| `GET /api/settings` | | Public settings (hash stripped). |
| `PUT /api/settings` | admin | Full settings object. Password changes only with `{currentPassword, newPassword}`; the existing hash is otherwise preserved. |
| `GET /api/products` | | Visible products (admin sees all). Query: `season`, `category`, `featured=1`, `ids=a,b`, `q`, `sort=price-asc|price-desc`. |
| `GET /api/products/:id` | | One product (404 if hidden and not admin). |
| `POST /api/products` · `PUT /api/products/:id` · `DELETE /api/products/:id` | admin | Create / partial update / delete. |
| `POST /api/upload` `{files:[{name,data:'data:image/...;base64,...'}]}` | admin | Saves to `public/uploads/`, returns `{urls}`. PNG/JPG/WEBP/GIF, ≤15 MB each, ≤10 per call. |
| `POST /api/orders` | | Validates Egyptian mobile `^0?1\d{8,9}$`, name ≥ 3, address ≥ 8; only visible + in-stock products; computes shipping. Returns `{id, subtotal, shipping, total, paymentUrl:null}`. |
| `GET /api/orders` · `PUT /api/orders/:id {status}` | admin | List (newest first) / change status. |

**Payment gateway:** not implemented. The extension point is the comment `/* === PAYMENT GATEWAY HOOK === */` in `POST /api/orders`. The checkout already redirects if the response has a `paymentUrl`. The "online card" option shows "Coming soon" until `payment.online.enabled` is true.

## 6. Frontend conventions & gotchas

- **Every user-facing string is bilingual.** Add it to `I18N` in `app.js` as `'key': ['English', 'العربية']` and use `data-i18n="key"` (or `data-i18n-ph` for placeholders), or call `t('key')` in JS. `{1}`, `{2}` are substitution slots. The Arabic copy is Egyptian colloquial in places. Keep that tone.
- Language lives in `localStorage['3m_lang']`. Toggling reloads the page. `applyI18n()` sets `<html dir="rtl">` for Arabic, so use logical CSS properties (`margin-inline-start`, `inset-inline`, …) instead of left/right.
- Product content: use `(LANG === 'ar' ? p.nameAr : p.nameEn) || p.nameEn`.
- ⚠️ **All page scripts are classic `<script>`s sharing one global scope with `app.js`.** A top-level `let`/`const` that repeats a name from `app.js` (`SETTINGS`, `LANG`, `$`, `esc`, `api`, `t`, …) throws `SyntaxError: Identifier … has already been declared` and **kills the whole page script**. This happened to `product.js` (fixed 2026-10-25). Names that are reused across *different* pages (e.g. `state`, `boot`) are fine, because only one page script loads at a time.
- ⚠️ Elements with class `.reveal` start at `opacity:0` and only appear when `revealInit()` observes them. **Call `revealInit()` after injecting any `.reveal` HTML**, or it stays invisible (this bug hid the cart rows; fixed).
- Always escape interpolated data with `esc()` (also inside `value="…"` attributes and `<textarea>`s).
- Page scripts start with `DOMContentLoaded → setTimeout(boot, 100)`, so `app.js`'s `initPage()` (header/footer) runs first.
- Cart = `localStorage['3m_cart_v1']`: `[{id, qty, size}]`. A line is unique per id + size.
- `loadSettings()` caches. Pass `loadSettings(true)` when you need fresh values (admin does after saving).
- Admin UI (`admin.js`) is **not** run through `I18N`. Its labels are inline "English · عربي" pairs.
- Caching: images get `max-age=3600`. HTML/CSS/JS get `no-cache`, so changes reach visitors immediately. While testing in a browser, still hard-refresh if something looks stale.

## 7. Business rules from the owner

- **Photography is garment-only** (hanger / flat-lay, no people or faces). Keep any new imagery that way.
- Products are grouped by **season** (Summer / Winter / All-season) and **category** (Home Wear / Eastern).
- Sizes go up to 140 kg (M → 3XL). Default sizes: M, L, XL, 2XL, 3XL.
- Shipping across all 27 Egyptian governorates. Default fee 60 EGP, free over 2,500 EGP.
- Facebook: https://www.facebook.com/3mhomewear/

## 8. How to test changes

There are no automated tests. Test on a **scratch copy** so you never write fake orders into the real `data/`:

```bash
T=$(mktemp -d); cp -r server.js public data assets "$T"/; (cd "$T" && PORT=3001 node server.js &)
# API smoke
curl -s localhost:3001/api/products | head -c 300
curl -s -c ck -X POST -H 'Content-Type: application/json' -d '{"password":"3m-admin"}' localhost:3001/api/login
# JS errors per page (Chrome prints console errors to stderr)
google-chrome --headless=new --no-sandbox --user-data-dir="$T/chr" --enable-logging=stderr --v=0 \
  --virtual-time-budget=4000 --dump-dom http://localhost:3001/product/<id> 2>&1 >/dev/null | grep Uncaught
```

- **Phone-width screenshots:** headless Chrome won't make a window narrower than about 500 px. Put a test page in the copy's `public/` with `<iframe src="/" style="width:390px;height:1400px">` frames and screenshot that instead. Read `iframe.contentDocument.documentElement.scrollWidth` to catch sideways overflow.
- Use a fresh `--user-data-dir` for each screenshot run, or cached CSS/JS can hide your change.
- Check every page in **both languages** (`localStorage['3m_lang']='ar'`).

## 9. Current state (2026-10-25)

- 31 products, all `summer` / `homewear`, all visible, 7 featured. Names (`Summer Set 01 … 31`) and the 350 EGP price are **placeholders** that the owner must replace.
- **Winter** and **Eastern** have no products yet (pages show an "empty / being prepared" state).
- `whatsapp` is empty in settings, so WhatsApp buttons are hidden. The admin password is still the default.
- No orders yet. No uploads yet.
- Git repo initialised. `data/orders.json` and `public/uploads/*` are ignored.

### Fixed in this session
1. Product page crashed (`SETTINGS` declared twice), so nobody could add to the bag. Fixed in `product.js`.
2. One malformed URL (e.g. `/%E0%A4%A`) **crashed the whole server**. It now returns 400.
3. Saving Admin ▸ Settings silently **reset the admin password to `3m-admin`**. The hash is now preserved.
4. Cart rows were invisible (`.reveal` never activated). Fixed in `cart.js`.
5. Checkout ignored the chosen payment method (Instapay saved as cash on delivery) and dropped the alternate phone. Both are now saved, and admin shows the alt phone.
6. Orders could include hidden or sold-out products. These are now rejected.
7. Logout didn't end the server session. Invalid JSON returned 500; it now returns 400.
8. Admin product editor broke on names containing quotes (values not escaped).
9. Admin settings form showed stale values after saving (cached settings).
10. Missing `size` translation key in the cart. The top bar said "free over 2500" even when free shipping was off.
11. Hero logo off-centre. CSS/JS were cached for 1 hour, so fixes didn't reach visitors.

## 10. Backlog / ideas (not done)

Roughly by value to the owner:

1. **Owner content:** real product names and prices, WhatsApp number, new admin password, winter and eastern products. These are owner tasks done in admin, not code.
2. **Newsletter form is fake.** It only shows a toast and stores nothing. Either save emails (e.g. `data/subscribers.json` + admin tab) or remove it.
3. **Order notifications:** the owner only sees orders by opening admin. Options: a WhatsApp click-to-chat link per order in admin, or email via an SMTP service.
4. **Payment gateway** (Paymob is the common Egyptian choice) at the marked hook, plus `/api/payment/callback`.
5. **Security hardening before going public:** salted password hashing (`crypto.scrypt`), persisted sessions, `Secure` cookie flag behind HTTPS, CSRF is mitigated only by `SameSite=Strict`.
6. Orphaned uploads are never deleted when a product or photo is removed.
7. Stock is just in/out, with no quantities. Sizes can't be sold out individually.
8. SEO: product titles/meta are set client-side only. There's no `sitemap.xml` or Open Graph tags (these matter for Facebook sharing).
9. Shop search only matches names client-side (the server supports descriptions too).
10. `withLock()` in `server.js` is a no-op busy-wait (all writes are synchronous anyway). Harmless.
11. Footer copyright year is hard-coded (`ft.rights`).
12. Deployment: README lists hosts. Nothing is configured yet (no HTTPS, no process manager).

## 11. Working rules for agents

- Don't add npm dependencies or a build step without the owner asking.
- Never commit or print `data/orders.json` (customer names, phones, addresses).
- Don't edit `data/*.json` by hand while the server runs, because the server keeps them in memory and will overwrite your edit. Stop the server first, or use the API.
- Bilingual for every new string, RTL-safe CSS for every new layout.
- Test on a scratch copy (§8), check the browser console, look at a phone-width screenshot.
- Update **§9 / §10 of this file** when you finish something, so the next agent picks up where you stopped.
