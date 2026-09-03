// ===================== STATE =====================
let DATA = { agentes:null, cola:null, rendimiento:null, abandonadas:null, salientes_summary:null, meta:{ period:'', loadedFiles:{} } };
let AGG = null;

// EXCLUSIONES — se comparan por número de interno, no por nombre.
// Nunca se muestran, en ningún reporte (extensiones de sistema y otras áreas):
//   8200 Call Center · 1001 Call Center · 8001 Belen Lomazzi · 4124 Matias Diaz
const EXCLUIR_SIEMPRE = ['8200','1001','8001','4124'];

// Fuera solo de ESTE reporte (en otros reportes pueden aparecer):
//   7998 Shoanna Silvera
const EXCLUIR_ESTE_REPORTE = ['7998'];

// SALIENTES — lista blanca: solo estos internos entran en el reporte de salientes.
//   1135 Piero · 7994 Melanie · 7995 Sabrina · 7996 Natasha
//   7997 Isabel · 7998 Shoanna · 8003 Alvaro · 8004 Damian
const SALIENTES_AGENTES = ['1135','7994','7995','7996','7997','7998','8003','8004'];

const EXCLUIDOS = EXCLUIR_SIEMPRE.concat(EXCLUIR_ESTE_REPORTE);
function excluido(agente){ return EXCLUIDOS.includes(getExt(agente)); }

// OBJETIVOS — editables. Definen el color de los KPI y qué entra en cada panel.
const OBJETIVOS = { atencion: 90, no_atendidas: 10, tmo_seg: 165 };

const ICO = ['#4A7DF5','#22B573','#F5A623','#8B5CF6','#14B8C4','#EC4899','#F97316','#EF4444'];
const tint = h => h + '1F';

// ===================== FORMATO es-UY =====================
function nInt(n){ return Math.round(n||0).toLocaleString('es-UY'); }
function nDec(n,d){ d = d===undefined?2:d; return (n||0).toLocaleString('es-UY',{minimumFractionDigits:d,maximumFractionDigits:d}); }
function nPct(n,d){ return nDec(n, d===undefined?1:d) + '\u00A0%'; }
function fmtSec(s){
  s = Math.round(s||0);
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), x = s%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');
}

// ===================== STORAGE =====================
function saveStorage(){
  try{
    localStorage.setItem('cc_data', JSON.stringify({
      agentes:DATA.agentes, cola:DATA.cola, rendimiento:DATA.rendimiento,
      abandonadas_summary:DATA.abandonadas_summary||null,
      salientes_summary:DATA.salientes_summary||null, meta:DATA.meta
    }));
  }catch(e){ console.warn('Storage failed',e); }
}
function loadStorage(){
  try{
    const s = localStorage.getItem('cc_data'); if(!s) return false;
    const d = JSON.parse(s);
    DATA.agentes=d.agentes; DATA.cola=d.cola; DATA.rendimiento=d.rendimiento;
    DATA.abandonadas_summary=d.abandonadas_summary; DATA.salientes_summary=d.salientes_summary||null;
    DATA.meta=d.meta||{period:'',loadedFiles:{}};
    return true;
  }catch(e){ return false; }
}

// ===================== SINCRONIZACIÓN (Google Apps Script) =====================
const API_URL = 'https://script.google.com/macros/s/AKfycbyUo2pp_9tUR-MmKwWtNykT-sgx0HOuKKj2P_bVu2o1zLWZKypERQfvipXZK2QlIeRO/exec';
const ADMIN_KEY = new URLSearchParams(location.search).get('admin') || '';
const IS_ADMIN = ADMIN_KEY !== '';

function setSync(t){ const e=document.getElementById('syncTag'); if(e) e.textContent=t; }
function fmtFecha(iso){
  try{ const d=new Date(iso);
    return d.toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});
  }catch(e){ return ''; }
}
async function cargarRemoto(){
  if(!API_URL.startsWith('http')){ setSync('Sin conectar'); return false; }
  try{
    setSync('Sincronizando…');
    const r = await fetch(API_URL+'?t='+Date.now());
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d = await r.json();
    if(!d || !d.agentes){ setSync('Sin reporte publicado'); return false; }
    DATA.agentes=d.agentes; DATA.cola=d.cola; DATA.rendimiento=d.rendimiento;
    DATA.abandonadas_summary=d.abandonadas_summary; DATA.salientes_summary=d.salientes_summary||null;
    DATA.meta=d.meta||{period:'',loadedFiles:{}};
    saveStorage(); renderAll();
    setSync(d.publicado_el ? 'Actualizado '+fmtFecha(d.publicado_el) : 'Actualizado');
    return true;
  }catch(e){ console.warn('Sync GET',e); setSync('Sin conexión · copia local'); return false; }
}
async function publicar(){
  if(!DATA.agentes||!DATA.cola){ alert('Cargá al menos los archivos 1 y 2 antes de publicar.'); return; }
  if(!confirm('Se va a publicar este reporte y lo va a ver todo el equipo. ¿Confirmás?')) return;
  const payload = { token:ADMIN_KEY, data:{
    agentes:DATA.agentes, cola:DATA.cola, rendimiento:DATA.rendimiento,
    abandonadas_summary:DATA.abandonadas_summary||null,
    salientes_summary:DATA.salientes_summary||null, meta:DATA.meta }};
  try{
    setSync('Publicando…');
    const r = await fetch(API_URL,{ method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload) });
    const res = await r.json();
    if(res.ok){ toast('Publicado · ya lo ve todo el equipo'); setSync('Actualizado '+fmtFecha(new Date().toISOString())); }
    else { alert('No se pudo publicar: '+(res.error||'error desconocido')); setSync('Error al publicar'); }
  }catch(e){ alert('No se pudo publicar: '+e.message); setSync('Error al publicar'); }
}

// ===================== UTILS =====================
function parseTimeToSec(t){
  if(!t||t==='00:00:00') return 0;
  const p = String(t).split(':');
  if(p.length===3) return (+p[0])*3600+(+p[1])*60+(+p[2]);
  if(p.length===2) return (+p[0])*60+(+p[1]);
  return parseFloat(t)||0;
}
function parsePctStr(s){ if(typeof s==='number') return s; if(!s) return 0; return parseFloat(String(s).replace('%','').trim())||0; }
function badgePct(p){ return p>=85?'g':p>=70?'a':'r'; }
function colorPct(p){ return p>=85?'var(--green)':p>=70?'var(--amber)':'var(--red)'; }
function colorTmo(t){ return t<=OBJETIVOS.tmo_seg?'var(--green)':t<=OBJETIVOS.tmo_seg*1.2?'var(--amber)':'var(--red)'; }
function shortName(f){ return String(f).replace(/^\d+\s+/,'').trim(); }
function getExt(f){ const m=String(f).match(/^(\d+)/); return m?m[1]:''; }
function shortQueue(q){ return String(q).replace(/^\d+\s*-?\s*/,'').trim(); }

// ===================== CSV =====================
function handleCSV(event,type){
  const file = event.target.files[0]; if(!file) return;
  Papa.parse(file,{ header:true, skipEmptyLines:true, encoding:'UTF-8',
    transformHeader:h=>String(h).replace(/^\uFEFF/,'').trim(),
    complete:(res)=>{
      if(type==='salientes'){
        // Se resume en el momento: al servidor solo viajan 8 filas, nunca el detalle
        DATA.salientes_summary = resumirSalientes(res.data);
      } else {
        DATA[type]=res.data;
      }
      DATA.meta.loadedFiles[type]=file.name; saveStorage();
      const map={agentes:1,cola:2,rendimiento:3,abandonadas:4,salientes:5};
      document.getElementById('up_'+map[type]).classList.add('loaded');
      document.getElementById('file_'+map[type]).textContent = file.name;
      updateDMStatus();
      if(type==='salientes') renderSalientes();
      if(DATA.agentes && DATA.cola) renderAll();
    },
    error:(err)=>alert('Error leyendo el CSV: '+err.message)
  });
}
function updateDMStatus(){
  const c = Object.keys(DATA.meta.loadedFiles||{}).length;
  const e = document.getElementById('dmStatus'); if(!e) return;
  e.textContent = c===0?'Esperando archivos…' : c<5?(c+' de 5 archivos cargados'):'Todos los archivos cargados';
}
function applyData(){ renderAll(); toast('Dashboard actualizado'); }
function clearData(){
  if(!confirm('¿Limpiar todos los datos?')) return;
  localStorage.removeItem('cc_data');
  DATA = { agentes:null,cola:null,rendimiento:null,abandonadas:null,salientes_summary:null,meta:{period:'',loadedFiles:{}} };
  location.reload();
}
function toggleDM(){
  const s=document.getElementById('dmCard');
  s.style.display = s.style.display==='none'?'block':'none';
  if(s.style.display==='block') s.scrollIntoView({behavior:'smooth'});
}

// ===================== AGGREGATION =====================
function aggregate(){
  if(!DATA.agentes) return null;
  const rows = DATA.agentes.filter(r=>r.Queue && r.Queue!=='Totals' && r.Agent && !excluido(r.Agent));
  const agents = {};
  rows.forEach(r=>{
    const name = r.Agent;
    if(!agents[name]) agents[name] = { name:shortName(name), ext:getExt(name), full:name, calls:0,
      talk_sec:0, ring_sec:0, logged_sec:0, queues:new Set(), pct_weighted_num:0, pct_weighted_den:0 };
    const a = agents[name];
    const calls = parseInt(r['Calls Answered'])||0;
    a.calls += calls;
    a.talk_sec += parseTimeToSec(r['Talk Time Total']);
    a.ring_sec += parseTimeToSec(r['Ring Time Total']);
    a.logged_sec += parseTimeToSec(r['Total Logged In Time']);
    a.queues.add(r.Queue);
    const pct = parsePctStr(r['% Calls Serviced']);
    a.pct_weighted_num += pct*calls; a.pct_weighted_den += calls;
  });
  Object.values(agents).forEach(a=>{
    a.tmo_sec = a.calls>0 ? a.talk_sec/a.calls : 0;
    a.pct = a.pct_weighted_den>0 ? a.pct_weighted_num/a.pct_weighted_den : 0;
    a.per_hour = a.logged_sec>0 ? a.calls/(a.logged_sec/3600) : 0;
    a.tmo_str = fmtSec(a.tmo_sec);
    a.queues_arr = Array.from(a.queues);
  });
  let queues = [];
  if(DATA.cola){
    queues = DATA.cola.filter(r=>r.Queue && r.Queue!=='Totals').map(r=>({
      name:r.Queue, short:shortQueue(r.Queue),
      agents:parseInt(r['Agents in Team'])||0,
      received:parseInt(r['Number of Calls Received'])||0,
      served:parseInt(r['Number of Calls Serviced'])||0,
      unanswered:parseInt(r['Number of Calls Unanswered'])||0,
      total_talk_sec:parseTimeToSec(r['Total Talk Time']),
      avg_talk_sec:parseTimeToSec(r['Average Talk Time'])
    }));
    queues.forEach(q=>q.pct = q.received>0 ? (q.served/q.received)*100 : 0);
  }
  let totalReceived=0,totalServed=0,totalUnanswered=0,totalTalkSec=0,totalCalls=0;
  queues.forEach(q=>{ totalReceived+=q.received; totalServed+=q.served; totalUnanswered+=q.unanswered;
    totalTalkSec+=q.total_talk_sec; totalCalls+=q.served; });
  let totalAbandoned = 0;
  if(DATA.abandonadas && Array.isArray(DATA.abandonadas)){
    const u = new Set();
    DATA.abandonadas.forEach(r=>{ if(r.Queue && r.Queue!=='Totals' && r['Call Time']) u.add(r['Call Time']+'|'+(r['Caller ID']||'')); });
    totalAbandoned = u.size; DATA.abandonadas_summary = { unique: totalAbandoned };
  } else if(DATA.abandonadas_summary){ totalAbandoned = DATA.abandonadas_summary.unique; }
  const teamTMO = totalCalls>0 ? totalTalkSec/totalCalls : 0;
  return {
    agents: Object.values(agents).sort((a,b)=>b.calls-a.calls),
    queues: queues,
    totals: { received:totalReceived, served:totalServed, unanswered:totalUnanswered, abandoned:totalAbandoned,
      pct_attention: totalReceived>0?(totalServed/totalReceived)*100:0,
      pct_abandoned: totalReceived>0?(totalUnanswered/totalReceived)*100:0,
      tmo_sec: teamTMO, tmo_str: fmtSec(teamTMO) }
  };
}

// ===================== SALIENTES =====================
function extSaliente(r){
  let e = String(r['Caller ID']==null?'':r['Caller ID']).trim().replace(/\.0$/,'');
  if(!e){ const m = String(r['Caller Display name']||'').match(/\((\d+)\)/); e = m?m[1]:''; }
  return e;
}
function resumirSalientes(rows){
  const ag = {}; let tot=0, ans=0, talk=0;
  (rows||[]).forEach(r=>{
    const ext = extSaliente(r);
    if(!SALIENTES_AGENTES.includes(ext)) return;
    if(!ag[ext]) ag[ext] = { ext:ext, name:(String(r['Caller Display name']||'').split('(')[0].trim()||ext),
      total:0, ans:0, un:0, talk:0 };
    const a = ag[ext];
    const contestada = String(r.Status||'').trim().toLowerCase()==='answered';
    a.total++; tot++;
    if(contestada){ const t=parseTimeToSec(r.Talking); a.ans++; a.talk+=t; ans++; talk+=t; }
    else a.un++;
  });
  const lista = Object.values(ag).map(a=>({
    ext:a.ext, name:a.name, total:a.total, ans:a.ans, un:a.un,
    pct: a.total?(a.ans/a.total)*100:0, talk:a.talk, tmo: a.ans?a.talk/a.ans:0
  })).sort((x,y)=>y.total-x.total);
  return { agentes:lista, totales:{ total:tot, ans:ans, un:tot-ans,
    pct: tot?(ans/tot)*100:0, talk:talk, tmo: ans?talk/ans:0 } };
}

function renderSalientes(){
  const s = DATA.salientes_summary;
  const sec = document.getElementById('secSalientes');
  if(!s || !s.agentes || !s.agentes.length){ sec.style.display='none'; return; }
  sec.style.display='block';
  const t = s.totales;
  document.getElementById('salKpis').innerHTML = `
    <div class="card"><div class="kpi-label">Llamadas salientes</div>
      <div class="kpi-value">${nInt(t.total)}</div>
      <div class="kpi-sub"><strong>${nInt(t.ans)}</strong> contestadas · <strong>${nInt(t.un)}</strong> sin respuesta</div></div>
    <div class="card"><div class="kpi-label">% Contacto</div>
      <div class="kpi-value">${nPct(t.pct)}</div>
      <div class="kpi-sub">Contestadas / salientes</div></div>
    <div class="card"><div class="kpi-label">Sin respuesta</div>
      <div class="kpi-value">${nInt(t.un)}</div>
      <div class="kpi-sub">${nPct(100-t.pct)} del total marcado</div></div>
    <div class="card"><div class="kpi-label">Duración media</div>
      <div class="kpi-value">${fmtSec(t.tmo)}</div>
      <div class="kpi-sub">Sobre llamadas contestadas</div></div>`;
  document.getElementById('salMeta').textContent = s.agentes.length + ' agentes';
  document.getElementById('salTable').innerHTML = s.agentes.map(a=>`
    <tr data-f="${a.name.toLowerCase()} ${a.ext}">
      <td style="padding-left:12px"><div class="ag-name">${a.name}</div><div class="ag-ext">Ext ${a.ext}</div></td>
      <td class="r">${nInt(a.total)}</td>
      <td class="r">${nInt(a.ans)}</td>
      <td class="r"><span class="badge ${badgePct(a.pct)}">${nPct(a.pct)}</span>
        <span class="mini"><i style="width:${Math.min(a.pct,100)}%;background:${colorPct(a.pct)}"></i></span></td>
      <td class="r" style="color:var(--mute)">${nInt(a.un)}</td>
      <td class="r">${fmtSec(a.tmo)}</td>
      <td class="r" style="color:var(--mute);padding-right:12px">${fmtSec(a.talk)}</td>
    </tr>`).join('');
}

// ===================== RENDER =====================
function renderAll(){
  const agg = aggregate();
  if(!agg){ toast('Cargá al menos los dos primeros archivos para generar el reporte'); return; }
  AGG = agg;
  renderKPIs(agg); renderPaneles(agg); renderDonut(agg); renderBars(agg);
  renderColaTable(agg); renderRankings(agg); renderAgentTable(agg); renderSalientes(); renderInferior(agg);

  let period = (DATA.meta && DATA.meta.period) || 'PERÍODO ACTUAL';
  if(DATA.abandonadas && DATA.abandonadas.length>0 && DATA.abandonadas[0]['Call Time']){
    const m = String(DATA.abandonadas[0]['Call Time']).match(/(\d{4})-(\d{2})/);
    if(m){ const M=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
      period = M[parseInt(m[2])-1]+' '+m[1]; }
  }
  document.getElementById('periodTag').textContent = period;
  DATA.meta.period = period;
  saveStorage();
}

function renderKPIs(agg){
  const t = agg.totals;
  const okAt = t.pct_attention >= OBJETIVOS.atencion;
  const okNo = t.pct_abandoned <= OBJETIVOS.no_atendidas;
  const okTmo = t.tmo_sec <= OBJETIVOS.tmo_seg;
  document.getElementById('kpiGrid').innerHTML = `
    <div class="card">
      <div class="kpi-label">Llamadas recibidas</div>
      <div class="kpi-value">${nInt(t.received)}</div>
      <div class="kpi-sub"><strong>${nInt(t.served)}</strong> atendidas · <strong>${nInt(t.unanswered)}</strong> no</div>
    </div>
    <div class="card">
      <div class="kpi-label">% Atención</div>
      <div class="kpi-value ${okAt?'ok':'bad'}">${nPct(t.pct_attention)}</div>
      <div class="kpi-obj">Objetivo: ${nPct(OBJETIVOS.atencion,0)}</div>
    </div>
    <div class="card">
      <div class="kpi-label">% No atendidas</div>
      <div class="kpi-value ${okNo?'ok':'bad'}">${nPct(t.pct_abandoned)}</div>
      <div class="kpi-obj">Objetivo: máx. ${nPct(OBJETIVOS.no_atendidas,0)}${t.abandoned>0?' · '+nInt(t.abandoned)+' abandonadas únicas':''}</div>
    </div>
    <div class="card">
      <div class="kpi-label">TMO promedio equipo</div>
      <div class="kpi-value ${okTmo?'ok':'bad'}">${t.tmo_str}</div>
      <div class="kpi-obj">Objetivo: máx. ${fmtSec(OBJETIVOS.tmo_seg)}</div>
    </div>`;
}

function itemHTML(ico,color,name,desc){
  return `<div class="p-item">
    <div class="p-ico" style="background:${tint(color)};color:${color}">${ico}</div>
    <div class="p-txt"><div class="p-name">${name}</div><div class="p-desc">${desc}</div></div>
    <div class="p-chev">›</div></div>`;
}

function renderPaneles(agg){
  // CRÍTICO: colas por debajo del objetivo de atención
  const bajas = agg.queues.filter(q=>q.pct < OBJETIVOS.atencion).sort((a,b)=>a.pct-b.pct);
  document.getElementById('listCrit').innerHTML = bajas.length
    ? bajas.map((q,i)=>itemHTML('📉',ICO[7],q.short,
        `${nPct(q.pct)} de atención · ${nInt(q.served)} de ${nInt(q.received)} · faltan ${nInt(q.received*OBJETIVOS.atencion/100 - q.served)} llamadas`)).join('')
    : '<div class="p-empty">✅ Todas las colas alcanzan el objetivo</div>';
  document.getElementById('bellBadge').textContent = bajas.length;

  // ATENCIÓN: agentes con TMO por encima del objetivo
  const tmoAlto = agg.agents.filter(a=>a.calls>=5 && a.tmo_sec>OBJETIVOS.tmo_seg).sort((a,b)=>b.tmo_sec-a.tmo_sec);
  document.getElementById('listWarn').innerHTML = tmoAlto.length
    ? tmoAlto.map(a=>itemHTML('⏱️',ICO[2],a.name,
        `TMO ${a.tmo_str} · ${nInt(a.calls)} atendidas · ${nPct(a.pct)} de atención`)).join('')
    : '<div class="p-empty">✅ Ningún agente por encima del TMO objetivo</div>';

  // DESTACADOS: top por atendidas y mejor TMO
  const top = [...agg.agents].sort((a,b)=>b.calls-a.calls).slice(0,3);
  const mejorTmo = [...agg.agents].filter(a=>a.calls>=5).sort((a,b)=>a.tmo_sec-b.tmo_sec)[0];
  const dest = top.map((a,i)=>itemHTML(['🥇','🥈','🥉'][i],ICO[1],a.name,
      `${nInt(a.calls)} atendidas · ${nPct(a.pct)} de atención`));
  if(mejorTmo) dest.push(itemHTML('⚡',ICO[4],mejorTmo.name,`Mejor TMO del período: ${mejorTmo.tmo_str}`));
  document.getElementById('listGood').innerHTML = dest.length ? dest.join('') : '<div class="p-empty">Sin datos</div>';
}

function renderDonut(agg){
  const t = agg.totals;
  const total = t.served + t.unanswered;
  if(total===0) return;
  const pS = (t.served/total)*100, pU = (t.unanswered/total)*100;
  const r=44,cx=80,cy=80,C=2*Math.PI*r, s1=(pS/100)*C, s2=(pU/100)*C;
  const el = document.getElementById('donut');
  el.className = 'donut-wrap';
  el.innerHTML = `
    <div class="donut"><svg viewBox="0 0 160 160">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EEF1F4" stroke-width="24"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#10A05B" stroke-width="24"
        stroke-dasharray="${s1} ${C}" transform="rotate(-90 ${cx} ${cy})"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F5B32E" stroke-width="24"
        stroke-dasharray="${s2} ${C}" stroke-dashoffset="${-s1}" transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy-1}" text-anchor="middle" class="dn-c" fill="#16263D">${nDec(t.pct_attention,0)}%</text>
      <text x="${cx}" y="${cy+15}" text-anchor="middle" class="dn-s">atención</text>
    </svg></div>
    <div class="lg">
      <div class="lg-row"><span class="dot" style="background:#10A05B"></span><span class="lg-lb">Atendidas</span>
        <span class="lg-v">${nInt(t.served)}</span><span class="lg-p">${nPct(pS)}</span></div>
      <div class="lg-row"><span class="dot" style="background:#F5B32E"></span><span class="lg-lb">No atendidas</span>
        <span class="lg-v">${nInt(t.unanswered)}</span><span class="lg-p">${nPct(pU)}</span></div>
      ${t.abandoned>0?`<div class="lg-row"><span class="dot" style="background:#ED4B45"></span><span class="lg-lb">Abandonadas (únicas)</span>
        <span class="lg-v">${nInt(t.abandoned)}</span><span class="lg-p"></span></div>`:''}
    </div>`;
}

function renderBars(agg){
  if(!agg.queues.length) return;
  const max = Math.max(...agg.queues.map(q=>q.received));
  const el = document.getElementById('bars');
  el.className = 'bars';
  el.innerHTML = agg.queues.map(q=>`
    <div>
      <div class="bar-top">
        <span class="bar-nm">${q.short}</span>
        <span class="bar-st"><strong>${nInt(q.served)}</strong> / ${nInt(q.received)}
          <span style="margin-left:8px;color:${colorPct(q.pct)};font-weight:700">${nPct(q.pct,0)}</span></span>
      </div>
      <div class="bar-tr">
        <div class="bar-rc" style="width:${(q.received/max)*100}%"></div>
        <div class="bar-sv" style="width:${(q.served/max)*100}%"></div>
      </div>
    </div>`).join('');
}

function renderColaTable(agg){
  const tb = document.getElementById('colaTable');
  if(!agg.queues.length){ tb.innerHTML = '<tr><td colspan="7" class="empty">Sin datos de colas</td></tr>'; return; }
  tb.innerHTML = [...agg.queues].sort((a,b)=>b.received-a.received).map(q=>`
    <tr data-f="${q.short.toLowerCase()}">
      <td style="padding-left:12px"><strong>${q.short}</strong></td>
      <td class="r">${q.agents}</td>
      <td class="r">${nInt(q.received)}</td>
      <td class="r">${nInt(q.served)}</td>
      <td class="r"><span class="badge ${badgePct(q.pct)}">${nPct(q.pct)}</span></td>
      <td class="r" style="color:var(--mute)">${nInt(q.unanswered)}</td>
      <td class="r" style="color:var(--mute);padding-right:12px">${fmtSec(q.avg_talk_sec)}</td>
    </tr>`).join('');
}

function renderRankings(agg){
  const byCalls = [...agg.agents].sort((a,b)=>b.calls-a.calls);
  document.getElementById('rankAtt').innerHTML = byCalls.map((a,i)=>`
    <tr data-f="${a.name.toLowerCase()}">
      <td style="padding-left:12px"><span class="num-circle">${i+1}</span></td>
      <td><div class="ag-name">${a.name}</div><div class="ag-ext">${a.ext}</div></td>
      <td class="r">${nInt(a.calls)}</td>
      <td class="r" style="padding-right:12px"><span class="badge ${badgePct(a.pct)}">${nPct(a.pct,0)}</span></td>
    </tr>`).join('');
  const byTmo = agg.agents.filter(a=>a.calls>=5).sort((a,b)=>a.tmo_sec-b.tmo_sec);
  document.getElementById('rankTmo').innerHTML = byTmo.map((a,i)=>`
    <tr data-f="${a.name.toLowerCase()}">
      <td style="padding-left:12px"><span class="num-circle">${i+1}</span></td>
      <td><div class="ag-name">${a.name}</div><div class="ag-ext">${a.ext}</div></td>
      <td class="r" style="color:${colorTmo(a.tmo_sec)};font-weight:600">${a.tmo_str}</td>
      <td class="r" style="color:var(--mute);padding-right:12px">${nInt(a.calls)}</td>
    </tr>`).join('');
}

function renderAgentTable(agg){
  document.getElementById('agentTable').innerHTML = agg.agents.map(a=>`
    <tr data-f="${a.name.toLowerCase()} ${a.ext}">
      <td style="padding-left:12px"><div class="ag-name">${a.name}</div><div class="ag-ext">Ext ${a.ext} · ${a.queues_arr.length} cola(s)</div></td>
      <td class="r">${nInt(a.calls)}</td>
      <td class="r"><span class="badge ${badgePct(a.pct)}">${nPct(a.pct)}</span>
        <span class="mini"><i style="width:${Math.min(a.pct,100)}%;background:${colorPct(a.pct)}"></i></span></td>
      <td class="r" style="color:${colorTmo(a.tmo_sec)};font-weight:600">${a.tmo_str}</td>
      <td class="r" style="color:var(--mute)">${fmtSec(a.talk_sec)}</td>
      <td class="r" style="color:var(--mute)">${fmtSec(a.logged_sec)}</td>
      <td class="r" style="color:var(--mute);padding-right:12px">${nDec(a.per_hour,1)}/h</td>
    </tr>`).join('');
}

function renderInferior(agg){
  const t = agg.totals;
  const items = [
    ['📞','Recibidas',nInt(t.received)], ['✅','Atendidas',nInt(t.served)],
    ['↩️','No atendidas',nInt(t.unanswered)], ['🚪','Abandonadas',t.abandoned>0?nInt(t.abandoned):'—'],
    ['🗂️','Colas activas',agg.queues.length], ['👥','Agentes',agg.agents.length],
    ['⏱️','TMO equipo',t.tmo_str], ['⚡','Llamadas/hora',nDec(agg.agents.reduce((s,a)=>s+a.per_hour,0)/(agg.agents.length||1),1)]
  ];
  document.getElementById('resumen').innerHTML = items.map((it,i)=>`
    <div class="li"><div class="li-ico" style="background:${tint(ICO[i%8])};color:${ICO[i%8]}">${it[0]}</div>
      <div class="li-tx"><div class="li-lb">${it[1]}</div><div class="li-v">${it[2]}</div></div></div>`).join('');

  document.getElementById('topRank').innerHTML = [...agg.agents].sort((a,b)=>b.calls-a.calls).slice(0,5).map((a,i)=>`
    <div class="rank-row"><span class="num-circle">${i+1}</span><span>${a.name}</span>
      <strong style="margin-left:auto;font-variant-numeric:tabular-nums">${nInt(a.calls)}</strong></div>`).join('');

  const arch = [
    ['agentes','📊','Agente × cola',ICO[0]], ['cola','📞','Llamadas por cola',ICO[1]],
    ['rendimiento','📈','Rendimiento de cola',ICO[2]], ['abandonadas','🚪','Abandonadas',ICO[3]],
    ['salientes','📤','Llamadas salientes',ICO[4]]
  ];
  document.getElementById('archivos').innerHTML = arch.map(([k,ic,nm,col])=>{
    const ok = !!(DATA.meta.loadedFiles||{})[k];
    return `<div class="tool-row"><div class="li-ico" style="background:${tint(col)};color:${col}">${ic}</div>
      <div class="li-tx"><div style="font-weight:600">${nm}</div><div class="li-lb">${ok?'Cargado':'No cargado'}</div></div>
      <button class="pill" ${IS_ADMIN?`onclick="toggleDM()"`:'disabled'}>${ok?'Actualizar':'Cargar'}</button></div>`;
  }).join('');

  document.getElementById('defs').innerHTML = `
    <div class="def"><div class="def-n">% Atención</div><div class="def-d">Atendidas sobre recibidas. Objetivo ${nPct(OBJETIVOS.atencion,0)}.</div></div>
    <div class="def"><div class="def-n">% No atendidas</div><div class="def-d">No atendidas sobre recibidas. Máximo aceptado ${nPct(OBJETIVOS.no_atendidas,0)}.</div></div>
    <div class="def"><div class="def-n">TMO</div><div class="def-d">Talk time total dividido llamadas atendidas. Objetivo máx. ${fmtSec(OBJETIVOS.tmo_seg)}.</div></div>
    <div class="def"><div class="def-n">Por hora</div><div class="def-d">Atendidas dividido tiempo logueado.</div></div>`;
}

// ===================== INTERACCIÓN =====================
function filtrar(q){
  q = q.trim().toLowerCase();
  document.querySelectorAll('tr[data-f]').forEach(tr=>{
    tr.style.display = (!q || tr.dataset.f.includes(q)) ? '' : 'none';
  });
}
function verTodas(id,btn){
  const l = document.getElementById(id);
  l.classList.toggle('collapsed');
  btn.textContent = l.classList.contains('collapsed') ? 'Ver todas' : 'Ver menos';
}
function toast(msg){
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; },2200);
  setTimeout(()=>el.remove(),2600);
}
function renderTiles(){
  const T = [
    ['📊','Vista general',"scrollTo_('kpis')"], ['📞','Performance por cola',"scrollTo_('colas')"],
    ['🏆','Rankings',"scrollTo_('rankings')"], ['👥','Detalle por agente',"scrollTo_('agentes')"],
    ['📤','Llamadas salientes',"scrollTo_('salientes')"],
    ['🔄','Actualizar datos','cargarRemoto()'], ['🖨️','Imprimir / PDF','window.print()']
  ];
  if(IS_ADMIN){ T.push(['📥','Cargar archivos','toggleDM()']); T.push(['⬆️','Publicar','publicar()']); }
  document.getElementById('tiles').innerHTML = T.map(([ic,lb,fn],i)=>`
    <button class="tile" onclick="${fn}">
      <div class="tile-ico" style="background:${tint(ICO[i%8])};color:${ICO[i%8]}">${ic}</div>
      <div class="tile-lb">${lb}</div></button>`).join('');
}
function scrollTo_(id){ document.getElementById(id).scrollIntoView({behavior:'smooth'}); }

function restoreUploaderUI(){
  const map={agentes:1,cola:2,rendimiento:3,abandonadas:4,salientes:5};
  Object.entries((DATA.meta&&DATA.meta.loadedFiles)||{}).forEach(([t,f])=>{
    const u=document.getElementById('up_'+map[t]), n=document.getElementById('file_'+map[t]);
    if(u) u.classList.add('loaded'); if(n) n.textContent=f;
  });
  updateDMStatus();
}

window.addEventListener('DOMContentLoaded', async ()=>{
  renderTiles();
  if(IS_ADMIN){
    document.getElementById('dmCard').style.display='block';
    document.getElementById('greetTitle').textContent='Hola, Samuel 👋';
    document.getElementById('avatar').textContent='SD';
    document.getElementById('userName').textContent='Samuel Díaz';
    document.getElementById('userRole').textContent='Coordinador Contact Center';
  }
  // checkboxes "Revisado" (local, por persona)
  document.querySelectorAll('[data-rev]').forEach(cb=>{
    const k='cc_rev_'+cb.dataset.rev;
    cb.checked = localStorage.getItem(k)==='1';
    cb.closest('.panel').classList.toggle('reviewed', cb.checked);
    cb.addEventListener('change',()=>{
      localStorage.setItem(k, cb.checked?'1':'0');
      cb.closest('.panel').classList.toggle('reviewed', cb.checked);
    });
  });
  if(loadStorage()){ restoreUploaderUI(); if(DATA.agentes) renderAll(); else renderSalientes(); }
  await cargarRemoto();
  if(IS_ADMIN) restoreUploaderUI();
});
