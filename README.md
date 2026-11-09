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

La entrada es una única pantalla negra: una imagen pequeña rodeada de runas, trazos rituales y siete ojos interactivos, con un solo enlace para entrar. No muestra nombres de archivo, frases de bienvenida ni el archivo al hacer scroll. Dentro quedan otros dos ojos y una marca rúnica. No hay marcadores de nivel ni puntuaciones. La imagen `assets/door-009.png` es una escena ficticia original generada para el proyecto; no es una cámara real ni una fotografía de un visitante.

Tocar un ojo o fallar una palabra puede invocar una aparición visual de 850 ms, sin destellos, con un intervalo mínimo de 18 segundos. Escape la oculta, cambiar de página o pestaña también. El control «calma» desactiva las apariciones y guarda la preferencia; con movimiento reducido se desactivan. El sonido sigue siendo optativo, activado por el control existente. `assets/presence.png` es un fragmento fotográfico original generado para esta web.

La fotografía de la puerta es interactiva. Al introducir la palabra correcta (o al volver con el sello abierto), un acercamiento de 1,6 segundos enfoca el hueco de la puerta y termina en negro. Después abre `#interior`: una cámara con una forma orgánica abstracta original y cuatro accesos simbólicos, con nombres breves, a los restos, voces, huellas y subsuelo. Escape cancela el acercamiento; se omite con movimiento reducido o «calma».

El interior usa grano fijo, scanlines y una banda de tracking ocasional. «Calma» también detiene el tracking. Los párrafos largos y las transcripciones están plegados y se conservan íntegros. Los diagramas de transmisión y subsuelo se regeneran con `python3 scripts/generate_forms.py` (sin dependencias). `assets/inner-relic.png` es una imagen abstracta original generada para el proyecto.

La primera puerta conserva su contraseña y una pista accesible. Tras entrar se muestran la navegación y los archivos existentes. El archivo público sigue disponible directamente en `#archivo`, sin acertijos obligatorios. La vista `#fragmentos` conserva el material de la antigua portada. Las secciones interiores mantienen la estética monocroma, los formularios, el audio optativo y el respeto a movimiento reducido.

El collage `assets/wired-memory.svg` es una ilustración original: figura anónima, ciudad, tendido telefónico y terminal. Su generador reproducible, sin dependencias, está en `scripts/generate_art.py`:

```sh
python3 scripts/generate_art.py
```

No utiliza personajes, ilustraciones ni portadas de las referencias. El collage se conserva dentro de un fragmento desplegable; tanto este como los GIFs del pasillo y el ojo se presentan en escala de grises. No se cargan fuentes ni recursos de terceros. El contenido público se puede consultar directamente desde `#archivo`; las puertas forman parte del recorrido narrativo.

## Imágenes aportadas

Los 13 originales de `images/` se conservan intactos. La dirección actual utiliza sus ojos, figuras alargadas, manos y multitudes. Se pueden abrir todos desde **Fragmentos → vestigios**, sin mostrar sus nombres en la interfaz.

Se prepararon tres versiones con fondo transparente y tinta clara mediante edición de imagen, en `assets/cutouts/`:

- `sentinel.png`: figura con cabeza de ojo (original `3e0d7102…`).
- `revelation.png`: manos abriendo un ojo (original `8ea51e04…`).
- `sewn-eye.png`: ojo cosido (original `495cd049…`).

El resto se integra con inversión monocroma y mezcla `screen` en CSS: el papel claro desaparece visualmente sobre negro, sin modificar los archivos. Las apariciones alternan tres imágenes aportadas; siguen respetando «calma», movimiento reducido y el intervalo entre sustos. La animación de entrada por la puerta se conserva.

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

Primera puerta: `eco`. La pista está en `leeme_antes.txt` y en el libro de visitas.

Segunda puerta: `1998`. La pista está en `no_abrir.txt` y en las fechas de la estación.

</details>

`index.html` contiene el umbral y las vistas; `style.css`, la estética; `app.js`, los documentos, pistas, contraseñas, audio y persistencia. `assets/` contiene los GIFs y la imagen estática originales.

Las contraseñas son una mecánica narrativa en JavaScript, **no autenticación segura**. Los textos protegidos están en el cliente y son inspeccionables. Para contenido privado real se requiere un servidor con autenticación y autorización. `noindex` solicita que los buscadores no indexen la web, pero no garantiza ocultarla ni controla el acceso. El libro de visitas no es compartido entre visitantes: no hay backend.

## Validación

```sh
npm test
```

Los tests de Node verifican el HTML y los recursos, los GIFs, respuestas HEAD, errores 404 y el bloqueo de archivos de configuración. Durante el desarrollo también se recorrieron las puertas, la navegación, los documentos, el libro de visitas, la persistencia, el audio, el reinicio y movimiento reducido mediante Chromium/Playwright, en escritorio y móvil.

Publicación: GitHub Pages desde la rama `main`, carpeta raíz (`/`). El archivo `CNAME` conserva `occult.saulmartin.com` y `.nojekyll` permite servir los archivos estáticos sin Jekyll. Cada cambio subido a `main` activa la publicación de Pages; no sincroniza automáticamente los cambios sin guardar o sin subir de este entorno. El certificado y la opción Enforce HTTPS se gestionan en Settings → Pages. No incluye configuración de un servicio oculto.
