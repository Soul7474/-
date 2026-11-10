# occult · estética wired / CRT (v3)

Variante experimental en `feature/estetica-wired`, creada desde `main` (`949dc06`). HTML, CSS y JavaScript estáticos: sin framework, dependencias de ejecución, fuentes remotas ni recursos descargados. GitHub Pages puede servir los archivos directamente.

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
- El registro usa la hora local real, conserva tres o cuatro líneas visibles y recibe actualizaciones cada 20–40 segundos. Mercurio aparece firmado como «otro».
- Inactividad de 45 segundos, regreso a la pestaña y corrección de palabras en Júpiter/Saturno producen cambios mínimos. Marte espera 3–6 segundos con solo un cursor si se contestó «no» en Sol. Con movimiento reducido no hay estos efectos, retraso ni actualización temporizada del registro.
- La salida de Saturno retorna a 00 alternando dos diferencias permitidas: una frase invertida o el símbolo girado. No se repite la diferencia anterior.
- El sonido empieza desactivado. El control de texto lo activa después del acceso; responder «sí» en Sol también constituye el gesto para activarlo. Web Audio genera una sinusoidal de 52 Hz, ganancia 0.02, con silencios de 1–3 segundos cada 40–90 segundos. Se silencia en segundo plano y se detiene al olvidar la visita o cerrar el documento.
- La paleta monocroma, tipografía Courier, espaciado amplio y columna de 640 px están centralizados en `style.css`. Todos los textos y controles están centrados. Las preguntas y el pie pueden ocupar varias líneas en móvil para conservar sus palabras y su legibilidad, sin desplazamiento horizontal. Se utilizan fuentes de sistema; el pie caligráfico depende de las familias disponibles en cada dispositivo.

## Sistema visual v3

`sigil.js` expone `renderSigil(gateIndex)`: círculos de radio 185, 150 y 128; heptagrama {7/2}; siete símbolos planetarios, con el de cada esfera resaltado. El Gate 00 usa el sigilo con punto central y sin heptagrama; el umbral de acceso `/` usa la fotografía original. Saturno muestra el GIF local `assets/still-here.gif`. Los ocho pies caligráficos son los del documento v3.

Tres capas fijas no interactivas producen scanlines, barras y viñeta/grano SVG local. `crt.js` programa por separado el corte horizontal (cada 6–15 s, durante 120–260 ms), bloom (8–20 s, durante 150–300 ms) y parpadeo de barra (5–12 s, durante 100 ms). El clon visual es inerte y se retiran sus identificadores para no duplicar controles accesibles. Los tiempos se cancelan al ocultar la pestaña, cambiar de página o activar movimiento reducido. Escape elimina el efecto transitorio visible.

Con movimiento reducido se ocultan las tres capas CRT y no se programan efectos. La luz estática del texto se conserva. En Saturno se muestra un fotograma del GIF dibujado en canvas, sin animación visible ni recursos nuevos. Las capas no interceptan clics ni foco.

Los archivos originales de `images/`, `gifs/`, `assets/`, `app.js` e `interior.js` permanecen intactos. La variante no carga el antiguo JavaScript ni las escenas de apariciones. `interior.css` queda como archivo de compatibilidad sin reglas. No se han descargado recursos ni añadido dependencias.

## Estado local

`wired-state.js` administra `occult_state`: `firstVisit`, `lastVisit`, `visits`, `gate`, `answers` y `visitorNo`. Añade `opened` y los indicadores de retorno necesarios. Las entradas propias del libro se guardan en `occult_traces`. Todas las operaciones de almacenamiento tienen `try/catch`.

Una visita se cuenta al iniciar otra sesión de pestaña o volver en otro día local; navegar entre puertas no aumenta la cuenta. El número original de visitante permanece fijo; Júpiter puede alterar solo el número mostrado. La hora secundaria de Luna difiere en 17 minutos. La frase «ya estuviste aquí» aparece en visitas de otro día.

Si el navegador deniega el almacenamiento local, se conserva una copia de la sesión en `window.name` para poder continuar incluso al abrir otra ruta del mismo origen. En ese caso no se garantiza memoria entre sesiones. «OLVIDAR ESTA VISITA» borra el nuevo estado, las entradas propias y esa copia, y devuelve al umbral. No modifica los datos de la versión anterior en `estacion09-v1`.

Estas puertas son navegación de ficción local, no autenticación de servidor. El libro no es compartido entre navegadores. Todas las páginas conservan `noindex,nofollow,noarchive`.

## Comprobaciones

```sh
npm test
npm run test:browser
```

Los siete tests de Node verifican el servidor, los recursos originales, los scripts CRT/sigilos y los ocho documentos de puertas y el libro. No hay compilación necesaria.

La comprobación de navegador requiere Playwright y Chromium disponibles en el entorno de desarrollo (no son dependencias de la web). `CHROMIUM_PATH` permite seleccionar el ejecutable. Prueba la palabra de acceso, entrada con teclado, desbloqueo secuencial, URL directa, respuestas, libro y escape de HTML, persistencia, visitante recurrente, contador alterado, retraso, cambios silenciosos, sonido, salida, reset, movimiento reducido y almacenamiento denegado. Comprueba consola, respuestas HTTP y ausencia de peticiones externas. Verifica también los tres efectos CRT con reloj controlado, sus duraciones, la selección de todos los planetas, las capas sin interacción y el GIF estático con movimiento reducido. Guarda capturas a 375, 430 y 1280 px en la carpeta temporal `estacion09-check` (prefijo `v3-`).

Se han revisado las capturas de escritorio y móvil en Chromium. Queda la valoración subjetiva del tono y del volumen en tus propios altavoces y otros navegadores; no se ha publicado esta variante en el dominio.
