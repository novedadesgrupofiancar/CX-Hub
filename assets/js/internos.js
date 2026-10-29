/* =========================================================
   INTERNOS — Sección
   ---------------------------------------------------------
   Equipo: ve todo, con buscador y una pestaña por sucursal.
   Admin:  entrar con internos.html?admin=CLAVE (la misma del Dashboard)
           y editar en la misma pantalla. Se guarda en la planilla del
           backend (hoja "Internos"); antes de cada cambio queda una copia
           en "Internos (historial)".

   No hace falta tocar este archivo: los datos se cargan desde la pantalla.
   ========================================================= */

/* Pestañas que muestran la columna "Días en Car One" */
const IN_CON_CAR_ONE = ['chevrolet', 'carone'];

const IN_DIAS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const IN_USOS  = {
  cliente:   '🟢 Se puede dar al cliente',
  interno:   '🟡 Solo uso interno',
  noderivar: '🔴 No derivar'
};
const IN_AREAS = ['Recepción', 'Ventas', 'Taller', 'Gestoría', 'Caja', 'Repuestos', 'Administración', 'RRHH',
                  'IT', 'Comercio exterior', 'Asistencia técnica', 'Comercial', 'Marketing', 'Gerencia', 'Contact Center'];
const IN_CACHE = 'cxhub-internos';

let sucursalesIN = [];      // datos del servidor
let actualIN = '';          // id de la pestaña elegida
let textoIN = '';
let edicionIN = null;       // copia en edición (admin) de la sucursal actual
let sinGuardarIN = false;


/* ========== Utilidades ========== */

function normalIN(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function hoyLetraIN(){ return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][new Date().getDay()]; }
function tieneDia(lista, d){ return String(lista || '').split(' ').indexOf(d) >= 0; }
function sucursalIN(id){ return sucursalesIN.find(s => s.id === id); }

function avisoIN(tipo, html){
  const c = document.getElementById('inAviso');
  c.className = 'cr-aviso ' + tipo;
  c.innerHTML = html;
  c.hidden = false;
  if (tipo === 'ok') setTimeout(() => { c.hidden = true; }, 3500);
}


/* ========== Carga ========== */

async function cargarIN(){
  try {
    const copia = JSON.parse(localStorage.getItem(IN_CACHE) || 'null');
    if (copia){ sucursalesIN = copia; elegirInicialIN(); renderIN(); }
  } catch(e){}
  try {
    const r = await fetch(HUB.api + '?action=internos&t=' + Date.now());
    const res = await r.json();
    if (!res.ok) throw new Error(res.error || 'error');
    sucursalesIN = res.datos.sucursales;
    try { localStorage.setItem(IN_CACHE, JSON.stringify(sucursalesIN)); } catch(e){}
    elegirInicialIN();
    if (!sinGuardarIN) renderIN();
  } catch(e){
    if (!sucursalesIN.length) document.getElementById('inLista').innerHTML = '<div class="in-vacio">No se pudo cargar. Probá recargar la página.</div>';
  }
}

/* Pestaña inicial: la de ?sucursal=Nombre (desde Sucursales) o la primera */
function elegirInicialIN(){
  if (actualIN && sucursalIN(actualIN)) return;
  const pedida = normalIN(new URLSearchParams(location.search).get('sucursal'));
  const s = sucursalesIN.find(x => pedida && normalIN(x.nombre) === pedida) || sucursalesIN[0];
  actualIN = s ? s.id : '';
}


/* ========== Vista del equipo ========== */

function renderIN(){
  renderChipsIN();
  if (claveAdmin) return renderEdicionIN();
  const cont = document.getElementById('inLista');
  if (!sucursalesIN.length){ cont.innerHTML = '<div class="in-vacio">Todavía no hay internos cargados.</div>'; return; }

  if (textoIN){
    const q = normalIN(textoIN);
    const bloques = sucursalesIN.map(s => {
      const hallados = s.personas.filter(p =>
        normalIN([p.nombre, p.cargo, p.area, p.interno, p.cel, p.nota, s.nombre].join(' ')).indexOf(q) >= 0);
      return hallados.length ? `<div class="in-suc-res">${escaparHTML(s.nombre)}</div>` + hallados.map(p => filaIN(p, s)).join('') : '';
    }).join('');
    cont.innerHTML = bloques || '<div class="in-vacio">No encontré a nadie con esa búsqueda.</div>';
    return;
  }

  const s = sucursalIN(actualIN);
  let html = `<div class="in-suc-head"><h2>${escaparHTML(s.nombre)}</h2>
    ${s.tel ? `<div class="in-central">Teléfono central <b>${escaparHTML(s.tel)}</b></div>` : ''}</div>`;
  if (!s.personas.length) html += '<div class="in-vacio">Sin internos cargados en esta sucursal.</div>';
  let area = null;
  s.personas.forEach(p => {
    if (p.area !== area){ area = p.area; html += `<div class="in-area">${escaparHTML(area || 'Otros')}</div>`; }
    html += filaIN(p, s);
  });
  cont.innerHTML = html;
}

function renderChipsIN(){
  document.getElementById('inChips').innerHTML = sucursalesIN.map(s =>
    `<button type="button" class="ts-chip ${!textoIN && s.id === actualIN ? 'on' : ''}" onclick="irIN('${s.id}')">${escaparHTML(s.nombre)}</button>`).join('');
}

function filaIN(p, s){
  const hoy = hoyLetraIN();
  const noEstaHoy = p.dias && !tieneDia(p.dias, hoy);
  const dias = p.dias || p.carone
    ? `<div class="in-dias" title="Días que trabaja">${IN_DIAS.map(d => {
        const cls = tieneDia(p.carone, d) ? 'c' : tieneDia(p.dias, d) ? 't' : '';
        return `<span class="${cls} ${d === hoy ? 'hoy' : ''}">${d}</span>`;
      }).join('')}</div>`
    : '';
  const uso = p.cel && IN_USOS[p.uso] ? `<span class="in-uso ${p.uso}">${IN_USOS[p.uso]}</span>` : '';
  return `
    <div class="in-fila ${noEstaHoy ? 'in-hoy-no' : ''}">
      <div class="in-persona">
        <b>${escaparHTML(p.nombre)}${noEstaHoy ? '<span class="in-tag-no">Hoy no está</span>' : ''}</b>
        <span>${escaparHTML(p.cargo)}</span>
        ${p.nota ? `<span class="in-nota">${escaparHTML(p.nota)}</span>` : ''}
      </div>
      <div class="in-int ${p.interno ? '' : 'vacio'}">${p.interno ? escaparHTML(p.interno) : 'sin interno'}</div>
      <div class="in-cel">${p.cel ? `<b>📱 ${escaparHTML(p.cel)}</b>${uso}` : ''}
        ${p.mail ? `<b style="font-weight:600;font-size:12px">✉️ ${escaparHTML(p.mail)}</b>` : ''}</div>
      <div class="in-dias-col">${dias}</div>
      <div class="in-horario">${escaparHTML(p.horario)}</div>
    </div>`;
}

function irIN(id){
  if (sinGuardarIN && !confirmarDescarteIN()) return;
  actualIN = id;
  textoIN = '';
  const b = document.getElementById('inBuscar'); if (b) b.value = '';
  edicionIN = null;
  sinGuardarIN = false;
  renderIN();
}

function buscarIN(t){ textoIN = t.trim(); renderIN(); }


/* ========== Edición (admin) ========== */

async function iniciarAdminIN(clave){
  claveAdmin = clave;
  const res = await llamarAdmin('verificarClave').catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    claveAdmin = '';
    try { sessionStorage.removeItem(CLAVE_SESION); } catch(e){}
    avisoIN('mal', '🔐 No se pudo entrar en modo admin: ' + escaparHTML(String(res.error || 'clave incorrecta').replace(/\.$/, '')) + '.');
    return;
  }
  document.body.classList.add('in-modo-admin');
  renderIN();
}

function renderEdicionIN(){
  const s = sucursalIN(actualIN);
  const cont = document.getElementById('inLista');
  if (!s){ cont.innerHTML = '<div class="in-vacio">Todavía no hay sucursales cargadas.</div>'; return; }
  if (!edicionIN || edicionIN.id !== s.id) edicionIN = JSON.parse(JSON.stringify(s));
  const e = edicionIN;
  const conCarOne = IN_CON_CAR_ONE.indexOf(e.id) >= 0;
  const usos = [['', '— elegir —']].concat(Object.keys(IN_USOS).map(k => [k, IN_USOS[k]]));

  const filas = e.personas.map((p, i) => `
    <tr>
      <td><input list="inAreas" value="${escaparHTML(p.area)}" oninput="editarIN(${i},'area',this.value)" style="width:120px"></td>
      <td><input value="${escaparHTML(p.nombre)}" oninput="editarIN(${i},'nombre',this.value)" style="width:160px"></td>
      <td><input value="${escaparHTML(p.cargo)}" oninput="editarIN(${i},'cargo',this.value)" style="width:160px"></td>
      <td><input value="${escaparHTML(p.interno)}" oninput="editarIN(${i},'interno',this.value)" style="width:66px"></td>
      <td><input value="${escaparHTML(p.cel)}" oninput="editarIN(${i},'cel',this.value)" style="width:110px"></td>
      <td><select onchange="editarIN(${i},'uso',this.value)" style="width:150px">${usos.map(u =>
        `<option value="${u[0]}" ${u[0] === p.uso ? 'selected' : ''}>${u[1]}</option>`).join('')}</select></td>
      <td>${botonesDiasIN(i, 'dias', p.dias, '')}</td>
      ${conCarOne ? `<td>${botonesDiasIN(i, 'carone', p.carone, 'c')}</td>` : ''}
      <td><input value="${escaparHTML(p.horario)}" placeholder="ej: 9 a 18hs" oninput="editarIN(${i},'horario',this.value)" style="width:110px"></td>
      <td><input value="${escaparHTML(p.mail)}" oninput="editarIN(${i},'mail',this.value)" style="width:150px"></td>
      <td><input value="${escaparHTML(p.nota)}" oninput="editarIN(${i},'nota',this.value)" style="min-width:150px"></td>
      <td><button type="button" class="in-x" title="Quitar" onclick="quitarIN(${i})">✕</button></td>
    </tr>`).join('');

  cont.innerHTML = `
    <div class="in-suc-head"><h2>${escaparHTML(e.nombre)}</h2>
      <label class="in-central">Teléfono central <input class="in-tel" value="${escaparHTML(e.tel)}" oninput="editarSucIN(this.value)"></label></div>
    <div class="in-tabla-wrap"><table class="in-tabla">
      <thead><tr><th>Área</th><th>Nombre</th><th>Cargo</th><th>Interno</th><th>Celular</th><th>¿Se da el celular?</th>
        <th>Días que trabaja</th>${conCarOne ? '<th>Días en Car One</th>' : ''}<th>Horario</th><th>Mail</th><th>Nota</th><th></th></tr></thead>
      <tbody>${filas}</tbody>
    </table></div>
    <datalist id="inAreas">${IN_AREAS.map(a => `<option value="${a}">`).join('')}</datalist>
    <div class="in-acciones">
      <button type="button" class="cr-btn-sec" onclick="agregarIN()">＋ Agregar persona</button>
      <button type="button" class="cr-btn" id="inGuardar" onclick="guardarIN()">Guardar cambios</button>
      <button type="button" class="cr-btn-sec" onclick="descartarIN()" ${sinGuardarIN ? '' : 'hidden'}>Descartar cambios</button>
      <span class="in-sin-guardar">${sinGuardarIN ? '● Hay cambios sin guardar' : ''}</span>
    </div>`;
}

function botonesDiasIN(i, campo, valor, clase){
  return `<div class="in-ed-dias ${clase}">${IN_DIAS.map(d =>
    `<button type="button" class="${tieneDia(valor, d) ? 'on' : ''}" onclick="alternarDiaIN(${i},'${campo}','${d}')">${d}</button>`).join('')}</div>`;
}

function marcarCambioIN(redibujar){
  const antes = sinGuardarIN;
  sinGuardarIN = true;
  if (redibujar || !antes) renderEdicionIN();
}
function editarIN(i, campo, valor){ edicionIN.personas[i][campo] = valor; marcarCambioIN(campo === 'uso'); }
function editarSucIN(valor){ edicionIN.tel = valor; marcarCambioIN(false); }
function alternarDiaIN(i, campo, d){
  const p = edicionIN.personas[i];
  const set = new Set(String(p[campo] || '').split(' ').filter(Boolean));
  set.has(d) ? set.delete(d) : set.add(d);
  p[campo] = IN_DIAS.filter(x => set.has(x)).join(' ');
  marcarCambioIN(true);
}
function quitarIN(i){ edicionIN.personas.splice(i, 1); marcarCambioIN(true); }
function agregarIN(){
  const ultima = edicionIN.personas[edicionIN.personas.length - 1];
  edicionIN.personas.push({ area: ultima ? ultima.area : '', nombre: '', cargo: '', interno: '', cel: '', uso: '',
    dias: 'L M X J V', carone: '', horario: ultima ? ultima.horario : '', mail: '', nota: '' });
  marcarCambioIN(true);
}
function descartarIN(){ edicionIN = null; sinGuardarIN = false; renderIN(); }
function confirmarDescarteIN(){ return confirm('Hay cambios sin guardar en ' + edicionIN.nombre + '. ¿Descartarlos?'); }

async function guardarIN(){
  const b = document.getElementById('inGuardar');
  b.disabled = true; b.textContent = 'Guardando…';
  const res = await llamarAdmin('guardarInternos', edicionIN).catch(() => ({ ok: false, error: 'Sin conexión' }));
  if (!res.ok){
    b.disabled = false; b.textContent = 'Guardar cambios';
    avisoIN('mal', '⚠️ No se guardó: ' + escaparHTML(res.error || 'error') );
    return;
  }
  sinGuardarIN = false;
  edicionIN = null;
  avisoIN('ok', '✓ Guardado. Ya lo ve todo el equipo.');
  await cargarIN();
  renderIN();
}

window.addEventListener('beforeunload', e => { if (sinGuardarIN){ e.preventDefault(); e.returnValue = ''; } });


/* ========== Arranque ========== */

document.addEventListener('DOMContentLoaded', async () => {
  const clave = tomarClaveDeURL();
  if (clave) await iniciarAdminIN(clave);
  cargarIN();
});
