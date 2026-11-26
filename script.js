// Navegación tipo panel: cada sección funciona como una vista independiente.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const views = [...document.querySelectorAll('.page-view')];
const navLinks = [...document.querySelectorAll('.nav a')];
const hubLinks = [...document.querySelectorAll('.hub-card, .hub-bottom a')];

document.body.classList.add('js-ready');

function showPage(id, updateHistory = true) {
  const target = document.getElementById(id);
  if (!target || !target.classList.contains('page-view')) return;
  document.body.classList.toggle('home-page', id === 'inicio');
  views.forEach(view => {
    const active = view === target;
    view.classList.toggle('active', active);
    view.setAttribute('aria-hidden', String(!active));
  });
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  if (updateHistory) history.pushState({ page: id }, '', `#${id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

[...navLinks, ...hubLinks].forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href')?.slice(1);
    if (document.getElementById(id)?.classList.contains('page-view')) {
      event.preventDefault();
      showPage(id);
    }
  });
});

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

const initialPage = location.hash.slice(1);
if (initialPage && document.getElementById(initialPage)?.classList.contains('page-view')) {
  showPage(initialPage, false);
} else {
  showPage('inicio', false);
}

window.addEventListener('popstate', () => {
  const page = location.hash.slice(1) || 'inicio';
  showPage(page, false);
});

document.getElementById('year').textContent = new Date().getFullYear();

async function loadMaterials() {
  const container = document.getElementById('materials-list');
  const search = document.getElementById('search-materials');
  const area = document.getElementById('filter-area');
  try {
    const response = await fetch('materiales/materiales.json');
    if (!response.ok) throw new Error('No se pudo leer el catálogo');
    const data = await response.json();
    function render() {
      const term = search.value.trim().toLowerCase();
      const selectedArea = area.value;
      const filtered = data.filter(item => {
        const haystack = `${item.titulo} ${item.area} ${item.grado} ${item.descripcion}`.toLowerCase();
        return haystack.includes(term) && (!selectedArea || item.area === selectedArea);
      });
      container.innerHTML = '';
      if (!filtered.length) {
        container.innerHTML = '<div class="empty-state">Todavía no hay materiales que coincidan con la búsqueda.</div>';
        return;
      }
      filtered.forEach(item => {
        const card = document.createElement('article'); card.className = 'material-card';
        const meta = document.createElement('div'); meta.className = 'material-meta'; meta.textContent = `${item.area} · ${item.grado}`;
        const title = document.createElement('h3'); title.textContent = item.titulo;
        const description = document.createElement('p'); description.textContent = item.descripcion;
        const link = document.createElement('a'); link.className = 'download-link';
        link.href = `materiales/${encodeURIComponent(item.archivo)}`; link.target = '_blank';
        link.rel = 'noopener'; link.textContent = 'Ver o descargar material ↗';
        card.append(meta, title, description, link); container.append(card);
      });
    }
    search.addEventListener('input', render); area.addEventListener('change', render); render();
  } catch (error) {
    container.innerHTML = '<div class="empty-state">La biblioteca se está preparando. Inténtalo nuevamente más tarde.</div>';
  }
}
loadMaterials();
