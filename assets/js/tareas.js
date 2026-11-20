/* =========================================================
   TAREAS DE LA SEMANA — panel del equipo
   ---------------------------------------------------------
   Las tareas NO están en este archivo: se guardan en la
   planilla del Hub (hoja "Tareas") y se editan desde
   tareas.html entrando como admin (botón del menú lateral).

   Este mismo archivo arma el bloque "Tareas de hoy" del Inicio
   (muestra solo las tareas que tocan el día de hoy).

   Para cambiar a mano: hoja "Tareas" de la planilla "Reclamos CX-Hub".
     Días  -> letras: L M X J V S D
     Quién -> vacío = todo el equipo. Por día: X=Melanie y Gianine; J=Alvaro y Sabrina
   ========================================================= */

const TR_CACHE = 'cxhub-tareas';
const TR_COLORES = ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--amber)', '#2fb8c4', '#ec4899', '#f97316', 'var(--red)'];

/* ---------- De acá para abajo no hace falta tocar nada ---------- */

const TR_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const TR_NOMBRES = { L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes', S: 'Sábado', D: 'Domingo' };

let tareasTR = [];
let editandoTR = null;
let borrarPendienteTR = '';

function hoyTR(){ return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][new Date().getDay()]; }
function diasDe(t){ return String(t.dias || '').split(/\s+/).filter(d => TR_DIAS.includes(d)); }

/* "X=Melanie y Gianine; J=Alvaro" -> { X: 'Melanie y Gianine', J: 'Alvaro' }; sin "=" -> { '*': texto } */
function quienDe(t){
  const q = String(t.quien || '').trim();
  if (!q) return {};
  if (!q.includes('=')) return { '*': q };
  const r = {};
  q.split(';').forEach(p => {
    const [d, ...resto] = p.split('=');
    const letra = d.trim().toUpperCase();
    if (TR_DIAS.includes(letra) && resto.join('=').trim()) r[letra] = resto.join('=').trim();
  });
  return r;
}
function quienHoy(t, d){ const q = quienDe(t); return q[d] || q['*'] || ''; }

function frecuenciaTR(dias){
  const s = dias.join(' ');
  if (s === 'L M X J V S D') return 'Todos los días';
  if (s === 'L M X J V S') return 'Lunes a sábado';
  if (s === 'L M X J V') return 'Lunes a viernes';
  return dias.map(d => TR_NOMBRES[d]).join(' · ');
}

function semanaTR(){
  const h = new Date(); const dow = (h.getDay() + 6) % 7;
  const lun = new Date(h); lun.setDate(h.getDate() - dow);
  const dom = new Date(lun); dom.setDate(lun.getDate() + 6);
  const f = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  return 'Semana del ' + f(lun) + ' al ' + f(dom);
}

function avisoTR(tipo, html){
  const c = document.getElementById('trAviso');
  if (!c) return;
  if (!html){ c.hidden = true; return; }
  c.className = 'cr-aviso ' + tipo;
  c.innerHTML = html;
  c.hidden = false;
}

function guardarCacheTR(){
  try { localStorage.setItem(TR_CACHE, JSON.stringify(tareasTR)); } catch(e){}
}


/* ========== Carga ========== */

async function cargarTR(pintar){
  try {
    const guardado = JSON.parse(localStorage.getItem(TR_CACHE) || 'null');
    if (guardado){ tareasTR = guardado; pintar(); }
  } catch(e){}
  try {
    const res = await (await fetch(HUB.api + '?action=tareas&t=' + Date.now())).json();
    if (!res.ok) throw new Error(res.error || 'error');
    tareasTR = res.datos.tareas || [];
    guardarCacheTR();
    if (!editandoTR) pintar();
  } catch(e){
    if (!tareasTR.length) pintar('error');
  }
}


/* ========== Página ========== */

function renderTR(estado){
  document.getElementById('trSemana').textContent = semanaTR();
  const cont = document.getElementById('trLista');
  if (estado === 'error'){ cont.innerHTML = '<div class="tr-vacio">No se pudieron cargar las tareas. Revisá la conexión y recargá la página.</div>'; return; }
  let html = tareasTR.map((t, i) => editandoTR && editandoTR.id === t.id ? edicionTR() : tarjetaTR(t, i)).join('');
  if (editandoTR && !editandoTR.id) html += edicionTR();
  if (!html) html = '<div class="tr-vacio">No hay tareas cargadas para esta semana.</div>';
  cont.innerHTML = html;
}

function tarjetaTR(t, i){
  const e = escaparHTML;
  const dias = diasDe(t), hoy = hoyTR(), q = quienDe(t);
  const tocaHoy = dias.includes(hoy);
  const porDia = Object.keys(q).some(k => k !== '*');
  let quien;
  if (porDia){
    quien = '<ul class="tr-turnos">' + dias.map(d =>
      `<li class="${d === hoy ? 'hoy' : ''}"><b>${TR_NOMBRES[d]}</b><span>${e(q[d] || q['*'] || 'Todo el equipo')}</span>${d === hoy ? '<em>HOY</em>' : ''}</li>`).join('') + '</ul>';
  } else {
    quien = `<div class="tr-quien">👥 ${e(q['*'] || 'Todo el equipo')}</div>`;
  }
  const externo = /^https:/.test(t.link || '');
  const link = t.link ? `<a class="tr-link" href="${e(t.link)}" ${externo ? 'target="_blank" rel="noopener"' : ''}>${externo ? 'Abrir ↗' : 'Ver cómo se hace →'}</a>` : '';
  return `<div class="card tr-card ${tocaHoy ? 'tr-hoy' : ''}" style="--tr-color:${TR_COLORES[i % TR_COLORES.length]}">
    <div class="tr-cab">
      <b class="tr-titulo">${e(t.titulo)}</b>
      <span class="tr-frec">${e(frecuenciaTR(dias))}</span>
      <button type="button" class="tr-editar tr-solo-admin" title="Editar" onclick="editarTR('${e(t.id)}')">✏️</button>
    </div>
    ${t.texto ? `<p class="tr-texto">${e(t.texto)}</p>` : ''}
    ${quien}
    ${link}
  </div>`;
}

function edicionTR(){
  const t = editandoTR, e = escaparHTML;
  const dias = diasDe(t), q = quienDe(t);
  const filas = TR_DIAS.map(d => `
    <div class="tr-dia">
      <label class="tr-check"><input type="checkbox" data-dia="${d}" ${dias.includes(d) ? 'checked' : ''}> ${TR_NOMBRES[d]}</label>
      <input data-quien="${d}" value="${e(q[d] || '')}" maxlength="80" placeholder="Quién (vacío = todo el equipo)">
    </div>`).join('');
  const borrar = t.id
    ? `<button type="button" class="pr-btn borrar ${borrarPendienteTR === t.id ? 'seguro' : ''}" onclick="borrarTR('${e(t.id)}')">
         ${borrarPendienteTR === t.id ? '¿Seguro? Tocá de nuevo para borrar' : 'Borrar'}</button>` : '';
  return `<div class="card tr-card tr-editando" id="trEdicion">
    <div class="cr-form">
      <b class="rc-form-titulo">✏️ ${t.id ? 'Editar tarea' : 'Tarea nueva'}</b>
      <label><span class="ts-lbl">Título</span><input id="trTitulo" value="${e(t.titulo || '')}" maxlength="80" placeholder="Ej: Campaña Chevrolet"></label>
      <label><span class="ts-lbl">Qué hacer</span><textarea id="trTexto" rows="3" maxlength="400" placeholder="Ej: Llamar a los clientes del Excel y agendar en X-Taller">${e(t.texto || '')}</textarea></label>
      <span class="ts-lbl">Días y quién</span>
      <div class="tr-dias">${filas}</div>
      <label><span class="ts-lbl">Link (opcional): https://... o una sección del Hub</span><input id="trLink" value="${e(t.link || '')}" placeholder="https://docs.google.com/... o procedimientos.html"></label>
      <div class="rc-acc">
        <button type="button" class="pr-btn guardar" id="trGuardar" onclick="guardarTR()">Guardar</button>
        <button type="button" class="pr-btn" onclick="descartarTR()">Descartar</button>
        ${borrar}
      </div>
    </div>
  </div>`;
}

/* Lee el formulario y arma { titulo, texto, dias, quien, link } */
function leerFormTR(){
  const v = id => document.getElementById(id).value.trim();
  const dias = TR_DIAS.filter(d => document.querySelector(`[data-dia="${d}"]`).checked);
  const nombres = dias.map(d => document.querySelector(`[data-quien="${d}"]`).value.trim());
  let quien = '';
  if (nombres.some(Boolean)){
    quien = nombres.every(n => n === nombres[0])
      ? nombres[0]
      : dias.map((d, i) => nombres[i] ? d + '=' + nombres[i] : '').filter(Boolean).join('; ');
  }
  return { id: editandoTR.id, titulo: v('trTitulo'), texto: v('trTexto'), dias: dias.join(' '), quien: quien, link: v('trLink') };
}


/* ========== Admin ========== */

async function iniciarAdminTR(clave){
  claveAdmin = clave;
  const res = await llamarAdmin('verificarClave').catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    claveAdmin = '';
    try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
    avisoTR('mal', '🔐 No se pudo entrar en modo admin: ' + escaparHTML(String(res.error || 'clave incorrecta').replace(/\.$/, '')) + '.');
    return;
  }
  document.body.classList.add('tr-modo-admin');
}

function editarTR(id){
  if (editandoTR) return;
  const t = tareasTR.find(x => x.id === id);
  if (!t) return;
  editandoTR = Object.assign({}, t);
  borrarPendienteTR = '';
  renderTR();
}

function nuevaTR(){
  if (editandoTR) return;
  editandoTR = { id: '', titulo: '', texto: '', dias: 'L M X J V S D', quien: '', link: '' };
  renderTR();
  const f = document.getElementById('trEdicion');
  if (f){ f.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.getElementById('trTitulo').focus(); }
}

async function guardarTR(){
  const datos = leerFormTR();
  if (!datos.titulo){ avisoTR('mal', 'Falta el título.'); return; }
  if (!datos.dias){ avisoTR('mal', 'Marcá al menos un día.'); return; }
  if (datos.link && !/^(https:\/\/\S+|[a-z0-9-]+\.html(\S*)?)$/.test(datos.link)){ avisoTR('mal', 'El link tiene que empezar con https:// o ser una sección del Hub.'); return; }
  Object.assign(editandoTR, datos);
  const btn = document.getElementById('trGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';
  const res = await llamarAdmin('guardarTarea', datos).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    btn.disabled = false;
    btn.textContent = 'Guardar';
    avisoTR('mal', '⚠️ No se guardó: ' + escaparHTML(res.error || 'error') + '. Los cambios siguen en pantalla.');
    return;
  }
  const guardado = Object.assign({}, datos, { id: res.datos.id, actualizado: res.datos.actualizado });
  const i = tareasTR.findIndex(t => t.id === guardado.id);
  if (i >= 0) tareasTR[i] = Object.assign({}, tareasTR[i], guardado); else tareasTR.push(guardado);
  guardarCacheTR();
  editandoTR = null;
  avisoTR('ok', '✓ Guardado. Ya lo ve todo el equipo.');
  renderTR();
}

function descartarTR(){
  editandoTR = null;
  borrarPendienteTR = '';
  avisoTR('', '');
  renderTR();
}

async function borrarTR(id){
  if (borrarPendienteTR !== id){
    Object.assign(editandoTR, leerFormTR());
    borrarPendienteTR = id; renderTR(); return;
  }
  borrarPendienteTR = '';
  const res = await llamarAdmin('borrarTarea', { id: id }).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){ avisoTR('mal', '⚠️ No se borró: ' + escaparHTML(res.error || 'error') + '.'); renderTR(); return; }
  tareasTR = tareasTR.filter(t => t.id !== id);
  guardarCacheTR();
  editandoTR = null;
  avisoTR('ok', '✓ Tarea borrada (queda guardada en la planilla, por las dudas).');
  renderTR();
}


/* ========== Bloque "Tareas de hoy" del Inicio ========== */

function renderHomeTR(estado){
  const cont = document.getElementById('homeTareas');
  const hoy = hoyTR();
  document.getElementById('homeTareasDia').textContent = TR_NOMBRES[hoy].toUpperCase();
  if (estado === 'error'){ cont.innerHTML = '<div class="tr-vacio">No se pudieron cargar las tareas.</div>'; return; }
  const deHoy = tareasTR.filter(t => diasDe(t).includes(hoy));
  if (!deHoy.length){ cont.innerHTML = '<div class="tr-vacio">Hoy no hay tareas especiales.</div>'; return; }
  cont.innerHTML = deHoy.map(t => {
    const i = tareasTR.indexOf(t);
    return `<a class="tr-home-item" href="tareas.html" style="--tr-color:${TR_COLORES[i % TR_COLORES.length]}">
      <b>${escaparHTML(t.titulo)}</b><span>${escaparHTML(quienHoy(t, hoy) || 'Todo el equipo')}</span></a>`;
  }).join('');
}


/* ========== Arranque ========== */

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('homeTareas')){ cargarTR(renderHomeTR); return; }
  if (!document.getElementById('trLista')) return;
  const clave = tomarClaveDeURL();
  if (clave) iniciarAdminTR(clave);
  await cargarTR(renderTR);
});

window.addEventListener('beforeunload', e => { if (editandoTR){ e.preventDefault(); e.returnValue = ''; } });
