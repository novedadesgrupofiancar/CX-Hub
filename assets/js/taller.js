/* =========================================================
   TALLER Y POSTVENTA
   ---------------------------------------------------------
   PARA AGREGAR O EDITAR UN TALLER:
   Tocá solamente la lista TALLERES de acá abajo.
   No hace falta abrir el HTML.

   horarios: se escriben como pares [desde, hasta] en formato 24hs.
             Un par = jornada corrida. Dos pares = con corte de mediodía.
             Los tres talleres trabajan de lunes a viernes.
   ========================================================= */

const TALLERES = [
  {
    nombre: 'BOR Carrasco',
    color: '#2f6fed',
    direccion: 'Av. Giannattasio esq. Tacuarí',
    referencia: 'Frente al Puente de las Américas',
    horarios: [['08:30','12:30'], ['14:00','18:30']],
    marcas: ['Lynk & Co', 'Geely', 'JAC'],
    recepcionistas: ['Javier Laespiga', 'Mathias Ibañez'],
    jefe: 'Leonardo Landeira',
    capacidad: '15',
    capacidadUnidad: 'autos por día'
  },
  {
    nombre: 'Taller Rondeau',
    color: '#1fa971',
    direccion: 'Av. Rondeau 2165 esq. Colombia',
    referencia: '',
    horarios: [['08:00','18:15']],
    marcas: ['Fiat', 'Lynk & Co', 'Geely', 'JAC', 'Chevrolet'],
    recepcionistas: ['Luciara Sosa', 'Lucero Alamos'],
    jefe: 'Fernando Rodríguez',
    capacidad: '70',
    capacidadUnidad: 'horas por día',
    capacidadNota: 'Se calculan automáticamente en Xtaller'
  },
  {
    nombre: 'Chevrolet Montevideo',
    color: '#f2a93b',
    direccion: 'Av. Giannattasio 50, Ciudad de la Costa',
    referencia: 'CP 15000 · Departamento de Canelones',
    horarios: [['08:30','12:30'], ['14:00','18:30']],
    marcas: ['Chevrolet'],
    recepcionistas: ['Diego Del Valle', 'Fernando Viera'],
    jefe: 'Daniel Massaferro',
    capacidad: '26',
    capacidadUnidad: 'autos por día'
  }
];

/* Marcas para los filtros. El orden es el que se ve en pantalla. */
const MARCAS = ['Chevrolet', 'Fiat', 'Geely', 'Lynk & Co', 'JAC'];


/* ========== ¿Está abierto ahora? (lunes a viernes) ========== */

function minutosAhora(){
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function aMinutos(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function estadoTaller(t){
  const d = new Date().getDay();          // 0 = domingo, 6 = sábado
  if (d === 0 || d === 6) return { abierto:false, texto:'Cerrado · fin de semana' };

  const ahora = minutosAhora();
  for (const [desde, hasta] of t.horarios){
    if (ahora >= aMinutos(desde) && ahora <= aMinutos(hasta)){
      return { abierto:true, texto:'Abierto ahora' };
    }
  }
  // Si todavía no abrió el primer tramo del día
  if (ahora < aMinutos(t.horarios[0][0])){
    return { abierto:false, texto:'Abre ' + t.horarios[0][0] };
  }
  // Si está en el corte del mediodía
  if (t.horarios.length > 1 && ahora < aMinutos(t.horarios[1][0])){
    return { abierto:false, texto:'Corte · vuelve ' + t.horarios[1][0] };
  }
  return { abierto:false, texto:'Cerrado por hoy' };
}
function horarioTexto(t){
  return t.horarios.map(([a,b]) => `${a} a ${b}`).join('  ·  ');
}


/* ========== Render de las tarjetas ========== */

function renderTalleres(filtro){
  const cont = document.getElementById('listaTalleres');
  if (!cont) return;

  const visibles = TALLERES.filter(t => !filtro || t.marcas.includes(filtro));

  if (!visibles.length){
    cont.innerHTML = `<div class="ts-vacio">Ninguno de los talleres cargados atiende esa marca.</div>`;
    return;
  }

  cont.innerHTML = visibles.map(t => {
    const est = estadoTaller(t);
    const marcas = t.marcas.map(m =>
      `<span class="ts-marca ${filtro === m ? 'match' : ''}">${m}</span>`).join('');
    const nota = t.capacidadNota ? `<div class="ts-cap-nota">${t.capacidadNota}</div>` : '';
    const ref  = t.referencia ? `<div class="ts-ref">${t.referencia}</div>` : '';

    return `
    <div class="ts-card" style="--acento:${t.color}">
      <div class="ts-top">
        <h2 class="ts-nombre">${t.nombre}</h2>
        <span class="ts-estado ${est.abierto ? 'on' : 'off'}">${est.texto}</span>
      </div>

      <div class="ts-dir">
        <span class="ts-pin">📍</span>
        <div>
          <div class="ts-calle">${t.direccion}</div>
          ${ref}
        </div>
        <button class="ts-copiar" type="button"
                onclick="copiarDireccion(this, '${t.direccion.replace(/'/g, "\\'")}')">Copiar</button>
      </div>

      <div class="ts-horario">
        <span class="ts-lbl">Horario · lunes a viernes</span>
        <b>${horarioTexto(t)}</b>
      </div>

      <div class="ts-marcas">${marcas}</div>

      <div class="ts-gente">
        <div>
          <span class="ts-lbl">Recepción</span>
          ${t.recepcionistas.map(r => `<div class="ts-persona">${r}</div>`).join('')}
        </div>
        <div>
          <span class="ts-lbl">Jefe de taller</span>
          <div class="ts-persona">${t.jefe}</div>
        </div>
      </div>

      <div class="ts-cap">
        <div class="ts-cap-num">${t.capacidad}</div>
        <div class="ts-cap-txt">${t.capacidadUnidad}</div>
        ${nota}
      </div>
    </div>`;
  }).join('');
}


/* ========== Filtro por marca ========== */

let filtroActivo = '';

function renderFiltros(){
  const cont = document.getElementById('filtrosMarca');
  if (!cont) return;
  cont.innerHTML =
    `<button class="ts-chip ${!filtroActivo ? 'on' : ''}" onclick="filtrarMarca('')">Todos</button>` +
    MARCAS.map(m =>
      `<button class="ts-chip ${filtroActivo === m ? 'on' : ''}" onclick="filtrarMarca('${m}')">${m}</button>`
    ).join('');
}

function filtrarMarca(marca){
  filtroActivo = marca;
  renderFiltros();
  renderTalleres(marca);
}

function copiarDireccion(btn, texto){
  navigator.clipboard.writeText(texto).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copiado';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 1600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFiltros();
  renderTalleres('');
  // Refresca el cartel de abierto/cerrado cada minuto
  setInterval(() => renderTalleres(filtroActivo), 60000);
});
