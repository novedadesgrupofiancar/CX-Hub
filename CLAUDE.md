# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

CX-Hub: hub interno de consulta del Contact Center de Grupo Fiancar. Sitio estático publicado en GitHub Pages
(https://novedadesgrupofiancar.github.io/CX-Hub/, repo `novedadesgrupofiancar/CX-Hub`, rama `main`).
Lo mantiene el coordinador, que **no es programador**: todo tiene que poder editarlo él (datos en listas
comentadas, sin pasos de build). Más adelante migra a un dominio propio sin tocar código.

Estado, decisiones y pendientes del proyecto: **`MEMORY.md`** (ver la sección "Memoria" al final).

## Reglas de arquitectura (no negociables)

- HTML/CSS/JS plano: sin frameworks, sin npm, sin build. Una página por sección en la raíz.
- Rutas siempre relativas (`assets/...`, nunca `/assets/...`). Archivos en minúsculas, sin tildes ni espacios.
- `sidebar.css` lo cargan todas las páginas (aislado bajo `#sidebar`). `hub.css` y `dashboard.css`
  **nunca juntos**: comparten nombres de clase (`.card`, `.topbar`, `.search`, `.badge`...) con estilos distintos.
- CSS nuevo va **al final de `hub.css`**, en un bloque con encabezado y clases con prefijo de 2–3 letras
  propio de la sección (`su-` sucursales, `es-` escalamientos, `pm-` productos, `cr-` cambios, `in-` internos, `bu-` buscador, `pr-` procedimientos).
- Datos separados del render: cada sección tiene arriba su lista comentada (`SUCURSALES`, `TALLERES`,
  `MARCAS_PM`, `SPEECHES_WPP`...) con un aviso "de acá para abajo no hace falta tocar nada".
- Sin imágenes en base64 (van en `assets/img/`).
- **Subir la versión** (`version` y `actualizado` arriba de `assets/js/hub.js`) en cada entrega que cambie el sitio; se ve en el pie.
- Los POST a Apps Script usan `Content-Type: text/plain` a propósito (evita el preflight de CORS).

## Arquitectura

**`assets/js/hub.js` (lo cargan todas las páginas)** es el núcleo:
- `HUB.nav` arma el menú lateral de todas las páginas (`href: null` = sección gris "en construcción").
  Sección nueva: copiar `_plantilla.html` y agregar su línea en `HUB.nav`.
- `HUB.herramientas` (links externos), `HUB.api` (URL única del backend), `HUB.saludo` (saludo de la home).
- Utilidades compartidas: `escaparHTML`, modo admin (`tomarClaveDeURL`, `llamarAdmin`, `salirAdmin`, `claveAdmin`),
  y `aplicarBusquedaURL`: `pagina.html?q=texto` escribe el texto en el input marcado con `data-hub-buscar`
  de esa página y dispara su filtro. El buscador de la home depende de esto para los links a cada sección.

**Modo admin**: botón **"Ingresar como admin"** abajo del menú lateral (lo arma `renderSidebar` en hub.js, en
todas las páginas, incluido el Dashboard). Pide la contraseña, la valida en el servidor (`verificarClave`) y la guarda
en `sessionStorage` (`cxhub-admin`): **una sola entrada vale para todo el Hub** mientras la pestaña esté abierta.
El botón pasa a "🔓 Admin · Salir". Ya no se usa `?admin=` en la URL (si viene, `quitarAdminDeURL` lo borra).
Las secciones leen la clave con `tomarClaveDeURL()` (nombre histórico) y el body recibe una clase
(`cr-modo-admin`, `in-modo-admin`, `pr-modo-admin`) que muestra/oculta `.xx-solo-admin` / `.xx-solo-equipo`.
Sin clave todo es solo lectura.

**Backend (Google Apps Script "CX-Hub Backend", cuenta novedades)** — una sola URL en `HUB.api`:
- `GET ?action=contenidos` → Cambios recientes / Importante hoy (público, cacheado 5 min).
- `GET ?action=internos` → Internos (público, cacheado 5 min).
- `GET ?action=procedimientos` → fichas de Procedimientos (público, cacheado 5 min).
- `POST` sin `action` → formulario de reclamos de Escalamientos (manda mails).
- `POST` con `action` + `clave` → escritura admin (`verificarClave`, `listarAdmin`, `guardar`, `borrar`, `guardarInternos`,
  `guardarProcedimiento`, `borrarProcedimiento`).
- Datos en la planilla "Reclamos CX-Hub": hojas `Reclamos`, `Cambios recientes`, `Importante hoy`, `Internos`,
  `Internos - sucursales`, `Internos (historial)`, `Procedimientos`. Borrado lógico en contenidos y procedimientos; en internos, cada guardado copia
  la versión anterior al historial. La clave está en Propiedades del script (`CLAVE_ADMIN`), nunca en el código.
- El código **no está en este repo**. Se trabaja con clasp (logueado en la cuenta novedades):
  `clasp clone 1dI7vdEhAbfcSWkDA86nUMCGpgrvh1K1Ju4R955FLKWEYxyGJBs0zNsHj` en una carpeta temporal,
  `clasp push -f`, y `clasp deploy -i AKfycbwptnYqzGl6w0cBJY1Ocaj01A3bLxBFGsruGiU_jmU-wjTki6hghpPcMXutRtZ15Ip7 -d "..."`
  (mantiene la misma URL). Probar con `curl -sL "<HUB.api>?action=internos"`.
- El Dashboard usa **otro** Apps Script propio (`API_URL` en `dashboard.js`).

**Cache en el navegador**: `contenidos.js`, `internos.js` y `procedimientos.js` pintan primero la copia de `localStorage`
(`cxhub-contenidos`, `cxhub-internos`, `cxhub-procedimientos`) y después la reemplazan con la del servidor.

**Buscador de la home (`buscar.js`)**: no tiene índice propio. Lee como texto los archivos de datos de cada
sección (`BU_ARCHIVOS`) y los ejecuta con un `document` falso para sacar sus listas; suma internos, cambios
y procedimientos desde el cache/servidor. Si un archivo de datos agrega código que toque el DOM al cargarse (fuera de
`DOMContentLoaded`), ese origen deja de aparecer en la búsqueda. `sucursales.js` y `taller.js` declaran
ambos `const MARCAS`: no se pueden cargar en la misma página con `<script>`.

## Probar

No hay tests ni lint. Se prueba sirviendo la raíz del repo y mirándolo en el navegador (PC y 375px, consola sin errores):

```bash
python -m http.server 8774
```

Usar un puerto nuevo si el navegador cachea. Abrir los HTML como `file://` no sirve para probar
(el `localStorage` es otro y los `fetch` fallan).

## Publicar

Hay git con credenciales guardadas en la PC del coordinador (no hay `gh`). Flujo:

```bash
git clone https://github.com/novedadesgrupofiancar/CX-Hub.git <carpeta temporal>
# copiar solo los archivos cambiados desde la copia de trabajo
git diff --cached --ignore-cr-at-eol --stat
git -c user.name="Coordinación Contact Center" -c user.email="m.diaz@grupofiancar.com" commit -m "vX.Y.Z: ..."
git push origin main
```

Después, esperar hasta que `https://novedadesgrupofiancar.github.io/CX-Hub/assets/js/hub.js` muestre la
versión nueva (1–2 min) y verificar en el sitio publicado.

El repo es público (se ve en GitHub Pages): no subir claves, mails de áreas ni datos que no deban verse.

## Trato con el usuario

- Responder siempre en español rioplatense.
- Decidir como arquitecto: proponer una solución, no listas de opciones ni preguntas triviales.
- Para secciones nuevas o rediseños, mostrar el diseño (o un boceto) y esperar el OK antes de programar.
- Si se necesita algo del usuario para seguir (cargar una clave, aceptar un permiso), pedirlo en pasos
  numerados al final del mensaje, no perdido en el texto.
- Marcas del grupo: solo Chevrolet, Fiat, JAC Auto/Camiones, Geely y Lynk & Co. Montos en $U.

## Memoria (`MEMORY.md`)

- **Al empezar**, leer `MEMORY.md` antes de proponer o tocar nada: ahí está la versión publicada, las decisiones
  ya tomadas (no volver a discutirlas) y los pendientes.
- **Después de cada cambio, entrega o decisión**, actualizarlo en la misma tarea y publicarlo junto con el resto:
  - *Estado actual*: versión publicada, secciones activas, deployment del backend.
  - *Decisiones*: qué se decidió y por qué, con fecha (incluye lo que el usuario elige o descarta).
  - *Pendientes*: agregar lo que queda abierto y sacar lo que se resolvió.
  - *Historial de versiones*: una línea por versión publicada.
- Lo más nuevo arriba en cada sección. Corto y concreto: es un registro, no un informe.
- Nada de datos personales, claves ni mails internos (el repo es público).
