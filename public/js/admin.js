/* =====================================================================
   3M FASHION — admin panel logic
   (interface bilingual EN/AR inline; the store itself is fully
    bilingual — product names/descriptions are entered in both.)
   ===================================================================== */
'use strict';

let PRODUCTS = [], ORDERS = [], SETT = null;
let curTab = 'overview';

/* ------------------------------------------------------------ helpers */
const byId = id => document.getElementById(id);
const SEASONS = [['summer', 'Summer · صيفي'], ['winter', 'Winter · شتوي'], ['all', 'All-season · طوال العام']];
const CATS = [['homewear', 'Home Wear · منزلي'], ['eastern', 'Eastern · شرقي']];
const BASE_SIZES = ['M', 'L', 'XL', '2XL', '3XL'];
const pillSeason = s => `<span class="pill ${s}">${esc((SEASONS.find(x => x[0] === s) || ['', s])[1])}</span>`;
const fmtDate = ts => new Date(ts).toLocaleString(LANG === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/* --------------------------------------------------------------- auth */
async function tryEnter() {
  try { await api('/api/orders'); enter(); }
  catch { byId('loginGate').classList.remove('hidden'); }
}
async function login(ev) {
  ev.preventDefault();
  const btn = byId('loginBtn');
  btn.disabled = true;
  try {
    await api('/api/login', { method: 'POST', body: { password: byId('pwInput').value } });
    byId('loginGate').classList.add('hidden');
    enter();
  } catch (e) {
    toast('Wrong password · كلمة المرور غير صحيحة', true);
    byId('pwInput').focus();
  }
  btn.disabled = false;
}
function logout() {
  api('/api/logout', { method: 'POST' });
  location.reload();
}
function enter() {
  byId('loginGate').classList.add('hidden');
  byId('adminApp').classList.remove('hidden');
  bootData();
}

/* ------------------------------------------------------------ loaders */
async function bootData() {
  [PRODUCTS, ORDERS, SETT] = await Promise.all([
    api('/api/products?all=1') /* server ignores unknown params; fine */,
    api('/api/orders'),
    loadSettings(true),
  ]);
  renderTab();
}

function renderTab() {
  $$('.admin-side button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === curTab));
  const box = byId('tabContent');
  ({ overview: renderOverview, products: renderProducts, orders: renderOrders, settings: renderSettings })[curTab](box);
}

/* ------------------------------------------------------------ overview */
function renderOverview(box) {
  const sum = s => PRODUCTS.filter(p => p.season === s).length;
  const revenue = ORDERS.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const newOrders = ORDERS.filter(o => o.status === 'new').length;
  box.innerHTML = `
    <div class="admin-crumbs">Dashboard · 3M Fashion</div>
    <h2>Overview</h2>
    <div class="stat-grid">
      <div class="stat"><b>${PRODUCTS.length}</b><span>Products</span></div>
      <div class="stat"><b>${sum('summer')}</b><span>Summer pieces · صيفي</span></div>
      <div class="stat"><b>${sum('winter')}</b><span>Winter pieces · شتوي</span></div>
      <div class="stat"><b>${newOrders}</b><span>New orders</span></div>
      <div class="stat"><b>${ORDERS.length}</b><span>Total orders</span></div>
      <div class="stat"><b>${revenue.toLocaleString('en-EG')}</b><span>Revenue EGP</span></div>
    </div>
    <div class="note">
      <b>Quick guide · دليل سريع</b><br>
      1) <b>Products</b> → "New product" → upload photos of the model (garment only), set name in both languages & price in EGP, choose <b>Summer</b> or <b>Winter</b> to group it.<br>
      2) Arabic names/descriptions appear automatically to Arabic visitors; English to English visitors.<br>
      3) <b>Orders</b> → every website order lands here with all customer details — mark it Confirmed → Delivered.<br>
      4) <b>Settings</b> → add your WhatsApp number so customers can order via WhatsApp.
    </div>
    <div class="note" style="margin-top:.8rem">
      <b>Photo policy · سياسة الصور</b><br>
      Keep every product photo garment-only (hanger / flat-lay) — no people. · صور القطعة فقط بدون أشخاص.
    </div>`;
}

/* ------------------------------------------------------------ products */
function renderProducts(box) {
  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.4rem">
      <h2 style="margin:0">Products · الموديلات</h2>
      <button class="btn solid small" id="newProd">+ New product · إضافة موديل</button>
    </div>
    <table class="tbl"><thead><tr>
      <th></th><th>Name · الاسم</th><th>Price EGP · السعر</th><th>Group · المجموعة</th><th>Category</th>
      <th>Featured</th><th>Visible</th><th class="actions"></th><th class="actions"></th>
    </tr></thead><tbody id="prodRows"></tbody></table>`;

  byId('prodRows').innerHTML = PRODUCTS.map(p => `
    <tr data-id="${p.id}">
      <td>${p.images[0] ? `<img class="timg" src="${esc(p.images[0])}" alt="">` : '<div class="timg" style="background:#eee"></div>'}</td>
      <td><b>${esc(p.nameEn || '—')}</b><br><span style="color:#777;font-size:.82rem">${esc(p.nameAr || '—')}</span></td>
      <td><b>${p.price.toLocaleString('en-EG')}</b>${p.oldPrice ? `<br><s style="color:#999;font-size:.8rem">${p.oldPrice.toLocaleString('en-EG')}</s>` : ''}</td>
      <td>${pillSeason(p.season)}</td>
      <td><span class="pill">${esc((CATS.find(c => c[0] === p.category) || ['', p.category])[1])}</span></td>
      <td style="text-align:center">${p.featured ? '★' : '☆'}</td>
      <td style="text-align:center">${p.visible ? '●' : '○'}</td>
      <td class="actions"><button data-stok data-s="${p.stock ? 0 : 1}">${p.stock ? 'Mark sold out' : 'Restock'}</button></td>
      <td class="actions">
        <button data-edit>Edit · تعديل</button>
        <button class="del" data-del>Delete · حذف</button>
      </td>
    </tr>`).join('');

  byId('newProd').addEventListener('click', () => openEditor(null));
  box.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
    openEditor(PRODUCTS.find(p => p.id === b.closest('tr').dataset.id))));
  box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    const p = PRODUCTS.find(p => p.id === b.closest('tr').dataset.id);
    if (!confirm(`Delete "${p.nameEn || p.nameAr}"?\nحذف الموديل؟`)) return;
    await api('/api/products/' + p.id, { method: 'DELETE' });
    toast('Deleted');
    bootData();
  }));
  box.querySelectorAll('[data-stok]').forEach(b => b.addEventListener('click', async () => {
    const id = b.closest('tr').dataset.id;
    const p = PRODUCTS.find(p => p.id === id);
    await api('/api/products/' + id, { method: 'PUT', body: { stock: !!+b.dataset.s } });
    p.stock = !!+b.dataset.s;
    toast(b.dataset.s ? 'Restocked' : 'Marked sold out');
    renderTab();
  }));
}

/* ------------------------------------------------------- product editor */
function openEditor(p) {
  const isNew = !p;
  const ed = {
    images: p ? [...p.images] : [],
    sizes: new Set(p ? p.sizes : BASE_SIZES.slice(0, 4)),
    customSizes: p ? (p.sizes.filter(s => !BASE_SIZES.includes(s))) : [],
  };
  const v = (sel, val) => esc(val ?? '');

  const modal = document.createElement('div');
  modal.className = 'modal-veil';
  modal.innerHTML = `
  <div class="modal" id="prodModal">
    <button class="close-x" data-close>✕</button>
    <h3>${isNew ? 'New product · موديل جديد' : 'Edit product · تعديل الموديل'}</h3>

    <div class="f-grid">
      <div class="field"><label>Name — English</label><input id="eNameEn" value="${v(0, p?.nameEn)}" dir="ltr"></div>
      <div class="field"><label>الاسم — عربي</label><input id="eNameAr" value="${v(0, p?.nameAr)}"></div>
      <div class="field full"><label>Description — English / الوصف إنجليزي</label>
        <textarea id="eDescEn" rows="2" dir="ltr">${v(0, p?.descEn)}</textarea></div>
      <div class="field full"><label>الوصف — عربي</label>
        <textarea id="eDescAr" rows="2">${v(0, p?.descAr)}</textarea></div>
      <div class="field"><label>Price EGP · السعر جنيه</label><input id="ePrice" type="number" min="0" step="1" value="${v(0, p?.price ?? '')}" dir="ltr" required></div>
      <div class="field"><label>Old price (optional) · السعر قبل الخصم</label><input id="eOld" type="number" min="0" step="1" value="${p?.oldPrice || ''}" dir="ltr"></div>
      <div class="field"><label>Group · المجموعة (مهم)</label>
        <select id="eSeason">${SEASONS.map(([k, l]) => `<option value="${k}" ${p?.season === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Category · القسم</label>
        <select id="eCat">${CATS.map(([k, l]) => `<option value="${k}" ${p?.category === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field full"><label>Available sizes · المقاسات المتاحة</label>
        <div class="size-chips" id="eSizes">${BASE_SIZES.map(s =>
      `<button type="button" data-s="${s}" class="${ed.sizes.has(s) ? 'on' : ''}">${s}</button>`).join('')}
          <span id="eCustomSizes" style="display:inline-flex;gap:.4rem">${ed.customSizes.map(cs =>
      `<button type="button" data-s="${esc(cs)}" class="on">${esc(cs)}</button>`).join('')}</span>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.6rem">
          <input id="eAddSize" placeholder="Add size · مثل: 38 أو XXL" style="flex:1">
          <button type="button" class="btn small" id="eAddSizeBtn">+ Add</button>
        </div>
      </div>
      <div class="field"><label>Colors (optional) · الألوان الأخرى</label>
        <input id="eColors" value="${v(0, p?.colors)}" placeholder="red, mint…"></div>
    </div>

    <span class="opt-label label" style="margin-top:1.4rem">Photos of the model — first photo = cover
      (garment only · صور الموديل — الأولى هي الغلاف)</span>
    <div class="up-zone" id="eUpZone">Drop photos here or click — صيفي / شتوي photos جاهزة للرفع<br>
      <small>PNG · JPG · WEBP (max 10 photos)</small>
      <input type="file" id="eFile" accept="image/png,image/jpeg,image/webp" multiple hidden>
    </div>
    <div class="up-thumbs" id="eThumbs"></div>

    <div style="display:flex;gap:2rem;margin-top:1.4rem;flex-wrap:wrap">
      <label class="switch"><input type="checkbox" id="eVisible" ${!p || p.visible ? 'checked' : ''}><span class="track"></span> Visible on site</label>
      <label class="switch"><input type="checkbox" id="eFeatured" ${p?.featured ? 'checked' : ''}><span class="track"></span> Featured (home page)</label>
      <label class="switch"><input type="checkbox" id="eStock" ${!p || p.stock ? 'checked' : ''}><span class="track"></span> In stock</label>
    </div>

    <div style="display:flex;gap:.8rem;margin-top:2rem">
      <button class="btn solid" id="eSave" style="flex:1;justify-content:center">Save · حفظ</button>
      <button class="btn" data-close>Cancel · إلغاء</button>
    </div>
  </div>`;
  byId('modalRoot').appendChild(modal);

  const close = () => modal.remove();
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  const zone = byId('eUpZone'), file = byId('eFile');
  zone.addEventListener('click', () => file.click());
  file.addEventListener('change', () => handleFiles(file.files));
  ['dragover', 'dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, e => {
    e.preventDefault();
    zone.classList.toggle('drag', ev === 'dragover');
    if (ev === 'drop') handleFiles(e.dataTransfer.files);
  }));

  function thumbsHTML() {
    byId('eThumbs').innerHTML = ed.images.map((src, i) => `
      <div class="thumb ${i === 0 ? 'main-tag' : ''}">
        <img src="${esc(src)}" alt="">
        <div class="row">
          ${i > 0 ? '<button type="button" data-mv="-1" data-i="' + i + '">←</button>' : '<span></span>'}
          <button type="button" data-rm="${i}">✕</button>
          ${i < ed.images.length - 1 ? '<button type="button" data-mv="1" data-i="' + i + '">→</button>' : '<span></span>'}
        </div>
      </div>`).join('');
    byId('eThumbs').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      ed.images.splice(+b.dataset.rm, 1); thumbsHTML();
    }));
    byId('eThumbs').querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, d = +b.dataset.mv;
      const [x] = ed.images.splice(i, 1);
      ed.images.splice(i + d, 0, x);
      thumbsHTML();
    }));
  }

  async function handleFiles(files) {
    for (const f of files) {
      if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) continue;
      const data = await new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(f); });
      try {
        const res = await api('/api/upload', { method: 'POST', body: { files: [{ name: f.name, data }] } });
        ed.images.push(...res.urls);
        thumbsHTML();
      } catch (e) { toast('Upload failed: ' + e.message, true); }
    }
    file.value = '';
  }

  /* sizes chips */
  const bindSize = btn => btn.addEventListener('click', () => {
    const s = btn.dataset.s;
    if (ed.sizes.has(s)) ed.sizes.delete(s); else ed.sizes.add(s);
    btn.classList.toggle('on', ed.sizes.has(s));
  });
  byId('eSizes').querySelectorAll('button').forEach(bindSize);
  byId('eAddSizeBtn').addEventListener('click', () => {
    const s = byId('eAddSize').value.trim().toUpperCase();
    if (!s || ed.sizes.has(s)) return;
    ed.sizes.add(s);
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.s = s; b.textContent = s; b.className = 'on';
    byId('eCustomSizes').appendChild(b);
    bindSize(b);
    byId('eAddSize').value = '';
  });

  thumbsHTML();

  byId('eSave').addEventListener('click', async () => {
    const price = Number(byId('ePrice').value);
    if (!price || price <= 0) { toast('Set the price in EGP · حدد السعر بالجنيه', true); byId('ePrice').focus(); return; }
    if (!ed.images.length) { toast('Add at least one photo · أضف صورة واحدة على الأقل', true); return; }
    const body = {
      nameEn: byId('eNameEn').value.trim(),
      nameAr: byId('eNameAr').value.trim(),
      descEn: byId('eDescEn').value.trim(),
      descAr: byId('eDescAr').value.trim(),
      price,
      oldPrice: Number(byId('eOld').value) || 0,
      season: byId('eSeason').value,
      category: byId('eCat').value,
      sizes: [...ed.sizes],
      colors: byId('eColors').value.trim(),
      images: ed.images,
      visible: byId('eVisible').checked,
      featured: byId('eFeatured').checked,
      stock: byId('eStock').checked,
    };
    if (isNew) await api('/api/products', { method: 'POST', body });
    else await api('/api/products/' + p.id, { method: 'PUT', body });
    toast('Saved · تم الحفظ');
    close();
    bootData();
  });
}

/* ------------------------------------------------------------- orders */
function renderOrders(box) {
  const pills = ['new', 'confirmed', 'delivered', 'cancelled'];
  box.innerHTML = `
    <div class="admin-crumbs">Every order from the store appears here · كل طلبات الموقع هنا</div>
    <h2>Orders · الطلبات</h2>
    <table class="tbl"><thead><tr>
      <th>Order</th><th>Customer</th><th>Items</th><th>Total EGP</th><th>Payment</th><th>Status</th><th>Date</th>
    </tr></thead><tbody>
    ${ORDERS.length ? ORDERS.map(o => `
      <tr>
        <td><b>${esc(o.id)}</b><br><span class="pill ${esc(o.status)}">${esc(o.status)}</span></td>
        <td>${esc(o.customer.name)}<br><a style="color:inherit" href="tel:${esc(o.customer.phone)}">${esc(o.customer.phone)}</a>${o.customer.altPhone ? ` · <a style="color:inherit" href="tel:${esc(o.customer.altPhone)}">${esc(o.customer.altPhone)}</a>` : ''}<br>
          <span style="color:#777;font-size:.8rem">${esc(o.customer.governorate)} · ${esc(o.customer.city)} — ${esc(o.customer.address)}</span>
          ${o.customer.notes ? `<br><span style="color:#999;font-size:.8rem">“${esc(o.customer.notes)}”</span>` : ''}</td>
        <td>${o.items.map(i => `${esc(i.nameEn || i.nameAr)}${i.size ? ' (' + esc(i.size) + ')' : ''} ×${i.qty}`).join('<br>')}</td>
        <td><b>${o.total.toLocaleString('en-EG')}</b><br>
          <label style="color:#999;font-size:.8rem;white-space:nowrap">ship · شحن
            <input type="number" min="0" data-ship="${esc(o.id)}" value="${o.shipping ?? ''}" placeholder="add" dir="ltr"
              style="width:5.5rem;padding:.15rem .35rem;margin-inline-start:.3rem;${o.shipping === null || o.shipping === undefined ? 'border-color:var(--logo-red)' : ''}"></label>
          ${o.shipping === null || o.shipping === undefined ? '<br><span style="color:var(--logo-red);font-size:.75rem">Shipping not added yet · الشحن لم يُضف</span>' : ''}</td>
        <td>${o.paymentMethod === 'instapay' ? 'Instapay' : 'Cash on delivery'}</td>
        <td><select data-oid="${esc(o.id)}" class="mini">
          ${pills.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></td>
        <td style="font-size:.8rem;color:#777">${fmtDate(o.createdAt)}</td>
      </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">No orders yet — they will appear the moment a customer checks out. · لا توجد طلبات بعد</td></tr>'}
    </tbody></table>`;

  box.querySelectorAll('input[data-ship]').forEach(inp => inp.addEventListener('change', async () => {
    if (inp.value === '' || Number(inp.value) < 0) return;
    await api('/api/orders/' + inp.dataset.ship, { method: 'PUT', body: { shipping: Number(inp.value) } });
    toast('Shipping saved · تم حفظ الشحن');
    bootData();
  }));
  box.querySelectorAll('select[data-oid]').forEach(sel => sel.addEventListener('change', async () => {
    await api('/api/orders/' + sel.dataset.oid, { method: 'PUT', body: { status: sel.value } });
    toast('Status updated');
    bootData();
  }));
}

/* ------------------------------------------------------------ settings */
function renderSettings(box) {
  const s = SETT;
  box.innerHTML = `
    <div class="admin-crumbs">Brand, payments & delivery · الإعدادات</div>
    <h2>Settings · الإعدادات</h2>

    <form id="setForm" class="form-card" style="max-width:760px">
      <h3>Store essentials</h3>
      <div class="f-grid">
        <div class="field"><label>WhatsApp number (floating chat button + orders) · رقم واتساب — e.g. 01012345678</label>
          <input id="sWa" value="${esc(s.whatsapp || '')}" dir="ltr" placeholder="010XXXXXXXX"></div>
        <div class="field"><label>Facebook page URL</label>
          <input id="sFb" value="${esc(s.facebook || '')}" dir="ltr"></div>
        <div class="field"><label>Hero title — English</label><input id="sHE" value="${esc(s.hero?.titleEn || '')}" dir="ltr"></div>
        <div class="field"><label>عنوان الواجهة — عربي</label><input id="sHA" value="${esc(s.hero?.titleAr || '')}"></div>
        <div class="field full"><label>Hero subtitle — English</label><input id="sHsE" value="${esc(s.hero?.subEn || '')}" dir="ltr"></div>
        <div class="field full"><label>الوصف — عربي</label><input id="sHsA" value="${esc(s.hero?.subAr || '')}"></div>
      </div>

      <h3 style="margin-top:2rem">Shipping · الشحن</h3>
      <label class="switch" style="margin-bottom:.4rem"><input type="checkbox" id="sShowShip" ${s.showShippingFee !== false ? 'checked' : ''}><span class="track"></span>
        Show shipping fee to customers · إظهار مصاريف الشحن للعميل</label>
      <p style="color:#777;font-size:.8rem;margin:0 0 1rem">When off, checkout says “Added on confirmation” and you type the fee on each order in the Orders tab. ·
        لو مقفولة، العميل يشوف «تُضاف عند تأكيد الطلب» وانت تكتب الشحن لكل طلب من صفحة الطلبات.</p>
      <div class="f-grid">
        <div class="field"><label>Default shipping fee EGP · الشحن الافتراضي</label>
          <input id="sShip" type="number" min="0" value="${s.shippingFee ?? ''}" dir="ltr"></div>
        <div class="field"><label>Free shipping over EGP · شحن مجاني أعلى من (0 = off)</label>
          <input id="sFree" type="number" min="0" value="${s.freeShippingOver ?? ''}" dir="ltr"></div>
      </div>
      <p style="color:#777;font-size:.8rem;margin:1rem 0 .5rem">Fee per governorate. Leave empty to use the default fee. Untick “Deliver” to hide a governorate from checkout. ·
        الشحن لكل محافظة. سيبه فاضي للشحن الافتراضي. شيل علامة «توصيل» لإخفاء المحافظة.</p>
      <div style="max-height:420px;overflow:auto;border:1px solid var(--line)">
      <table class="tbl" style="border:0"><thead><tr><th>Governorate · المحافظة</th><th>Fee EGP · الشحن</th><th>Deliver · توصيل</th></tr></thead><tbody>
        ${GOVS.map(([en, ar]) => `<tr>
          <td>${esc(en)} · ${esc(ar)}</td>
          <td><input type="number" min="0" data-rate="${esc(en)}" value="${s.shippingRates?.[en] ?? ''}" placeholder="${esc(s.shippingFee ?? '')}" dir="ltr" style="width:7rem;padding:.25rem .5rem"></td>
          <td><label class="switch"><input type="checkbox" data-deliver="${esc(en)}" ${(s.deliveryOff || []).includes(en) ? '' : 'checked'}><span class="track"></span></label></td>
        </tr>`).join('')}
      </tbody></table></div>

      <h3 style="margin-top:2rem">Payment methods</h3>
      <div style="display:grid;gap:.8rem">
        <label class="switch"><input type="checkbox" id="sCod" ${s.payment?.cashOnDelivery ? 'checked' : ''}><span class="track"></span> Cash on delivery · الدفع عند الاستلام</label>
        <label class="switch"><input type="checkbox" id="sInsta" ${s.payment?.instapay?.enabled ? 'checked' : ''}><span class="track"></span> Instapay / bank transfer · تحويل فوري
          <input id="sInstaNo" value="${esc(s.payment?.instapay?.number || '')}" dir="ltr" placeholder="number" style="width:auto;margin-inline-start:1rem;padding:.25rem .5rem"></label>
        <label class="switch" style="opacity:.6"><input type="checkbox" disabled><span class="track"></span> Online card gateway · بوابة الدفع — hook ready, enable when you register the gateway</label>
      </div>

      <h3 style="margin-top:2rem">Change admin password</h3>
      <div class="f-grid">
        <div class="field"><label>Current password</label><input id="sCurPw" type="password" autocomplete="current-password"></div>
        <div class="field"><label>New password</label><input id="sNewPw" type="password" autocomplete="new-password"></div>
      </div>

      <button class="btn solid" type="submit" style="margin-top:2rem">Save settings · حفظ</button>
    </form>`;
  applyI18n();

  byId('setForm').addEventListener('submit', async ev => {
    ev.preventDefault();
    const body = {
      whatsapp: byId('sWa').value.trim(),
      facebook: byId('sFb').value.trim(),
      shippingFee: Number(byId('sShip').value) || 0,
      freeShippingOver: Number(byId('sFree').value) || 0,
      showShippingFee: byId('sShowShip').checked,
      shippingRates: Object.fromEntries([...box.querySelectorAll('input[data-rate]')]
        .filter(i => i.value !== '').map(i => [i.dataset.rate, Number(i.value)])),
      deliveryOff: [...box.querySelectorAll('input[data-deliver]')].filter(i => !i.checked).map(i => i.dataset.deliver),
      hero: {
        titleEn: byId('sHE').value.trim(), titleAr: byId('sHA').value.trim(),
        subEn: byId('sHsE').value.trim(), subAr: byId('sHsA').value.trim(),
      },
      payment: {
        cashOnDelivery: byId('sCod').checked,
        instapay: { enabled: byId('sInsta').checked, number: byId('sInstaNo').value.trim() },
        online: { enabled: false, note: SETT.payment?.online?.note || 'Online card payments are coming soon.' },
      },
    };
    const cur = byId('sCurPw').value, nw = byId('sNewPw').value;
    if (nw) { body.currentPassword = cur; body.newPassword = nw; }
    try {
      await api('/api/settings', { method: 'PUT', body });
      toast('Settings saved · تم الحفظ');
      bootData();
    } catch (e) { toast(e.message, true); }
  });
}

/* --------------------------------------------------------------- tabs */
document.querySelectorAll('.admin-side button[data-tab]').forEach(b =>
  b.addEventListener('click', () => { curTab = b.dataset.tab; renderTab(); }));
byId('logoutBtn').addEventListener('click', logout);
byId('logoutBtn2').addEventListener('click', logout);
byId('loginForm').addEventListener('submit', login);

tryEnter();
