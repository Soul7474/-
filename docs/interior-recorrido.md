# Recorrido interior — primer bloque de Soul

## Alcance

Trabajo en `feature/soul`, destinado a revisión hacia `develop`. No modifica la puerta, `app.js`, `index.html`, `style.css`, los originales ni la web publicada. Conserva la composición de dibujos y GIFs; no utiliza la habitación fotográfica descartada.

## Recorrido

- Al llegar, el acceso a Restos tiene más peso visual. Los demás permanecen disponibles y sus etiquetas no pierden contraste.
- Tras consultar un documento de Restos, aparece un enlace discreto a Voces. Volver al interior destaca ese acceso.
- Al sintonizar la señal, aparece el regreso al sello. El visitante vuelve al interior y puede abrirlo con las soluciones existentes.
- Tras abrir el sello, se destaca la puerta del subsuelo.
- Huellas ofrece un regreso al interior. No hay redirecciones obligatorias, puntuaciones ni contadores de progreso.

Las presencias avanzan hasta su último estado y permanecen allí; no vuelven al inicio cada cuatro consultas. Las marcas, documentos, pistas y soluciones se conservan. «Calma», movimiento reducido y el borrado de sesión mantienen su función.

La continuidad se guarda con `trail` dentro de la clave de sesión `estacion09-interior`. Es compatible con sesiones antiguas, que empiezan sin ese rastro. No se añade seguimiento externo.

## Integración pendiente con Risketo

`puerta-ritual` añade profundidad y parallax en `interior.js` e `interior.css`. Este bloque no incorpora ni sustituye esos cambios: sus funciones y estilos están pendientes de revisión en `develop`. Al integrarlos, conservar el bloque de tilt y el nuevo bloque de recorrido. Este último se inicializa al final, antes de `environmentChanged()`; su listener de retorno al sello debe ejecutarse después del listener que cierra diálogos al navegar.

`package.json` solo incorpora el comando de comprobación `test:route`; no cambia dependencias ni arranque.

## Verificación

```sh
npm test
npm run test:browser
npm run test:route
```

La comprobación de recorrido verifica el descubrimiento de enlaces, el regreso al sello, soluciones y persistencia, posiciones fijas de los accesos, presencias sin ciclo, Calma, móvil y borrado de sesión. Las pruebas de navegador necesitan Playwright y Chromium disponibles. No requiere cambiar la entrada para probar el interior: se puede abrir directamente `#interior`.
