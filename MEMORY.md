# MEMORY.md — Memoria del proyecto CX-Hub

Registro vivo de lo que está publicado, por qué se decidió así y qué falta.
Se actualiza después de cada cambio, entrega o decisión (ver la sección "Memoria" de CLAUDE.md).
Lo más nuevo va arriba en cada sección. Fechas en formato AAAA-MM-DD.

---

## Estado actual

- **Versión publicada:** 1.19.4 (2026-11-19)
- **Secciones activas:** Inicio, Dashboard, Productos y Modelos, Taller y Postventa, Recalls activos, Guiones,
  Escalamientos, Sucursales, Internos, Procedimientos, Cambios recientes, Buscar (buscador de la home).
- **Secciones sin construir (gris en el menú):** Promociones, Agendamientos, FAQ, CRM y Tipificaciones.
- **Backend:** Apps Script único "CX-Hub Backend" (reclamos + contenidos + internos + procedimientos + recalls), deployment @13.
  Dashboard: Apps Script propio (cuenta novedades), deployment @3; valida la clave contra el Hub y lee los mails de 3CX.

---

## Decisiones (y por qué)

- **2026-11-19 — Manual del Contact Center publicado.** Reemplaza al "Manual de atención" y a "Capacitación – Atención" en Documentos de referencia; se lee con el link. El "Cronograma de inducción" queda solo admin (`soloAdmin: true` en PR_DOCUMENTOS).
- **2026-11-19 — Geely EX5 EM-i:** plan propio (1.er service a 10.000 km, después cada 10.000), separado del EX5. Agenda de actualización: máximo 3 por día en Rondeau y 2 en Carrasco.
- **2026-11-19 — Taller.** Carrasco: agenda por horas, máximo 5 autos por día y el resto camiones. JAC Camiones: primera opción Obisun (taller externo, Aguada); no se agenda, se le pasa el teléfono. Campañas activas de noviembre: kilometraje Chevrolet, kilometraje Marcas y JAC Camiones primer service (preguntar si lo hicieron y dónde).
- **2026-11-18 — Procedimientos: bloque Coordinación solo admin.** El servidor no lo manda sin clave (GET público filtrado; admin usa `procedimientosAdmin`) y no se guarda en el navegador. Para ocultar una ficha al equipo, ponerle bloque "coordinacion".
- **2026-11-18 — El Hub es para los agentes (regla del usuario).** Lo visible sin admin es solo lo que un agente necesita. Las tareas de coordinación (calidad/escucha de llamadas, KPIs, inducción, armado de la campaña, NPS) no se muestran al equipo. Está también en CLAUDE.md, en las reglas de arquitectura.
- **2026-11-18 — Escalamientos:** todos los reclamos van con copia al coordinador y a Jimena (gerencia CC). Shopping de Autos: ventas y gestoría llegan a los dos responsables del Shopping y de gestoría (mails solo en el backend).
- **2026-11-17 — Datos confirmados por el usuario.** Redes de 10 a 19 hs; NPS todos los meses (sin "reportes"); no se pone "RECALL" en el turno; Monica Rodriguez es vendedora; el gerente de Lynk & Co es el de Rondeau; Car One no tiene teléfono; las listas de precios son las carpetas del Drive (el doc "Para copiar y pegar" se sacó).
- **2026-11-17 — Portal de solicitudes.** Sección nueva que muestra embebida la app de Google del portal (el link está arriba en portal-solicitudes.html). Se embebe bien; botón "Abrir en pestaña nueva" por las dudas.
- **2026-11-13 — Recalls editables por el admin.** Tarjetas en la hoja "Recalls" (marca, título, descripción, link de gestión
  del Drive). El admin agrega/edita/borra desde recalls.html (✏️ y "＋ Nuevo recall"); borrado lógico. El número del menú
  se calcula solo. Las 2 tarjetas de Chevrolet (airbag y Spark) se cargaron solas al crear la hoja.
- **2026-11-13 — Colores del % de atención (Dashboard)**: verde desde 90 % (objetivo), amarillo de 80 a 89 %, rojo debajo de 80 %.
  Pedido del usuario (antes el KPI salía rojo debajo de 90 y las tablas usaban 85/70). Editable en `OBJETIVOS` de dashboard.js.
- **2026-11-13 — Guiones: botones Marcas / Chevrolet** (para la auditoría de Chevrolet). Los speeches "Marcas y Chevrolet"
  que nombran la empresa se escriben una vez con `[EMPRESA]` y la página arma los dos botones (Grupo Fiancar / Chevrolet
  Montevideo); también en los pasos 1 y 5 de la llamada. La elección queda guardada en el navegador. Reemplaza el cambio
  de v1.15.2 (todo a "Chevrolet Montevideo"), que además había tocado por error speeches "Solo Marcas".
- **2026-11-13 — Dashboard: botón "📥 Leer reportes" (solo admin).** Trae los 5 CSV "mes acumulado" del último mail de
  3CX (Gmail de novedades, se reconocen por el nombre del adjunto), los carga como si se subieran a mano y después se
  toca "Publicar". No publica solo. El script del Dashboard ya no tiene clave propia: valida contra el backend del Hub.
  El reporte de salientes por mail trae la interna en "From" ("Nombre (7994)"); el Dashboard lee las dos variantes.
- **2026-11-12 — Admin con botón "Ingresar como admin" y una sola clave para todo** (pedido del usuario).
  Reemplaza el `?admin=` en la URL (la clave quedaba en la barra y en capturas) y el modo admin por página de v1.9.1:
  ahora una entrada vale para todas las secciones, y el botón del menú siempre muestra si se está en modo admin.
  La clave vive en Propiedades del script del backend; copia local en `CX_HUB/CLAVE.txt` (nunca se sube).
- **2026-11-12 — Dashboard: leer los reportes de 3CX desde el Gmail de novedades.** 3CX manda 5 reportes diarios
  (rango "Este mes", CSV adjunto) a novedades ~7:00.
- **2026-11-09 — Procedimientos: fichas en 4 bloques** (Atención · Según lo que pide el cliente · Tareas salientes · Equipo).
  Ficha fija: cuándo aplica, pasos, sistema, escalar a, qué decir, tipificación, errores, fecha de revisión.
  No repite contenido: linkea a Guiones (qué decir), Escalamientos (a quién) e Internos. Editable por el admin desde la página.
  Boceto aprobado y publicado en v1.13.0. Las fichas viven en la hoja "Procedimientos" (no en el repo).
  Las 8 tarjetas "¿Necesitás resolver?" de la home abren su ficha (buscan por título exacto: no renombrar sin cambiar el link).
- **2026-11-09 — Los saludos oficiales son los de Guiones** (llamada: "Grupo Fiancar, buenos días/tardes, mi nombre es…,
  ¿en qué le puedo ayudar?"; WhatsApp: "Buenos días/tardes! Mi nombre es… de Grupo Fiancar"). Trato de usted.
  Los documentos del Drive que digan otra cosa quedan desactualizados.
- **2026-11-09 — La "Matriz de escalamiento" del Drive se descarta.** El "¿A quién se escala?" sale de la lista
  `AREAS` de Escalamientos (la misma del formulario), así hay una sola lista que mantener.
- **2026-11-09 — Listas de precios = links a las carpetas del Drive** (una por marca, dentro de "Precios y catálogo").
  Las listas se actualizan en el Drive sin tocar el Hub; solo se edita `LISTAS_PRECIOS` si se crea una carpeta nueva.
  También aparecen en el buscador de la home ("precios", "lista chevrolet").
- **2026-10-30 — Buscador sin índice propio.** Lee los mismos archivos de datos de cada sección para que no haya
  nada aparte que mantener. Cada resultado abre la sección filtrada con `?q=`.
- **2026-10-30 — Home sin usuario de maqueta.** Saludo según la hora ("¡Buen día/Buenas tardes/Buenas noches, equipo!")
  y bloque "Contact Center · Grupo Fiancar". No hay login, así que no se identifica a nadie. La campanita cuenta
  los avisos "Importante hoy" vigentes.
- **2026-10-29 — Modo admin por página** (reemplazado el 2026-11-12, ver arriba). Entrar con la clave en una sección no deja admin a las demás
  (antes se compartía por pestaña y el usuario lo reportó como bug).
- **2026-10-29 — Internos: ver es público, editar solo con clave.** El usuario lo eligió así aunque haya
  celulares personales marcados "solo uso interno". Los datos viven en la planilla (no en el repo) y cada
  guardado copia la versión anterior a "Internos (historial)".
- **2026-10-29 — Internos: "Días que trabaja" (no "día libre").** Más natural de cargar y de leer; la fila
  se marca "Hoy no está" si hoy no es día de trabajo. Los días en Car One son un subconjunto de los días que trabaja.
- **2026-10-29 — Backend unificado en Apps Script + Sheets** (en vez de Python + SQLite): la carga es chica
  (~500 lecturas y ~10 escrituras por día), no necesita servidor y no pide permisos nuevos de Google.
  Revisar si se necesita login por persona, más de 100k filas, respuestas de más de 3 s, o más de 100 mails de reclamos por día.
- **2026-10-29 — Una sola clave admin**, la misma del Dashboard, guardada en Propiedades del script.
  Se quitó "Vista coordinador" y los formularios muertos de todo el Hub.
- **2026-10-29 — Cambios recientes / Importante hoy:** vencen a los 7 días por defecto (editable o "sin vencimiento").
  Lo vencido sale de la home pero queda en el historial. Borrado lógico.
- **2026-10-26 — Sin sección Campañas** en el Hub por ahora (el usuario la descartó).
- **Marcas del grupo:** solo Chevrolet, Fiat, JAC Auto/Camiones, Geely y Lynk & Co (Tata, Karry, Hyundai, Kia, etc. NO). Montos en $U.

---

## Pendientes

- Procedimientos: falta saber en qué campo del CRM se marca la baja de comunicaciones, y el speech de encuestas para notas 0–9.
  Tipificaciones vacías (esperan CRM y Tipificaciones).
- Internos: falta el cargo de Ramiro Orte.
- Panel de tareas del equipo (sección nueva, pedida 2026-11-19): diseño propuesto, espera OK.
- Manuales del Drive (diseño aprobado 2026-11-18): (1) Manual del Contact Center [publicado 2026-11-19], (2) Manual de Encuestas con el speech de encuestas adentro (NO va a Guiones: CX/calidad
  separado de atención) y camino para notas 0–9, (3) Inducción de 3 días. Los viejos no se tocan.
- Home: "¿Necesitás contactar a alguien?", "Más consultado esta semana" y "¿Necesitás resolver?" son datos de maqueta.
- README.md desactualizado.

---

## Historial de versiones

- **1.19.4 (2026-11-19)** — Manual del Contact Center en Procedimientos (Cronograma de inducción solo admin), plan propio del Geely EX5 EM-i, regla 1 de Taller corregida (3 Rondeau / 2 Carrasco).
- **1.19.3 (2026-11-19)** — Taller: Obisun como taller externo (JAC Camiones, primera opción, no se agenda), filtro JAC Auto / JAC Camiones, Carrasco máximo 5 autos por día (agenda por horas). Avisos en Cambios recientes e Importante hoy hasta el 30/11.
- **1.19.2 (2026-11-18)** — Procedimientos: bloque "Coordinación (solo admin)" con Campaña mensual: armado, NPS, Calidad, KPIs e Inducción. El equipo no lo recibe; la Campaña mensual de service queda para los agentes solo con la parte de llamar.
- **1.19.1 (2026-11-17)** — Correcciones del usuario: Car One en Sucursales, gerente de Lynk & Co = el de Rondeau, sin el doc "Para copiar y pegar" en Listas de precios. En la planilla: recepcionista de Carrasco, Car One en Internos, Procedimientos (redes 10–19 hs, NPS mensual, sin paso "RECALL").
- **1.19.0 (2026-11-17)** — Sección nueva "Portal de solicitudes": la app de Google del portal embebida en el Hub, con botón para abrirla en pestaña nueva.
- **1.18.1 (2026-11-17)** — Productos y modelos: garantía de Fiat corregida a 3 años o 100.000 km.
- **1.18.0 (2026-11-13)** — Recalls editables desde la página (admin), guardados en la planilla; número del menú automático.
- **1.17.0 (2026-11-13)** — Guiones: botones Marcas / Chevrolet con el nombre de la empresa en cada speech y en la llamada.
- **1.16.1 (2026-11-13)** — Dashboard: % de atención entre 80 y 89 % en amarillo (KPI, tablas y barras).
- **1.16.0 (2026-11-13)** — Dashboard: botón "Leer reportes" (mails de 3CX), clave única del Hub, salientes del reporte por mail.
- **1.15.2 (2026-11-13)** — Guiones: todos los saludos dicen "Chevrolet Montevideo" (antes "Grupo Fiancar").
- **1.15.1 (2026-11-12)** — Recalls: cada tarjeta abre su planilla de gestión en el Drive.
- **1.15.0 (2026-11-12)** — Recalls: sale Fiat (airbags Takata); entran Chevrolet campaña de airbag y campaña de Spark (tarjetas simples, sin imagen).
- **1.14.2 (2026-11-12)** — Ingresar como admin: ignora espacios/caracteres invisibles y el error dice cuántos caracteres leyó.
- **1.14.1 (2026-11-12)** — Ingresar como admin: botón para ver la clave y sin autocompletado del navegador.
- **1.14.0 (2026-11-12)** — Botón "Ingresar como admin" en el menú, una sola clave para todo el Hub.
- **1.13.0 (2026-11-09)** — Sección Procedimientos (29 fichas editables por el admin), tarjetas "¿Necesitás resolver?" activas, procedimientos en el buscador.
- **1.12.0 (2026-11-09)** — Escalamientos: tabla "¿A quién se escala?" (tocar un área la carga en el formulario).
- **1.11.0 (2026-11-09)** — Listas de precios por marca (Drive) en Productos y Modelos y en el buscador.
- **1.10.0 (2026-10-30)** — Buscador de la home; "Buscar" del menú activo.
- **1.9.2 (2026-10-30)** — Saludo según la hora, sin usuario de maqueta, campanita con Importante hoy.
- **1.9.1 (2026-10-29)** — El modo admin de una sección no se pasa a las demás.
- **1.9.0 (2026-10-29)** — Sección Internos (112 contactos, 9 pestañas) y link desde cada sucursal.
- **1.8.1 (2026-10-29)** — El modo admin acepta también `?admin?=CLAVE`.
- **1.8.0 (2026-10-29)** — Cambios recientes e Importante hoy con datos reales; backend unificado.
- **1.7.5 (2026-10-26)** — Herramientas de trabajo con links reales; favicon.
- **1.7.x (2026-10-23)** — Productos y Modelos (garantías, planes de service, calculadora).
- **1.6.x (2026-10-15)** — Sucursales, Escalamientos con formulario de reclamos, Asistencia técnica en Taller.
