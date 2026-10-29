/* =========================================================
   CONTENIDOS — Cambios recientes e Importante hoy
   ---------------------------------------------------------
   Trae los datos del backend (HUB.api, en hub.js) y dibuja
   las tarjetas de la home. Lo usan index.html y cambios-recientes.html.

   Los textos NO se editan acá: se cargan desde la sección
   Cambios recientes, entrando con la clave de admin.
   No hace falta tocar este archivo.
   ========================================================= */

/* Cuántos ítems muestra cada tarjeta de la home */
const HOME_MAX_IMPORTANTE = 4;
const HOME_MAX_CAMBIOS    = 5;

const ICONO_TIPO = { 'Precio': '💰', 'Proceso': '📋', 'Información': 'ℹ️', 'Horario': '🕘' };
const PRIORIDAD  = {
  'Alta':  { icono: '🔴', fondo: 'var(--red-light)',   orden: 0 },
  'Media': { icono: '🟠', fondo: 'var(--amber-light)', orden: 1 },
  'Baja':  { icono: '🔵', fondo: 'var(--blue-light)',  orden: 2 }
};

const CACHE_LOCAL = 'cxhub-contenidos';


/* ========== Utilidades ========== */

/* escaparHTML está en hub.js */

/* Fecha de hoy del navegador, AAAA-MM-DD */
function hoyLocal(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function esVigente(o){ return !o.vence || o.vence >= hoyLocal(); }

/* "Hoy", "Ayer" o "18/10" a partir de la fecha de creación */
function etiquetaDia(iso){
  const d = new Date(iso);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dia = new Date(d); dia.setHours(0, 0, 0, 0);
  const dif = Math.round((hoy - dia) / 86400000);
  if (dif === 0) return 'Hoy';
  if (dif === 1) return 'Ayer';
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}
function horaCorta(iso){
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
/* "2026-11-05" → "05/11" */
function fechaVence(v){ return v ? v.slice(8, 10) + '/' + v.slice(5, 7) : ''; }

function ordenarImportantes(lista){
  return lista.slice().sort((a, b) =>
    (PRIORIDAD[a.prioridad] || PRIORIDAD.Baja).orden - (PRIORIDAD[b.prioridad] || PRIORIDAD.Baja).orden ||
    String(b.creado).localeCompare(String(a.creado)));
}


/* ========== Carga de datos ==========
   Muestra al instante la última copia guardada en este navegador
   y después la reemplaza por la del servidor. */

function leerCopiaLocal(){
  try { return JSON.parse(localStorage.getItem(CACHE_LOCAL) || 'null'); } catch(e){ return null; }
}
function guardarCopiaLocal(datos){
  try { localStorage.setItem(CACHE_LOCAL, JSON.stringify(datos)); } catch(e){}
}

async function cargarContenidos(alTener){
  const copia = leerCopiaLocal();
  if (copia) alTener(copia, true);
  try {
    const r = await fetch(HUB.api + '?action=contenidos&t=' + Date.now());
    const res = await r.json();
    if (!res.ok) throw new Error(res.error || 'error');
    guardarCopiaLocal(res.datos);
    alTener(res.datos, false);
  } catch(e){
    if (!copia) alTener(null, false);
  }
}


/* ========== Tarjetas de la home ========== */

function renderHomeImportante(datos){
  const cont = document.getElementById('homeImportante');
  if (!cont) return;
  if (!datos){ cont.innerHTML = '<div class="cr-home-vacio">No se pudo cargar. Probá recargar la página.</div>'; return; }
  const lista = ordenarImportantes(datos.importantes.filter(esVigente)).slice(0, HOME_MAX_IMPORTANTE);
  if (!lista.length){ cont.innerHTML = '<div class="cr-home-vacio">Sin avisos importantes para hoy.</div>'; return; }
  cont.innerHTML = lista.map(o => {
    const p = PRIORIDAD[o.prioridad] || PRIORIDAD.Baja;
    return `
      <a class="alert-item on-dark cr-home-link" href="cambios-recientes.html">
        <div class="ic" style="background:${p.fondo}">${p.icono}</div>
        <div class="txt"><b>${escaparHTML(o.titulo)}</b><p>${escaparHTML(o.texto)}</p></div>
        <div class="chev">›</div>
      </a>`;
  }).join('');
}

function renderHomeCambios(datos){
  const cont = document.getElementById('homeCambios');
  if (!cont) return;
  if (!datos){ cont.innerHTML = '<div class="cr-home-vacio oscuro">No se pudo cargar. Probá recargar la página.</div>'; return; }
  const lista = datos.cambios.filter(esVigente).slice(0, HOME_MAX_CAMBIOS);
  if (!lista.length){ cont.innerHTML = '<div class="cr-home-vacio oscuro">Sin cambios en los últimos días.</div>'; return; }
  let diaAnterior = '';
  cont.innerHTML = lista.map(o => {
    const dia = etiquetaDia(o.creado);
    const titulo = dia !== diaAnterior ? `<div class="day-label on-yellow">${dia}</div>` : '';
    diaAnterior = dia;
    const destino = o.link || 'cambios-recientes.html';
    return `${titulo}
      <a class="change-item on-white cr-home-link" href="${escaparHTML(destino)}">
        <div><b>${ICONO_TIPO[o.tipo] || '🔁'} ${escaparHTML(o.titulo)}</b><p>${escaparHTML(o.texto)}</p></div>
        <div class="change-time">${horaCorta(o.creado)}</div>
      </a>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('homeImportante') && !document.getElementById('homeCambios')) return;
  cargarContenidos(datos => { renderHomeImportante(datos); renderHomeCambios(datos); });
});
