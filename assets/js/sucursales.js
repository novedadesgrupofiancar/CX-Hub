/* =========================================================
   SUCURSALES
   ---------------------------------------------------------
   PARA AGREGAR O EDITAR UNA SUCURSAL:
   Tocá solamente la lista SUCURSALES de acá abajo.
   No hace falta abrir el HTML.

   horarios:  un par ['desde','hasta'] en formato 24hs por cada
              tipo de día. Si ese día está cerrado, poné null.
   marcas:    usá los mismos nombres que la lista MARCAS de abajo,
              si no el filtro no las encuentra.
   usados:    true si vende usados, false si no.
   taller:    true si en la misma dirección hay taller
              (los talleres se editan en taller.js).
   mapa:      link de Google Maps. Si lo dejás vacío (''),
              el botón busca la dirección en Google Maps.
   Si un dato no aplica, dejalo vacío ('') y no se muestra.
   ========================================================= */

const SUCURSALES = [
  {
    nombre: 'Rondeau',
    color: '#1fa971',
    direccion: 'Av. Rondeau 2165 esq. Colombia',
    referencia: '',
    zona: 'Aguada, Montevideo',
    horarios: { lunesAViernes: ['09:00','18:00'], sabado: null, domingo: null },
    marcas: ['Fiat', 'Geely', 'JAC Auto', 'Lynk & Co'],
    usados: true,
    telefono: '2924 7575',
    whatsapp: '093 407 568',
    mail: 'info@grupofiancar.com',
    gerente: 'Dario Amigo',
    mapa: 'https://maps.app.goo.gl/pRwXiiVvuzRBPmBe8',
    taller: true
  },
  {
    nombre: 'Lynk & Co',
    color: '#0f1b3d',
    direccion: 'Av. Gral. Rondeau 1878',
    referencia: '',
    zona: 'Aguada, Montevideo',
    horarios: { lunesAViernes: ['09:00','18:00'], sabado: null, domingo: null },
    marcas: ['Lynk & Co', 'Geely'],
    usados: false,
    telefono: '2924 7575',
    whatsapp: '093 407 568',
    mail: 'info@grupofiancar.com',
    gerente: 'Monica Rodriguez',
    mapa: '',
    taller: false
  },
  {
    nombre: 'Carrasco',
    color: '#2f6fed',
    direccion: 'Av. Giannattasio esq. Tacuarí',
    referencia: 'Frente al Puente de las Américas',
    zona: 'Carrasco, Montevideo',
    horarios: { lunesAViernes: ['09:00','18:00'], sabado: null, domingo: null },
    marcas: ['Fiat', 'JAC Auto', 'Geely'],
    usados: false,
    telefono: '2924 7575',
    whatsapp: '093 407 568',
    mail: 'info@grupofiancar.com',
    gerente: 'Eduardo Amigo',
    mapa: 'https://maps.app.goo.gl/moHJftnngmFLmrxf9',
    taller: true
  },
  {
    nombre: 'Chevrolet Montevideo',
    color: '#f2a93b',
    direccion: 'Av. Giannattasio 50, Ciudad de la Costa',
    referencia: 'Frente al Puente de las Américas',
    zona: 'Ciudad de la Costa, Canelones',
    horarios: { lunesAViernes: ['09:00','18:00'], sabado: null, domingo: null },
    marcas: ['Chevrolet'],
    usados: true,
    telefono: '2604 1632',
    whatsapp: '094 133 570',
    mail: 'chevmon@grupofiancar.com',
    gerente: 'Eduardo Amigo',
    mapa: 'https://maps.app.goo.gl/5fjE4YvcQiJaAqfE7',
    taller: true
  },
  {
    nombre: 'Shopping de Autos',
    color: '#8b5cf6',
    direccion: 'Ruta Interbalnearia km 22.500',
    referencia: '',
    zona: 'Canelones',
    horarios: { lunesAViernes: ['10:00','20:00'], sabado: ['10:00','20:00'], domingo: ['10:00','20:00'] },
    marcas: ['JAC Camiones', 'JAC Auto', 'Geely'],
    usados: true,
    telefono: '0800 345 1473',
    whatsapp: '094 442 299',
    mail: 'holashoppingdeautos@grupofiancar.com',
    gerente: 'Fabian Radzinski',
    mapa: 'https://maps.app.goo.gl/wEpQv5Lkp3WN7gR68',
    taller: false
  },
  {
    nombre: 'Punta del Este',
    color: '#2fb8c4',
    direccion: 'Av. Roosevelt parada 8 y Oslo',
    referencia: '',
    zona: 'Punta del Este, Maldonado',
    horarios: { lunesAViernes: ['09:00','18:00'], sabado: null, domingo: null },
    marcas: ['Geely', 'JAC Auto', 'Lynk & Co', 'Fiat'],
    usados: false,
    telefono: '4244 7205',
    whatsapp: '096 424 539',
    mail: '',
    gerente: 'Maria Bensich',
    mapa: 'https://maps.app.goo.gl/K2KjFmeCn7P66sWJ9',
    taller: false
  }
];

/* Botones del filtro. El orden es el que se ve en pantalla.
   "Usados" es especial: filtra por usados: true. */
const MARCAS = ['Chevrolet', 'Fiat', 'Geely', 'Lynk & Co', 'JAC Auto', 'JAC Camiones', 'Usados'];

/* Concesionarios del interior: cada marca tiene su página
   con filtro por departamento. */
const INTERIOR = [
  { marca: 'Geely',        web: 'geely.com.uy',   url: 'https://geely.com.uy/concesionarios/' },
  { marca: 'JAC Camiones', web: 'jac.com.uy',     url: 'https://jac.com.uy/concesionarios' },
  { marca: 'JAC Auto',     web: 'jacauto.com.uy', url: 'https://jacauto.com.uy/concesionarios' }
];


/* =========================================================
   DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA
   ========================================================= */

/* ========== ¿Está abierto ahora? ========== */

function aMinutos(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function horarioDeHoy(s){
  const d = new Date().getDay();          // 0 = domingo, 6 = sábado
  if (d === 0) return s.horarios.domingo;
  if (d === 6) return s.horarios.sabado;
  return s.horarios.lunesAViernes;
}
function estadoSucursal(s){
  const h = horarioDeHoy(s);
  if (!h) return { abierto:false, texto:'Cerrado hoy' };
  const d = new Date();
  const ahora = d.getHours() * 60 + d.getMinutes();
  if (ahora < aMinutos(h[0])) return { abierto:false, texto:'Abre ' + h[0] };
  if (ahora > aMinutos(h[1])) return { abierto:false, texto:'Cerrado por hoy' };
  return { abierto:true, texto:'Abierto · hasta ' + h[1] };
}


/* ========== Textos de horario ========== */

function mismoHorario(a, b){
  return (!a && !b) || (a && b && a[0] === b[0] && a[1] === b[1]);
}
function tramo(h){ return h ? `${h[0]} a ${h[1]}` : 'cerrado'; }

/* Devuelve filas [día, horario] para la tarjeta */
function filasHorario(s){
  const { lunesAViernes:lv, sabado:sa, domingo:do_ } = s.horarios;
  if (mismoHorario(lv, sa) && mismoHorario(lv, do_)) return [['Todos los días', tramo(lv)]];
  const filas = [['Lun a vie', tramo(lv)]];
  if (mismoHorario(sa, do_)) filas.push(['Sáb y dom', tramo(sa)]);
  else { filas.push(['Sábado', tramo(sa)]); filas.push(['Domingo', tramo(do_)]); }
  return filas;
}

/* Horario en una frase, para la ficha de WhatsApp */
function horarioFrase(s){
  const { lunesAViernes:lv, sabado:sa, domingo:do_ } = s.horarios;
  if (mismoHorario(lv, sa) && mismoHorario(lv, do_)) return `Todos los días de ${lv[0]} a ${lv[1]} hs.`;
  let t = lv ? `Lunes a viernes de ${lv[0]} a ${lv[1]} hs.` : '';
  if (sa && mismoHorario(sa, do_)) t += ` Sábados y domingos de ${sa[0]} a ${sa[1]} hs.`;
  else {
    if (sa) t += ` Sábados de ${sa[0]} a ${sa[1]} hs.`;
    if (do_) t += ` Domingos de ${do_[0]} a ${do_[1]} hs.`;
  }
  return t.trim();
}

function linkMapa(s){
  return s.mapa || 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${s.direccion}, ${s.zona}, Uruguay`);
}


/* ========== Ficha lista para pegar en WhatsApp ========== */

function fichaWhatsapp(s){
  const lineas = [
    // Chevrolet Montevideo se presenta con su nombre, sin "Grupo Fiancar"
    s.nombre.startsWith('Chevrolet') ? `*${s.nombre}*` : `*Grupo Fiancar — ${s.nombre}*`,
    `📍 ${s.direccion}${s.zona ? ' (' + s.zona + ')' : ''}`,
    s.referencia ? `   ${s.referencia}` : '',
    `🕘 ${horarioFrase(s)}`,
    s.telefono ? `📞 ${s.telefono}` : '',
    s.whatsapp ? `📱 WhatsApp: ${s.whatsapp}` : '',
    `🗺️ ${linkMapa(s)}`
  ];
  return lineas.filter(Boolean).join('\n');
}


/* ========== Render de las tarjetas ========== */

function filaContacto(icono, etiqueta, valor){
  if (!valor) return '';
  return `
    <div class="su-contacto">
      <span class="su-c-ic">${icono}</span>
      <div class="su-c-txt"><span class="ts-lbl">${etiqueta}</span><b>${valor}</b></div>
      <button class="ts-copiar" type="button" data-copiar="${valor}" onclick="copiarDato(this)">Copiar</button>
    </div>`;
}

function renderSucursales(filtro){
  const cont = document.getElementById('listaSucursales');
  if (!cont) return;

  const visibles = SUCURSALES
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => !filtro || (filtro === 'Usados' ? s.usados : s.marcas.includes(filtro)));

  if (!visibles.length){
    cont.innerHTML = `<div class="ts-vacio">Ninguna sucursal de Montevideo o Punta del Este vende esa marca.
      Revisá los concesionarios del interior, más abajo.</div>`;
    return;
  }

  cont.innerHTML = visibles.map(({ s, i }) => {
    const est = estadoSucursal(s);
    const marcas = s.marcas.map(m =>
      `<span class="ts-marca ${filtro === m ? 'match' : ''}">${m}</span>`).join('') +
      (s.usados ? `<span class="ts-marca su-usados ${filtro === 'Usados' ? 'match' : ''}">Usados</span>` : '');
    const ref = s.referencia ? `<div class="ts-ref">${s.referencia}</div>` : '';
    const zona = `<div class="su-zona">${s.zona || ''}</div>`;
    const horario = filasHorario(s).map(([d, h]) =>
      `<div class="su-h-fila"><span>${d}</span><b class="${h === 'cerrado' ? 'su-cerrado' : ''}">${h}</b></div>`).join('');
    const taller = s.taller
      ? `<a class="su-taller si" href="taller-postventa.html">🔧 Tiene taller · ver Taller y Postventa →</a>`
      : `<div class="su-taller no">Sin taller en esta sucursal</div>`;

    return `
    <div class="ts-card su-card" style="--acento:${s.color}">
      <div class="su-top">
        <h2 class="ts-nombre">${s.nombre}</h2>
        <div class="su-sub">
          ${zona}
          <span class="ts-estado ${est.abierto ? 'on' : 'off'}">${est.texto}</span>
        </div>
      </div>

      <div class="ts-dir">
        <span class="ts-pin">📍</span>
        <div>
          <div class="ts-calle">${s.direccion}</div>
          ${ref}
        </div>
        <div class="su-dir-btns">
          <button class="ts-copiar" type="button" data-copiar="${s.direccion}" onclick="copiarDato(this)">Copiar</button>
          <a class="ts-copiar su-mapa" href="${linkMapa(s)}" target="_blank" rel="noopener">Mapa</a>
        </div>
      </div>

      <div class="su-horario">${horario}</div>

      <div class="ts-marcas">${marcas}</div>

      <div class="su-contactos">
        ${filaContacto('📞', 'Teléfono', s.telefono)}
        ${filaContacto('📱', 'WhatsApp', s.whatsapp)}
        ${filaContacto('✉️', 'Mail', s.mail)}
      </div>

      ${s.gerente ? `<div class="su-gerente"><span class="ts-lbl">Gerente</span><div class="ts-persona">${s.gerente}</div></div>` : ''}

      <div class="su-pie">
        ${taller}
        <a class="su-taller si" href="internos.html?sucursal=${encodeURIComponent(s.nombre)}">📞 Ver internos de esta sucursal →</a>
        <button class="su-ficha" type="button" onclick="copiarFicha(this, ${i})">📋 Copiar ficha para WhatsApp</button>
      </div>
    </div>`;
  }).join('');
}

function renderInterior(){
  const cont = document.getElementById('listaInterior');
  if (!cont) return;
  cont.innerHTML = INTERIOR.map(x => `
    <a class="ts-tarifa" target="_blank" rel="noopener" href="${x.url}">
      <b>${x.marca}</b><span>${x.web} →</span></a>`).join('');
}


/* ========== Filtro por marca ========== */

let filtroActivo = '';

function renderFiltros(){
  const cont = document.getElementById('filtrosMarca');
  if (!cont) return;
  cont.innerHTML =
    `<button class="ts-chip ${!filtroActivo ? 'on' : ''}" onclick="filtrarMarca(-1)">Todas</button>` +
    MARCAS.map((m, i) =>
      `<button class="ts-chip ${filtroActivo === m ? 'on' : ''}" onclick="filtrarMarca(${i})">${m}</button>`
    ).join('');
}

function filtrarMarca(i){
  filtroActivo = i < 0 ? '' : MARCAS[i];
  renderFiltros();
  renderSucursales(filtroActivo);
}


/* ========== Copiar ========== */

function avisarCopiado(btn, texto){
  navigator.clipboard.writeText(texto).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Copiado';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('ok'); }, 1600);
  });
}
function copiarDato(btn){ avisarCopiado(btn, btn.dataset.copiar); }
function copiarFicha(btn, i){ avisarCopiado(btn, fichaWhatsapp(SUCURSALES[i])); }


document.addEventListener('DOMContentLoaded', () => {
  renderFiltros();
  renderSucursales('');
  renderInterior();
  // Refresca el cartel de abierto/cerrado cada minuto
  setInterval(() => renderSucursales(filtroActivo), 60000);
});
