# 3M Fashion — Online Store 🖤

A bilingual (Arabic / English) e-commerce website for **3M Fashion — Home Wear & Eastern Clothes**, styled after the brand logo (black · ivory · gold · red) with a luxury-fashion look — and **garment-only photography** (no people, as requested).

---

## 🚀 Run it

You need only Node.js (any recent version). **No npm install required.**

| System | How |
|---|---|
| Windows | Double-click `start.bat` |
| Linux / Mac | `./start.sh` or `node server.js` |

Then open:

- **Store** → http://localhost:3000
- **Admin** → http://localhost:3000/admin — default password: **`3m-admin`** *(change it in Admin ▸ Settings)*

Different port: `PORT=8080 node server.js` (or edit `start.bat`).

---

## 🗂 What's inside

| Path | Purpose |
|---|---|
| `server.js` | Zero-dependency Node server: pages, products API, orders, photo uploads, admin login |
| `public/` | The website itself (HTML / CSS / JS, bilingual) |
| `assets/` | Your original photo folders — the live site reuses images from here |
| `data/` | Auto-created on first run: `products.json`, `orders.json`, `settings.json` (keep a backup) |
| `public/uploads/` | Photos uploaded through the admin page |

## 👗 For the site owner (Admin)

Open `/admin` and log in.

**Products ▸ "+ New product"** — upload photos of the model (the first one becomes the cover), write the name **in both English and Arabic** (Arabic visitors see the Arabic, English visitors the English), set the **price in EGP** (optional "old price" shows a sale badge), pick available sizes, and choose the **Group**:

- **Summer · صيفي** — grouped together in the Summer collection and its nav link
- **Winter · شتوي** — the winter group
- **All-season** — always available

Also pick the **Category: Home Wear · منزلي** or **Eastern · شرقي**.
`Featured` = appears on the home page. `Visible` = hide from the store without deleting. `Mark sold out` keeps the piece browseable.

**Orders** — every website order arrives here with the customer's name, phone, governorate, address, items and payment method. Change the status: *new → confirmed → delivered / cancelled*.

**Overview** — live counters: total / summer / winter pieces, new orders, total revenue in EGP.

**Settings** — put your **WhatsApp number** here (enables the WhatsApp order buttons and the "send order" link after checkout), the Facebook page URL, shipping fee, free-shipping threshold, hero titles in EN/AR, and **change the admin password**.

> The seeded products ("Summer Set 01…", 350 EGP) use placeholder names and prices — replace them with your real ones from the admin.

## 🌍 Languages

The round toggle in the header (top-right) switches between **ع** and **EN**. The layout flips to RTL automatically in Arabic, and the choice is remembered per device.

## 💳 Payments (gateway hook ready)

Out of the box: **Cash on Delivery** (default) plus **Instapay / bank transfer** (toggle + number in Settings). During checkout, **online card payment shows "Coming soon"**.

When you attach your gateway later, everything hooks into one marked spot:

```
server.js   →   /* === PAYMENT GATEWAY HOOK === */
```

Create the payment session with the order's `total`, return its `paymentUrl` in the response, and the checkout will send the customer to pay. You then enable it from `data/settings.json → payment.online.enabled` (and the coming-soon pill disappears).

## 🧾 Your data

- Products, orders and settings are plain JSON files in `data/` — easy to back up or inspect.
- Orders survive server restarts; nothing a customer entered is ever lost.
- Admin login is rate-limited (5 tries / 5 min); admin sessions last 7 days per browser.

## 🖼 Photography policy

Every image on the site is **garment-only** (hanger / flat-lay shots) — no people, exactly as requested. Keep uploaded product photos the same way for a consistent, polished look.

## ☁️ Putting it online later

Any host that runs Node.js works (small VPS, Railway, Render, Hostinger…) — the port comes from the host's `PORT` variable, which `server.js` already reads. Upload the whole folder (keep `assets/`), run the server, put your domain/HTTPS in front, then set the real WhatsApp number in **Admin ▸ Settings**.

**Facebook:** the footer already links https://www.facebook.com/3mhomewear/ — change it any time in Settings.
