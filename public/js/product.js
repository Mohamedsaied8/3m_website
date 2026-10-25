/* =====================================================================
   3M FASHION — product detail
   ===================================================================== */
'use strict';

let P = null; // SETTINGS comes from app.js
let selSize = '';

function pdId() { return decodeURIComponent(location.pathname.split('/product/')[1] || ''); }

function paintMain(src) {
  const main = $('#pdMain');
  main.style.opacity = 0;
  setTimeout(() => { main.src = src; main.style.opacity = 1; }, 140);
  $$('#pdThumbs button').forEach(b => b.classList.toggle('on', b.dataset.img === src));
}

function seasonLabel(s) {
  return s === 'summer' ? t('nav.summer') : s === 'winter' ? t('nav.winter') : t('shop.all');
}

function renderInfo() {
  const name = (LANG === 'ar' ? P.nameAr : P.nameEn) || P.nameEn;
  const desc = (LANG === 'ar' ? P.descAr : P.descEn) || P.descEn;
  const isSale = P.oldPrice && P.oldPrice > P.price;
  const crumbName = esc(name);

  $('#pdInfo').innerHTML = `
    <div class="breadcrumb-inline"><span class="label">${esc(t('pd.title'))} · ${esc(seasonLabel(P.season))}</span></div>
    <h1 style="margin-top:.8rem">${crumbName}</h1>
    <div class="pd-price">${isSale ? `<span class="old">${money(P.oldPrice)}</span>` : ''}${money(P.price)}</div>
    ${P.stock ? '' : `<p style="margin-top:.4rem;color:var(--logo-red);font-size:.85rem;letter-spacing:.08em">${esc(t('pd.stock.no'))}</p>`}
    <p class="pd-desc">${esc(desc)}</p>

    ${P.sizes && P.sizes.length ? `
      <span class="opt-label label" data-i18n="pd.size"></span>
      <div class="size-chips" id="sizeChips">
        ${P.sizes.map(sz => `<button data-size="${esc(sz)}">${esc(sz)}</button>`).join('')}
      </div>` : ''}

    <div class="qty-row">
      <div class="qty-stepper" aria-label="${esc(t('pd.qty'))}">
        <button id="qMinus" type="button">−</button>
        <output id="qOut">1</output>
        <button id="qPlus" type="button">+</button>
      </div>
      <button class="btn solid" id="addBtn" type="button" ${P.stock ? '' : 'disabled'} data-i18n="pd.add-cart"></button>
      ${SETTINGS.whatsapp ? `<button class="btn gold" id="waBtn" type="button" ${P.stock ? '' : 'disabled'}>
        ${ico('wa')}<span data-i18n="pd.buy-wa"></span></button>` : ''}
    </div>

    <div class="pd-meta">
      <p>${ico('cotton')}<span data-i18n="pd.meta.1"></span></p>
      <p>${ico('truck')}<span data-i18n="pd.meta.2"></span></p>
      <p>${ico('check')}<span data-i18n="pd.meta.3"></span></p>
      <p>${ico('phone')}<span data-i18n="pd.meta.4"></span></p>
    </div>`;

  applyI18n();
  $('#crumb').innerHTML = `<a href="/shop" data-i18n="nav.shop"></a> · <a href="/shop?season=${esc(P.season)}">${esc(seasonLabel(P.season))}</a> · <span>${crumbName}</span>`;
  applyI18n();

  /* thumbnails */
  $('#pdThumbs').innerHTML = (P.images || []).map(src =>
    `<button data-img="${esc(src)}" type="button"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('');
  $$('#pdThumbs button').forEach(b => b.addEventListener('click', () => paintMain(b.dataset.img)));

  /* sizes */
  const chips = $$('#sizeChips button');
  chips.forEach(c => c.addEventListener('click', () => {
    selSize = c.dataset.size;
    chips.forEach(x => x.classList.toggle('on', x === c));
  }));

  /* qty */
  let qty = 1;
  const out = $('#qOut');
  $('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); out.textContent = qty; });
  $('#qPlus').addEventListener('click', () => { qty = Math.min(99, qty + 1); out.textContent = qty; });

  /* add */
  $('#addBtn').addEventListener('click', () => {
    if (P.sizes?.length && !selSize) { toast(t('t.select'), true); return; }
    cartAdd(P.id, qty, selSize);
    document.body.classList.add('cart-flash');
  });

  /* whatsapp express order */
  const wa = $('#waBtn');
  if (wa) wa.addEventListener('click', () => {
    const name = (LANG === 'ar' ? P.nameAr : P.nameEn) || P.nameEn;
    const msg = LANG === 'ar'
      ? `مرحباً 3M 👋 أود طلب:\n• ${name}${selSize ? ' — مقاس ' + selSize : ''} × ${qty}\n• السعر: ${money(P.price)}`
      : `Hello 3M 👋 I would like to order:\n• ${name}${selSize ? ' — size ' + selSize : ''} × ${qty}\n• Price: ${money(P.price)}`;
    window.open(`https://wa.me/${SETTINGS.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

async function boot() {
  SETTINGS = await loadSettings();
  const id = pdId();
  try { P = await api('/api/products/' + encodeURIComponent(id)); }
  catch { return notFound(); }
  if (!P || !P.images || !P.images.length) return notFound();

  document.title = `${(LANG === 'ar' ? P.nameAr : P.nameEn) || P.nameEn} — 3M Fashion`;
  renderInfo();
  paintMain(P.images[0]);

  /* related */
  const all = await api('/api/products');
  const rel = all.filter(p => p.id !== P.id && p.season === P.season).slice(0, 4);
  if (rel.length) {
    $('#relatedSec').classList.remove('hidden');
    renderProductGrid(rel, '#relatedGrid');
  }
}
function notFound() {
  $('#pdWrap').innerHTML = `<div class="empty-state" style="grid-column:1/-1">
    <h3 data-i18n="pd.notfound.t"></h3><p data-i18n="pd.notfound.d"></p>
    <a class="btn" href="/shop" data-i18n="cart.empty.btn"></a></div>`;
  applyI18n();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
