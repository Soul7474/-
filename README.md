# ESTACIÓN 09

Una web de ficción interactiva en español. Un nodo abandonado en 1998 que todavía responde: cámara deteriorada, GIFs originales, archivos recuperados, dos puertas, interferencia sonora opcional y un libro de visitas local.

## Arranque

Requiere Node.js 20 o superior. No tiene dependencias externas ni necesita instalación.

```sh
cd /workspace/-
npm run dev
```

El servidor escucha en el puerto 3000 y permite configurar otro con `PORT`. Comprueba el arranque mediante una petición a `/`, que debe devolver HTML con el título «ESTACIÓN 09». También puedes servir esta carpeta con cualquier servidor de archivos estáticos: la navegación utiliza fragmentos de URL y no necesita reescrituras.

Para futuras tareas en la nube, usa este checkout existente. Cada tarea ya está aislada; no crees un worktree salvo petición explícita. Los procesos no sobreviven necesariamente a una nueva sesión: ejecuta `npm run dev` de nuevo cuando haga falta.

## Identidad visual

La entrada es una única pantalla negra: una imagen pequeña rodeada de runas, trazos rituales y siete ojos interactivos, con un solo enlace para entrar y una línea de pistas susurradas bajo él. No muestra nombres de archivo, frases de bienvenida ni el archivo al hacer scroll. Las runas también son botones (se añadió ᛖ a la columna izquierda). Dentro quedan otros dos ojos y una marca rúnica. No hay marcadores de nivel ni puntuaciones. La imagen `assets/door-009.png` es una escena ficticia original generada para el proyecto; no es una cámara real ni una fotografía de un visitante.

Tocar un ojo cosido, fallar un paso del ritual o fallar una palabra puede invocar una aparición visual de 850 ms (los aciertos del ritual no la invocan), sin destellos, con un intervalo mínimo de 18 segundos. Escape la oculta, cambiar de página o pestaña también. El control «calma» desactiva las apariciones y guarda la preferencia; con movimiento reducido se desactivan. El sonido sigue siendo optativo, activado por el control existente. `assets/presence.png` es un fragmento fotográfico original generado para esta web.

La entrada muestra la fotografía tal cual: una sola puerta, entreabierta, con la hoja a la derecha y una cara apenas visible en la sombra del hueco. No se dibuja ninguna puerta encima. El paso está **sellado** hasta completar el ritual. Bajo `[ entrar ]` hay una línea de susurros que da la pista del paso actual y se vuelve más explícita con cada error. Para abrirla hay que completar un ritual de tres pasos tocando elementos de la propia pantalla (la solución está más abajo, en el bloque de spoilers). Tocar la puerta antes de tiempo solo la hace temblar y repite la pista. El progreso del ritual no se guarda: al recargar vuelve a empezar, pero la puerta abierta sí se recuerda.

### Animación al entrar

Al completar el ritual, la puerta tiembla y las runas y los ojos se funden en negro (300 ms). Como la foto ya muestra la puerta entreabierta, no hay hoja que abrir: la cámara se acerca despacio al hueco negro (2,4 s) mientras los bordes se oscurecen, y la hoja real, recortada de la propia foto con `clip-path` (polígono medido sobre la imagen de 1448×1086: 73 % 4 %, 92,5 % 16 %, 93 % 100 %, 74 % 100 %), gira un poco más hacia el espectador con `perspective` y `rotateY` desde su borde derecho; lo que deja al descubierto se rellena de negro. Durante la escena el hueco gana grano y una figura lejana apenas visible. Unos 10 s en total, en este orden:

1. **La mano (1,7–2,6 s).** Al final del acercamiento, unos dedos salen de la oscuridad y se agarran al marco izquierdo del hueco, el borde de la pared con la pintura desconchada (`assets/cutouts/presence-hand.png`).
2. **La cara (2,6–5,6 s).** Nace de la cara que la foto ya muestra en la sombra (hacia x 70 %, y 39 %), medio oculta tras el canto de la hoja: empieza oscura y borrosa en ese punto y desde ahí se aclara, crece y se asoma. Es una presencia por capas: cuello y hombros apenas visibles, una masa de pelo, la cara (`assets/cutouts/presence-face.png`) con más contraste y una máscara radial ancha, grano propio y una sombra que se come el borde del recorte. La cabeza se ladea despacio (hasta unos 2,6°) y se balancea; a mitad se detiene en seco 360 ms y vuelve a moverse. Mientras, los dedos tamborilean en el marco y se tensan cuando la cara se para.
3. **El agarre (≈1,6 s).**
   - La mano suelta el marco y entra desde abajo a la derecha, oscura y con desenfoque de movimiento (440 ms), dimensionada por la altura de la pantalla para que también envuelva la parte baja de un móvil en vertical.
   - Se cierra: está hecha de tres capas de la misma imagen (palma, dedos y pulgar); los dedos se curvan y el pulgar baja (280 ms).
   - Aprieta (800 ms): una viñeta negra se cierra desde los bordes en dos latidos y el encuadre tiembla. Con el sonido ambiente activado suenan dos golpes graves.
   - Te arrastra (700 ms): la mano se queda fija en el encuadre y todo lo demás se estira hacia el hueco (zoom acelerado, desplazamiento, rayas radiales y desenfoque). Funde a negro antes de que la cara se amplíe lo bastante para pixelarse.
4. **Dentro (2,3 s).** La cámara cae entre paredes: franjas gruesas y difusas a dos velocidades y dos luces tenues que pasan. Golpe seco al llegar (rebote de 34 px y un oscurecimiento breve, nunca un destello). Estática de bajo contraste, el rótulo `● REC CAM_09 / SEÑAL PERDIDA` y «Te estábamos esperando.», que escala con la pantalla y se escribe letra a letra. El interior aparece con un fundido desde negro.

Todo está hecho con CSS y la Web Animations API, sin librerías ni recursos externos (el grano es un SVG de ruido incrustado). Ningún efecto brusco dura más de 850 ms y no hay destellos ni parpadeos fuertes. Si el sonido ambiente está activado, la caída añade un siseo de estática sintetizado.

**Saltar.** A los 2 s aparece un botón discreto «saltar ›» abajo a la izquierda, y un doble toque en cualquier punto también salta: los dos llevan directamente al interior y cuentan como escena vista. Escape, en cambio, cancela la escena, te deja en el umbral con la puerta abierta y no la marca como vista. Con «calma» o con movimiento reducido no hay animación: la puerta queda abierta con la mano en el marco y la cara en el hueco, quietas. Los encuadres se calculan a partir del tamaño de la ventana, en escritorio y en móvil.

Con el sello ya abierto, la fotografía de la puerta es interactiva. Al tocarla, un acercamiento de 1,6 segundos enfoca el hueco de la puerta y termina en negro. Después abre `#interior`: una cámara con una forma orgánica abstracta original y cuatro accesos simbólicos, con nombres breves, a los restos, voces, huellas y subsuelo. Escape cancela el acercamiento; se omite con movimiento reducido o «calma».

El interior usa grano fijo, scanlines y una banda de tracking ocasional. «Calma» también detiene el tracking. Los párrafos largos y las transcripciones están plegados y se conservan íntegros. Los diagramas de transmisión y subsuelo se regeneran con `python3 scripts/generate_forms.py` (sin dependencias). `assets/inner-relic.png` es una imagen abstracta original generada para el proyecto.

En el archivo, el primer sello conserva su contraseña y una pista accesible; si se abre ahí, la puerta de la entrada también queda abierta. Tras entrar se muestran la navegación y los archivos existentes. El archivo público sigue disponible directamente en `#archivo`, sin acertijos obligatorios. La vista `#fragmentos` conserva el material de la antigua portada. Las secciones interiores mantienen la estética monocroma, los formularios, el audio optativo y el respeto a movimiento reducido.

El collage `assets/wired-memory.svg` es una ilustración original: figura anónima, ciudad, tendido telefónico y terminal. Su generador reproducible, sin dependencias, está en `scripts/generate_art.py`:

```sh
python3 scripts/generate_art.py
```

No utiliza personajes, ilustraciones ni portadas de las referencias. El collage se conserva dentro de un fragmento desplegable; tanto este como los GIFs del pasillo y el ojo se presentan en escala de grises. No se cargan fuentes ni recursos de terceros. El contenido público se puede consultar directamente desde `#archivo`; las puertas forman parte del recorrido narrativo.

## Imágenes aportadas

Los 17 originales de `images/` se conservan intactos. La dirección actual utiliza sus ojos, figuras alargadas, manos y multitudes. Los 13 primeros se pueden abrir desde **Fragmentos → vestigios**, sin mostrar sus nombres en la interfaz.

Los cuatro últimos se aportaron para el ser de la puerta:

- `08fe20c9…`: cara en la oscuridad. Es la cara que sale del hueco.
- `5b1e40ef…`: mano. Se agarra al marco y luego te agarra a ti.
- `2483130d…`: figura en un pasillo. Ahora no se usa.
- `c2f15d46…`: rostro con ojos anulares y dientes. Ahora no se usa.

Los dos últimos se usaron en una versión anterior de la escena y se conservan por si vuelven.

Se prepararon tres versiones con fondo transparente y tinta clara mediante edición de imagen, en `assets/cutouts/`:

- `sentinel.png`: figura con cabeza de ojo (original `3e0d7102…`).
- `revelation.png`: manos abriendo un ojo (original `8ea51e04…`).
- `sewn-eye.png`: ojo cosido (original `495cd049…`).
- `presence-face.png`: la cara que se asoma, recortada, en escala de grises, aclarada y con bordes fundidos a transparente (original `08fe20c9…`).
- `presence-hand.png`: la mano sin el papel blanco, en escala de grises y reflejada para que la muñeca quede en la oscuridad. El fondo se elimina por relleno desde los bordes (más el papel casi blanco encerrado entre los dedos), así el dorso claro es completamente opaco al ampliarla; el borde se erosiona 2 px para que no quede halo (original `5b1e40ef…`).

El resto se integra con inversión monocroma y mezcla `screen` en CSS: el papel claro desaparece visualmente sobre negro, sin modificar los archivos. Las apariciones alternan tres imágenes aportadas; siguen respetando «calma», movimiento reducido y el intervalo entre sustos. La animación de entrada por la puerta se conserva.

## Cintas animadas

Los siete archivos de `gifs/` se conservan sin modificaciones:

| Archivo | Ubicación |
| --- | --- |
| `giphy.gif` | Ojos de la entrada |
| `giphy (1).gif` | Archivo |
| `giphy (2).gif` | Fondo del interior |
| `giphy (3).gif` | Subsuelo, reproducción explícita |
| `giphy (4).gif` | Voces |
| `giphy (5).gif` | Fragmentos |
| `giphy (6).gif` | Huellas |

Por la web, las cintas tienen tamaños, márgenes e inclinaciones distintos (no una columna centrada), llevan scanlines y grano encima y aparecen con un fundido la primera vez que entran en pantalla; en móvil se quitan los desplazamientos para que nada se solape. Los tres ojos abiertos de la entrada encuadran el ojo de su cinta, más grande y claro, y respiran despacio. También pueden abrirse en **Fragmentos → cintas**. Los fotogramas de `assets/gif-stills/` son capturas del navegador de los GIFs originales. Se muestran de entrada; `IntersectionObserver` carga la animación cuando entra en pantalla. Se vuelve al fotograma cuando sale de pantalla, se oculta la pestaña, se activa «calma» o el navegador pide movimiento reducido. La cinta con cortes más marcados no se reproduce automáticamente: requiere pulsarla o abrirla desde «cintas». Los GIFs no añaden audio.

## Interior cambiante (fases 2–5)

La extensión está separada en `interior.js` y `interior.css`. La entrada y `crossDoor()` siguen en `app.js`; el contrato `window.EstacionInterior` expone únicamente consulta del estado, contexto de audio ya activado, apariciones y apertura del subsuelo. Los eventos `station:sound` y `station:transmission` comunican acciones confirmadas. No modificar la puerta para añadir comportamientos al interior.

La sala está compuesta en profundidad: la figura del ojo, cerca y grande; las figuras de la luna y de los brazos justo detrás, más pequeñas, tenues y desenfocadas cuanto más lejos; la multitud y la neblina al fondo. Máscaras radiales y una viñeta de sala las funden con la oscuridad. Se desplazan un poco con el ratón (o con la inclinación del móvil, donde el navegador la da sin pedir permiso) y la figura del ojo y la de la luna giran levemente para seguirte; se hace con las propiedades `translate` y `rotate`, aparte de `transform`, para que los cambios de posición de las presencias sigan funcionando. Las figuras llegan una tras otra cada vez que se entra. Los cuatro accesos nunca se mueven. «Calma» y movimiento reducido lo desactivan todo.

Cerrar un documento, vestigio o marca cambia las posiciones de las presencias. Los cuatro accesos permanecen fijos. La memoria se guarda en `sessionStorage` durante la sesión; «Olvidar esta visita» también la borra. «Calma» y movimiento reducido fijan la escena y cancelan los sucesos pendientes.

Las apariciones interiores requieren una interacción, tienen un retardo breve y al menos 48 segundos entre invocaciones. No se lanzan en segundo plano, al mirar un diálogo ni al entrar por primera vez. Escape cancela los sonidos añadidos y las invocaciones pendientes, con una pausa de 20 segundos. El sonido ambiental solo se amplía después de activar el control existente: roce de cinta, filtrado grave y golpes lejanos; los nodos se liberan al terminar y al desactivar el sonido, cambiar de vista o esconder la pestaña.

<details><summary>Pistas y soluciones del sello (spoilers)</summary>

Las tres marcas se examinan en el interior. El orden `⊙ ⋔ ☾` (ojo, mano, luna) abre el sello. «Voces» contiene un pequeño sintonizador `⌁`: revela ese orden y `UMBRA` entre interferencias, también con sonido desactivado. La palabra `umbra` permite abrir el mismo sello por otra vía. Con movimiento reducido o «calma» la señal se revela inmediatamente.

El fragmento abierto conserva la fecha `MCMXCVIII`, que corresponde a `1998`, la palabra de la puerta del subsuelo existente. Las rutas públicas y el acceso anterior siguen disponibles; estas pistas son narrativas, no autenticación.

</details>

Verificación del interior con Playwright y Chromium disponibles:

```sh
npm run test:browser
```

El comando levanta un servidor local temporal, comprueba las mutaciones, posiciones de navegación, apariciones y cancelación, ambas soluciones del sello, sonido optativo, persistencia, reset y vistas móviles; al acabar cierra servidor y navegador. `CHROMIUM_PATH` permite seleccionar el ejecutable. Las capturas de comprobación se guardan en la carpeta temporal `estacion09-check`.

## Recorrido

- **Umbral:** entrada, cámara animada, registro y primeros documentos.
- **Archivo:** siete fragmentos. Los documentos públicos contienen pistas para las puertas.
- **Transmisiones:** interferencia sintetizada de nueve segundos con transcripción ficticia. El ambiente se activa por separado; no hay audio automático ni archivos remotos.
- **Los que llegaron:** mensajes de ficción y entradas del visitante guardadas en su navegador.
- **Subsuelo:** desenlace tras la segunda contraseña.
- **Olvidar esta visita:** pide confirmación antes de borrar accesos y mensajes locales.

El sistema respeta movimiento reducido con una imagen estática en vez del GIF principal. Tiene navegación por teclado, diálogos cerrables con Escape, foco visible y presentación adaptable a móvil. Todos los recursos se sirven desde el propio proyecto. No hay rastreo, peticiones externas ni recogida real de identidades.

## Contraseñas y edición

<details>
<summary>Solución del recorrido (spoilers)</summary>

Puerta de la entrada (ritual, en orden):

1. Despertar los tres ojos de cinta (los GIF que se abren en la oscuridad, sin hilo); tocar un ojo cosido vuelve a cerrarlos.
2. Escribir `eco` con las runas de la pared: ᛖ (izquierda) → ᚲ → ᛟ (derecha). Una runa equivocada borra la secuencia. Al llegar a este paso, la pista muestra la tabla de runas.
3. Llamar a la puerta tres veces seguidas, con menos de 2,4 s entre golpes.

Primer sello del archivo: `eco`. La pista está en `leeme_antes.txt` y en el libro de visitas.

Segunda puerta: `1998`. La pista está en `no_abrir.txt` y en las fechas de la estación.

</details>

`index.html` contiene el umbral y las vistas; `style.css`, la estética; `app.js`, los documentos, pistas, contraseñas, audio y persistencia. `assets/` contiene los GIFs y la imagen estática originales.

Las contraseñas son una mecánica narrativa en JavaScript, **no autenticación segura**. Los textos protegidos están en el cliente y son inspeccionables. Para contenido privado real se requiere un servidor con autenticación y autorización. `noindex` solicita que los buscadores no indexen la web, pero no garantiza ocultarla ni controla el acceso. El libro de visitas no es compartido entre visitantes: no hay backend.

## Validación

```sh
npm test
```

Los accesos de visitas anteriores ya no implican haber visto la nueva escena de la puerta. El indicador `estacion09-door-scene-v1` solo se guarda al completarla. Si el visitante ya tenía acceso antes de esta actualización, su siguiente entrada con efectos activos muestra la escena completa sin borrar accesos ni mensajes. Si se cancela antes de terminar, puede intentarse de nuevo.

El botón `[ repetir ]` permite volver a ver la escena una vez abierta la puerta. Respeta «calma» y movimiento reducido; si están activos, explica por qué se omite. «Olvidar esta visita» borra también el indicador de escena vista. La preferencia «calma» se conserva por separado.

Verificación de visitantes antiguos, repetición y preferencias (requiere Playwright y Chromium):

```sh
npm run test:door
```

Los tests de Node verifican el HTML y los recursos (incluidas las runas, la puerta cerrada y los recortes con transparencia), los GIFs, respuestas HEAD, errores 404 y el bloqueo de archivos de configuración. Durante el desarrollo también se recorrieron las puertas, la navegación, los documentos, el libro de visitas, la persistencia, el audio, el reinicio y movimiento reducido mediante Chromium/Playwright, en escritorio y móvil.

Publicación: GitHub Pages desde la rama `main`, carpeta raíz (`/`). El archivo `CNAME` conserva `occult.saulmartin.com` y `.nojekyll` permite servir los archivos estáticos sin Jekyll. Cada cambio subido a `main` activa la publicación de Pages; no sincroniza automáticamente los cambios sin guardar o sin subir de este entorno. El certificado y la opción Enforce HTTPS se gestionan en Settings → Pages. No incluye configuración de un servicio oculto.
