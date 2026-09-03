# Contact Center Hub

Hub interno de consulta para el equipo de Contact Center.

## Estructura

```
/
├── index.html          ← Home
├── dashboard.html      ← Reporte mensual del Contact Center
├── recalls.html        ← Sección Recalls activos
├── _plantilla.html     ← Copiá este archivo para crear secciones nuevas
├── README.md
└── assets/
    ├── css/sidebar.css   ← Menú lateral. Lo usan TODAS las páginas
    ├── css/hub.css       ← Estilos de las páginas del Hub
    ├── css/dashboard.css ← Estilos solo del Dashboard
    ├── js/hub.js         ← Configuración del menú + funciones comunes
    ├── js/dashboard.js   ← Lógica del reporte (CSV, KPIs, publicación)
    └── img/            ← Imágenes (promos, recalls, logo)
```

## Cómo agregar una sección nueva

1. Copiá `_plantilla.html` y renombralo. **Siempre en minúsculas, sin espacios ni tildes**
   (ej: `promociones.html`, `taller-postventa.html`).
2. Cambiá el `<title>` y el encabezado (`<h1>` y bajada).
3. Escribí el contenido entre los comentarios `TU CONTENIDO ARRANCA ACÁ` / `FIN DE TU CONTENIDO`.
4. Abrí `assets/js/hub.js` y buscá la lista `nav`. Poné el nombre de tu archivo
   donde dice `null`:

   ```js
   { icon: '🏷️', label: 'Promociones', href: 'promociones.html' },
   ```

5. Subí los cambios. El menú lateral se actualiza solo en **todas** las páginas.

Las secciones con `href: null` aparecen en el menú en gris y no son clickeables.
Sirve para que el equipo vea qué viene, sin links rotos.

## Cómo agregar una imagen

1. Guardá el archivo en `assets/img/` con nombre descriptivo
   (ej: `promo-tracker-2026.jpg`).
2. Referencialo así:

   ```html
   <img class="promo-thumb" src="assets/img/promo-tracker-2026.jpg" alt="Tracker"
        onclick="openLightbox('assets/img/promo-tracker-2026.jpg')">
   ```

**No pegar imágenes en base64 dentro del HTML.** Infla el archivo, rompe el
historial de Git y hace que el navegador tenga que volver a descargar todo en
cada visita.

## Reglas para que no se rompa

- **Rutas siempre relativas.** Escribir `assets/css/hub.css` y `recalls.html`,
  nunca `/assets/css/hub.css` con barra al principio. Así el Hub funciona igual
  en GitHub Pages, en el dominio propio y abriendo el archivo localmente.
- **Nombres de archivo en minúsculas.** El servidor distingue mayúsculas de
  minúsculas: `Promociones.html` y `promociones.html` son dos archivos distintos.
- **La home tiene que llamarse `index.html`** (con `i` minúscula), si no el
  servidor no la reconoce como página de inicio.
- **Los estilos van en `hub.css`**, no dentro de cada página. Si un color o un
  espaciado se cambia en un solo lugar, cambia en todo el Hub.

## Migración de GitHub Pages al dominio propio

Copiar todos los archivos y carpetas tal cual están, respetando la estructura.
No hay que tocar ningún link: al ser rutas relativas, funcionan igual en
`usuario.github.io/hub/` que en `hub.empresa.com/`.

Después de migrar, conviene revisar:

- Que `hub.empresa.com` cargue bien y no dé 404 en `index.html`.
- Que las imágenes carguen (mirar la consola del navegador con F12).
- Que el menú marque en azul la sección donde estás parado.

## Versionado

La versión y la fecha de última actualización están en `assets/js/hub.js`,
arriba de todo:

```js
version: '1.1.0',
actualizado: '18/08/2026 10:45',
```

Se muestran en el pie de todas las páginas. Conviene actualizarlas cada vez que
se publica un cambio, así el equipo sabe si está viendo información fresca.


## El Dashboard

`dashboard.html` es el reporte mensual del Contact Center. Vive dentro de este
mismo repo, comparte el menú lateral con el resto del Hub, pero usa su propio
archivo de estilos (`dashboard.css`).

**Por qué el CSS está separado:** el Dashboard y el Hub usan varios nombres de
clase iguales (`.card`, `.topbar`, `.avatar`, `.badge`, `.search`, `.pill`,
entre otros) con estilos distintos. Si se juntaran en un solo archivo se
pisarían y las dos pantallas se romperían. Por eso:

- `sidebar.css` → lo cargan todas las páginas (está aislado bajo `#sidebar`)
- `hub.css` → solo las páginas del Hub
- `dashboard.css` → solo el Dashboard

**No mezclar `hub.css` y `dashboard.css` en la misma página.**

### Modo administrador

Para cargar los CSV y publicar el reporte hay que abrirlo con la clave en la URL:

```
dashboard.html?admin=TU_CLAVE
```

La clave no está escrita en el HTML: viaja por la URL y se valida contra la
constante `CLAVE` del Apps Script. El equipo entra a `dashboard.html` sin
parámetro y ve el reporte publicado, en modo lectura.

### Conexión con Google Apps Script

El Dashboard lee y publica contra un Apps Script (`API_URL` en `dashboard.js`).
Mover el archivo de un repo a otro **no rompe esta conexión**, porque el POST
usa `Content-Type: text/plain`, que no dispara la verificación previa de CORS.

Si algún día cambia la implementación del Apps Script, hay que actualizar
`API_URL` en `assets/js/dashboard.js`. Es el único lugar donde aparece.
