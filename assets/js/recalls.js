/* =========================================================
   RECALLS ACTIVOS
   ---------------------------------------------------------
   Las tarjetas NO están en este archivo: se guardan en la
   planilla del Hub (hoja "Recalls") y se editan desde esta
   misma página entrando como admin (botón del menú lateral).

   Para cambiar a mano: abrir la hoja "Recalls" de la planilla
   "Reclamos CX-Hub". Borrado = "1" oculta la tarjeta.
   ========================================================= */

const RC_MARCAS = ['Chevrolet', 'Fiat', 'Geely', 'Lynk & Co', 'JAC Auto', 'JAC Camiones'];
const RC_CACHE  = 'cxhub-recalls';     // también lo lee hub.js para el número del menú

/* ---------- De acá para abajo no hace falta tocar nada ---------- */

let recallsRC = [];
let editandoRC = null;     // copia del recall que se está editando ({ id:'' } = nuevo)
let borrarPendienteRC = '';

function avisoRC(tipo, html){
  const c = document.getElementById('rcAviso');
  if (!html){ c.hidden = true; return; }
  c.className = 'cr-aviso ' + tipo;
  c.innerHTML = html;
  c.hidden = false;
}

function guardarCacheRC(){
  try { localStorage.setItem(RC_CACHE, JSON.stringify(recallsRC)); localStorage.setItem(RC_CACHE + '-t', String(Date.now())); } catch(e){}
  actualizarBadgeRecalls();
}


/* ========== Carga ========== */

async function cargarRC(){
  try {
    const guardado = JSON.parse(localStorage.getItem(RC_CACHE) || 'null');
    if (guardado){ recallsRC = guardado; renderRC(); }
  } catch(e){}
  try {
    const res = await (await fetch(HUB.api + '?action=recalls&t=' + Date.now())).json();
    if (!res.ok) throw new Error(res.error || 'error');
    recallsRC = res.datos.recalls || [];
    guardarCacheRC();
    if (!editandoRC) renderRC();
  } catch(e){
    if (!recallsRC.length) document.getElementById('rcLista').innerHTML =
      '<div class="rc-vacio">No se pudieron cargar los recalls. Revisá la conexión y recargá la página.</div>';
  }
}


/* ========== Vista ========== */

function renderRC(){
  const n = recallsRC.length;
  document.getElementById('rcTitulo').textContent = n === 1 ? '1 RECALL ACTIVO' : n + ' RECALLS ACTIVOS';

  let html = recallsRC.map(r => editandoRC && editandoRC.id === r.id ? edicionRC() : tarjetaRC(r)).join('');
  if (editandoRC && !editandoRC.id) html += edicionRC();
  if (!html) html = '<div class="rc-vacio">No hay recalls activos.</div>';
  document.getElementById('rcLista').innerHTML = html;
}

function tarjetaRC(r){
  const e = escaparHTML;
  const editar = `<button type="button" class="rc-editar rc-solo-admin" title="Editar"
      onclick="event.preventDefault();event.stopPropagation();editarRC('${e(r.id)}')">✏️</button>`;
  const cuerpo = `
      <div class="promo-txt">
        <div class="brandtag">${e(String(r.marca).toUpperCase())}</div>
        <b>${e(r.titulo)}</b>
        ${r.descripcion ? `<p>${e(r.descripcion)}</p>` : ''}
        ${r.link ? '<span class="recall-link">Ver gestión en el Drive →</span>' : ''}
      </div>${editar}`;
  return r.link
    ? `<a class="promo-item on-white recall-item recall-click" href="${e(r.link)}" target="_blank" rel="noopener">${cuerpo}</a>`
    : `<div class="promo-item on-white recall-item">${cuerpo}</div>`;
}

function edicionRC(){
  const r = editandoRC;
  const v = c => escaparHTML(r[c] || '');
  const marcas = RC_MARCAS.map(m => `<option ${m === r.marca ? 'selected' : ''}>${escaparHTML(m)}</option>`).join('');
  const borrar = r.id
    ? `<button type="button" class="pr-btn borrar ${borrarPendienteRC === r.id ? 'seguro' : ''}" onclick="borrarRC('${escaparHTML(r.id)}')">
         ${borrarPendienteRC === r.id ? '¿Seguro? Tocá de nuevo para borrar' : 'Borrar'}</button>` : '';
  return `<div class="promo-item on-white recall-item rc-editando" id="rcEdicion">
    <div class="cr-form" oninput="cambioRC(event)" onchange="cambioRC(event)">
      <b class="rc-form-titulo">✏️ ${r.id ? 'Editar recall' : 'Recall nuevo'}</b>
      <label><span class="ts-lbl">Marca</span><select data-c="marca">${marcas}</select></label>
      <label><span class="ts-lbl">Título</span><input data-c="titulo" value="${v('titulo')}" maxlength="80" placeholder="Ej: Campaña de airbag"></label>
      <label><span class="ts-lbl">Descripción (una línea)</span><input data-c="descripcion" value="${v('descripcion')}" maxlength="200" placeholder="Ej: Reemplazo del inflador · Celta y Cruze · Sin costo"></label>
      <label><span class="ts-lbl">Link de gestión en el Drive (opcional)</span><input data-c="link" value="${v('link')}" placeholder="https://docs.google.com/..."></label>
      <div class="rc-acc">
        <button type="button" class="pr-btn guardar" id="rcGuardar" onclick="guardarRC()">Guardar</button>
        <button type="button" class="pr-btn" onclick="descartarRC()">Descartar</button>
        ${borrar}
      </div>
    </div>
  </div>`;
}


/* ========== Admin ========== */

async function iniciarAdminRC(clave){
  claveAdmin = clave;
  const res = await llamarAdmin('verificarClave').catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    claveAdmin = '';
    try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
    avisoRC('mal', '🔐 No se pudo entrar en modo admin: ' + escaparHTML(String(res.error || 'clave incorrecta').replace(/\.$/, '')) + '.');
    return;
  }
  document.body.classList.add('rc-modo-admin');
}

function editarRC(id){
  const r = recallsRC.find(x => x.id === id);
  if (!r) return;
  editandoRC = Object.assign({}, r);
  borrarPendienteRC = '';
  renderRC();
}

function nuevoRC(){
  if (editandoRC) return;
  editandoRC = { id: '', marca: 'Chevrolet', titulo: '', descripcion: '', link: '' };
  renderRC();
  const f = document.getElementById('rcEdicion');
  if (f){ f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.querySelector('[data-c="titulo"]').focus(); }
}

function cambioRC(ev){
  const c = ev.target.dataset && ev.target.dataset.c;
  if (c) editandoRC[c] = ev.target.value;
}

async function guardarRC(){
  if (!String(editandoRC.titulo || '').trim()){ avisoRC('mal', 'Falta el título.'); return; }
  const link = String(editandoRC.link || '').trim();
  if (link && !/^https:\/\//.test(link)){ avisoRC('mal', 'El link tiene que empezar con https://'); return; }
  const btn = document.getElementById('rcGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';
  const res = await llamarAdmin('guardarRecall', editandoRC).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    btn.disabled = false;
    btn.textContent = 'Guardar';
    avisoRC('mal', '⚠️ No se guardó: ' + escaparHTML(res.error || 'error') + '. Los cambios siguen en pantalla.');
    return;
  }
  const guardado = Object.assign({}, editandoRC, { id: res.datos.id, link: link });
  const i = recallsRC.findIndex(r => r.id === guardado.id);
  if (i >= 0) recallsRC[i] = guardado; else recallsRC.push(guardado);
  guardarCacheRC();
  editandoRC = null;
  avisoRC('ok', '✓ Guardado. Ya lo ve todo el equipo.');
  renderRC();
}

function descartarRC(){
  editandoRC = null;
  borrarPendienteRC = '';
  avisoRC('', '');
  renderRC();
}

async function borrarRC(id){
  if (borrarPendienteRC !== id){ borrarPendienteRC = id; renderRC(); return; }
  borrarPendienteRC = '';
  const res = await llamarAdmin('borrarRecall', { id: id }).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){ avisoRC('mal', '⚠️ No se borró: ' + escaparHTML(res.error || 'error') + '.'); renderRC(); return; }
  recallsRC = recallsRC.filter(r => r.id !== id);
  guardarCacheRC();
  editandoRC = null;
  avisoRC('ok', '✓ Recall borrado (queda guardado en la planilla, por las dudas).');
  renderRC();
}


/* ========== Arranque ========== */

document.addEventListener('DOMContentLoaded', async () => {
  const clave = tomarClaveDeURL();
  if (clave) iniciarAdminRC(clave);
  await cargarRC();
});
