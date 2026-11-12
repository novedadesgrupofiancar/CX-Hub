# MEMORY.md — Memoria del proyecto CX-Hub

Registro vivo de lo que está publicado, por qué se decidió así y qué falta.
Se actualiza después de cada cambio, entrega o decisión (ver la sección "Memoria" de CLAUDE.md).
Lo más nuevo va arriba en cada sección. Fechas en formato AAAA-MM-DD.

---

## Estado actual

- **Versión publicada:** 1.14.1 (2026-11-12)
- **Secciones activas:** Inicio, Dashboard, Productos y Modelos, Taller y Postventa, Recalls activos, Guiones,
  Escalamientos, Sucursales, Internos, Procedimientos, Cambios recientes, Buscar (buscador de la home).
- **Secciones sin construir (gris en el menú):** Promociones, Agendamientos, FAQ, CRM y Tipificaciones.
- **Backend:** Apps Script único "CX-Hub Backend" (reclamos + contenidos + internos + procedimientos), deployment @10.

---

## Decisiones (y por qué)

- **2026-11-12 — Admin con botón "Ingresar como admin" y una sola clave para todo** (pedido del usuario).
  Reemplaza el `?admin=` en la URL (la clave quedaba en la barra y en capturas) y el modo admin por página de v1.9.1:
  ahora una entrada vale para todas las secciones, y el botón del menú siempre muestra si se está en modo admin.
  La clave vive en Propiedades del script del backend; copia local en `CX_HUB/CLAVE.txt` (nunca se sube).
- **2026-11-12 — Dashboard: leer los reportes de 3CX desde el Gmail de novedades.** 3CX manda 5 reportes diarios
  (rango "Este mes", CSV adjunto) a novedades ~7:00. El Apps Script del Dashboard (cuenta novedades) los va a leer
  con un botón "Leer reportes" (solo admin). Pendiente: paso 2 (script del Dashboard valida con la clave del Hub + Gmail).
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

- Dashboard paso 2: el Apps Script del Dashboard todavía valida con su clave vieja escrita en el código. Cambiarlo para que
  valide contra el backend del Hub + leer Gmail (el usuario autoriza una vez). Hasta entonces, publicar el Dashboard
  necesita `dashboard.html?admin=<clave vieja>`. Después: botón "Leer reportes".
- Procedimientos: el usuario tiene que revisar el borrador de las 29 fichas. Datos "a confirmar": horario de redes, campo de baja en el CRM,
  "RECALL" en la descripción del turno, frecuencia de NPS/reportes, speech de encuestas para notas 0–9. Tipificaciones vacías (esperan CRM y Tipificaciones).
- Procedimientos: editar en modo admin no se probó con la clave real.
- Rehacer los "Manuales" del Drive de Procedimientos (el usuario lo quiere ver más adelante).
- Listas de precios: confirmar que todo el equipo tiene acceso a las carpetas del Drive (son de la cuenta callcenter).
  El doc "Precios para copiar y pegar" no se actualiza desde 2025-04.
- Internos: falta el nombre de la recepcionista de Carrasco (figura "Pendiente") y el cargo de Ramiro Orte.
- Internos: confirmar si Monica Rodriguez es gerente o vendedora de Lynk & Co (Sucursales dice gerente).
- Car One no está en Sucursales y no tiene teléfono central.
- Editar Internos en modo admin no se probó con la clave real.
- Home: la tarjeta "¿Necesitás contactar a alguien?" sigue con datos de maqueta (se podría alimentar de Internos).
  También son maqueta "Más consultado esta semana" y "¿Necesitás resolver?".
- Taller: la regla 1 (Geely EX5/EX2 y Lynk & Co) tiene un texto contradictorio publicado.
- Taller: separar JAC Auto y JAC Camiones en el filtro (Rondeau no atiende camiones).
- README.md desactualizado (solo lista Inicio, Dashboard y Recalls).

---

## Historial de versiones

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
