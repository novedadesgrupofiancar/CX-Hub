/* =========================================================
   PRODUCTOS Y MODELOS — Garantía, services y tolerancia
   ---------------------------------------------------------
   PARA EDITAR: tocá solamente la lista MARCAS_PM y PRECIOS.
   No hace falta abrir el HTML.

   Cada marca tiene:
     garantia    -> texto tal cual se le dice al cliente
     tolerancia  -> km que se acepta pasarse del service (número, sin puntos)
     notas       -> recuadros amarillos (excepciones, eléctricos, etc.)
     planes      -> los planes de service. Cada plan tiene:
         modelos   -> lista de modelos. Si dice 'Todos los modelos' o
                      'Resto de los modelos', se muestra así.
         primero   -> km del 1.er service (número, sin puntos)
         segundo   -> km del 2.º service
         cada      -> después, cada cuántos km
         porTiempo -> true si también vence por tiempo
                      ("o al año, lo que se cumpla primero")

   Los km de service salen del tarifario de postventa.grupofiancar.com.
   ========================================================= */

/* Links a las webs de precios y catálogo */
const PRECIOS = [
  { nombre: 'Grupo Fiancar',     web: 'vehiculos.grupofiancar.com', url: 'https://vehiculos.grupofiancar.com/' },
  { nombre: 'Shopping de Autos', web: 'shoppingdeautos.uy',         url: 'https://shoppingdeautos.uy/' },
  { nombre: 'Chevrolet',         web: 'chevroletmontevideo.com.uy', url: 'https://chevroletmontevideo.com.uy/' },
  { nombre: 'Geely',             web: 'geely.com.uy',               url: 'https://geely.com.uy/' },
  { nombre: 'Lynk & Co',         web: 'lynkco.uy',                  url: 'https://lynkco.uy/' },
  { nombre: 'JAC Auto',          web: 'jacauto.com.uy',             url: 'https://jacauto.com.uy/' },
  { nombre: 'JAC Camiones',      web: 'jac.com.uy',                 url: 'https://jac.com.uy/' }
];

/* Texto que se repite en Geely y Lynk & Co */
const NOTA_ACTUALIZACION = '💻 <b>Actualización de software (Geely EX2, EX5 y Lynk &amp; Co):</b> se hace en el primer service. Si el cliente la hace aparte, tiene costo: <b>$U 2.850 + IVA</b>.';

const MARCAS_PM = [
  {
    marca: 'Chevrolet',
    color: '#f2a93b',
    importador: 'General Motors',
    garantia: '3 años o 100.000 km',
    tolerancia: 1500,
    notas: [
      '🔧 <b>Correas:</b> si son bañadas en aceite, se cambian cada 15 años o 240.000 km. Si no, cada 50.000 km.'
    ],
    planes: [
      { modelos: ['Captiva 1.5 T', 'Groove 1.5', 'N400 1.5'], primero: 5000, segundo: 10000, cada: 10000 },
      { modelos: ['Resto de los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'Onix, Onix Plus, Prisma, Tracker, Montana, S10, Silverado, Spin, Equinox, Cruze, Captiva 2.4 / 3.0, Sail, Spark, Spark EUV' }
    ]
  },
  {
    marca: 'Fiat',
    color: '#e6483d',
    importador: 'Sevel',
    garantia: '3 años o 150.000 km',
    tolerancia: 1000,
    notas: [],
    planes: [
      { modelos: ['Todos los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'Argo, Cronos, Mobi, Pulse, Fastback, Strada, Toro, Fiorino, 500X, Uno, Palio, Punto, Grand Siena' }
    ]
  },
  {
    marca: 'Geely',
    color: '#2f6fed',
    importador: 'Grupo Fiancar',
    garantia: '5 años o 150.000 km',
    tolerancia: 1500,
    notas: [
      '📅 Vehículos <b>anteriores a mayo 2024</b>: 4 años o 100.000 km.',
      '🔋 <b>Eléctricos:</b> la batería tiene 8 años de garantía.',
      NOTA_ACTUALIZACION
    ],
    planes: [
      { modelos: ['EX2', 'EX5'], primero: 5000, segundo: 20000, cada: 20000, porTiempo: true },
      { modelos: ['Resto de los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'Coolray, Coolray Lite, Coolray New, Azkarra, Cityray, EX5 EM-i, Geometry C, Geometry E, GX3, GX3 Pro' }
    ]
  },
  {
    marca: 'Lynk & Co',
    color: '#0f1b3d',
    importador: 'Grupo Fiancar',
    garantia: '5 años o 150.000 km',
    tolerancia: 1000,
    notas: [
      '🔋 <b>Eléctricos:</b> 5 años, y la batería 8 años.',
      NOTA_ACTUALIZACION
    ],
    planes: [
      { modelos: ['Lynk 02'], primero: 5000, segundo: 20000, cada: 20000, porTiempo: true },
      { modelos: ['Resto de los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'Lynk 01, Lynk 03+, Lynk 06, Lynk 08, Lynk 09' }
    ]
  },
  {
    marca: 'JAC Auto',
    color: '#1fa971',
    importador: 'Grupo Fiancar',
    garantia: '5 años o 150.000 km',
    tolerancia: 1500,
    notas: [
      '⭐ <b>Ytterby (ES3):</b> 6 años o 150.000 km.'
    ],
    planes: [
      { modelos: ['Ytterby (ES3)'], primero: 5000, segundo: 20000, cada: 20000, porTiempo: true },
      { modelos: ['Resto de los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'JS4, JS8, S2, RF8 PHEV, EJ7 EV, ES1 EV, ES4 EV' }
    ]
  },
  {
    marca: 'JAC Camiones',
    color: '#8b5cf6',
    importador: 'Grupo Fiancar',
    garantia: '5 años o 150.000 km',
    tolerancia: 1500,
    notas: [
      '🚫 <b>No se atienden en Taller Rondeau.</b> Van a Carrasco o a Obisun (2203 0907).'
    ],
    planes: [
      { modelos: ['Todos los modelos'], primero: 10000, segundo: 20000, cada: 10000,
        incluye: 'T6, T8, X200, X200 EV, Sunray, Sunray EV, M3 EV, línea HFC' }
    ]
  }
];


/* =========================================================
   DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA
   ========================================================= */

/* \u00a0 es un espacio que no corta línea: "5.000 km" siempre queda junto */
function km(n){ return n.toLocaleString('es-UY') + '\u00a0km'; }
function sinTildes(t){ return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

/* Texto de un plan: "1.º 5.000 km o 1 año · 2.º 20.000 km o 1 año después · luego cada 20.000 km" */
function textoPlan(p){
  const t1 = p.porTiempo ? ' o al año de la compra' : '';
  const t2 = p.porTiempo ? ' o al año del 1.º' : '';
  const t3 = p.porTiempo ? ' o cada año' : '';
  return { primero: km(p.primero) + t1, segundo: km(p.segundo) + t2, cada: 'cada ' + km(p.cada) + t3 };
}

/* Lista de services (en km) de un plan, hasta 300.000 km */
function hitos(p){
  const l = [p.primero, p.segundo];
  while (l[l.length - 1] < 300000) l.push(l[l.length - 1] + p.cada);
  return l;
}


/* ========== Precios ========== */

function renderPrecios(){
  const cont = document.getElementById('pmPrecios');
  if (!cont) return;
  cont.innerHTML = PRECIOS.map(p => `
    <a class="ts-tarifa" target="_blank" rel="noopener" href="${p.url}">
      <b>${p.nombre}</b><span>${p.web} →</span></a>`).join('');
}


/* ========== Tarjetas por marca ========== */

let filtroMarca = '';
let textoBusqueda = '';

function planCoincide(p, t){
  return sinTildes(p.modelos.join(' ') + ' ' + (p.incluye || '')).includes(t);
}

function renderMarcas(){
  const cont = document.getElementById('pmMarcas');
  if (!cont) return;
  const t = sinTildes(textoBusqueda.trim());

  const visibles = MARCAS_PM.filter(m => {
    if (filtroMarca && m.marca !== filtroMarca) return false;
    if (!t) return true;
    return sinTildes(m.marca).includes(t) || m.planes.some(p => planCoincide(p, t));
  });

  if (!visibles.length){
    cont.innerHTML = `<div class="ts-vacio">No encontré «${textoBusqueda}». Probá con otro nombre o revisá la web de la marca.</div>`;
    return;
  }

  cont.innerHTML = visibles.map(m => {
    const notas = m.notas.map(n => `<div class="pm-nota">${n}</div>`).join('');
    const filas = m.planes.map(p => {
      const tx = textoPlan(p);
      const marcado = t && !sinTildes(m.marca).includes(t) && planCoincide(p, t) ? ' match' : '';
      const incluye = p.incluye ? `<div class="pm-incluye">${p.incluye}</div>` : '';
      return `
        <tr class="pm-fila${marcado}">
          <td><b>${p.modelos.join(', ')}</b>${incluye}</td>
          <td>${tx.primero}</td>
          <td>${tx.segundo}</td>
          <td>${tx.cada}</td>
        </tr>`;
    }).join('');

    return `
    <div class="pm-marca" style="--acento:${m.color}">
      <div class="pm-marca-top">
        <h2>${m.marca}</h2>
        <span class="pm-imp">Importador: ${m.importador}</span>
      </div>
      <div class="pm-kpis">
        <div class="pm-kpi"><span class="ts-lbl">Garantía</span><b>${m.garantia}</b></div>
        <div class="pm-kpi tol"><span class="ts-lbl">Tolerancia</span><b>${km(m.tolerancia)}</b></div>
      </div>
      ${notas ? `<div class="pm-notas">${notas}</div>` : ''}
      <div class="pm-tabla-wrap">
        <table class="pm-tabla">
          <tr><th>Modelos</th><th>1.er service</th><th>2.º service</th><th>Después</th></tr>
          ${filas}
        </table>
      </div>
    </div>`;
  }).join('');
}

function renderFiltros(){
  const cont = document.getElementById('pmFiltros');
  if (!cont) return;
  cont.innerHTML =
    `<button class="ts-chip ${!filtroMarca ? 'on' : ''}" onclick="filtrarMarcaPM(-1)">Todas</button>` +
    MARCAS_PM.map((m, i) =>
      `<button class="ts-chip ${filtroMarca === m.marca ? 'on' : ''}" onclick="filtrarMarcaPM(${i})">${m.marca}</button>`
    ).join('');
}

function filtrarMarcaPM(i){
  filtroMarca = i < 0 ? '' : MARCAS_PM[i].marca;
  renderFiltros();
  renderMarcas();
}

function buscarModelo(valor){
  textoBusqueda = valor;
  renderMarcas();
}


/* ========== ¿Le toca service? ========== */

function renderCalculadora(){
  const sel = document.getElementById('pmCalcModelo');
  if (!sel) return;
  sel.innerHTML = '<option value="">Elegí marca y modelo</option>' +
    MARCAS_PM.map((m, i) => `<optgroup label="${m.marca}">` +
      m.planes.map((p, j) => `<option value="${i}-${j}">${m.marca} · ${p.modelos.join(', ')}</option>`).join('') +
      `</optgroup>`).join('');
}

function calcularService(){
  const sel = document.getElementById('pmCalcModelo').value;
  const kmTxt = document.getElementById('pmCalcKm').value.replace(/\D/g, '');
  const caja = document.getElementById('pmCalcRes');

  if (!sel || !kmTxt){
    caja.className = 'pm-res aviso';
    caja.innerHTML = 'Elegí el modelo y escribí el kilometraje.';
    caja.hidden = false;
    return;
  }

  const [i, j] = sel.split('-').map(Number);
  const m = MARCAS_PM[i], p = m.planes[j];
  const k = Number(kmTxt);
  const lista = hitos(p);
  const tol = m.tolerancia;
  const tiempo = p.porTiempo ? ' Recordá que también vence por tiempo: si pasó el año, le toca igual.' : '';

  // Último service que ya debería haber hecho (el mayor que sea <= km actual)
  const vencido = [...lista].reverse().find(h => h <= k);
  const proximo = lista.find(h => h > k);

  if (vencido !== undefined && k - vencido <= tol){
    caja.className = 'pm-res ok';
    caja.innerHTML = `✓ <b>Le toca el service de ${km(vencido)}.</b> ` +
      (k === vencido ? 'Está justo en el kilometraje.' : `Se pasó ${km(k - vencido)}, está <b>dentro de la tolerancia (${km(tol)})</b>.`) +
      ` Se puede agendar.${tiempo}`;
  } else if (proximo !== undefined && proximo - k <= tol){
    // Está cerca del próximo: se agenda ese
    caja.className = 'pm-res ok';
    caja.innerHTML = `✓ <b>Le toca el service de ${km(proximo)}</b> (le faltan ${km(proximo - k)}). Se puede agendar.${tiempo}`;
  } else if (vencido !== undefined){
    // No sabemos si hizo el anterior: se muestran los dos casos
    caja.className = 'pm-res aviso';
    caja.innerHTML = `ℹ️ <b>El próximo service es el de ${km(proximo)}</b> (le faltan ${km(proximo - k)}).` +
      `<div class="pm-res-extra">⚠️ Si <b>no hizo el de ${km(vencido)}</b>, se pasó ${km(k - vencido)} y ` +
      `<b>supera la tolerancia de ${km(tol)}</b>: consultar con recepción de taller antes de agendar.</div>`;
  } else {
    caja.className = 'pm-res aviso';
    caja.innerHTML = `ℹ️ Todavía no le toca. <b>El primer service es a los ${km(proximo)}</b>` +
      ` (le faltan ${km(proximo - k)}).${p.porTiempo ? ' O al año de la compra, lo que se cumpla primero.' : ''}`;
  }
  caja.hidden = false;
}


document.addEventListener('DOMContentLoaded', () => {
  renderPrecios();
  renderFiltros();
  renderMarcas();
  renderCalculadora();
  const kmInput = document.getElementById('pmCalcKm');
  if (kmInput) kmInput.addEventListener('keydown', e => { if (e.key === 'Enter') calcularService(); });
});
