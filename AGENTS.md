# Acuerdos de colaboración

- Antes de editar, comprueba la rama, `git status` y las referencias remotas actuales. Conserva cambios locales y ajenos.
- El trabajo de Soul se hace en `feature/soul`. `develop` es para integración mediante PR; `main` es la versión publicada. No desarrollar ni fusionar automáticamente sobre estas dos últimas ramas.
- La puerta publicada en `main` está aprobada y, por ahora, se conserva tal como está. No traer automáticamente las versiones pendientes de `puerta-ritual`. Una nueva instrucción explícita del usuario puede cambiar este alcance.
- La rama existente del compañero es `puerta-ritual`; no renombrarla ni sobrescribirla. Cada parte puede mantener su identidad visual.
- `app.js`, `style.css` e `index.html` son compartidos. Antes de cambiarlos, identifica el impacto sobre la puerta, el interior y la navegación. Prefiere módulos separados cuando proceda.
- Soul mantiene habitualmente `interior.js` e `interior.css`, pero hay cambios pendientes del compañero en esos archivos. Inspecciona ambas versiones antes de integrar o modificar esa zona; no asumas propiedad exclusiva.
- Las fusiones, incluidos los PR hacia `develop` y `main`, requieren autorización. No usar reset destructivo, limpieza de archivos ni push forzado sin permiso explícito.
- Documenta en el PR el resultado, los archivos compartidos afectados y las comprobaciones reales. No envíes mensajes, comentarios o Issues de coordinación por tu cuenta salvo petición del usuario.
- Lee `CONTRIBUTING.md` para el flujo, el reparto de módulos y los comandos de desarrollo.
