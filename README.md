# Jayce Café-Bar — landing

Sitio estático (HTML/CSS/JS, sin build), mismo *toolkit* técnico que el
resto de webs de esta carpeta (GSAP + ScrollTrigger, Lenis) pero con su
propia estructura y su propia técnica de hero — ver "Familia estructural
propia" más abajo. Abrir `index.html` con un servidor estático cualquiera
(por ejemplo `python -m http.server`) — no funciona bien con `file://`
porque las fuentes y `js/main.js` necesitan HTTP.

## Familia estructural propia

Este workspace usa cada web como plantilla reutilizable para vender a
futuros clientes, así que cada sitio debe leerse como una plantilla
distinta, no como un reskin. Antes de escribir código se revisaron las
~13 webs hermanas ya existentes para no repetir ni el orden de secciones
ni la técnica de hero de ninguna:

- **Taza que se llena con el scroll** (`js/main.js`, `initCupGauge`): en
  vez del rail de puntos o la barra de progreso habitual de las webs
  hermanas, un SVG de taza en la cabecera se va llenando (`clip-path` +
  rect animado) según el progreso de scroll — motivo propio de "café de
  barrio", no usado en ningún otro sitio de la carpeta.
- **Hero de vapor de café** (`js/scene-steam.js`): partículas en canvas 2D
  ascendiendo sobre el degradado granate. El "puff" difuminado se dibuja
  UNA sola vez en un sprite fuera de pantalla (radial gradient) y cada
  partícula es un `drawImage` con alpha — nada de `ctx.filter`/`shadowBlur`
  en vivo por fotograma (coste constante por frame, no por partícula).
- **"El día en Jayce"** (`#momentos`): 4 tarjetas apiladas verticalmente
  (no en pin horizontal, para no solapar con `melao-template-tres-cocinas`,
  que sí usa scroll-pin horizontal), cada una anclada a una cita textual
  real de una reseña de Google.
- **"Lo que encontrarás"** (`#sabores`): sin carta publicada por el
  negocio, la lista de platos se limita a los que sus propios clientes
  nombran en las reseñas (café, tortilla, oreja, hamburguesas) — precios
  marcados `[PRECIO PENDIENTE]`, sin inventar el resto de una carta que no
  existe.
- **Sello de anillo de café** al entrar cada sección (`runRingStamps` en
  `js/main.js`): un anillo circular hace "pop" (`back.out`) al aparecer,
  motivo reutilizado como puntuación visual en vez del rail de puntos con
  el que navegan otras webs hermanas.

## Contenido real vs. pendiente

**Confirmado y usado tal cual** (ficha de Google Maps del negocio,
14-09-2026, más las 4 reseñas completas facilitadas por el cliente en
capturas):
- Nombre, dirección (Rúa Río Miño, 18, 15102 Carballo), teléfono
  (682 12 09 30), valoración de Google (**4,4★, 87 reseñas**), rango de
  precio (1-10 €/persona), servicios (terraza, comida en el bar),
  Facebook real (enlazado tal cual lo dio el cliente).
- Las 4 reseñas de Google completas (Antiq, ana c.s., David Juncal Vilas,
  jose manuel), con texto, fecha relativa y respuesta del propietario
  citados literalmente — incluidas las respuestas en gallego ("Moitas
  grazas").
- Platos citados por los propios clientes en sus reseñas: café,
  hamburguesas, oreja, tortilla, y que hacen pedidos a domicilio.

**⚠️ Pendiente / decisiones marcadas en la propia web — revisar antes de
enseñarla al dueño:**
- **Logo real**: no se recibió el archivo de imagen del logo (solo se vio
  pegado en el chat, sin ruta de archivo accesible). El favicon/marca
  actual (`assets/img/logo/icon.svg`) es un emblema propio dibujado con la
  paleta granate/crema del logo real — **no es el logo real del negocio**.
  En cuanto el cliente pase el archivo, sustituir este SVG (y regenerar
  `manifest.json` con iconos PNG reales si se quiere soporte PWA
  completo).
- **Horario completo de la semana**: la ficha de Google solo mostraba
  "Abierto · Cierre 23:00" — no el resto de días ni la hora de apertura.
  La sección Encuéntranos lo deja marcado como
  `[HORARIO COMPLETO DE LA SEMANA PENDIENTE DE CONFIRMAR]`, sin inventar
  franjas.
- **Carta y precios**: no hay carta publicada en ningún sitio (ni web
  previa, ni Facebook). "Lo que encontrarás" es deliberadamente una lista
  corta basada solo en reseñas, no una carta completa inventada.
- Los metadatos usan `https://alvarotaiagu.github.io/jayce-cafe-bar-carballo-web/`
  como dominio de referencia; si el negocio consigue un dominio propio,
  sustituir esa URL en `index.html` (canonical, `og:url`, JSON-LD) y en
  `404.html`.

## Validación hecha

Servido en local (`python -m http.server`) y revisado con Playwright
(Chromium) en 1440px y 390px: cero errores de consola, mapa cargando solo
al clic (`.map-consent`), banner de cookies con el patrón seguro
`[hidden]{display:none}`, taza de progreso llenándose con el scroll.

Un bug real se encontró y corrigió en el proceso: `#mobile-nav` era un
overlay `position: fixed` anidado dentro de `<header>`; el `transform`
inline que GSAP deja tras animar la cabecera al cargar convierte a ese
ancestro en el "containing block" del hijo `fixed`, así que el menú móvil
quedaba encajonado en los ~112px de alto de la cabecera en vez de cubrir
la pantalla completa. Se movió `#mobile-nav` fuera de `<header>`, como
hermano directo en `<body>` — inmune a cualquier transform futuro que
reciba la cabecera.
