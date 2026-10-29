/* =========================================================
   CAMBIOS RECIENTES — Sección
   ---------------------------------------------------------
   Equipo: historial con filtro y buscador, e Importante hoy vigente.
   Admin:  entrar con cambios-recientes.html?admin=CLAVE
           (la misma clave del Dashboard). La clave se valida en el
           servidor; acá solo se guarda mientras la pestaña está abierta.

   Usa contenidos.js (datos y utilidades). No hace falta tocar este archivo:
   los textos se cargan desde la pantalla, en modo admin.
   ========================================================= */

const DIAS_VIGENCIA_DEFECTO = 7;
const CLAVE_SESION = 'cxhub-admin';

let datosCR = null;        // último set de datos recibido
let claveAdmin = '';       // vacío = modo equipo
let filtroCR = '';         // '' = todos · tipo de cambio · 'importante'
let textoCR = '';
let formContenido = 'cambio';
let editandoId = '';


/* ========== Modo admin ========== */

function tomarClaveDeURL(){
  const params = new URLSearchParams(location.search);
  // También acepta "?admin?=CLAVE" (error de tipeo común)
  const enURL = params.get('admin') || params.get('admin?');
  if (enURL){
    try { sessionStorage.setItem(CLAVE_SESION, enURL); } catch(e){}
    // Se saca la clave de la barra de direcciones y del historial
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

async function iniciarAdmin(clave){
  claveAdmin = clave;
  const res = await llamarAdmin('verificarClave').catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    claveAdmin = '';
    try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
    avisoCR('mal', '🔐 No se pudo entrar en modo admin: ' + escaparHTML(String(res.error || 'clave incorrecta').replace(/\.$/, '')) + '.');
    return false;
  }
  document.body.classList.add('cr-modo-admin');
  armarSelectLinks();
  limpiarForm();
  return true;
}

async function recargarAdmin(){
  const res = await llamarAdmin('listarAdmin').catch(() => null);
  if (res && res.ok){ datosCR = res.datos; renderTodo(); }
}


/* ========== Avisos ========== */

function avisoCR(tipo, html){
  const c = document.getElementById('crAviso');
  c.className = 'cr-aviso ' + tipo;
  c.innerHTML = html;
  c.hidden = false;
  if (tipo === 'ok') setTimeout(() => { c.hidden = true; }, 3500);
}


/* ========== Equipo: Importante hoy vigente ========== */

function renderImportanteSeccion(){
  const cont = document.getElementById('crImportante');
  if (!cont) return;
  if (!datosCR){ cont.innerHTML = '<div class="cr-home-vacio">No se pudo cargar.</div>'; return; }
  const lista = ordenarImportantes(datosCR.importantes.filter(esVigente));
  if (!lista.length){ cont.innerHTML = '<div class="cr-home-vacio">Sin avisos importantes para hoy.</div>'; return; }
  cont.innerHTML = lista.map(o => {
    const p = PRIORIDAD[o.prioridad] || PRIORIDAD.Baja;
    const vence = o.vence ? `vence ${fechaVence(o.vence)}` : 'sin vencimiento';
    return `
      <div class="alert-item on-dark">
        <div class="ic" style="background:${p.fondo}">${p.icono}</div>
        <div class="txt"><b>${escaparHTML(o.titulo)}</b><p>${escaparHTML(o.texto)}</p>
          <span class="cr-meta-osc">${etiquetaDia(o.creado)} · ${vence}</span></div>
      </div>`;
  }).join('');
}


/* ========== Historial ========== */

function itemsHistorial(){
  if (!datosCR) return [];
  let lista = datosCR.cambios.map(o => Object.assign({ contenido: 'cambio' }, o));
  if (claveAdmin){
    lista = lista.concat(datosCR.importantes.map(o => Object.assign({ contenido: 'importante' }, o)));
  }
  lista.sort((a, b) => String(b.creado).localeCompare(String(a.creado)));

  if (filtroCR === 'importante') lista = lista.filter(o => o.contenido === 'importante');
  else if (filtroCR) lista = lista.filter(o => o.contenido === 'cambio' && o.tipo === filtroCR);

  const t = sinTildesCR(textoCR.trim());
  if (t) lista = lista.filter(o => sinTildesCR(o.titulo + ' ' + o.texto + ' ' + (o.tipo || '')).includes(t));
  return lista;
}

function sinTildesCR(t){ return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

function nombreSeccion(href){
  const s = HUB.nav.find(n => n.href === href);
  return s ? s.label : href;
}

function renderHistorial(){
  const cont = document.getElementById('crHistorial');
  if (!cont) return;
  if (!datosCR){ cont.innerHTML = '<div class="ts-vacio">No se pudo cargar el historial. Probá recargar la página.</div>'; return; }
  const lista = itemsHistorial();
  if (!lista.length){
    cont.innerHTML = `<div class="ts-vacio">${textoCR || filtroCR ? 'No hay resultados con ese filtro.' : 'Todavía no hay cambios cargados.'}</div>`;
    return;
  }
  cont.innerHTML = lista.map(o => {
    const vigente = esVigente(o);
    const etiqueta = o.contenido === 'importante'
      ? `<span class="cr-tipo p-${(o.prioridad || 'baja').toLowerCase()}">Imp. · ${escaparHTML(o.prioridad)}</span>`
      : `<span class="cr-tipo t-${sinTildesCR(o.tipo)}">${escaparHTML(o.tipo)}</span>`;
    const vence = !vigente ? '<b>vencido</b> · ya no está en la home'
      : (o.vence ? 'vence ' + fechaVence(o.vence) : 'sin vencimiento');
    const link = o.link ? ` · <a href="${escaparHTML(o.link)}">Ver ${escaparHTML(nombreSeccion(o.link))} →</a>` : '';
    const editado = o.editado ? ' · editado' : '';
    const acciones = claveAdmin ? `
      <div class="cr-acc">
        <button type="button" title="Editar" onclick="editarItem('${o.contenido}','${o.id}')">✏️</button>
        <button type="button" title="Borrar" onclick="borrarItem('${o.contenido}','${o.id}')">🗑️</button>
      </div>` : '';
    return `
      <div class="cr-item ${vigente ? '' : 'cr-vencido'}">
        ${etiqueta}
        <div class="cr-txt"><b>${escaparHTML(o.titulo)}</b><p>${escaparHTML(o.texto)}</p>
          <span class="cr-meta">${etiquetaDia(o.creado)} ${horaCorta(o.creado)} · ${vence}${editado}${link}</span></div>
        ${acciones}
      </div>`;
  }).join('');
}

function renderFiltrosCR(){
  const cont = document.getElementById('crFiltros');
  if (!cont) return;
  const opciones = [['', 'Todos']].concat(Object.keys(ICONO_TIPO).map(t => [t, t]));
  if (claveAdmin) opciones.push(['importante', '⚠️ Importante hoy']);
  cont.innerHTML = opciones.map(([v, n]) =>
    `<button type="button" class="ts-chip ${filtroCR === v ? 'on' : ''}" onclick="filtrarCR('${v}')">${n}</button>`).join('');
}
function filtrarCR(v){ filtroCR = v; renderFiltrosCR(); renderHistorial(); }
function buscarCR(v){ textoCR = v; renderHistorial(); }

function renderTodo(){
  renderImportanteSeccion();
  renderFiltrosCR();
  renderHistorial();
}


/* ========== Admin: formulario ========== */

function fechaMasDias(dias){
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function armarSelectLinks(){
  const sel = document.getElementById('crLink');
  sel.innerHTML = '<option value="">— ninguna —</option>' +
    HUB.nav.filter(n => n.href && n.href !== 'index.html' && !/^https?:/.test(n.href))
      .map(n => `<option value="${n.href}">${n.label}</option>`).join('');
}

function elegirContenido(c){
  formContenido = c;
  document.querySelectorAll('[data-cr-contenido]').forEach(b => b.classList.toggle('on', b.dataset.crContenido === c));
  document.querySelectorAll('.cr-solo-cambio').forEach(e => e.hidden = c !== 'cambio');
  document.querySelectorAll('.cr-solo-importante').forEach(e => e.hidden = c !== 'importante');
  document.getElementById('crEtiquetaTexto').textContent = c === 'cambio' ? 'Qué cambió' : 'Descripción';
}

function limpiarForm(){
  editandoId = '';
  const f = document.getElementById('crForm');
  f.reset();
  f.elements.vence.value = fechaMasDias(DIAS_VIGENCIA_DEFECTO);
  f.elements.vence.disabled = false;
  document.getElementById('crFormTitulo').textContent = 'NUEVO';
  document.getElementById('crGuardar').textContent = 'Publicar';
  document.getElementById('crCancelar').hidden = true;
  document.querySelectorAll('[data-cr-contenido]').forEach(b => b.disabled = false);
  elegirContenido(formContenido);
}

function alternarSinVence(chk){
  const f = document.getElementById('crForm');
  f.elements.vence.disabled = chk.checked;
  if (!chk.checked && !f.elements.vence.value) f.elements.vence.value = fechaMasDias(DIAS_VIGENCIA_DEFECTO);
}

function editarItem(contenido, id){
  const lista = contenido === 'cambio' ? datosCR.cambios : datosCR.importantes;
  const o = lista.find(x => x.id === id);
  if (!o) return;
  elegirContenido(contenido);
  editandoId = id;
  const f = document.getElementById('crForm');
  f.elements.titulo.value = o.titulo;
  f.elements.texto.value = o.texto;
  if (contenido === 'cambio'){ f.elements.tipo.value = o.tipo; f.elements.link.value = o.link || ''; }
  else f.elements.prioridad.value = o.prioridad;
  f.elements.sinVence.checked = !o.vence;
  f.elements.vence.value = o.vence || '';
  f.elements.vence.disabled = !o.vence;
  document.getElementById('crFormTitulo').textContent = 'EDITANDO';
  document.getElementById('crGuardar').textContent = 'Guardar cambios';
  document.getElementById('crCancelar').hidden = false;
  document.querySelectorAll('[data-cr-contenido]').forEach(b => b.disabled = true);
  f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function guardarForm(ev){
  ev.preventDefault();
  const f = ev.target;
  const sinVence = f.elements.sinVence.checked;
  const datos = {
    contenido: formContenido,
    id: editandoId || undefined,
    titulo: f.elements.titulo.value.trim(),
    texto: f.elements.texto.value.trim(),
    vence: sinVence ? '' : f.elements.vence.value
  };
  if (formContenido === 'cambio'){ datos.tipo = f.elements.tipo.value; datos.link = f.elements.link.value; }
  else datos.prioridad = f.elements.prioridad.value;

  if (!datos.titulo || !datos.texto) return avisoCR('mal', 'Completá el título y el texto.');
  if (!sinVence && !datos.vence) return avisoCR('mal', 'Elegí la fecha de vencimiento o marcá "Sin vencimiento".');

  const btn = document.getElementById('crGuardar');
  btn.disabled = true;
  try {
    const res = await llamarAdmin('guardar', datos);
    if (!res.ok) throw new Error(res.error);
    avisoCR('ok', editandoId ? '✓ Cambios guardados.' : '✓ Publicado. Ya lo ve todo el equipo.');
    limpiarForm();
    await recargarAdmin();
  } catch(e){
    avisoCR('mal', '⚠️ No se pudo guardar: ' + escaparHTML(e.message));
  } finally {
    btn.disabled = false;
  }
}

async function borrarItem(contenido, id){
  const lista = contenido === 'cambio' ? datosCR.cambios : datosCR.importantes;
  const o = lista.find(x => x.id === id);
  if (!o || !confirm('¿Borrar "' + o.titulo + '"? Deja de verse en el Hub.')) return;
  const res = await llamarAdmin('borrar', { contenido: contenido, id: id }).catch(e => ({ ok: false, error: e.message }));
  if (!res.ok) return avisoCR('mal', '⚠️ No se pudo borrar: ' + escaparHTML(res.error));
  if (editandoId === id) limpiarForm();
  avisoCR('ok', '✓ Borrado.');
  await recargarAdmin();
}


/* ========== Arranque ========== */

document.addEventListener('DOMContentLoaded', async () => {
  const clave = tomarClaveDeURL();
  document.getElementById('crForm').addEventListener('submit', guardarForm);

  if (clave && await iniciarAdmin(clave)){
    await recargarAdmin();
    return;
  }
  cargarContenidos(datos => { datosCR = datos; renderTodo(); });
});
