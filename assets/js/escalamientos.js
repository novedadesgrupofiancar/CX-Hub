/* =========================================================
   ESCALAMIENTOS — Registro de reclamos
   ---------------------------------------------------------
   El formulario manda cada reclamo a un Google Apps Script
   (archivo Reclamos.gs, que NO va en el repo). El script:
     1. lo guarda en la planilla "Reclamos CX-Hub"
     2. manda el mail al encargado del área, con copia al coordinador

   LOS MAILS DE CADA ÁREA ESTÁN EN EL SCRIPT, NO ACÁ.
   Esta página es pública: si los mails estuvieran acá,
   cualquiera los podría leer.

   PARA AGREGAR UN AGENTE: sumalo a la lista AGENTES.

   PARA AGREGAR UN ÁREA: sumala a la lista AREAS de acá
   Y TAMBIÉN en la lista AREAS de Reclamos.gs, con el MISMO id.
   Si el id no coincide, el script rechaza el reclamo.
   ========================================================= */

/* Dirección del Apps Script de reclamos. Se pega una sola vez,
   cuando se publica el script (ver la guía). */
const RECLAMOS_API_URL = '';

const AGENTES = [
  'Sabrina', 'Alvaro', 'Melanie', 'Gianine',
  'Natasha', 'Damian', 'Piero', 'Shoanna'
];

/* grupo:       título bajo el que aparece en la lista
   nombre:      lo que ve el agente
   responsable: a quién le llega (solo informativo, el mail está en el script) */
const AREAS = [
  { id: 'ventas-rondeau',     grupo: 'Ventas',   nombre: 'Ventas Rondeau',          responsable: 'Dario Amigo' },
  { id: 'ventas-carrasco',    grupo: 'Ventas',   nombre: 'Ventas Carrasco',         responsable: 'Eduardo Amigo' },
  { id: 'ventas-chevrolet',   grupo: 'Ventas',   nombre: 'Ventas Chevrolet',        responsable: 'Eduardo Amigo' },
  { id: 'ventas-shopping',    grupo: 'Ventas',   nombre: 'Ventas Shopping de Autos', responsable: 'Fabian Radzinski' },
  { id: 'ventas-punta',       grupo: 'Ventas',   nombre: 'Ventas Punta del Este',   responsable: 'Maria Bensich' },

  { id: 'taller-rondeau',     grupo: 'Taller',   nombre: 'Taller Rondeau',          responsable: 'Leonardo Biccherai y Fernando Rodríguez' },
  { id: 'taller-carrasco',    grupo: 'Taller',   nombre: 'Taller Carrasco',         responsable: 'Leonardo Biccherai y Leonardo Landeira' },
  { id: 'taller-chevrolet',   grupo: 'Taller',   nombre: 'Taller Chevrolet',        responsable: 'Fernando Sánchez y Daniel Massaferro' },

  { id: 'garantias',          grupo: 'Postventa', nombre: 'Garantías',              responsable: 'Nicolas Vazquez' },
  { id: 'red-talleres',       grupo: 'Postventa', nombre: 'Red de talleres oficiales (Montevideo e interior)', responsable: 'Nicolas Vazquez' },

  { id: 'gestoria-rondeau',   grupo: 'Gestoría', nombre: 'Gestoría Rondeau',        responsable: 'Gestoría' },
  { id: 'gestoria-carrasco',  grupo: 'Gestoría', nombre: 'Gestoría Carrasco',       responsable: 'Gestoría' },
  { id: 'gestoria-chevrolet', grupo: 'Gestoría', nombre: 'Gestoría Chevrolet',      responsable: 'Gestoría' },
  { id: 'gestoria-shopping',  grupo: 'Gestoría', nombre: 'Gestoría Shopping de Autos', responsable: 'Gestoría' },

  { id: 'atencion-cliente',   grupo: 'Otros',    nombre: 'Atención al cliente',     responsable: 'Coordinación del Contact Center' }
];


/* =========================================================
   DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA
   ========================================================= */

const CAMPOS = ['agente', 'area', 'vehiculo', 'clienteNombre', 'clienteMail', 'clienteTelefono', 'descripcion'];

/* Cada PC recuerda qué agente la usó por última vez */
function guardarAgente(nombre){ try { localStorage.setItem('cxhub-agente', nombre); } catch(e){} }
function leerAgente(){ try { return localStorage.getItem('cxhub-agente') || ''; } catch(e){ return ''; } }


/* ========== Armar las listas ========== */

function renderListas(){
  const selAgente = document.getElementById('esAgente');
  selAgente.innerHTML = '<option value="">Elegí tu nombre</option>' +
    AGENTES.map(a => `<option>${a}</option>`).join('');
  const ultimo = leerAgente();
  if (AGENTES.includes(ultimo)) selAgente.value = ultimo;

  const grupos = [...new Set(AREAS.map(a => a.grupo))];
  document.getElementById('esArea').innerHTML = '<option value="">Elegí el área</option>' +
    grupos.map(g => `<optgroup label="${g}">` +
      AREAS.filter(a => a.grupo === g).map(a => `<option value="${a.id}">${a.nombre}</option>`).join('') +
      `</optgroup>`).join('');
}

function mostrarDestino(){
  const area = AREAS.find(a => a.id === document.getElementById('esArea').value);
  const caja = document.getElementById('esDestino');
  if (!area){ caja.hidden = true; return; }
  caja.hidden = false;
  caja.innerHTML = `📨 Le llega a <b>${area.responsable}</b>, con copia a coordinación.`;
}


/* ========== Validación ========== */

function validar(form){
  let primero = null;
  CAMPOS.forEach(c => {
    const el = form.elements[c];
    const valor = el.value.trim();
    let error = '';
    if (!valor) error = 'Este dato es obligatorio';
    else if (c === 'clienteMail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) error = 'Revisá el mail';
    else if (c === 'clienteTelefono' && valor.replace(/\D/g, '').length < 8) error = 'Revisá el teléfono (mínimo 8 números)';
    else if (c === 'vehiculo' && valor.replace(/[\s.-]/g, '').length < 6) error = 'Matrícula o chasis incompleto';
    else if (c === 'descripcion' && valor.length < 20) error = 'Contá un poco más (mínimo 20 caracteres)';

    const campo = el.closest('.es-campo');
    campo.classList.toggle('error', !!error);
    campo.querySelector('.es-error').textContent = error;
    if (error && !primero) primero = el;
  });
  if (primero) primero.focus();
  return !primero;
}


/* ========== Envío ========== */

function aviso(tipo, html){
  const caja = document.getElementById('esAviso');
  caja.className = 'es-aviso ' + tipo;
  caja.innerHTML = html;
  caja.hidden = false;
  caja.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

async function enviarReclamo(ev){
  ev.preventDefault();
  const form = ev.target;
  document.getElementById('esAviso').hidden = true;
  if (!validar(form)) return;

  if (!RECLAMOS_API_URL){
    aviso('mal', '⚠️ El formulario todavía no está conectado. Avisale al coordinador.');
    return;
  }

  const datos = {};
  CAMPOS.forEach(c => datos[c] = form.elements[c].value.trim());
  datos.vehiculo = datos.vehiculo.toUpperCase();
  datos.trampa = form.elements.web.value;   // campo oculto anti-robots

  const btn = document.getElementById('esEnviar');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  try {
    // text/plain a propósito: evita la verificación previa de CORS
    const r = await fetch(RECLAMOS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos)
    });
    const res = await r.json();
    if (!res.ok) throw new Error(res.error || 'error desconocido');

    guardarAgente(datos.agente);
    aviso('ok', `
      <div><b>✓ Reclamo N.º ${res.numero} enviado</b>
      <p>Ya le llegó el mail al área. Podés darle este número al cliente.</p></div>
      <button type="button" class="ts-copiar" onclick="copiarNumero(this, '${res.numero}')">Copiar número</button>`);
    // Se limpia todo menos el agente
    CAMPOS.filter(c => c !== 'agente').forEach(c => form.elements[c].value = '');
    mostrarDestino();
  } catch(e){
    aviso('mal', `⚠️ No se pudo enviar: ${e.message}. Los datos siguen cargados, probá de nuevo.`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar reclamo';
  }
}

function copiarNumero(btn, numero){
  navigator.clipboard.writeText(numero).then(() => {
    btn.textContent = '✓ Copiado';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copiar número'; btn.classList.remove('ok'); }, 1600);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  renderListas();
  const form = document.getElementById('esForm');
  form.addEventListener('submit', enviarReclamo);
  document.getElementById('esArea').addEventListener('change', mostrarDestino);
  // Al corregir un campo, se va el mensaje de error
  form.addEventListener('input', e => {
    const campo = e.target.closest('.es-campo');
    if (campo) campo.classList.remove('error');
  });
  if (!RECLAMOS_API_URL) document.getElementById('esSinConectar').hidden = false;
});
