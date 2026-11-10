# occult · estética wired / CRT (v3.1)

Variante experimental en `feature/estetica-wired`, creada desde `main` (`949dc06`). HTML, CSS y JavaScript estáticos: sin framework ni dependencias de ejecución. La fuente de máquina de escribir se incluye en el repositorio; no se solicitan fuentes ni recursos a servicios externos durante la visita. GitHub Pages puede servir los archivos directamente.

## Previsualizar

Requiere Node.js 20 o superior. Desde la carpeta de tu clon, en PowerShell:

```powershell
git fetch origin
git switch feature/estetica-wired
$env:PORT = "3001"
npm.cmd run dev
```

Abre <http://localhost:3001>. No necesitas `npm install`. `npm.cmd` evita el bloqueo de scripts de PowerShell. En Linux/macOS: `PORT=3001 npm run dev`.

La rama no cambia la publicación de `occult.saulmartin.com`: Pages sigue publicando `main`. No se ha hecho merge ni cambiado `CNAME`.

## Recorrido y decisiones

- El umbral recupera la fotografía original `assets/door-009.png`, sin alterar sus bytes. Conserva la palabra **eco**, el campo «palabra de acceso», el botón «ABRIR LA PUERTA» y el reinicio de visita. Los archivos de la puerta original siguen intactos. La variante mantiene su formulario de acceso; no carga el antiguo guion de apariciones ni la escena cinematográfica de `main`.
- Hay ocho archivos reales: `/gate/00.html` a `/gate/07.html`. Las respuestas desbloquean la siguiente puerta; una URL adelantada se redirige a la última disponible. Las preguntas son las del documento de diseño.
- Los enlaces internos también actualizan la URL sin recargar el documento, para mantener el sonido optativo entre puertas. Recargar o abrir una URL directamente funciona con los mismos archivos estáticos, sin reglas de servidor.
- Cada página sigue el orden vertical v3: encabezado, esfera, cita, imagen, pie caligráfico, `Powered by NOTEPAD.EXE`, pregunta, navegación, registro y pie. Todo queda dentro de `#screen`, con el contenido cambiante en `#content`. La navegación solo muestra puertas abiertas; Home lleva a 00, sin volver a la entrada cerrada.
- El libro `/rastro.html` aparece al desbloquear la puerta 03. Contiene diez entradas fijas, la respuesta de Venus como «otro» y mensajes locales. Se muestran como texto, nunca como HTML.
- El registro usa la hora local real en `HH:MM:SS`. Las tres primeras líneas se sitúan 9, 5 y 2 segundos antes del renderizado; recibe una nueva cada 20–40 segundos, sin repetir el mensaje anterior y con un máximo de seis visibles. Mercurio aparece firmado como «otro».
- Inactividad de 45 segundos, regreso a la pestaña y corrección de palabras en Júpiter/Saturno producen cambios mínimos. Marte espera 3–6 segundos con solo un cursor si se contestó «no» en Sol. Con movimiento reducido no hay estos efectos, retraso ni actualización temporizada del registro.
- La salida de Saturno retorna a 00 alternando dos diferencias permitidas: una frase invertida o el símbolo girado. No se repite la diferencia anterior.
- El sonido empieza desactivado. El control de texto lo activa después del acceso; responder «sí» en Sol también constituye el gesto para activarlo. Web Audio genera una sinusoidal de 52 Hz, ganancia 0.02, con silencios de 1–3 segundos cada 40–90 segundos. Se silencia en segundo plano y se detiene al olvidar la visita o cerrar el documento.
- La paleta monocroma, Special Elite autoalojada, espaciado amplio y columna de 640 px están centralizados en `style.css`. El cuerpo usa 16 px en móvil y 18 px desde 600 px, peso 700, trazo de 0.3 px y glow blanco. Courier es el fallback. La identidad del pie se divide en tres líneas; las preguntas envuelven en móvil sin scroll horizontal. El pie caligráfico mantiene las fuentes de sistema del dispositivo.

## Sistema visual v3.1

`sigil.js` expone `renderSigil(gateIndex)`: círculos de radio 185, 150 y 128; heptagrama {7/2}; siete símbolos planetarios, con el de cada esfera resaltado. El filtro `engrave` aplica desplazamiento de escala 4 y grano (matriz -3.6), anillo de texto latino a radio 196, 49 marcas y serpiente de dos contornos de 180 puntos (`r = 64 + 4·sin(23θ) ± 3`) con cabeza triangular y ojo negro, sobre el heptagrama al 50 % de opacidad. Los planetas apagados usan 38 px al 70 % y el activo 46 px con glow; un círculo negro de radio 18 evita que los anillos los crucen. El Gate 00 usa el sigilo con punto central y sin heptagrama; el umbral de acceso `/` usa la fotografía original. Saturno muestra el GIF local `assets/still-here.gif`. Los ocho pies caligráficos son los del documento v3. La cita larga de Luna se restaura completa; se conserva su variante breve si se respondió «sí» en 00.

La puerta y Saturno usan `.fig-img`, sin marco ni halo rectangular, con máscara elíptica y posterización `#onebit`. La imagen ocupa todo el ancho disponible hasta 560 px. La puerta se recorta a 4:5 con `object-fit:cover` y `object-position:85% 50%`, centrando el hueco sin alterar la máscara ni el filtro; Saturno conserva su proporción. El filtro trabaja en sRGB y eleva 2.2 veces la exposición antes de aplicar los niveles pedidos: el original es tan oscuro que sin este ajuste desaparecía. No se ha modificado el PNG ni el GIF.

Special Elite se descargó del paquete `@fontsource/special-elite@5.3.0`. El WOFF2 latino original y la licencia Apache 2.0 están en `assets/fonts/`; el README de esa carpeta documenta procedencia y checksum. No se añadió una dependencia npm. El servidor de desarrollo admite `font/woff2`.

Tres capas fijas no interactivas producen scanlines, barras y viñeta/grano SVG local. `crt.js` programa por separado el corte horizontal (cada 6–15 s, durante 120–260 ms), bloom (8–20 s, durante 150–300 ms) y parpadeo de barra (5–12 s, durante 100 ms). El clon visual es inerte y se retiran sus identificadores para no duplicar controles accesibles. Los tiempos se cancelan al ocultar la pestaña, cambiar de página o activar movimiento reducido. Escape elimina el efecto transitorio visible.

Con movimiento reducido se ocultan las tres capas CRT y no se programan efectos. La luz estática del texto se conserva. En Saturno se muestra un fotograma del GIF dibujado en canvas, sin animación visible ni recursos nuevos. Las capas no interceptan clics ni foco.

Los archivos originales de `images/`, `gifs/`, `assets/`, `app.js` e `interior.js` permanecen intactos. La variante no carga el antiguo JavaScript ni las escenas de apariciones. `interior.css` queda como archivo de compatibilidad sin reglas. El único recurso externo incorporado en v3.1 es el WOFF2 local con su licencia; la web no depende de una conexión a ese proveedor.

## Estado local

`wired-state.js` administra `occult_state`: `firstVisit`, `lastVisit`, `visits`, `gate`, `answers` y `visitorNo`. Añade `opened` y los indicadores de retorno necesarios. Las entradas propias del libro se guardan en `occult_traces`. Todas las operaciones de almacenamiento tienen `try/catch`.

Una visita se cuenta al iniciar otra sesión de pestaña o volver en otro día local; navegar entre puertas no aumenta la cuenta. El número original de visitante permanece fijo; Júpiter puede alterar solo el número mostrado. La hora secundaria de Luna difiere en 17 minutos y se conserva como una línea de «conexión». La frase «ya estuviste aquí» aparece en visitas de otro día.

«tiempo en el nodo» es duración, no hora de conexión: se calcula a partir de `Date.now()` al cargar el documento y se actualiza cada segundo. Continúa entre puertas sin recarga, incluye el tiempo en segundo plano y se recalcula al volver; la pestaña oculta no mantiene el temporizador activo. Recargar el documento o «olvidar esta visita» reinicia esa duración. El contador funcional continúa actualizándose con movimiento reducido.

Si el navegador deniega el almacenamiento local, se conserva una copia de la sesión en `window.name` para poder continuar incluso al abrir otra ruta del mismo origen. En ese caso no se garantiza memoria entre sesiones. «OLVIDAR ESTA VISITA» borra el nuevo estado, las entradas propias y esa copia, y devuelve al umbral. No modifica los datos de la versión anterior en `estacion09-v1`.

Estas puertas son navegación de ficción local, no autenticación de servidor. El libro no es compartido entre navegadores. Todas las páginas conservan `noindex,nofollow,noarchive`.

## Comprobaciones

```sh
npm test
npm run test:browser
```

Los ocho tests de Node verifican el servidor, los recursos originales, los scripts CRT/sigilos, los ocho documentos de puertas, el libro y el MIME del WOFF2. No hay compilación necesaria.

La comprobación de navegador requiere Playwright y Chromium disponibles en el entorno de desarrollo (no son dependencias de la web). `CHROMIUM_PATH` permite seleccionar el ejecutable. Prueba la palabra de acceso, entrada con teclado, desbloqueo secuencial, URL directa, respuestas, libro y escape de HTML, persistencia, visitante recurrente, contador alterado, retraso, cambios silenciosos, sonido, salida, reset, movimiento reducido y almacenamiento denegado. Comprueba consola, respuestas HTTP y ausencia de peticiones externas. Verifica también los tres efectos CRT con reloj controlado, sus duraciones, la selección de todos los planetas, las capas sin interacción y el GIF estático con movimiento reducido. Guarda capturas a 375, 430 y 1280 px en la carpeta temporal `estacion09-check` (prefijo `v31-`).

Se han revisado las capturas de escritorio y móvil en Chromium. Se ha hecho scroll real mediante rueda de ratón a 375 px: las tres capas conservan x=0, y=0 y las dimensiones del viewport; las barras quedan arriba y abajo después de desplazarse. No se cambió su posicionamiento: que solo aparezcan en el primer tramo de una captura completa es un artefacto de la captura. `v31-scroll-375.png` muestra un viewport ya desplazado y `v31-scroll.json` guarda las medidas.

Los tests comprueban intervalos y duraciones de varios cortes, blooms y parpadeos, además de su cancelación con movimiento reducido. Se verificaron también en Chromium con el reloj real, sin acelerarlo, y se guardó un vídeo de evidencia fuera del repositorio. Queda la valoración subjetiva del tono y del volumen en tus propios altavoces y otros navegadores; no se ha publicado esta variante en el dominio.
