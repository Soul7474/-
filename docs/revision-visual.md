# Revisión del interior — 9 de noviembre de 2026

## Qué se revisó

Recorrido local en Chromium, con la sesión limpia, con y sin sonido; regreso al interior tras examinar imágenes; estados posteriores de la sesión; escritorio y móvil. Se comparó la composición anterior con la nueva y se conservaron los accesos y las soluciones de los acertijos.

Se intentó consultar material externo en Frictional Games, Nielsen Norman Group y W3C. Las solicitudes fueron rechazadas por el proxy del entorno con HTTP 403. No se han leído esos artículos y no se presentan como bibliografía consultada. Esta revisión se basa en la aplicación, sus imágenes y la comparación visual; no es un estudio de respuesta emocional con participantes.

## Problemas observados

1. **Competencia entre imágenes.** Varias figuras grandes, de tinta clara, disputaban la atención. La pantalla se leía como una colección de ilustraciones.
2. **Ausencia de espacio compartido.** Las figuras flotaban alrededor de los accesos. No había distancias, objetos cotidianos ni un lugar que pudiera cambiar.
3. **Repetición reconocible.** El estado visual dependía de `visits % 4`: cada cuatro consultas volvía al inicio. La repetición convertía la presencia en una animación predecible.
4. **Apariciones desligadas de la escena.** El salto de una imagen a pantalla completa no pertenecía al espacio que se acababa de observar.
5. **Sonido sin origen estable.** El paneo aleatorio no permitía asociar una perturbación a la puerta o a la emisión.

## Cambios aplicados

- Una estancia fotográfica original (`assets/room.png`), con puerta al fondo, silla y CRT. La imagen continúa la atmósfera de la puerta existente; la entrada y su transición no cambian.
- Una sola emisión dentro del CRT. Los siete GIFs siguen disponibles en sus secciones y en Cintas; no se reproducen simultáneamente como decoración del interior.
- Las ilustraciones aportadas se conservan en el archivo y sus marcas. La figura principal aparece como una presencia tenue dentro del espacio, no como un cartel de primer plano.
- La presencia avanza tras 1, 3 y 6 consultas. Permanece en la última posición; no vuelve al estado inicial al seguir consultando documentos.
- Una anomalía contextual: tracking en el televisor, seguido de un ojo en su pantalla durante 1,1 segundos. La secuencia ocurre tras una acción, con retardo y pausas de al menos 48 segundos. En otras secciones se conserva la aparición anterior.
- Los golpes proceden del lado de la puerta; el roce de cinta, del lado del monitor. El primer tramo es más silencioso. El volumen no aumenta con la progresión.
- Los cuatro accesos y el sello se agrupan en una franja inferior estable. Las marcas se sitúan en objetos de la escena, con controles accesibles por teclado.

## Verificación

`npm test` comprueba el servidor y la entrega de recursos. `npm run test:browser` comprueba progresión finita, posiciones fijas de navegación, anomalía dentro del monitor, Escape, ambas soluciones del sello, persistencia, acceso al subsuelo, sonido optativo, Calma, movimiento reducido, móvil y borrado de sesión. También se comprueba que la entrada y `crossDoor()` permanezcan intactos.

La intención es aumentar continuidad, expectativa y descubrimiento. Que produzca más miedo requiere contrastarlo con visitantes: observar si reconocen la estancia, detectan el cambio y sienten ganas de volver a comprobar el fondo. Añadir más imágenes o subir el volumen no sustituye esa revisión.
