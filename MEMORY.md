# MEMORY.md — Memoria del proyecto CX-Hub

Registro vivo de lo que está publicado, por qué se decidió así y qué falta.
Se actualiza después de cada cambio, entrega o decisión (ver la sección "Memoria" de CLAUDE.md).
Lo más nuevo va arriba en cada sección. Fechas en formato AAAA-MM-DD.

---

## Estado actual

- **Versión publicada:** 1.10.0 (2026-10-30)
- **Secciones activas:** Inicio, Dashboard, Productos y Modelos, Taller y Postventa, Recalls activos, Guiones,
  Escalamientos, Sucursales, Internos, Cambios recientes, Buscar (buscador de la home).
- **Secciones sin construir (gris en el menú):** Promociones, Agendamientos, FAQ, Procedimientos, CRM y Tipificaciones.
- **Backend:** Apps Script único "CX-Hub Backend" (reclamos + contenidos + internos), deployment @5.

---

## Decisiones (y por qué)

- **2026-10-30 — Buscador sin índice propio.** Lee los mismos archivos de datos de cada sección para que no haya
  nada aparte que mantener. Cada resultado abre la sección filtrada con `?q=`.
- **2026-10-30 — Home sin usuario de maqueta.** Saludo según la hora ("¡Buen día/Buenas tardes/Buenas noches, equipo!")
  y bloque "Contact Center · Grupo Fiancar". No hay login, así que no se identifica a nadie. La campanita cuenta
  los avisos "Importante hoy" vigentes.
- **2026-10-29 — Modo admin por página.** Entrar con la clave en una sección no deja admin a las demás
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

- Internos: falta el nombre de la recepcionista de Carrasco (figura "Pendiente") y el cargo de Ramiro Orte.
- Internos: confirmar si Monica Rodriguez es gerente o vendedora de Lynk & Co (Sucursales dice gerente).
- Car One no está en Sucursales y no tiene teléfono central.
- Editar Internos en modo admin no se probó con la clave real.
- Home: la tarjeta "¿Necesitás contactar a alguien?" sigue con datos de maqueta (se podría alimentar de Internos).
  También son maqueta "Más consultado esta semana" y "¿Necesitás resolver?".
- Taller: la regla 1 (Geely EX5/EX2 y Lynk & Co) tiene un texto contradictorio publicado.
- Taller: separar JAC Auto y JAC Camiones en el filtro (Rondeau no atiende camiones).
- Escalamientos: falta la tabla "qué se escala a quién" arriba del formulario.
- README.md desactualizado (solo lista Inicio, Dashboard y Recalls).

---

## Historial de versiones

- **1.10.0 (2026-10-30)** — Buscador de la home; "Buscar" del menú activo.
- **1.9.2 (2026-10-30)** — Saludo según la hora, sin usuario de maqueta, campanita con Importante hoy.
- **1.9.1 (2026-10-29)** — El modo admin de una sección no se pasa a las demás.
- **1.9.0 (2026-10-29)** — Sección Internos (112 contactos, 9 pestañas) y link desde cada sucursal.
- **1.8.1 (2026-10-29)** — El modo admin acepta también `?admin?=CLAVE`.
- **1.8.0 (2026-10-29)** — Cambios recientes e Importante hoy con datos reales; backend unificado.
- **1.7.5 (2026-10-26)** — Herramientas de trabajo con links reales; favicon.
- **1.7.x (2026-10-23)** — Productos y Modelos (garantías, planes de service, calculadora).
- **1.6.x (2026-10-15)** — Sucursales, Escalamientos con formulario de reclamos, Asistencia técnica en Taller.
