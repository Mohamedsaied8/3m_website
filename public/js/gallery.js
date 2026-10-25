/* =====================================================================
   3M FASHION — gallery (lookbook masonry)
   ===================================================================== */
'use strict';

const state = { season: '' };

async function boot() {
  const list = await api('/api/products');
  const chips = [
    { v: '', label: t('gal.all') },
    { v: 'summer', label: t('nav.summer') },
    { v: 'winter', label: t('nav.winter') },
  ];
  $('#galChips').innerHTML = chips.map(c =>
    `<button class="chip ${c.v === state.season ? 'on' : ''}" data-v="${c.v}">${esc(c.label)}</button>`).join('');
  $$('#galChips .chip').forEach(b => b.addEventListener('click', () => {
    state.season = b.dataset.v;
    $$('#galChips .chip').forEach(x => x.classList.toggle('on', x === b));
    render(list);
  }));
  render(list);
}

function render(list) {
  const filtered = list.filter(p => !state.season || p.season === state.season);
  const shots = [];
  filtered.forEach(p => (p.images || []).slice(0, 3).forEach((img, i) => {
    shots.push({ img, name: (LANG === 'ar' ? p.nameAr : p.nameEn) || p.nameEn, id: p.id, big: i === 0 });
  }));

  $('#galGrid').classList.toggle('hidden', !shots.length);
  $('#galEmpty').classList.toggle('hidden', !!shots.length);
  $('#galGrid').innerHTML = shots.map((s, i) => `
    <a href="/product/${esc(s.id)}" class="reveal ${i % 5 === 0 ? 'd1' : ''}">
      <img src="${esc(s.img)}" alt="${esc(s.name)}" loading="lazy" ${s.big ? 'style="aspect-ratio:4/5;object-fit:cover;object-position:top"' : ''}>
      <span class="cap">${esc(s.name)}</span>
    </a>`).join('');
  revealInit();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
