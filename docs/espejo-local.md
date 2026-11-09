# El reverso del sello

Prueba en `feature/soul`; no se publica con la integración de Risketo en `main`.

## Dirección

Una página oculta que se descubre con `⌾` tras abrir el sello del interior. La tensión se apoya en el propio reflejo, su presentación como cinta deteriorada, una pausa antes de una interferencia y la alternativa de una emisión ficticia. Usa el material aportado y conserva los controles de salida. Estas son decisiones de diseño, no resultados de una prueba emocional con visitantes.

Se intentó consultar la documentación de `getUserMedia` de MDN desde este entorno, pero el proxy respondió HTTP 403. No se presenta como fuente consultada. El comportamiento se verificó en Chromium mediante dispositivos de cámara simulados.

## Cámara

- `mirror.html`, `mirror.js` y `mirror.css` son independientes de la entrada y de `app.js`.
- Al cargar no se solicita acceso: primero se explica que es una cámara opcional y solo local; el visitante pulsa «abrir el espejo» para solicitar el permiso nativo del navegador.
- Se solicita solo vídeo, nunca micrófono. El `MediaStream` se asigna directamente al vídeo local. No se utiliza MediaRecorder, captura de fotogramas, reconocimiento facial ni envío de imagen.
- La página declara `connect-src 'none'`, no importa scripts externos y no añade servicios ni almacenamiento de imágenes.
- El estado real permanece visible: cámara activa y espejo local, cámara apagada, o señal ficticia sin cámara.
- Al rechazar, no disponer de cámara o elegir «sin cámara», se ve material ficticio. El mensaje es «la señal no venía de tu cámara»; no se afirma poder acceder sin permiso.
- Apagar, Escape, salir, esconder la pestaña y `pagehide` detienen las pistas del vídeo. Cancelar una solicitud invalida su resultado: si el permiso llega después, se detiene el stream inmediatamente.
- Reintentar solo ocurre por una acción explícita. No hay petición automática tras una negativa.
- Se requiere HTTPS o localhost. Sin esa capacidad se puede seguir con la emisión ficticia.
- Calma y movimiento reducido detienen la interferencia animada. La cámara se puede apagar independientemente de los efectos.

## Integración

`interior.js` añade un único enlace al fragmento abierto del sello y `interior.css` lo presenta como un símbolo pequeño. No se altera la puerta ni se introduce el enlace en el menú principal. El regreso va a `index.html#interior`.

Al llevarlo a `develop`, revisar ese pequeño cambio junto al bloque de profundidad de `puerta-ritual`. La página oculta no necesita las funciones de la entrada.

## Verificación

`npm run test:mirror` levanta un servidor temporal y usa un dispositivo falso de Chromium, sin pedir ni usar la cámara real del entorno. Comprueba solicitud explícita, vídeo sin audio, cierre de pistas, Escape, pestaña oculta, salida, rechazo, señal ficticia, Calma, movimiento reducido, móvil y permiso tardío tras cancelar. Inspecciona también las solicitudes de la página: solo GETs al servidor local, sin subidas.

`npm test` comprueba los recursos y la presencia de la política de red. La vista con una cámara física y sus avisos concretos queda para la revisión en el dispositivo del visitante.
