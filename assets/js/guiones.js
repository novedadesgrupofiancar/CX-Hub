/* =========================================================
   GUIONES — Render de pantalla
   ---------------------------------------------------------
   Este archivo dibuja la pantalla. El contenido de los
   speeches está en guiones-datos.js: para cambiar un texto,
   editá ese archivo, no este.
   ========================================================= */

let tabActiva      = 0;   // categoría de WhatsApp seleccionada
let variantesElegidas = {}; // qué variante quedó elegida en cada categoría
let busqueda       = '';

/* Marcas o Chevrolet: elegida una vez, vale para todos los speeches (queda guardada en el navegador) */
const CLAVE_MARCA = 'cxhub-guiones-marca';
let marcaElegida = 'Marcas';
try { if (EMPRESAS[localStorage.getItem(CLAVE_MARCA)]) marcaElegida = localStorage.getItem(CLAVE_MARCA); } catch(e){}

function conEmpresa(texto, marca){ return texto.split('[EMPRESA]').join(EMPRESAS[marca]); }
function tieneEmpresa(bloques){ return bloques.some(b => b.texto.indexOf('[EMPRESA]') >= 0); }

/* Cada variante "Marcas y Chevrolet" que nombra [EMPRESA] se convierte en dos: Marcas y Chevrolet */
function armarVariantesEmpresa(){
  SPEECHES_WPP.forEach(s => {
    s.variantes = s.variantes.flatMap(v => {
      if (v.nombre !== 'Marcas y Chevrolet' || !tieneEmpresa(v.bloques)) return [v];
      return Object.keys(EMPRESAS).map(m => Object.assign({}, v, {
        nombre: m,
        bloques: v.bloques.map(b => Object.assign({}, b, { texto: conEmpresa(b.texto, m) }))
      }));
    });
  });
}

function elegirMarca(m){
  marcaElegida = m;
  try { localStorage.setItem(CLAVE_MARCA, m); } catch(e){}
  renderWpp();
  renderLlamada();
}


/* --- Los *asteriscos* de WhatsApp se ven en negrita --- */
function escapar(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatear(t){
  return escapar(t).replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
}

/* --- Resalta el término buscado --- */
function resaltar(html, termino){
  if (!termino) return html;
  const re = new RegExp('(' + termino.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
  return html.replace(/(>[^<]*)/g, seg => seg.replace(re, '<mark>$1</mark>'));
}


/* ================= TARJETA DE UN MENSAJE ================= */

function tarjetaBloque(b, termino){
  const etiqueta = b.etiqueta
    ? `<div class="gu-etiqueta">${b.etiqueta}</div>` : '';
  const nota = b.nota
    ? `<div class="gu-nota"><b>Tener en cuenta:</b> ${b.nota}</div>` : '';
  const conector = b.conector
    ? `<div class="gu-conector"><span>${b.conector}</span></div>` : '';

  const cuerpo = resaltar(formatear(b.texto), termino);

  return `
    <div class="gu-bloque">
      <div class="gu-bloque-top">
        ${etiqueta}
        <button class="gu-copiar" type="button"
                onclick="copiarSpeech(this)">📋 Copiar</button>
      </div>
      <div class="gu-mensaje">${cuerpo}</div>
      <textarea class="gu-raw" readonly hidden>${escapar(b.texto)}</textarea>
      ${nota}
    </div>
    ${conector}`;
}


/* ================= PESTAÑAS DE CATEGORÍA ================= */

function renderTabs(){
  const cont = document.getElementById('guTabs');
  if (!cont) return;
  cont.innerHTML = SPEECHES_WPP.map((s,i) =>
    `<button class="ts-chip ${i === tabActiva ? 'on' : ''}"
             onclick="elegirTab(${i})">${s.tab}</button>`
  ).join('');
}

function elegirTab(i){
  tabActiva = i;
  renderTabs();
  renderWpp();
  document.getElementById('guWpp').scrollIntoView({behavior:'smooth', block:'start'});
}

function elegirVariante(iTab, iVar){
  const nombre = SPEECHES_WPP[iTab].variantes[iVar].nombre;
  if (EMPRESAS[nombre]){ delete variantesElegidas[iTab]; elegirMarca(nombre); return; }
  variantesElegidas[iTab] = iVar;
  renderWpp();
}


/* ================= CATEGORÍA SELECCIONADA ================= */

function renderWpp(){
  const cont = document.getElementById('guWpp');
  if (!cont) return;

  const s    = SPEECHES_WPP[tabActiva];
  const iMarca = s.variantes.findIndex(x => x.nombre === marcaElegida);
  const iVar = variantesElegidas[tabActiva] != null ? variantesElegidas[tabActiva] : Math.max(iMarca, 0);
  const v    = s.variantes[iVar];

  // Sub-botones solo si hay más de una variante
  const subtabs = s.variantes.length > 1
    ? `<div class="gu-subtabs">` + s.variantes.map((x,i) =>
        `<button class="gu-subtab ${i === iVar ? 'on' : ''}"
                 onclick="elegirVariante(${tabActiva}, ${i})">${x.nombre}</button>`
      ).join('') + `</div>`
    : `<span class="gu-alcance">${v.nombre}</span>`;

  cont.innerHTML = `
    <div class="card">
      <div class="gu-head">
        <h2 class="gu-titulo">${s.titulo}</h2>
        ${subtabs}
      </div>
      ${v.bloques.map(b => tarjetaBloque(b, '')).join('')}
    </div>`;
}


/* ================= BUSCADOR ================= */

function buscar(valor){
  busqueda = valor.trim();
  const cajaTabs = document.getElementById('guTabsWrap');
  const cajaWpp  = document.getElementById('guWpp');
  const cajaRes  = document.getElementById('guResultados');

  if (busqueda.length < 2){
    cajaTabs.hidden = false;
    cajaWpp.hidden  = false;
    cajaRes.hidden  = true;
    return;
  }

  cajaTabs.hidden = true;
  cajaWpp.hidden  = true;
  cajaRes.hidden  = false;

  const t = busqueda.toLowerCase();
  const hallazgos = [];

  SPEECHES_WPP.forEach(s => {
    s.variantes.forEach(v => {
      v.bloques.forEach(b => {
        const enTexto = b.texto.toLowerCase().includes(t);
        const enNota  = (b.nota||'').toLowerCase().includes(t);
        const enTitulo = (s.titulo + ' ' + s.tab + ' ' + (b.etiqueta||'')).toLowerCase().includes(t);
        if (enTexto || enNota || enTitulo){
          hallazgos.push({ origen:`${s.titulo} · ${v.nombre}`, bloque:b });
        }
      });
    });
  });

  PASOS_LLAMADA.forEach(p => {
    p.bloques.forEach(b0 => {
      const b = Object.assign({}, b0, { texto: conEmpresa(b0.texto, marcaElegida) });
      const enTexto = b.texto.toLowerCase().includes(t);
      const enNota  = ((b.nota||'') + ' ' + (p.nota||'')).toLowerCase().includes(t);
      const enTitulo = (p.titulo + ' ' + (b.etiqueta||'')).toLowerCase().includes(t);
      if (enTexto || enNota || enTitulo){
        hallazgos.push({ origen:`Llamada · paso ${p.n}: ${p.titulo}`, bloque:b });
      }
    });
  });

  if (!hallazgos.length){
    cajaRes.innerHTML = `<div class="ts-vacio">No hay speeches que contengan «${escapar(busqueda)}».</div>`;
    return;
  }

  cajaRes.innerHTML = `
    <div class="gu-res-titulo">${hallazgos.length} ${hallazgos.length === 1 ? 'speech encontrado' : 'speeches encontrados'}</div>` +
    hallazgos.map(h => `
      <div class="card gu-res">
        <div class="gu-origen">${h.origen}</div>
        ${tarjetaBloque(h.bloque, busqueda)}
      </div>`).join('');
}

function limpiarBusqueda(){
  const input = document.getElementById('guBuscar');
  input.value = '';
  buscar('');
  input.focus();
}


/* ================= SPEECH DE LLAMADA ================= */

function renderLlamada(){
  const cont = document.getElementById('guLlamada');
  if (!cont) return;

  const botones = document.getElementById('guLlamadaMarca');
  if (botones) botones.innerHTML = Object.keys(EMPRESAS).map(m =>
    `<button class="gu-subtab ${m === marcaElegida ? 'on' : ''}" onclick="elegirMarca('${m}')">${m}</button>`).join('');

  cont.innerHTML = PASOS_LLAMADA.map(p => `
    <div class="card gu-paso">
      <div class="gu-paso-head">
        <span class="gu-paso-num">${p.n}</span>
        <div>
          <h3 class="gu-paso-titulo">${p.titulo}</h3>
          ${p.bajada ? `<div class="gu-paso-bajada">${p.bajada}</div>` : ''}
        </div>
      </div>
      ${p.bloques.map(b => tarjetaBloque(Object.assign({}, b, { texto: conEmpresa(b.texto, marcaElegida) }), '')).join('')}
      ${p.nota ? `<div class="gu-nota"><b>Tener en cuenta:</b> ${p.nota}</div>` : ''}
    </div>`).join('');
}


/* ================= COPIAR ================= */

function copiarSpeech(btn){
  const bloque = btn.closest('.gu-bloque');
  const texto  = bloque.querySelector('.gu-raw').value;
  navigator.clipboard.writeText(texto).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Copiado';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('ok'); }, 1800);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const regla = document.getElementById('guRegla');
  if (regla) regla.textContent = REGLA_GENERAL;
  armarVariantesEmpresa();
  renderTabs();
  renderWpp();
  renderLlamada();
});
