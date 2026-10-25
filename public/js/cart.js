/* =====================================================================
   3M FASHION — cart & checkout
   ===================================================================== */
'use strict';

let PRODUCTS = [];
let S = null;          // settings
let paymentChoice = 'cash_on_delivery';

function pmap() { const m = new Map(); PRODUCTS.forEach(p => m.set(p.id, p)); return m; }

function cartTotals() {
  const m = pmap();
  const items = getCart().map(i => ({ ...i, p: m.get(i.id) })).filter(i => i.p);
  const subtotal = items.reduce((s, i) => s + (i.p.price || 0) * i.qty, 0);
  const shipping = !items.length ? 0
    : (S.freeShippingOver > 0 && subtotal >= S.freeShippingOver ? 0 : (Number(S.shippingFee) || 0));
  return { items, subtotal, shipping, total: subtotal + shipping };
}

function summaryHTML(tot, withBtn) {
  return `
    <h3>${esc(t('c.summary'))}</h3>
    ${tot.items.map(i => `
      <div class="s-row">
        <span>${esc((LANG === 'ar' ? i.p.nameAr : i.p.nameEn) || i.p.nameEn)}
          <small style="color:rgba(247,244,238,.55)"> × ${i.qty}${i.size ? ' · ' + esc(i.size) : ''}</small></span>
        <span>${money(i.p.price * i.qty)}</span>
      </div>`).join('')}
    <div class="s-row"><span>${esc(t('c.subtotal'))}</span><span>${money(tot.subtotal)}</span></div>
    <div class="s-row"><span>${esc(t('c.shipping'))}</span>
      <span class="${tot.shipping === 0 ? 'free' : ''}">${tot.shipping === 0 ? esc(t('c.free')) : money(tot.shipping)}</span></div>
    <div class="s-row total"><span>${esc(t('c.total'))}</span><span>${money(tot.total)}</span></div>
    ${withBtn ? `<button class="btn gold" id="toCheckout" style="width:100%;justify-content:center;margin-top:1.6rem" data-i18n="c.checkout"></button>` : ''}
  `;
}

function renderCart() {
  applyI18n();
  const tot = cartTotals();
  const box = $('#cartLines');
  if (!tot.items.length) {
    box.innerHTML = `<div class="empty-state" style="text-align:start">
      <h3 style="font-size:1.6rem">${esc(t('cart.empty.t'))}</h3>
      <p style="color:var(--muted);margin-bottom:1.6rem">${esc(t('cart.empty.d'))}</p>
      <a class="btn" href="/shop">${esc(t('cart.empty.btn'))}</a>
    </div>`;
    $('#summaryBox').innerHTML = `<h3>${esc(t('c.summary'))}</h3><div class="s-row total"><span>${esc(t('c.total'))}</span><span>${money(0)}</span></div>`;
    $('#summaryBox').style.opacity = .5;
    return;
  }
  $('#summaryBox').style.opacity = 1;
  box.innerHTML = tot.items.map(i => `
    <div class="cart-line reveal">
      <a href="/product/${esc(i.id)}"><img src="${esc((i.p.images || [])[0])}" alt=""></a>
      <div>
        <div class="c-name">${esc((LANG === 'ar' ? i.p.nameAr : i.p.nameEn) || i.p.nameEn)}</div>
        <div class="c-sub">${money(i.p.price)}${i.size ? ' · ' + esc(t('size')) + ': ' + esc(i.size) : ''}</div>
        <div class="c-qty" style="max-width:130px;margin-top:.55rem">
          <button data-dec data-id="${esc(i.id)}" data-size="${esc(i.size)}" aria-label="-">−</button>
          <b>${i.qty}</b>
          <button data-inc data-id="${esc(i.id)}" data-size="${esc(i.size)}" aria-label="+">+</button>
        </div>
      </div>
      <div class="c-right">
        <b>${money(i.p.price * i.qty)}</b>
        <button class="rm" data-rm data-id="${esc(i.id)}" data-size="${esc(i.size)}">${esc(t('c.remove'))}</button>
      </div>
    </div>`).join('');
  $('#summaryBox').innerHTML = summaryHTML(tot, true);
  applyI18n();

  box.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => bumpQty(b.dataset.id, b.dataset.size, +1)));
  box.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => bumpQty(b.dataset.id, b.dataset.size, -1)));
  box.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { cartRemove(b.dataset.id, b.dataset.size); renderCart(); }));
  $('#toCheckout').addEventListener('click', goCheckout);
  revealInit(); // cart lines use the .reveal fade-in
}

function bumpQty(id, size, d) {
  const c = getCart();
  const it = c.find(x => x.id === id && x.size === size);
  if (!it) return;
  it.qty = Math.min(99, Math.max(0, it.qty + d));
  if (!it.qty) cartRemove(id, size);
  else setCart(c);
  renderCart();
}

/* ------------------------------------------------------------- checkout */
function goCheckout() {
  const tot = cartTotals();
  $('#cartView').classList.add('hidden');
  $('#checkoutView').classList.remove('hidden');
  $('#coGov').innerHTML = `<option value="" disabled selected>${LANG === 'ar' ? 'اختر المحافظة' : 'Select governorate'}</option>` + govOptions();
  $('#coSummary').innerHTML = summaryHTML(tot, false);
  $('#coForm')?.querySelector('.note')?.remove();
  renderPayOpts(tot);
  applyI18n();
  if (tot.shipping === 0 && S.freeShippingOver > 0) { /* free shipping hint */ }
  else if (S.freeShippingOver > 0) {
    $('#coForm').insertAdjacentHTML('afterbegin', `<div class="note">${LANG === 'ar'
      ? `أضف بقيمة ${money(S.freeShippingOver - tot.subtotal)} للحصول على شحن مجاني`
      : `Spend ${money(S.freeShippingOver - tot.subtotal)} more for free shipping`}</div>`);
  }
}

function renderPayOpts(tot) {
  const el = $('#payOpts');
  const opts = [];
  if (S.payment?.cashOnDelivery) opts.push({ id: 'cash_on_delivery', t: t('pay.cod'), d: t('pay.cod.d') });
  if (S.payment?.instapay?.enabled) opts.push({ id: 'instapay', t: t('pay.instapay'), d: `${t('pay.instapay.d')} <b dir="ltr">${esc(S.payment.instapay.number)}</b>` });
  if (S.payment?.online?.enabled) opts.push({ id: 'online', t: t('pay.online'), d: t('pay.online.d') });
  else opts.push({ id: 'online', t: `${t('pay.online')} — ${t('online.soon')}`, d: t('pay.online.d'), off: true });
  if (!opts.some(o => o.id === paymentChoice && !o.off)) paymentChoice = opts.find(o => !o.off)?.id || 'cash_on_delivery';
  el.innerHTML = opts.map(o => `
    <label class="pay-opt ${o.off ? '' : 'on'}" style="${o.off ? 'opacity:.55;cursor:not-allowed' : ''}">
      <input type="radio" name="pay" value="${o.id}" ${o.off ? 'disabled' : ''} ${paymentChoice === o.id && !o.off ? 'checked' : ''}>
      <span><b>${o.t}</b><small>${o.d}</small></span>
    </label>`).join('');
  el.querySelectorAll('input[name=pay]:not(:disabled)').forEach(r =>
    r.addEventListener('change', () => {
      paymentChoice = r.value;
      el.querySelectorAll('.pay-opt').forEach(l => l.classList.toggle('on', l.querySelector('input').checked && !l.querySelector('input').disabled));
    }));
}

async function submitOrder() {
  const form = $('#coForm');
  const f = id => (document.getElementById(id) || {}).value || '';
  const gov = f('coGov');
  const payload = {
    items: getCart().map(i => ({ id: i.id, qty: i.qty, size: i.size })),
    paymentMethod: paymentChoice,
    customer: {
      name: f('coName').trim(),
      phone: f('coPhone').trim(),
      altPhone: f('coPhone2').trim(),
      governorate: gov,
      city: f('coCity').trim(),
      address: f('coAddress').trim(),
      notes: f('coNotes').trim(),
    },
  };

  /* validate visually */
  const bad = [];
  if (payload.customer.name.length < 3) bad.push('#coName');
  if (!/^0?1\d{8,9}$/.test(payload.customer.phone.replace(/[\s-]/g, ''))) bad.push('#coPhone');
  if (!gov) bad.push('#coGov');
  if (payload.customer.city.length < 2) bad.push('#coCity');
  if (payload.customer.address.length < 8) bad.push('#coAddress');
  $$('#coForm input,#coForm select,#coForm textarea').forEach(i => i.style.borderColor = '');
  if (bad.length) {
    bad.forEach(sel => { const el = $(sel); el.style.borderColor = 'var(--logo-red)'; });
    toast(t('co.err.1'), true);
    bad[0] && $(bad[0]).focus();
    return;
  }

  const btn = $('#coSubmit');
  btn && (btn.disabled = true);
  try {
    const res = await api('/api/orders', { method: 'POST', body: payload });
    finishSuccess(res);
  } catch (e) {
    toast(e.message || t('t.error'), true);
    btn && (btn.disabled = false);
  }
}

async function finishSuccess(res) {
  setCart([]);
  $('#checkoutView').classList.add('hidden');
  $('#cartView').classList.add('hidden');
  $('#successView').classList.remove('hidden');
  $('#okRing').innerHTML = ico('check');
  $('#okOrderNo').textContent = res.id;
  $('#okWa').querySelector('.waIco').innerHTML = ico('wa');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const waMessage = LANG === 'ar'
    ? `مرحباً 3M 👋\nطلبي رقم ${res.id}\nالإجمالي: ${LANG === 'ar' ? res.total + ' ج.م' : res.total + ' EGP'}\nطريقة الدفع: ${paymentChoice === 'instapay' ? 'Instapay' : 'الدفع عند الاستلام'}`
    : `Hello 3M 👋\nMy order is ${res.id}\nTotal: ${res.total} EGP\nPayment: ${paymentChoice === 'instapay' ? 'Instapay' : 'Cash on delivery'}`;
  $('#okWa').href = S.whatsapp ? `https://wa.me/${String(S.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}` : '#';
  applyI18n();
}

let coSubmitBound = false;
function wireCheckout() {
  // build dynamic submit button inside form
  const form = $('#coForm');
  form.insertAdjacentHTML('beforeend', `<button class="btn solid" id="coSubmit" type="submit" style="width:100%;justify-content:center;margin-top:1.8rem" data-i18n="co.submit"></button>`);
  form.addEventListener('submit', e => { e.preventDefault(); submitOrder(); });
  coSubmitBound = true;
}

async function boot() {
  S = await loadSettings();
  const [products] = await Promise.all([api('/api/products'),]);
  PRODUCTS = products;
  applyI18n();
  $('#okRing').innerHTML = ico('check');
  $('#okWa').querySelector('.waIco').innerHTML = ico('wa');
  renderCart();
  wireCheckout();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
