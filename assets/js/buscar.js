/* =========================================================
   BUSCADOR DE LA HOME
   ---------------------------------------------------------
   Busca en lo que ya está cargado en el Hub, leyendo los mismos
   archivos de datos que usa cada sección:
     personas (Internos), sucursales, talleres, modelos, guiones,
     cambios recientes / importante hoy y las secciones del menú.

   No hay una lista aparte para mantener: si se agrega algo en una
   sección, el buscador ya lo encuentra.
   No hace falta tocar este archivo.
   ========================================================= */

const BU_MAX_POR_GRUPO = 5;

/* Archivos de datos que se leen y qué listas tomar de cada uno */
const BU_ARCHIVOS = [
  { archivo: 'assets/js/sucursales.js',        listas: ['SUCURSALES'] },
  { archivo: 'assets/js/taller.js',            listas: ['TALLERES'] },
  { archivo: 'assets/js/productos-modelos.js', listas: ['MARCAS_PM'] },
  { archivo: 'assets/js/guiones-datos.js',     listas: ['SPEECHES_WPP'] }
];

let indiceBU = null;        // lista de { grupo, icono, titulo, sub, extra, href, texto }
let cargandoBU = null;
let resultadosBU = [];
let activoBU = 0;

function normalBU(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }


/* ========== Lectura de datos ==========
   Cada archivo se lee como texto y se ejecuta aparte, con un "document"
   de mentira, para sacar solo sus listas sin dibujar nada en la home. */

async function leerArchivoBU(a){
  const r = await fetch(a.archivo + '?v=' + HUB.version);
  const codigo = await r.text();
  const falso = { addEventListener(){}, getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; } };
  const devolver = a.listas.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : []`).join(', ');
  return new Function('document', 'window', codigo + '\n;return {' + devolver + '};')(falso, falso);
}

function cargarIndiceBU(){
  if (cargandoBU) return cargandoBU;
  cargandoBU = (async () => {
    const datos = {};
    await Promise.all(BU_ARCHIVOS.map(a => leerArchivoBU(a).then(d => Object.assign(datos, d)).catch(() => {})));
    indiceBU = armarIndiceBU(datos);
    // Internos y cambios llegan del servidor: se suman cuando están
    await Promise.all([sumarInternosBU(), sumarCambiosBU()]);
    return indiceBU;
  })();
  return cargandoBU;
}

function item(grupo, icono, titulo, sub, href, extra, masTexto){
  return { grupo, icono, titulo, sub: sub || '', href, extra: extra || '',
           texto: normalBU([titulo, sub, extra, masTexto].join(' ')), tituloN: normalBU(titulo) };
}

function armarIndiceBU(d){
  const lista = [];

  HUB.nav.filter(n => n.href).forEach(n =>
    lista.push(item('Secciones', n.icon, n.label, 'Sección del Hub', n.href)));

  (d.SUCURSALES || []).forEach(s =>
    lista.push(item('Sucursales', '📍', s.nombre, [s.direccion, s.zona].filter(Boolean).join(' · '),
      'sucursales.html', s.telefono ? '☎ ' + s.telefono : '', (s.marcas || []).join(' ') + ' ' + (s.gerente || ''))));

  (d.TALLERES || []).forEach(t =>
    lista.push(item('Talleres', '🔧', t.nombre, [t.direccion, (t.marcas || []).join(', ')].filter(Boolean).join(' · '),
      'taller-postventa.html', '', 'taller ' + (t.recepcionistas || []).join(' ') + ' ' + (t.jefe || ''))));

  (d.MARCAS_PM || []).forEach(m => {
    const vistos = {};
    (m.planes || []).forEach(p => {
      const nombres = p.modelos.filter(x => !/^(resto|todos)/i.test(x))
        .concat(p.incluye ? p.incluye.split(',') : []).map(x => x.trim()).filter(Boolean);
      nombres.forEach(n => {
        if (vistos[n]) return;
        vistos[n] = 1;
        lista.push(item('Modelos', '🚗', n, m.marca + ' · garantía ' + (m.garantia || ''),
          'productos-modelos.html?q=' + encodeURIComponent(n), '', m.marca + ' modelo service'));
      });
    });
  });

  (d.SPEECHES_WPP || []).forEach(g =>
    lista.push(item('Guiones', '💬', g.titulo, 'Speech de WhatsApp · ' + (g.tab || ''),
      'guiones.html?q=' + encodeURIComponent(g.titulo), '', 'guion speech')));

  return lista;
}

async function sumarInternosBU(){
  let sucs = null;
  try { sucs = JSON.parse(localStorage.getItem('cxhub-internos') || 'null'); } catch(e){}
  if (!sucs){
    try {
      const res = await (await fetch(HUB.api + '?action=internos&t=' + Date.now())).json();
      if (res.ok){ sucs = res.datos.sucursales; try { localStorage.setItem('cxhub-internos', JSON.stringify(sucs)); } catch(e){} }
    } catch(e){}
  }
  (sucs || []).forEach(s => s.personas.forEach(p =>
    indiceBU.push(item('Personas', '📞', p.nombre, [p.cargo, s.nombre].filter(Boolean).join(' · '),
      'internos.html?q=' + encodeURIComponent(p.nombre), p.interno ? 'int. ' + p.interno : '',
      [p.area, p.cel, p.mail, p.nota].join(' ')))));
}

async function sumarCambiosBU(){
  let d = null;
  try { d = JSON.parse(localStorage.getItem('cxhub-contenidos') || 'null'); } catch(e){}
  if (!d) return;
  (d.importantes || []).filter(o => !o.vence || o.vence >= hoyBU()).forEach(o =>
    indiceBU.push(item('Cambios', '⚠️', o.titulo, 'Importante hoy · ' + o.texto, 'cambios-recientes.html?q=' + encodeURIComponent(o.titulo))));
  (d.cambios || []).forEach(o =>
    indiceBU.push(item('Cambios', '🔁', o.titulo, (o.tipo || 'Cambio') + ' · ' + o.texto, 'cambios-recientes.html?q=' + encodeURIComponent(o.titulo))));
}

function hoyBU(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}


/* ========== Búsqueda ========== */

const BU_ORDEN = ['Personas', 'Sucursales', 'Talleres', 'Modelos', 'Guiones', 'Cambios', 'Secciones'];

function buscarBU(texto){
  const palabras = normalBU(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) return [];
  const q = palabras.join(' ');
  const hallados = indiceBU
    .filter(x => palabras.every(p => x.texto.indexOf(p) >= 0))
    .map(x => ({ x, puntos: x.tituloN.startsWith(q) ? 0 : x.tituloN.indexOf(q) >= 0 ? 1 : palabras.every(p => x.tituloN.indexOf(p) >= 0) ? 2 : 3 }))
    .sort((a, b) => a.puntos - b.puntos);
  // Primero el grupo que mejor coincide por título (ej: "carrasco" → la sucursal antes que las personas)
  const porGrupo = {}, mejor = {};
  hallados.forEach(h => {
    (porGrupo[h.x.grupo] = porGrupo[h.x.grupo] || []).push(h.x);
    if (mejor[h.x.grupo] === undefined) mejor[h.x.grupo] = h.puntos;
  });
  return BU_ORDEN.filter(g => porGrupo[g])
    .sort((a, b) => mejor[a] - mejor[b] || BU_ORDEN.indexOf(a) - BU_ORDEN.indexOf(b))
    .map(g => ({ grupo: g, items: porGrupo[g].slice(0, BU_MAX_POR_GRUPO) }));
}


/* ========== Pantalla ========== */

async function alEscribirBU(texto){
  const caja = document.getElementById('buResultados');
  if (!texto.trim()){ caja.hidden = true; return; }
  if (!indiceBU){
    caja.hidden = false;
    caja.innerHTML = '<div class="bu-vacio">Buscando…</div>';
    await cargarIndiceBU();
    if (document.getElementById('hubBuscar').value !== texto) return;   // ya escribió otra cosa
  }
  const grupos = buscarBU(texto);
  resultadosBU = grupos.flatMap(g => g.items);
  activoBU = 0;
  if (!resultadosBU.length){
    caja.innerHTML = '<div class="bu-vacio">No encontré nada con “' + escaparHTML(texto) + '”.</div>';
    caja.hidden = false;
    return;
  }
  let n = 0;
  caja.innerHTML = grupos.map(g => `
    <div class="bu-grupo">${g.grupo}</div>
    ${g.items.map(x => `
      <a class="bu-item ${n === 0 ? 'on' : ''}" data-n="${n++}" href="${escaparHTML(x.href)}">
        <span class="bu-ic">${x.icono}</span>
        <span class="bu-txt"><b>${escaparHTML(x.titulo)}</b><span>${escaparHTML(x.sub)}</span></span>
        ${x.extra ? `<span class="bu-extra">${escaparHTML(x.extra)}</span>` : ''}
      </a>`).join('')}`).join('');
  caja.hidden = false;
}

function moverBU(paso){
  if (!resultadosBU.length) return;
  activoBU = (activoBU + paso + resultadosBU.length) % resultadosBU.length;
  document.querySelectorAll('#buResultados .bu-item').forEach(a => a.classList.toggle('on', +a.dataset.n === activoBU));
  const a = document.querySelector('#buResultados .bu-item.on');
  if (a) a.scrollIntoView({ block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('hubBuscar');
  if (!input) return;
  const caja = document.getElementById('buResultados');

  input.addEventListener('input', () => alEscribirBU(input.value));
  input.addEventListener('focus', () => { cargarIndiceBU(); if (input.value.trim()) caja.hidden = false; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); moverBU(1); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); moverBU(-1); }
    else if (e.key === 'Enter' && resultadosBU[activoBU]){ location.href = resultadosBU[activoBU].href; }
    else if (e.key === 'Escape'){ caja.hidden = true; input.blur(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.bu-wrap')) caja.hidden = true; });

  // "/" en cualquier lado de la home lleva al buscador
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); input.focus(); }
  });

  // Desde "Buscar" del menú (index.html#buscar)
  if (location.hash === '#buscar') input.focus();
  window.addEventListener('hashchange', () => { if (location.hash === '#buscar') input.focus(); });
});
