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

  version: '1.10.0',
  actualizado: '30/10/2026',

  /* Saludo de la home. Cambia solo según la hora: "¡Buen día, equipo!",
     "¡Buenas tardes, equipo!", "¡Buenas noches, equipo!".
     Para otra palabra, cambiá 'equipo' (ej: 'team'). */
  saludo: 'equipo',

  /* Backend del Hub (Google Apps Script "CX-Hub Backend" en la cuenta de novedades).
     Lo usan Escalamientos (reclamos), Cambios recientes / Importante hoy e Internos.
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
    { icon: '🔎',  label: 'Buscar',              href: 'index.html#buscar' },
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
    { icon: '📞',  label: 'Internos',            href: 'internos.html' },
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

/* ---- Saludo y fecha de la home (con el reloj de cada PC) ---- */
function renderSaludo() {
  const h1 = document.getElementById('homeSaludo');
  if (!h1) return;
  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo = hora < 12 ? '¡Buen día' : hora < 19 ? '¡Buenas tardes' : '¡Buenas noches';
  const icono  = hora < 12 ? '☀️' : hora < 19 ? '👋' : '🌙';
  h1.textContent = `${saludo}, ${HUB.saludo}! ${icono}`;
  const fecha = ahora.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
  const p = document.getElementById('homeFecha');
  if (p) p.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1) + ' · ¿Qué necesitás encontrar hoy?';
}

/* ---- Texto seguro para meter dentro del HTML ---- */
function escaparHTML(t){
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---- Modo admin (Cambios recientes, Internos) ----
   Se entra con pagina.html?admin=CLAVE (la misma del Dashboard).
   La clave se valida en el servidor; acá solo se guarda mientras
   la pestaña está abierta y se saca de la barra de direcciones.
   Cada sección guarda la suya: entrar como admin en una NO deja
   en modo admin a las demás. */
const CLAVE_SESION = 'cxhub-admin:' + (location.pathname.split('/').pop() || 'index.html');
let claveAdmin = '';       // vacío = modo equipo

function tomarClaveDeURL(){
  const params = new URLSearchParams(location.search);
  // También acepta "?admin?=CLAVE" (error de tipeo común)
  const enURL = params.get('admin') || params.get('admin?');
  if (enURL){
    try { sessionStorage.setItem(CLAVE_SESION, enURL); } catch(e){}
    params.delete('admin');
    params.delete('admin?');
    const q = params.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    return enURL;
  }
  try { return sessionStorage.getItem(CLAVE_SESION) || ''; } catch(e){ return ''; }
}

function salirAdmin(){
  try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
  location.reload();
}

async function llamarAdmin(action, datos){
  const r = await fetch(HUB.api, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // sin preflight de CORS, igual que el Dashboard
    body: JSON.stringify({ action: action, clave: claveAdmin, datos: datos || {} })
  });
  return r.json();
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
  renderSaludo();
  setTimeout(aplicarBusquedaURL, 0);   // después de que la página dibuje lo suyo
});

/* ---- Llegar desde el buscador de la home ----
   pagina.html?q=texto escribe "texto" en el buscador de esa sección
   (el input marcado con data-hub-buscar). */
function aplicarBusquedaURL() {
  const q = new URLSearchParams(location.search).get('q');
  const input = document.querySelector('[data-hub-buscar]');
  if (!q || !input) return;
  input.value = q;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
