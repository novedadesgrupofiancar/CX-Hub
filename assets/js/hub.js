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

  version: '1.8.1',
  actualizado: '29/10/2026',

  /* Backend del Hub (Google Apps Script "CX-Hub Backend" en la cuenta de novedades).
     Lo usan Escalamientos (reclamos) y Cambios recientes / Importante hoy.
     Si algún día se publica otra implementación, se cambia solo acá. */
  api: 'https://script.google.com/macros/s/AKfycbwptnYqzGl6w0cBJY1Ocaj01A3bLxBFGsruGiU_jmU-wjTki6hghpPcMXutRtZ15Ip7/exec',

  /* ---- MENÚ PRINCIPAL ----------------------------------
     href: null  -> se muestra en gris, sin link (sección todavía no construida)
     href: 'x.html' -> se vuelve clickeable automáticamente
     badge: texto opcional del globito naranja
  ------------------------------------------------------- */
  nav: [
    { icon: '🏠',  label: 'Inicio',              href: 'index.html' },
    { icon: '📊',  label: 'Dashboard',           href: 'dashboard.html' },
    { icon: '🔎',  label: 'Buscar',              href: null },
    { icon: '🚗',  label: 'Productos y Modelos', href: 'productos-modelos.html' },
    { icon: '🏷️',  label: 'Promociones',         href: null },
    { icon: '🔧',  label: 'Taller y Postventa',  href: 'taller-postventa.html' },
    { icon: '🛠️',  label: 'Recalls activos',     href: 'recalls.html', badge: '1' },
    { icon: '📅',  label: 'Agendamientos',       href: null },
    { icon: '💬',  label: 'Guiones',             href: 'guiones.html' },
    { icon: '❓',  label: 'FAQ',                 href: null },
    { icon: '📄',  label: 'Procedimientos',      href: null },
    { icon: '🗄️',  label: 'CRM y Tipificaciones', href: null },
    { icon: '⚠️',  label: 'Escalamientos',       href: 'escalamientos.html' },
    { icon: '📍',  label: 'Sucursales',          href: 'sucursales.html' },
    { icon: '🔁',  label: 'Cambios recientes',   href: 'cambios-recientes.html' }
  ],

  /* ---- HERRAMIENTAS EXTERNAS ----------------------------
     Acá van los sistemas que ya usan (CRM, agenda, etc).
     Se abren en pestaña nueva. Esta misma lista arma el menú
     lateral y la tarjeta "Herramientas de trabajo" de la home.
     color: fondo del ícono en la home.
  ------------------------------------------------------- */
  herramientas: [
    { icon: '🗄️', label: 'CRM',                 href: 'https://crm.grupofiancar.com/',          color: 'var(--blue)' },
    { icon: '📅', label: 'Agenda Taller',       href: 'https://xtaller.binomio.uy/',            color: 'var(--purple)' },
    { icon: '📞', label: 'Sistema de Llamadas', href: 'https://grupofiancar.south.3cx.us:5001/', color: 'var(--green)' },
    { icon: '🚙', label: 'Web Chevrolet',       href: 'https://chevroletmontevideo.com.uy/',    color: '#f4b400' }
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

/* ---- Tarjeta "Herramientas de trabajo" de la home ---- */
function renderHerramientasHome() {
  const cont = document.querySelector('[data-hub-herramientas]');
  if (!cont) return;
  cont.innerHTML = HUB.herramientas.map(h => {
    const abrir = h.href
      ? `<a class="btn-open" href="${h.href}" target="_blank" rel="noopener">Abrir</a>`
      : `<span class="btn-open" style="opacity:.45">Sin link</span>`;
    return `<div class="tool-item"><div class="tool-left"><span class="ic" style="background:${h.color || 'var(--blue)'}">${h.icon}</span>${h.label}</div>${abrir}</div>`;
  }).join('');
}

/* ---- Ícono de la pestaña del navegador ----
   Para cambiarlo, reemplazá assets/img/favicon.png por otra imagen cuadrada. */
(function ponerFavicon(){
  if (document.querySelector('link[rel="icon"]')) return;
  const l = document.createElement('link');
  l.rel = 'icon';
  l.type = 'image/png';
  l.href = 'assets/img/favicon.png';
  document.head.appendChild(l);
})();

/* ---- Arranque ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderFooter();
  renderHerramientasHome();
});
