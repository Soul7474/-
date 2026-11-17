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

Tocar un ojo cosido, fallar un paso del ritual o fallar una palabra puede invocar una aparición visual de 850 ms (los aciertos del ritual no la invocan), sin destellos, con un intervalo mínimo de 18 segundos. Escape la oculta, cambiar de página o pestaña también. El control «calma» (ahora un pequeño ◌ abajo a la derecha, con su etiqueta accesible) desactiva las apariciones y guarda la preferencia; con movimiento reducido se desactivan. El sonido sigue siendo optativo, activado por el control existente. `assets/presence.png` es un fragmento fotográfico original generado para esta web.

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
4. **Dentro (2,3 s).** La cámara cae entre paredes: franjas gruesas y difusas a dos velocidades y dos luces tenues que pasan. Golpe seco al llegar (rebote de 34 px y un oscurecimiento breve, nunca un destello). Estática de bajo contraste, el rótulo `● REC CAM_09 / SEÑAL PERDIDA` y «Tú no eres quien esperábamos.», que escala con la pantalla y se escribe letra a letra. El interior aparece con un fundido desde negro.

Todo está hecho con CSS y la Web Animations API, sin librerías ni recursos externos (el grano es un SVG de ruido incrustado). Ningún efecto brusco dura más de 850 ms y no hay destellos ni parpadeos fuertes. Si el sonido ambiente está activado, la caída añade un siseo de estática sintetizado.

**Saltar.** A los 2 s aparece un botón discreto «›» (etiquetado «Saltar la escena») abajo a la izquierda, y un doble toque en cualquier punto también salta: los dos llevan directamente al interior y cuentan como escena vista. Escape, en cambio, cancela la escena, te deja en el umbral con la puerta abierta y no la marca como vista. Con «calma» o con movimiento reducido no hay animación: la puerta queda abierta con la mano en el marco y la cara en el hueco, quietas. Los encuadres se calculan a partir del tamaño de la ventana, en escritorio y en móvil.

Con el sello ya abierto, la fotografía de la puerta es interactiva. Al tocarla, un acercamiento de 1,6 segundos enfoca el hueco de la puerta y termina en negro. Después abre `#interior`: una cámara con una forma orgánica abstracta original y cuatro accesos simbólicos, con nombres breves, a los restos, voces, huellas y subsuelo. Escape cancela el acercamiento; se omite con movimiento reducido o «calma».

El interior usa grano fijo, scanlines y una banda de tracking ocasional. «Calma» también detiene el tracking. Los párrafos largos y las transcripciones están plegados y se conservan íntegros. Los diagramas de transmisión y subsuelo se regeneran con `python3 scripts/generate_forms.py` (sin dependencias). `assets/inner-relic.png` es una imagen abstracta original generada para el proyecto.

En el archivo, el primer sello conserva su contraseña y una pista accesible; si se abre ahí, la puerta de la entrada también queda abierta. Tras entrar se muestran la navegación y los archivos existentes. El archivo público sigue disponible directamente en `#archivo`, sin acertijos obligatorios. La vista `#fragmentos` conserva el material de la antigua portada. Las secciones interiores mantienen la estética monocroma, los formularios, el audio optativo y el respeto a movimiento reducido.

El collage `assets/wired-memory.svg` es una ilustración original: figura anónima, ciudad, tendido telefónico y terminal. Su generador reproducible, sin dependencias, está en `scripts/generate_art.py`:

```sh
python3 scripts/generate_art.py
```

No utiliza personajes, ilustraciones ni portadas de las referencias. El collage se conserva dentro de un fragmento desplegable; tanto este como los GIFs del pasillo y el ojo se presentan en escala de grises. No se cargan fuentes ni recursos de terceros. El contenido público se puede consultar directamente desde `#archivo`; las puertas forman parte del recorrido narrativo.

## Imágenes aportadas

Los 27 originales de `images/` (incluidas las 11 imágenes y GIF añadidos el 17/11) se conservan intactos (el ojo en la oscuridad `71f43ece…`, de 480 px y 2 KB, se retiró por resolución; su lugar en las apariciones lo ocupa la cara en la oscuridad `08fe20c9…`). La dirección actual utiliza sus ojos, figuras alargadas, manos y multitudes. Los 12 primeros se pueden abrir desde **Fragmentos → vestigios**, sin mostrar sus nombres en la interfaz.

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

Cada cinta lleva un rótulo de cinta encontrada (CAM_09 · PASILLO B, CINTA 04 · DESDE EL FONDO DEL POZO, CINTA 06 · LA ÚLTIMA VISITA, CINTA 05 · SELLO, CINTA 03 · NO REPRODUCIR) que además dice qué está haciendo: «sintonizando…» mientras se descarga el GIF y «en pausa · calma» cuando está quieta a propósito. Los GIF empiezan a cargarse 240 px antes de entrar en pantalla. La cinta del archivo es el monitor en directo de la cámara 09, con REC y el reloj de la cámara; la criatura del interior se ve, respirando. Por la web, las cintas tienen tamaños, márgenes e inclinaciones distintos (no una columna centrada), llevan scanlines y grano encima y aparecen con un fundido la primera vez que entran en pantalla; en móvil se quitan los desplazamientos para que nada se solape. Los tres ojos abiertos de la entrada encuadran el ojo de su cinta, más grande y claro, y respiran despacio. También pueden abrirse en **Fragmentos → cintas**. Los fotogramas de `assets/gif-stills/` son capturas del navegador de los GIFs originales. Se muestran de entrada; `IntersectionObserver` carga la animación cuando entra en pantalla. Se vuelve al fotograma cuando sale de pantalla, se oculta la pestaña, se activa «calma» o el navegador pide movimiento reducido. La cinta con cortes más marcados no se reproduce automáticamente: requiere pulsarla o abrirla desde «cintas». Los GIFs no añaden audio.

## Interior cambiante (fases 2–5)

La extensión está separada en `interior.js` y `interior.css`. La entrada y `crossDoor()` siguen en `app.js`; el contrato `window.EstacionInterior` expone únicamente consulta del estado, contexto de audio ya activado, apariciones y apertura del subsuelo. Los eventos `station:sound` y `station:transmission` comunican acciones confirmadas. No modificar la puerta para añadir comportamientos al interior.

La sala está compuesta en profundidad: la figura del ojo, cerca y grande; las figuras de la luna y de los brazos justo detrás, más pequeñas, tenues y desenfocadas cuanto más lejos; la multitud y la neblina al fondo. Máscaras radiales y una viñeta de sala las funden con la oscuridad. Se desplazan un poco con el ratón (o con la inclinación del móvil, donde el navegador la da sin pedir permiso) y la figura del ojo y la de la luna giran levemente para seguirte; se hace con las propiedades `translate` y `rotate`, aparte de `transform`, para que los cambios de posición de las presencias sigan funcionando. Las figuras llegan una tras otra cada vez que se entra. Los cuatro accesos nunca se mueven. «Calma» y movimiento reducido lo desactivan todo.

Cerrar un documento, vestigio o marca cambia las posiciones de las presencias. Los cuatro accesos permanecen fijos. La memoria se guarda en `sessionStorage` durante la sesión; «borrar rastro» también la borra. «Calma» y movimiento reducido fijan la escena y cancelan los sucesos pendientes.

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

## Ecos de otras webs

Algunas ideas vienen de dos webs personales antiguas: *Terminal 00* (angusnicneven.com) y *Wired Sound for Wired People* (fauux.neocities.org). Se ha tomado la idea, nunca imágenes, textos ni código: todo está hecho con recursos propios de la estación, en su paleta monocroma y en español.

- **Portada 403** (sustituye a la antigua «ESCUCHA»; ver *Intruso*).
- **Una súplica en muchos idiomas.** Bajo la cabecera, «[recuérdame]» va cambiando entre catorce idiomas (fija con movimiento reducido).
- **Crees que eres invisible.** «Crees que eres invisible. [firmar]» hasta que firmas el libro de visitas; después, «Has firmado. Ya no hace falta que finjas».
- **El descenso (`#descenso`).** Una vista oculta muy larga, sobre un fondo de estática en forma de rombos (tres teselas de canvas que se alternan, sin destellos). Paneles en caracteres de ancho completo repiten «Vuelve atrás. Esto es un [CALLEJÓN SIN SALIDA]» mientras el texto se descompone: espaciado, sombra que resbala, corchetes vacíos, una línea entre barras, «[Intentando…]», otra al revés. Hay una franja de ojos recortados de las imágenes de la estación que se desliza al bajar, y al fondo del todo una revelación. Con «calma» o movimiento reducido todo queda quieto.
- **Puertas que parecen texto.** Enlaces sin subrayado que llevan al descenso (ver soluciones).
- **La estatua (`#estatua`).** Al fondo del descenso, un «∴» lleva a una sala oscura con un busto de mármol que gira dibujado como una pantalla de fósforo (tríadas de puntos en grises y líneas de barrido) sobre un `<canvas>`. Si mueves el puntero sobre él, vuelve la cara hacia ti. Con «calma» o movimiento reducido se queda quieto, de frente. El busto es *Marble Bust 01* de Rico Cilliers en Poly Haven (CC0). Se renderizó en Blender como un giro de 48 fotogramas, con fondo negro, luz principal dura y contraluz débil, y se guardó en una sola hoja en escala de grises: `assets/statue-turntable.png` (8×6 fotogramas de 168×224 px).
- **404 propio.** `404.html`, que GitHub Pages sirve para cualquier dirección que no exista: fondo de «SIN SEÑAL», rótulos invertidos, las frecuencias conocidas para volver y la figura del ojo en una esquina. El servidor local devuelve la misma página con estado 404.
- **Detalles.** Esquinas ⌈ ⌉ ⌊ ⌋ en la cabecera, cursores propios (un anillo y, sobre los enlaces, un ojo) y una selección de texto pálida.

## Intruso: la estación se da cuenta de que estás

Rama `intruso`. La idea: esta web no es para ti. Está hecha para otros (notas internas, inventarios, inscripciones) y poco a poco se da cuenta de que hay alguien que no debería estar. No se explica el miedo: se nota en detalles normales que están mal. Todo pasa en el navegador del visitante; **no se envía ni se recoge nada**. La lógica está en `vigilia.js` y `vigilia.css`; `app.js` solo cambia en textos, en la portada y en dos documentos.

- **Intrusión (`intrusion.js`, `intrusion.css`).** Lo primero, una vez por sesión, antes del 403, es una terminal negra a toda pantalla que finge que la estación ha entrado en el dispositivo (unos 11 s):
  - abre una «sesión» desde una dirección de red local (192.168.1.x, inventada);
  - «identifica» el aparato con lo que el navegador ya sabe: sistema, navegador, pantalla, gráfica (WebGL), núcleos y memoria, idioma, zona horaria, hora y batería si el navegador la da;
  - dice que ya tenía la cámara y el micrófono, y «copia» Fotos, Documentos y Conversaciones (o el Escritorio) con barras;
  - repite «no cierres esta ventana» y enseña la dirección en tamaño enorme con «te estamos viendo» en rojo (con el grave del susto si el audio ya está activo);
  - se rompe con un temblor y corta de golpe al 403 en blanco.

  Es teatro: no pide ningún permiso, no lee nada y no hace ninguna petición fuera de la web (el test lo comprueba). No imita avisos de ningún sistema, antivirus ni autoridad, y no pide nada. Un toque durante la intrusión pide pantalla completa y contesta «no toques nada.». Escape o «›» la saltan. Con movimiento reducido sale todo a la vez y dura unos 4,6 s. Para lectores de pantalla hay una línea oculta que dice que es parte de la historia.
- **Portada 403.** Una vez por sesión, antes del umbral, aparece una página de error de Apache de 1998, blanca y normal, con la pestaña titulada «403 Forbidden». A los 2 s, debajo, se escribe «no deberías poder ver esto.»; la página se hunde despacio en negro (1,8 s, nunca un destello) y añade «pero ya te hemos visto.». Después hay dos opciones: «[ escuchar ]» activa el sonido ambiente con tu clic; «[ irse ]» contesta «no.» y te deja entrar igualmente, en silencio. Escape la cierra. Con movimiento reducido aparece todo a la vez.
- **Susurros.** Abajo a la izquierda aparecen frases que primero se escriben en runas y se «traducen» solas, letra a letra (con movimiento reducido salen ya en letras). Hablan de cosas reales del visitante, sin guardar nada fuera de su navegador:
  - la hora local («17:34. aquí siempre son las 03:33.»; de madrugada, «a esta hora no debería haber nadie»);
  - cuántas veces ha venido («has vuelto», «hace 2 días cerraste la ventana. no sirvió», «5.ª vez. ya no hace falta que llames»);
  - el aparato («lo tienes muy cerca de la cara»);
  - quedarse quieto («¿sigues ahí?», «te oigo respirar.»);
  - sacar el puntero por arriba de la ventana («no te vayas.»), copiar texto («eso no es tuyo.»), abrir el menú contextual, las herramientas de desarrollo o el código fuente, encoger la ventana;
  - entrar en cada sala, escribir en el libro de visitas («te leemos mientras escribes.», «ese no es tu nombre.»);
  - y, tras «borrar rastro», «has borrado tu rastro. nosotros no.».

  Cada frase sale como mucho una vez por sesión, con al menos 6,5 s entre una y otra.
- **La pestaña.** Al cambiar de pestaña, el título va pasando por «¿adónde vas?», «vuelve», «sigo aquí»… Al volver, «te he visto volver». El favicon es un ojo dibujado en un canvas que parpadea, y que se queda abierto de par en par mientras no miras.
- **Cosas que cambian.** Cada vez que vuelves de otra pestaña, una sola frase que ya habías leído ha cambiado («Este lugar ya no existe. ¿Por qué has vuelto?»). Un documento abierto durante unos segundos reescribe una frase sin avisar («No sabemos por qué.» pasa a ser «Ahora sabemos por qué.»). Al bajar por el archivo y volver arriba, el título termina su frase: «Lo que queda *de ti.*».
- **Alguien más.** Con ratón, en las salas interiores y tras 25 s, un segundo cursor tenue te sigue con retraso, se para un poco antes de llegar a ti y, de vez en cuando, se va solo a un enlace y se queda encima, como si otra persona estuviera eligiendo. En móvil, a veces, un momento después de tocar, aparece un anillo tenue en el lugar simétrico. Ninguno de los dos aparece con «calma» ni con movimiento reducido.
- **Quietud.** Si no te mueves durante casi un minuto, la oscuridad se cierra despacio desde los bordes (8 s) y en la esquina asoma, muy tenue, la cara de la puerta. En cuanto te mueves, desaparece («te has movido.»). Si sigues quieto, «no te des la vuelta.». Con el sonido activado, mientras tanto se oye una respiración en el oído izquierdo. Se repite como mucho cada 2,5 minutos; no ocurre con «calma» ni con movimiento reducido.
- **CAM_10 · DETRÁS DE TI.** Una vez por sesión, tras 40 s en el archivo y con el monitor a la vista, la cámara cambia de canal durante 6,5 s: estática y una figura que se acerca («no te gires.»). No se usa ninguna cámara real.
- **Dos presencias.** A los dos minutos, el pie pasa a «2 PRESENCIAS EN ESTE NODO» («ya no estás solo en el nodo.»), y después vuelve a una: «¿cuál de las dos eres tú?».
- **El libro de visitas contesta.** 7 s después de firmar, `sin_remitente` cita tu mensaje: «Lo leí antes de que lo enviaras.». En la siguiente visita, si firmaste con un alias, te llama por él: «sabemos que no te llamas así. sirve igual.».
- **Tus accesos.** `acceso_no_autorizado.log`, en el archivo, lista tus propias visitas con fecha y hora (las guarda `localStorage` en `estacion09-rastro`) y termina con la hora de ahora: «sigue aquí. está leyendo este archivo.». «borrar rastro» no lo borra: hay que borrar los datos del sitio en el navegador.
- **Runas que se leen.** Las inscripciones están en futhark antiguo real y se descifran con `abecedario.txt` (archivo, pegado «bajo el teclado de la sala 0»): el umbral (ᚾᛟ᛫ᛖᚱᛖᛊ᛫ᛞᛖ᛫ᛚᛟᛊ᛫ᚾᚢᛖᛊᛏᚱᛟᛊ), el anillo que gira alrededor de la figura del interior, el pie, el fondo del descenso y la 404. La runa de la pared para la i pasa a ser ᛁ (isa), la correcta. El ritual no cambia.
- **Consola del navegador.** Quien la abra encuentra un mensaje.
- **Menos protección a la vista.** La navegación son rutas (`../umbral`, `dentro/`, `restos/`, `fragmentos/`, `voces/`, `huellas/`, `debajo/`). «calma» es un ◌, «saltar» es «›» y «Olvidar esta visita» es «borrar rastro». Todo mantiene sus etiquetas accesibles y su funcionamiento.
- **Textos.** El subsuelo dice «No eras *tú.*». La estatua tiene una etiqueta de inventario cuyo estado cambia mientras gira («de espaldas», «de frente», «girando»).

### Perdido

- **Sin menú y sin nombre.** Ya no hay barra de navegación ni el título «estación_09»: solo quedan la súplica que cambia de idioma y «Crees que eres invisible.». Se avanza por las puertas del interior (restos, voces, huellas, debajo) y se vuelve con un «↶» discreto al final de cada sala. A *fragmentos* se llega desde el pie del archivo («quedan fragmentos.») o desde la 404. El sonido es un pequeño control fijo arriba a la derecha (en móvil, solo ▥).
- **La pestaña no dice dónde estás.** El título es el nombre de la sala en runas (ᚱᛖᛊᛏᛟᛊ, ᚹᛟᚲᛖᛊ…), y antes de que cargue nada, «403 Forbidden».
- **Pantalla completa.** Al elegir en la portada 403, la web pide pantalla completa (los navegadores solo lo permiten tras un clic; el iPhone no lo admite y se queda como está). Si sales, «no hay salida por ahí.» y el siguiente clic te vuelve a meter, como mucho dos veces por sesión; a la tercera te deja: «vale. mira desde fuera, si eso te tranquiliza.».
- **Tu cursor desaparece.** Con ratón, cada pocos minutos tu puntero se esconde unos 5 s y solo queda el otro cursor, más visible, moviéndose por su cuenta: «¿cuál de los dos eres tú?». Escape lo devuelve al instante. Cuando el otro cursor se posa en un enlace, lo «pulsa» (un anillo tenue).
- **Palabras en el vacío.** De vez en cuando, una palabra enorme y casi invisible (DETRÁS, QUÉDATE, TE VEO…) aparece unos segundos detrás de todo.

Ninguno de estos efectos ocurre con «calma» ni con movimiento reducido, salvo los títulos y el menú.

Verificación: `npm run test:vigilia` (Playwright + Chromium).

## Salas ocultas (`ocultos.js`, `ocultos.css`)

Seis salas que no salen en ningún plano. A cada una se llega por varios enlaces escondidos repartidos sin orden (y la consola del navegador muestra sus nombres en runas):

| Sala | Qué es | Desde dónde se llega |
| --- | --- | --- |
| `#pozo` | Un pozo sin fondo que se genera mientras bajas: frases, runas, recortes, cosas sobre ti; un contador de profundidad. Las letras se van volviendo runas cuanto más bajas. A 333 m hay una salida a tu habitación; a 666 m todo se funde en negro con «AQUÍ» (fundido de 1,2 s, sin destello); a 999 m asoma la cara. | «↓» bajo la estatua |
| `#habitacion` | Un informe sobre el visitante, escrito a máquina con lo que el navegador ya sabe: alias, primer acceso, hora y ciudad de su zona horaria, si hay luz, pantalla, si sostiene el móvil, idioma, modo oscuro, batería (si el navegador la da), núcleos; y en vivo, cuánto lleva y desde cuándo no se mueve. Una cámara «CAM_10 · TU HABITACIÓN». **No se envía nada.** | «⌗» en el suelo del interior; «tú» en la 404; el pozo |
| `#ellos` | Lo que dejaron los que entraron antes, de 1998 a hoy, torcido y desordenado: tachones, censura, runas, entradas vacías, alguien de tu ciudad hace tres días, «hay uno nuevo» hace siete minutos… y `sin_remitente` escribiendo en directo. | «ver a los demás» en el libro de visitas; el pozo |
| `#espejo` | Todo al revés. Una cara que se mueve al contrario que tu puntero, y el cursor fantasma, también en espejo. | La línea invertida del descenso; «mírate» en la habitación |
| `#nadie` | Una página blanca de Times New Roman (entra con un fundido, sin destello): «no hay nadie aquí.» · «salvo tú.» · «no mires hacia abajo.». Muy abajo, algo. | El «©» del pie; «nadie» en el espejo y en la 404 |
| `#volcado` | El volcado hexadecimal sin fin de `estacion09.img`, con palabras escondidas entre los bytes (SÁCAME, TE VEO, tu alias, lo que escribiste) y, tras un sector dañado, runas. | «nombre» en *fragmentos*; la orden `volcado` en la consola de la sala 0 |

**Desorden.** El archivo cambia de orden cada vez que entras, y en cada sala algunos elementos quedan un poco torcidos y desplazados, distintos cada vez. A veces (como mucho dos por sesión, nunca en el primer minuto) la flecha de volver te lleva a una sala oculta: «ese no era el camino.».

Verificación: `npm run test:ocultos`.

## Caos (`caos.js`, `caos.css`) y sonido grave

- **Pantalla entera.** El interior ocupa toda la pantalla (la cámara, las figuras y las puertas se reparten por todo el ancho), sin pie ni cabecera; «↶ umbral» queda fijo abajo a la izquierda. Las demás salas también usan todo el ancho y el fondo es negro puro.
- **Fotos por todas partes.** En cada sala, cada vez que entras, se reparten entre 6 y 9 imágenes del repositorio (recortes, fotogramas de los GIF, originales): torcidas, cortadas, invertidas, medio fuera, algunas a la deriva muy despacio y una o dos por delante de todo, casi invisibles. Las del grito y la cara no se usan, para que los sustos conserven su efecto. En el interior solo hay 3 y muy tenues; en *nadie* y en el umbral, ninguna.
- **Nada es un rectángulo.** Las cámaras, cintas, vestigios y pantallas pierden marcos y bordes: tienen bordes rotos (cinco formas de recorte) y fundidos, y aparecen torcidas y desplazadas de forma distinta en cada visita.
- **Menos datos.** Fuera las descripciones y los tamaños del archivo, las migas de pan, las etiquetas técnicas, los relojes de las cámaras y las ondas. El archivo es una lista de nombres desparramada por la pantalla. Los títulos se escriben medio en runas, distinto cada vez.
- **Sonido grave en todos los sustos.** Todos los sustos (los gritos, las apariciones, CAM_10 y el apagón del pozo) suenan aunque no se haya activado el sonido ambiente: el primer toque o tecla desbloquea el audio en silencio. El sonido se sintetiza en el momento: un subgrave que cae de 62 a 21 Hz; un acorde disonante en lo más bajo del teclado (mi, fa, la#, si) saturado para que se oiga en altavoces pequeños; un golpe sordo; un gemido lejano de formantes que baja; y la cola de una sala oscura (reverberación generada). Pasa por un limitador para no saturar. Las apariciones usan una versión más corta y suave. «Calma» y el movimiento reducido siguen desactivando los sustos.

Verificación: `npm run test:ocultos` incluye que el audio queda desbloqueado tras el primer toque con el ambiente apagado.

### Imágenes del 17/11

- **Caras de los sustos.** Cada tipo de susto elige una cara al azar entre varias y nunca repite la anterior: *dientes* (grito original, la sonrisa en la oscuridad `b3ea…`, la máscara blanca `ed97…`), *cara* (la cara de la puerta, el fantasma `92c3…`, el maniquí `4777…`) y *pasillo* (la figura del pasillo, la mueca `ac4b…`). Estas imágenes no aparecen sueltas en ninguna otra parte, para que no se pierda la sorpresa.
- **Sustos nuevos.** Cuando `sin_remitente` deja de escribir en *ellos*, a los 4,5 s; tras 32 s mirando el *espejo*; y a 1500 m de profundidad en el *pozo*. Cada uno ocurre una vez por sesión.
- **GIF.** La máscara que sonríe despacio (`f7d0…`) es ahora la cara que asoma en la esquina cuando te quedas quieto; la calavera de ojos inquietos (`d1ce…`) está a 999 m en el pozo; la cara oscura (`kamluve-kam.gif`) es el reflejo del espejo. En cada sala, una de cada cuatro veces no hay ningún GIF suelto; las demás veces hay uno (de los ligeros: `d1ce…`, `kamluve`, `giphy (5)`, `giphy (6)`, `giphy.gif`).
- **Interior.** La polilla de ojos (`2b44…`) flota sobre la figura; la criatura agachada (`1fcd…`) aparece en una esquina distinta cada vez que entras, y a veces no está.
- **Apariciones y fotos sueltas.** La polilla, la criatura y la cara borrosa (`b90c…`) se suman a las apariciones. Los recortes y las caras oscuras se reparten entre las fotos sueltas, el pozo y los mensajes de *ellos*, como adjuntos.

## El último turno

La historia continúa la del operador 09, que dejó de escribir a las 03:33 con una «[ENTRADA BORRADA]». El archivo, la estatua, el libro de visitas y la cámara del pasillo B forman una cadena de acertijos que lleva a una sala nueva:

- `inventario_1998.txt` (con el primer sello) habla de una **sala 0** con una consola que pide «el nombre del operador y la palabra de vigilia», de una cámara que graba un pasillo que no está en los planos y de un busto de mármol que nadie pidió.
- `turno_noche.log` (con el segundo sello) recupera parte de la entrada borrada: la estatua solo se mueve cuando no la miras, lleva escrita la palabra en la nuca y está «al fondo, donde ya no se pide volver». Si alguien firma con el nombre del operador en el libro de visitas, la cámara le dejará pasar.
- La **estatua** del descenso lleva la palabra tallada en la nuca, dentro de su propia trama de puntos. Solo se ve cuando te da la espalda, así que hay que dejar de seguirla con el puntero.
- En **Los que llegaron**, firmar con el nombre del operador hace que `sin_remitente` conteste y enciende la cámara.
- El monitor **CAM_09 · PASILLO B** del archivo muestra entonces «[ conectar con la sala 0 ]».
- La **sala 0** (`#control`) es una consola: inicio de sesión, órdenes que cuentan el resto de la historia y un final.

Para volver a jugar desde el principio basta con «borrar rastro».

## Sustos

Hay dos niveles:

- **Apariciones.** Las de siempre: una imagen aportada durante 850 ms, como mucho cada 18 s.
- **Screamers.** El sonido ambiente (si está activado) se corta un instante; después hay un único corte a una cara a pantalla completa que entra de golpe, tiembla y se hunde en negro, con un golpe sonoro distorsionado sintetizado cuando hay sonido. Las caras son el rostro de ojos anulares y dientes (`c2f15d46…`), la cara de la puerta y la figura del pasillo. Saltan al fallar por segunda vez una contraseña, al tercer error del ritual, al quedarse leyendo `no_abrir.txt`, al llegar a «[Intentando…]» en el descenso, al quedarse quieto mirando la estatua hasta que te da la cara, al fallar tres veces la palabra en la consola y en el final.

Ningún screamer parpadea: es un solo corte, como mucho de 820 ms. Hay como mucho uno cada 25 s, ninguno en los primeros 15 s de una visita, cada desencadenante salta una vez por sesión y ninguno salta con «calma» o con movimiento reducido. El del final es el único que ignora el intervalo mínimo.

## Recorrido

- **Umbral:** entrada, cámara animada, registro y primeros documentos.
- **Archivo:** siete fragmentos. Los documentos públicos contienen pistas para las puertas.
- **Transmisiones:** interferencia sintetizada de nueve segundos con transcripción ficticia. El ambiente se activa por separado; no hay audio automático ni archivos remotos.
- **Los que llegaron:** mensajes de ficción y entradas del visitante guardadas en su navegador.
- **Subsuelo:** desenlace tras la segunda contraseña.
- **Descenso:** oculto; solo se llega por las puertas que parecen texto.
- **Sala 0:** la consola de la estación, tras firmar con el nombre del operador.
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

El descenso: la palabra «encontrado» de la cita de Fragmentos («No todo lo que está en la red quiere ser encontrado»), la palabra «PERDIDOS» del pie de página y «más abajo» en la página 404. La estatua: el «∴» bajo la revelación final del descenso.

El último turno:

1. Abrir el primer sello (`eco`) para leer `inventario_1998.txt` y el segundo (`1998`) para leer `turno_noche.log`.
2. En la estatua, dejar de mover el puntero y esperar a que dé la espalda: en la nuca pone `VIGILIA`.
3. Firmar en Los que llegaron con el nombre `operador_09` (da igual el mensaje).
4. En el archivo, pulsar «[ conectar con la sala 0 ]» sobre el monitor de la cámara.
5. En la consola: `operador_09`, luego `vigilia`. Órdenes: `ayuda`, `estado`, `registro`, `camaras`, `presencias`, `frecuencia`, `escuchar`, `salir`; también responde a `eco`, `umbra`, `1998` y `vigilia`.
6. `apagar` y `s` terminan la historia: la estación pasa a tener dos presencias y tú eres el operador.

</details>

`index.html` contiene el umbral y las vistas; `style.css`, la estética; `app.js`, los documentos, pistas, contraseñas, audio y persistencia. `assets/` contiene los GIFs y la imagen estática originales.

Las contraseñas son una mecánica narrativa en JavaScript, **no autenticación segura**. Los textos protegidos están en el cliente y son inspeccionables. Para contenido privado real se requiere un servidor con autenticación y autorización. `noindex` solicita que los buscadores no indexen la web, pero no garantiza ocultarla ni controla el acceso. El libro de visitas no es compartido entre visitantes: no hay backend.

## Validación

```sh
npm test
```

Los accesos de visitas anteriores ya no implican haber visto la nueva escena de la puerta. El indicador `estacion09-door-scene-v1` solo se guarda al completarla. Si el visitante ya tenía acceso antes de esta actualización, su siguiente entrada con efectos activos muestra la escena completa sin borrar accesos ni mensajes. Si se cancela antes de terminar, puede intentarse de nuevo.

El botón `[ repetir ]` permite volver a ver la escena una vez abierta la puerta. Respeta «calma» y movimiento reducido; si están activos, explica por qué se omite. «borrar rastro» borra también el indicador de escena vista. La preferencia «calma» se conserva por separado.

Verificación de visitantes antiguos, repetición y preferencias (requiere Playwright y Chromium):

```sh
npm run test:door
npm run test:vigilia
```

Los tests de Node verifican el HTML y los recursos (incluidas las runas, la puerta cerrada y los recortes con transparencia), los GIFs, respuestas HEAD, errores 404 y el bloqueo de archivos de configuración. Durante el desarrollo también se recorrieron las puertas, la navegación, los documentos, el libro de visitas, la persistencia, el audio, el reinicio y movimiento reducido mediante Chromium/Playwright, en escritorio y móvil.

Publicación: GitHub Pages desde la rama `main`, carpeta raíz (`/`). El archivo `CNAME` conserva `occult.saulmartin.com` y `.nojekyll` permite servir los archivos estáticos sin Jekyll. Cada cambio subido a `main` activa la publicación de Pages; no sincroniza automáticamente los cambios sin guardar o sin subir de este entorno. El certificado y la opción Enforce HTTPS se gestionan en Settings → Pages. No incluye configuración de un servicio oculto.
