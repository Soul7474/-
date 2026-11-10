# occult · estética wired

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

- El umbral solo contiene la entrada y el pie. Se conserva la palabra **eco**, el campo «palabra de acceso», el botón «ABRIR LA PUERTA» y «OLVIDAR ESTA VISITA». Esta variante sustituye la escena animada y su ritual por ese formulario directo, según la nueva dirección sin personajes ni sustos.
- Hay ocho archivos reales: `/gate/00.html` a `/gate/07.html`. Las respuestas desbloquean la siguiente puerta; una URL adelantada se redirige a la última disponible. Las preguntas son las del documento de diseño.
- Los enlaces internos también actualizan la URL sin recargar el documento, para mantener el sonido optativo entre puertas. Recargar o abrir una URL directamente funciona con los mismos archivos estáticos, sin reglas de servidor.
- El bloque principal de cada puerta contiene encabezado, símbolo SVG local, texto corto y pregunta. Menú, registro y pie están fuera del bloque principal para conciliar la estructura mínima con los elementos globales requeridos.
- El libro `/rastro.html` aparece al desbloquear la puerta 03. Contiene diez entradas fijas, la respuesta de Venus como «otro» y mensajes locales. Se muestran como texto, nunca como HTML.
- El registro usa la hora local real, conserva tres o cuatro líneas visibles y recibe actualizaciones cada 20–40 segundos. Mercurio aparece firmado como «otro».
- Inactividad de 45 segundos, regreso a la pestaña y corrección de palabras en Júpiter/Saturno producen cambios mínimos. Marte espera 3–6 segundos con solo un cursor si se contestó «no» en Sol. Con movimiento reducido no hay estos efectos, retraso ni actualización temporizada del registro.
- La salida de Saturno retorna a 00 alternando dos diferencias permitidas: una frase invertida o el símbolo girado. No se repite la diferencia anterior.
- El sonido empieza desactivado. El control de texto lo activa después del acceso; responder «sí» en Sol también constituye el gesto para activarlo. Web Audio genera una sinusoidal de 52 Hz, ganancia 0.02, con silencios de 1–3 segundos cada 40–90 segundos. Se silencia en segundo plano y se detiene al olvidar la visita o cerrar el documento.
- La paleta, tipografía de sistema y columna de 720 px están centralizadas en `style.css`. El rojo oscuro marca bordes de avisos, manteniendo su texto gris para conservar el contraste.

Los archivos originales de `images/`, `gifs/`, `assets/`, `app.js` e `interior.js` permanecen en el repositorio, pero la variante no carga sus escenas ni efectos. `interior.css` queda como archivo de compatibilidad sin reglas. La nueva página usa solo símbolos SVG creados por código y un favicon local (`assets/wired-sigil.svg`).

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

Los siete tests de Node verifican el servidor, los recursos originales y los ocho documentos de puertas y el libro. No hay compilación necesaria.

La comprobación de navegador requiere Playwright y Chromium disponibles en el entorno de desarrollo (no son dependencias de la web). `CHROMIUM_PATH` permite seleccionar el ejecutable. Prueba la palabra de acceso, entrada con teclado, desbloqueo secuencial, URL directa, respuestas, libro y escape de HTML, persistencia, visitante recurrente, contador alterado, retraso, cambios silenciosos, sonido, salida, reset, movimiento reducido y almacenamiento denegado. Comprueba consola, respuestas HTTP y ausencia de peticiones externas. Guarda capturas a 1280 y 375 px en la carpeta temporal `estacion09-check`.

Se han revisado las capturas de escritorio y móvil en Chromium. Queda la valoración subjetiva del tono y del volumen en tus propios altavoces y otros navegadores; no se ha publicado esta variante en el dominio.
