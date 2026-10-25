/* =====================================================================
   3M FASHION — shop page (filters sync with URL)
   ===================================================================== */
'use strict';

const state = { season: '', cat: '', q: '', sort: '' };
let ALL = [];

function qs() { return Object.fromEntries(new URLSearchParams(location.search).entries()); }

function syncUrl() {
  const p = new URLSearchParams();
  if (state.season) p.set('season', state.season);
  if (state.cat) p.set('category', state.cat);
  if (state.q) p.set('q', state.q);
  if (state.sort) p.set('sort', state.sort);
  history.replaceState(null, '', p.toString() ? `?${p}` : '/shop');
}

function paintChips() {
  $$('#seasonChips .chip').forEach(c => c.classList.toggle('on', (c.dataset.season || '') === state.season));
  $$('#catChips .chip').forEach(c => c.classList.toggle('on', (c.dataset.cat || '') === state.cat));
}

async function render() {
  paintChips();
  const list = await fetchList();
  $('#countLabel').textContent = t('shop.count', [list.length]);
  $('#shopGrid').classList.toggle('hidden', !list.length);
  $('#shopEmpty').classList.toggle('hidden', !!list.length);
  renderProductGrid(list, '#shopGrid');
  syncUrl();
}

async function fetchList() {
  // filter client-side over the full list for instant feel
  let l = ALL;
  if (state.season) l = l.filter(p => p.season === state.season);
  if (state.cat) l = l.filter(p => p.category === state.cat);
  if (state.q) {
    const q = state.q.toLowerCase();
    l = l.filter(p => ((p.nameEn || '') + ' ' + (p.nameAr || '')).toLowerCase().includes(q));
  }
  if (state.sort === 'price-asc') l = [...l].sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') l = [...l].sort((a, b) => b.price - a.price);
  return l;
}

function wire() {
  $$('#seasonChips .chip').forEach(c => c.addEventListener('click', () => { state.season = c.dataset.season; render(); }));
  $$('#catChips .chip').forEach(c => c.addEventListener('click', () => { state.cat = c.dataset.cat; render(); }));
  let deb;
  $('#shopSearch').addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 220);
  });
  $('#shopSort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  window.addEventListener('popstate', () => { const q = qs(); Object.assign(state, { season: q.season || '', cat: q.category || '', q: q.q || '', sort: q.sort || '' }); $('#shopSearch').value = state.q; $('#shopSort').value = state.sort; render(); });
}

async function boot() {
  ALL = await api('/api/products');
  const q = qs();
  Object.assign(state, { season: q.season || '', cat: q.category || '', q: q.q || '', sort: q.sort || '' });
  $('#shopSearch').value = state.q;
  $('#shopSort').value = state.sort;
  wire();
  render();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
