/* =========================================================
   PROCEDIMIENTOS — Cómo se resuelve cada caso
   ---------------------------------------------------------
   Las fichas NO están en este archivo: viven en la planilla
   "Reclamos CX-Hub", hoja "Procedimientos", y se editan desde
   la página con procedimientos.html?admin=CLAVE.

   Acá solo se tocan, si hace falta:
     PR_BLOQUES    -> los 4 grupos (nombre e ícono)
     PR_DOCUMENTOS -> los links a los documentos largos del Drive
   ========================================================= */

const PR_BLOQUES = [
  { id: 'atencion',  nombre: 'Atención',                     icono: '🎧' },
  { id: 'cliente',   nombre: 'Según lo que pide el cliente', icono: '📌' },
  { id: 'salientes', nombre: 'Tareas salientes y de oficina', icono: '📤' },
  { id: 'equipo',    nombre: 'Equipo',                       icono: '👥' }
];

const PR_DOCUMENTOS = [
  { nombre: 'Manual de atención',       url: 'https://docs.google.com/document/d/1Abmlqn77oc_jiMXNP2pXdQ4dog-Fnuvps7pGX5_Vra8/edit' },
  { nombre: 'Capacitación – Atención',  url: 'https://docs.google.com/document/d/1PL9o-R8r1pYDLlE3h-Ow8yZN_veIYtqBed8tsG_ZfOs/edit' },
  { nombre: 'Capacitación – Encuestas', url: 'https://docs.google.com/document/d/1HJL5ZuuoNoVpsKSPJ7t8Rdx29BHpPhFRr7nircI1rE0/edit' },
  { nombre: 'Speech de encuestas',      url: 'https://docs.google.com/document/d/1n0BJgDTFk0jAinlB08P2r4Dz-hz5YZqZcEXvc5gR-fM/edit' },
  { nombre: 'Cronograma de inducción',  url: 'https://docs.google.com/document/d/1Jgy6rLtX_CA0bbUY7S5zII0yJId_-eq0mPbmQPwxO7U/edit' }
];


/* =========================================================
   DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA
   ========================================================= */

const PR_ESCALAR = ['', 'Ventas', 'Taller', 'Postventa', 'Gestoría', 'Otros', 'Internos'];
const PR_COLORES = ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--amber)', 'var(--red)', '#2fb8c4', '#ec4899', '#f97316', '#0ea5e9', '#64748b', '#94a3b8', 'var(--navy)'];
const PR_CACHE = 'cxhub-procedimientos';

let fichasPR = [];
let filtroPR = '';
let textoPR = '';
let abiertaPR = '';        // id de la ficha abierta
let editandoPR = null;     // copia de la ficha en edición (admin)
let sinGuardarPR = false;
let borrarPendientePR = '';

function sinTildesPR(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function lineasPR(t){ return String(t || '').split('\n').map(x => x.trim()).filter(Boolean); }
function listaPR(t, sep){ return String(t || '').split(sep).map(x => x.trim()).filter(Boolean); }

function fechaPR(iso){
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function avisoPR(tipo, html){
  const c = document.getElementById('prAviso');
  if (!html){ c.hidden = true; return; }
  c.className = 'cr-aviso ' + tipo;
  c.innerHTML = html;
  c.hidden = false;
}


/* ========== Carga ========== */

async function cargarPR(){
  try {
    const guardado = JSON.parse(localStorage.getItem(PR_CACHE) || 'null');
    if (guardado && guardado.length){ fichasPR = guardado; renderPR(); }
  } catch(e){}
  try {
    const res = await (await fetch(HUB.api + '?action=procedimientos&t=' + Date.now())).json();
    if (!res.ok) throw new Error(res.error || 'error');
    fichasPR = res.datos.fichas || [];
    try { localStorage.setItem(PR_CACHE, JSON.stringify(fichasPR)); } catch(e){}
    if (!editandoPR) renderPR();
  } catch(e){
    if (!fichasPR.length) document.getElementById('prLista').innerHTML =
      '<div class="in-vacio">No se pudieron cargar los procedimientos. Revisá la conexión y recargá la página.</div>';
  }
}


/* ========== Vista ========== */

function renderFiltrosPR(){
  const chip = (id, txt) => `<button class="ts-chip ${filtroPR === id ? 'on' : ''}" onclick="filtrarPR('${id}')">${txt}</button>`;
  document.getElementById('prFiltros').innerHTML =
    chip('', 'Todos') + PR_BLOQUES.map(b => chip(b.id, b.icono + ' ' + b.nombre.replace(' y de oficina', '').replace('Según lo que pide el cliente', 'Lo que pide el cliente'))).join('');
}

function coincidePR(f, palabras){
  if (!palabras.length) return true;
  const texto = sinTildesPR([f.titulo, f.resumen, f.cuando, f.pasos, f.sistema, f.errores, f.tipificacion, f.decir, f.escalar].join(' '));
  return palabras.every(p => texto.indexOf(p) >= 0);
}

function renderPR(){
  renderFiltrosPR();
  const cont = document.getElementById('prLista');
  const palabras = sinTildesPR(textoPR).split(/\s+/).filter(Boolean);
  let html = '';
  let total = 0;

  PR_BLOQUES.forEach(b => {
    if (filtroPR && filtroPR !== b.id) return;
    const lista = fichasPR.filter(f => f.bloque === b.id && coincidePR(f, palabras));
    if (editandoPR && !editandoPR.id && editandoPR.bloque === b.id) lista.push(editandoPR);
    if (!lista.length) return;
    total += lista.length;
    html += `<div class="pr-bloque">${b.icono} ${b.nombre} <span>${lista.length}</span></div>
      <div class="pr-grid">${lista.map(f => tarjetaPR(f) + (abiertaPR === (f.id || 'nueva') ? fichaPR(f) : '')).join('')}</div>`;
  });

  cont.innerHTML = total ? html :
    `<div class="in-vacio">${textoPR ? 'No encontré procedimientos con “' + escaparHTML(textoPR) + '”.' : 'Todavía no hay procedimientos cargados.'}</div>`;
}

function tarjetaPR(f){
  const id = f.id || 'nueva';
  return `<button type="button" class="pr-card ${abiertaPR === id ? 'on' : ''}" onclick="abrirPR('${id}')">
    <span class="ic" style="background:${escaparHTML(f.color || 'var(--blue)')}">${escaparHTML(f.icono || '📄')}</span>
    <span><b>${escaparHTML(f.titulo || 'Procedimiento nuevo')}</b><span>${escaparHTML(f.resumen || '')}</span></span>
  </button>`;
}

function linkEscalarPR(g){
  if (!g) return '';
  if (g === 'Internos') return `<a class="pr-link" href="internos.html">📞 Internos</a>`;
  return `<a class="pr-link" href="escalamientos.html?grupo=${encodeURIComponent(g)}">⚠️ Escalamientos → ${escaparHTML(g)}</a>`;
}

function fichaPR(f){
  if (editandoPR && (editandoPR.id || 'nueva') === (f.id || 'nueva')) return edicionPR();
  const pasos = lineasPR(f.pasos);
  const errores = lineasPR(f.errores);
  const decir = listaPR(f.decir, ';');
  const fila = (k, v) => v ? `<div class="k">${k}</div><div class="v">${v}</div>` : '';
  const tags = t => listaPR(t, ',').map(x => `<span class="pr-tag">${escaparHTML(x)}</span>`).join('');
  const borrando = borrarPendientePR === f.id;

  return `<div class="card pr-ficha" id="prFicha">
    <div class="pr-ficha-head">
      <h2>${escaparHTML(f.icono || '')} ${escaparHTML(f.titulo)}</h2>
      <div class="pr-ficha-acc">
        ${f.revisado ? `<span class="pr-rev">Revisado el ${fechaPR(f.revisado)}</span>` : ''}
        <button type="button" class="pr-btn pr-solo-admin" onclick="editarPR('${f.id}')">✏️ Editar</button>
        <button type="button" class="pr-btn borrar pr-solo-admin ${borrando ? 'seguro' : ''}" onclick="borrarPR('${f.id}')">${borrando ? '¿Seguro? Tocá de nuevo' : '🗑 Borrar'}</button>
        <button type="button" class="pr-cerrar" onclick="abrirPR('${f.id}')" title="Cerrar">✕</button>
      </div>
    </div>
    <div class="pr-filas">
      ${fila('Cuándo aplica', escaparHTML(f.cuando))}
      ${fila('Pasos', pasos.length ? '<ol>' + pasos.map(p => `<li>${escaparHTML(p)}</li>`).join('') + '</ol>' : '')}
      ${fila('Sistema', tags(f.sistema))}
      ${fila('Escalar a', linkEscalarPR(f.escalar))}
      ${fila('Qué decir', decir.map(d => `<a class="pr-link" href="guiones.html?q=${encodeURIComponent(d)}">💬 ${escaparHTML(d)}</a>`).join(''))}
      ${fila('Tipificación', tags(f.tipificacion))}
      ${fila('Errores comunes', errores.length ? '<div class="pr-err">' + errores.map(e => `<div>⚠️ ${escaparHTML(e)}</div>`).join('') + '</div>' : '')}
    </div>
  </div>`;
}

function abrirPR(id){
  if (editandoPR) return;          // primero guardar o descartar
  borrarPendientePR = '';
  abiertaPR = abiertaPR === id ? '' : id;
  renderPR();
  const f = document.getElementById('prFicha');
  if (f) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try { history.replaceState(null, '', location.pathname + (abiertaPR ? '?id=' + abiertaPR : '')); } catch(e){}
}

function filtrarPR(id){ filtroPR = id; renderPR(); }
function buscarPR(t){ textoPR = t.trim(); renderPR(); }

function renderDocsPR(){
  document.getElementById('prDocs').innerHTML = PR_DOCUMENTOS.map(d =>
    `<a class="ts-tarifa" target="_blank" rel="noopener" href="${escaparHTML(d.url)}"><b>${escaparHTML(d.nombre)}</b><span>Abrir →</span></a>`).join('');
}


/* ========== Edición (admin) ========== */

async function iniciarAdminPR(clave){
  claveAdmin = clave;
  const res = await llamarAdmin('verificarClave').catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    claveAdmin = '';
    try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
    avisoPR('mal', '🔐 No se pudo entrar en modo admin: ' + escaparHTML(String(res.error || 'clave incorrecta').replace(/\.$/, '')) + '.');
    return;
  }
  document.body.classList.add('pr-modo-admin');
}

function editarPR(id){
  const f = fichasPR.find(x => x.id === id);
  if (!f) return;
  editandoPR = Object.assign({}, f);
  sinGuardarPR = false;
  renderPR();
}

function nuevaFichaPR(){
  if (editandoPR) return;
  const bloque = filtroPR || 'cliente';
  const ultimo = fichasPR.filter(f => f.bloque === bloque).reduce((m, f) => Math.max(m, +f.orden || 0), 0);
  editandoPR = { id: '', bloque: bloque, orden: String(ultimo + 10), icono: '📄', color: 'var(--blue)', titulo: '', resumen: '',
                 cuando: '', pasos: '', sistema: '', escalar: '', decir: '', tipificacion: '', errores: '' };
  abiertaPR = 'nueva';
  textoPR = '';
  document.getElementById('prBuscar').value = '';
  renderPR();
  const f = document.getElementById('prFicha');
  if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function edicionPR(){
  const e = editandoPR;
  const v = c => escaparHTML(e[c] || '');
  const opciones = (lista, actual, nombre) => lista.map(x => `<option value="${escaparHTML(x)}" ${x === actual ? 'selected' : ''}>${escaparHTML(nombre ? nombre(x) : x)}</option>`).join('');
  const nombreBloque = id => (PR_BLOQUES.find(b => b.id === id) || {}).nombre || id;
  return `<div class="card pr-ficha pr-editando" id="prFicha">
    <div class="pr-ficha-head"><h2>✏️ ${e.id ? 'Editar procedimiento' : 'Procedimiento nuevo'}</h2></div>
    <div class="cr-form pr-form" oninput="cambioPR(event)" onchange="cambioPR(event)">
      <div class="pr-form-fila">
        <label style="flex:3"><span class="ts-lbl">Título</span><input data-c="titulo" value="${v('titulo')}" maxlength="80"></label>
        <label style="flex:1"><span class="ts-lbl">Ícono</span><input data-c="icono" value="${v('icono')}" maxlength="8"></label>
        <label style="flex:1"><span class="ts-lbl">Color</span><select data-c="color">${opciones(PR_COLORES, e.color)}</select></label>
      </div>
      <label><span class="ts-lbl">Resumen (una línea, se ve en la tarjeta)</span><input data-c="resumen" value="${v('resumen')}" maxlength="120"></label>
      <div class="pr-form-fila">
        <label style="flex:3"><span class="ts-lbl">Bloque</span><select data-c="bloque">${opciones(PR_BLOQUES.map(b => b.id), e.bloque, nombreBloque)}</select></label>
        <label style="flex:1"><span class="ts-lbl">Orden (menor = primero)</span><input data-c="orden" value="${v('orden')}" inputmode="numeric"></label>
      </div>
      <label><span class="ts-lbl">Cuándo aplica</span><textarea data-c="cuando" rows="2">${v('cuando')}</textarea></label>
      <label><span class="ts-lbl">Pasos — uno por renglón (se numeran solos)</span><textarea data-c="pasos" rows="7">${v('pasos')}</textarea></label>
      <div class="pr-form-fila">
        <label style="flex:2"><span class="ts-lbl">Sistema (separado por comas)</span><input data-c="sistema" value="${v('sistema')}"></label>
        <label style="flex:1"><span class="ts-lbl">Escalar a</span><select data-c="escalar">${opciones(PR_ESCALAR, e.escalar, x => x ? (x === 'Internos' ? 'Internos' : 'Escalamientos → ' + x) : '— no se escala —')}</select></label>
      </div>
      <label><span class="ts-lbl">Qué decir — títulos de Guiones separados por ";" (ej: Agenda de taller; Resolución)</span><input data-c="decir" value="${v('decir')}"></label>
      <label><span class="ts-lbl">Tipificación (separado por comas)</span><input data-c="tipificacion" value="${v('tipificacion')}"></label>
      <label><span class="ts-lbl">Errores comunes — uno por renglón</span><textarea data-c="errores" rows="3">${v('errores')}</textarea></label>
      <div class="pr-form-acc">
        <button type="button" class="pr-btn guardar" id="prGuardar" onclick="guardarPR()">Guardar</button>
        <button type="button" class="pr-btn" onclick="descartarPR()">Descartar</button>
      </div>
    </div>
  </div>`;
}

function cambioPR(ev){
  const c = ev.target.dataset && ev.target.dataset.c;
  if (!c) return;
  editandoPR[c] = ev.target.value;
  sinGuardarPR = true;
}

async function guardarPR(){
  if (!String(editandoPR.titulo || '').trim()){ avisoPR('mal', 'Falta el título.'); return; }
  const btn = document.getElementById('prGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';
  const res = await llamarAdmin('guardarProcedimiento', editandoPR).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    btn.disabled = false;
    btn.textContent = 'Guardar';
    avisoPR('mal', '⚠️ No se guardó: ' + escaparHTML(res.error || 'error') + '. Los cambios siguen en pantalla.');
    return;
  }
  const guardada = Object.assign({}, editandoPR, { id: res.datos.id, revisado: res.datos.revisado });
  const i = fichasPR.findIndex(f => f.id === guardada.id);
  if (i >= 0) fichasPR[i] = guardada; else fichasPR.push(guardada);
  fichasPR.sort((a, b) => PR_BLOQUES.findIndex(x => x.id === a.bloque) - PR_BLOQUES.findIndex(x => x.id === b.bloque) || (+a.orden || 0) - (+b.orden || 0));
  try { localStorage.setItem(PR_CACHE, JSON.stringify(fichasPR)); } catch(e){}
  editandoPR = null;
  sinGuardarPR = false;
  abiertaPR = guardada.id;
  avisoPR('ok', '✓ Guardado. Ya lo ve todo el equipo.');
  renderPR();
}

function descartarPR(){
  if (editandoPR && !editandoPR.id) abiertaPR = '';
  editandoPR = null;
  sinGuardarPR = false;
  avisoPR('', '');
  renderPR();
}

async function borrarPR(id){
  if (borrarPendientePR !== id){ borrarPendientePR = id; renderPR(); return; }
  borrarPendientePR = '';
  const res = await llamarAdmin('borrarProcedimiento', { id: id }).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){ avisoPR('mal', '⚠️ No se borró: ' + escaparHTML(res.error || 'error') + '.'); renderPR(); return; }
  fichasPR = fichasPR.filter(f => f.id !== id);
  try { localStorage.setItem(PR_CACHE, JSON.stringify(fichasPR)); } catch(e){}
  abiertaPR = '';
  avisoPR('ok', '✓ Procedimiento borrado (queda guardado en la planilla, por las dudas).');
  renderPR();
}

window.addEventListener('beforeunload', e => { if (sinGuardarPR){ e.preventDefault(); e.returnValue = ''; } });


/* ========== Arranque ========== */

document.addEventListener('DOMContentLoaded', async () => {
  renderDocsPR();
  abiertaPR = new URLSearchParams(location.search).get('id') || '';
  const clave = tomarClaveDeURL();
  if (clave) await iniciarAdminPR(clave);
  await cargarPR();
  const q = sinTildesPR(new URLSearchParams(location.search).get('q') || '').trim();
  const exacta = q && fichasPR.find(f => sinTildesPR(f.titulo) === q);
  if (exacta){
    abiertaPR = exacta.id;
    textoPR = '';
    document.getElementById('prBuscar').value = '';
    renderPR();
  }
  if (abiertaPR){
    const f = document.getElementById('prFicha');
    if (f) f.scrollIntoView({ block: 'center' });
  }
});
