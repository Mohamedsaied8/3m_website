/* =====================================================================
   3M FASHION — home page
   ===================================================================== */
'use strict';

const MARQUEE_EN = ['3M Fashion', 'Home Wear', 'Eastern Clothes', '100% Pure Cotton', 'Cash on Delivery', 'Egypt-Wide Shipping'];
const MARQUEE_AR = ['3M فيشن', 'ملابس منزلية', 'ملابس شرقية', 'قطن 100%', 'الدفع عند الاستلام', 'شحن لكل مصر'];

async function boot() {
  const [products, s] = await Promise.all([
    api('/api/products'),
    loadSettings(),
  ]);

  /* hero text */
  const hero = s.hero || {};
  $('#heroTitle').textContent = LANG === 'ar'
    ? (hero.titleAr || 'أناقة تليق بمنزلك')
    : (hero.titleEn || 'Dress your home in elegance');
  $('#heroSub').textContent = LANG === 'ar'
    ? (hero.subAr || '')
    : (hero.subEn || '');

  /* marquee */
  const chunk = (LANG === 'ar' ? MARQUEE_AR : MARQUEE_EN)
    .map(w => `<span>${esc(w)}</span>`).join('');
  $('#marqueeTrack').innerHTML = chunk + chunk;

  /* services */
  $('#servicesRow').innerHTML = [1, 2, 3].map(i => `
    <div class="service">
      ${ico(i === 1 ? 'check' : i === 2 ? 'truck' : 'cotton')}
      <h4 data-i18n="home.services.${i}.t"></h4>
      <p data-i18n="home.services.${i}.d"></p>
    </div>`).join('');
  applyI18n();

  /* featured grid */
  let featured = products.filter(p => p.featured);
  if (!featured.length) featured = products.slice(0, 8);
  renderProductGrid(featured.slice(0, 8), '#featuredGrid');

  /* collection covers: summer from a real (non-AI) product photo, winter if any exist */
  const summer = products.find(p => p.season === 'summer' && p.images?.[0]);
  const summerImg = (summer && summer.images[0]) || '';
  if (summerImg) {
    $('#summerCard').classList.remove('no-photo');
    $('#summerBg').style.backgroundImage = `url("${esc(summerImg)}")`;
  }
  const winter = products.find(p => p.season === 'winter' && p.images?.[0]);
  if (winter) {
    $('#winterCard').classList.remove('no-photo');
    $('#winterBg').style.backgroundImage = `url("${esc(winter.images[0])}")`;
  }

  /* story image — an elegant garment shot */
  const storySrc = (featured[0] && featured[0].images[0]) || '';
  if (storySrc) $('#storyImg').src = storySrc;

  /* lookbook preview */
  const shots = [];
  for (const p of products) {
    for (const img of (p.images || []).slice(0, 1)) {
      shots.push({ img, name: (LANG === 'ar' ? p.nameAr : p.nameEn) || p.nameEn });
    }
    if (shots.length >= 12) break;
  }
  $('#lookMasonry').innerHTML = shots.map(sh =>
    `<a href="/gallery"><img src="${esc(sh.img)}" alt="${esc(sh.name)}" loading="lazy"><span class="cap">${esc(sh.name)}</span></a>`
  ).join('');

  /* newsletter */
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    toast(t('news.done'));
    e.target.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 120));
