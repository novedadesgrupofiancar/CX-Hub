/* =========================================================
   CONTACT CENTER HUB — Núcleo compartido
   ---------------------------------------------------------
   Este archivo lo cargan TODAS las páginas del Hub.
   Si tocás algo acá, cambia en todas las secciones a la vez.

   PARA AGREGAR UNA SECCIÓN NUEVA:
   1. Copiá _plantilla.html y renombralo (ej: promociones.html)
   2. Agregá su línea en la lista NAV de abajo con su "href"
   3. Listo: el menú se actualiza solo en todas las páginas
   ========================================================= */

const HUB = {

  version: '1.4.0',
  actualizado: '18/08/2026 10:45',

  /* ---- MENÚ PRINCIPAL ----------------------------------
     href: null  -> se muestra en gris, sin link (sección todavía no construida)
     href: 'x.html' -> se vuelve clickeable automáticamente
     badge: texto opcional del globito naranja
  ------------------------------------------------------- */
  nav: [
    { icon: '🏠',  label: 'Inicio',              href: 'index.html' },
    { icon: '📊',  label: 'Dashboard',           href: 'dashboard.html' },
    { icon: '🔎',  label: 'Buscar',              href: null },
    { icon: '🚗',  label: 'Productos y Modelos', href: null },
    { icon: '🏷️',  label: 'Promociones',         href: null },
    { icon: '🔧',  label: 'Taller y Postventa',  href: 'taller-postventa.html' },
    { icon: '🛠️',  label: 'Recalls activos',     href: 'recalls.html', badge: '1' },
    { icon: '📅',  label: 'Agendamientos',       href: null },
    { icon: '💬',  label: 'Guiones',             href: 'guiones.html' },
    { icon: '❓',  label: 'FAQ',                 href: null },
    { icon: '📄',  label: 'Procedimientos',      href: null },
    { icon: '🗄️',  label: 'CRM y Tipificaciones', href: null },
    { icon: '⚠️',  label: 'Escalamientos',       href: null },
    { icon: '📍',  label: 'Sucursales',          href: null },
    { icon: '🔁',  label: 'Cambios recientes',   href: null }
  ],

  /* ---- HERRAMIENTAS EXTERNAS ----------------------------
     Acá van los sistemas que ya usan (CRM, agenda, etc).
     Poné la URL real y se abren en pestaña nueva.
  ------------------------------------------------------- */
  herramientas: [
    { icon: '🗄️', label: 'CRM',                 href: null },
    { icon: '📅', label: 'Agenda Taller',       href: null },
    { icon: '📞', label: 'Sistema de Llamadas', href: null },
    { icon: '🚙', label: 'Web Chevrolet',       href: null }
  ]
};


/* =========================================================
   RENDER DEL SIDEBAR — no hace falta tocar de acá para abajo
   ========================================================= */

function archivoActual() {
  const f = window.location.pathname.split('/').pop();
  return (!f || f === '') ? 'index.html' : f;
}

function itemNav(item, actual) {
  const activo = item.href && item.href.toLowerCase() === actual.toLowerCase();
  const badge  = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
  const inner  = `<span class="ico">${item.icon}</span>${item.label}${badge}`;

  if (!item.href) {
    return `<li class="nav-pendiente" title="Sección en construcción">${inner}</li>`;
  }
  const externo = /^https?:\/\//.test(item.href);
  const target  = externo ? ' target="_blank" rel="noopener"' : '';
  return `<li class="${activo ? 'active' : ''}"><a href="${item.href}"${target}>${inner}</a></li>`;
}

function renderSidebar() {
  const cont = document.getElementById('sidebar');
  if (!cont) return;
  const actual = archivoActual();

  cont.className = 'sidebar';
  cont.innerHTML = `
    <div class="brand-wrap">
      <img class="fiancar-logo" src="assets/img/logo-fiancar.png" alt="Fiancar">
      <a class="brand" href="index.html">
        <div class="logo">💬</div>
        <div class="lines"><div>CONTACT</div><div>CENTER HUB</div></div>
      </a>
    </div>
    <ul class="nav">
      ${HUB.nav.map(i => itemNav(i, actual)).join('')}
    </ul>
    <div class="sec-title">Herramientas</div>
    <ul class="nav">
      ${HUB.herramientas.map(i => itemNav(i, actual)).join('')}
    </ul>
    <div class="report-btn">💬 Reportar información</div>
  `;
}

function renderFooter() {
  document.querySelectorAll('[data-hub-footer]').forEach(el => {
    el.innerHTML = `
      <span>Última actualización del Hub: ${HUB.actualizado}</span>
      <span>Versión ${HUB.version}</span>`;
    el.classList.add('footer');
  });
}

/* ---- Lightbox de imágenes (promos, recalls, etc.) ---- */
function openLightbox(src) {
  const ov = document.getElementById('lightboxOverlay');
  if (!ov) return;
  document.getElementById('lightboxImg').src = src;
  ov.style.display = 'flex';
}
function closeLightbox() {
  const ov = document.getElementById('lightboxOverlay');
  if (ov) ov.style.display = 'none';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ---- Toggle "Vista coordinador" ---- */
function toggleCoord(idTarjeta, checkbox) {
  const el = document.getElementById(idTarjeta);
  if (el) el.classList.toggle('coord-mode', checkbox.checked);
}

/* ---- Arranque ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderFooter();
});
