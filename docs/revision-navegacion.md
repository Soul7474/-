# Revisión del recorrido desde la entrada

Cambios en `feature/soul`, sin publicar ni integrar en `main` o `develop`.

## Confusiones localizadas y correcciones

- El título, el enlace «Umbral» y el pie del interior devolvían a la entrada. Se eliminan los dos enlaces y el título apunta al interior.
- Recargar una sección mantenía esa sección. Ahora una recarga real vuelve a la entrada; no borra accesos, mensajes ni la preferencia de efectos.
- Visitar directamente un subsuelo bloqueado expulsaba al umbral. Ahora se abre su pregunta desde el interior.
- «Olvidar esta visita» también devolvía a la puerta. Pasa a «Borrar mi rastro»: borra accesos, mensajes, memoria del recorrido e indicador de escena vista, pero permanece dentro. No recarga el documento.
- Fragmentos y Subsuelo no tenían el regreso explícito al interior que sí tenían otras secciones. Ahora lo tienen.
- Las mismas zonas recibían nombres diferentes en los accesos y en el menú. El menú utiliza Restos, Voces y Huellas, como el interior; se actualiza la pista que menciona Voces.

Se conservan los controles nativos del navegador. No se atrapa el historial ni se impide salir de la web. El cambio retira los enlaces de la propia web hacia la entrada; una recarga vuelve al umbral.

## Archivos compartidos

`index.html`: navegación y texto de confirmación, fuera de `#entry-portal`.

`app.js`: arranque tras recarga, destino de la ruta bloqueada, borrado de datos en el sitio y actualización del estado visible. No cambia `crossDoor()`, el ritual ni la animación. El evento `station:reset` permite reinicializar el interior sin recargar. Al integrar con Risketo, conservar tanto sus cambios de entrada como este arranque y contrato.

`interior.js`: maneja el nuevo evento y añade regresos internos. Los datos de sesión antiguos siguen siendo compatibles.

`package.json` y `checks/`: incorporan la comprobación de navegación y adaptan las pruebas existentes a la recarga y al borrado sin retorno a la puerta.

## Comprobaciones

- `npm test`: recursos y servidor.
- `npm run test:navigation`: todas las secciones, 16 combinaciones de ruta y anchura, enlaces, ruta bloqueada, título, recarga, persistencia, borrado sin salir, errores de navegador y recursos faltantes.
- `npm run test:route`: continuidad Restos → Voces → sello, persistencia y reinicio.
- `npm run test:browser`: acertijos, apariciones, audio, Escape, Calma, movimiento reducido y móvil.
- `npm run test:door`: entrada, animación completa, visitantes antiguos, repetición y preferencias.

La entrada no se rediseña. Dibujos, GIFs y pistas se mantienen.
