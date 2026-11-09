# Colaboración de Soul y Risketo

## Estado acordado

La puerta de la versión publicada funciona y se mantiene como está. La organización inicial toma como base `main` en `a068c14`, sin incorporar las versiones posteriores de `puerta-ritual` ni la rama de capturas de Claude. Esto fija el punto de partida; no impide actualizar la base más adelante mediante un PR autorizado.

## Ramas

| Rama | Uso |
| --- | --- |
| `main` | Web estable publicada por GitHub Pages en `occult.saulmartin.com`. |
| `develop` | Integración y revisión conjunta. Crear PRs hacia ella; no desarrollar directamente. |
| `feature/soul` | Trabajo de Soul y su asistente. |
| `puerta-ritual` | Rama existente del compañero. Se mantiene su nombre. |
| `claude/npm-test-ky6dr5` | Capturas pendientes; no se integran automáticamente. |

Los nombres y las referencias del remoto deben comprobarse antes de cada tarea. Una referencia `origin/pruebas` antigua en un clon no demuestra que siga existiendo esa rama en GitHub.

## Antes de implementar

1. Comprobar rama y árbol de trabajo: `git branch --show-current` y `git status`.
2. Consultar las referencias remotas: `git fetch origin` y `git branch -a`.
3. Definir funcionalidad, archivos afectados, dependencias e impacto sobre la otra parte.
4. Trabajar en la rama propia. Con cambios pendientes, no cambiar de rama ni integrar otra base sin preservarlos primero.

Un clon completo puede preparar la rama de Soul con:

```sh
git fetch origin
git switch feature/soul
```

Si el entorno solo descarga una rama, obtener la referencia explícitamente:

```sh
git fetch origin feature/soul:refs/remotes/origin/feature/soul
git switch feature/soul
```

La rama `develop` empieza desde la versión estable, no desde la versión más nueva de cualquiera de las implementaciones.

## Límites entre partes

| Zona | Archivos | Coordinación |
| --- | --- | --- |
| Puerta y ritual | Funciones de entrada en `app.js`, marcado `#entry-portal`, estilos de puerta en `style.css`, sus recortes y SVG | Conservar la versión de `main` hasta que se solicite otro cambio. |
| Interior | `interior.js`, `interior.css` | Zona habitual de Soul; revisar los cambios pendientes del compañero antes de tocar áreas coincidentes. |
| Estructura y estado | `index.html`, `app.js`, `style.css` | Compartidos: delimitar el cambio y comprobar ambos recorridos. |
| Material gráfico | `images/`, `gifs/`, `assets/` | Conservar originales y nombres usados por la otra parte. |
| Verificación | `tests/`, `checks/`, `server.mjs` | Documentar qué se ejecutó y mantener el servidor estático compatible. |

La integración puede conectar estéticas diferentes mediante rutas y navegación. No requiere uniformar su diseño.

`window.EstacionInterior` comunica el interior con el estado y acciones de la web. Los eventos `station:sound` y `station:transmission` indican cambios confirmados. Antes de cambiar este contrato, revisar sus consumidores en ambas ramas.

## Preparación y pruebas

La web usa HTML, CSS y JavaScript sin framework ni dependencias de producción. Node.js 20 o posterior:

```sh
npm run dev
npm test
```

Las comprobaciones de navegador requieren Playwright y Chromium disponibles:

```sh
npm run test:door
npm run test:browser
```

No es necesario ejecutar pruebas de la aplicación para un cambio exclusivamente documental. Para cambios funcionales, elegir comprobaciones pertinentes y revisar escritorio, móvil, navegación, Escape, audio optativo, «calma» y movimiento reducido cuando se vean afectados.

## Integración

1. Hacer commits descriptivos y subir la rama propia.
2. Abrir un PR desde la rama de trabajo hacia `develop`, indicando el resultado, áreas compartidas, posibles conflictos y validación real.
3. Revisar conjuntamente y resolver los conflictos conservando las dos implementaciones.
4. Fusionar solo con autorización y comprobar el recorrido integrado.
5. Abrir un PR desde `develop` hacia `main`; publicar solo después de la validación y autorización.

GitHub Pages publica `main`: subir una rama de trabajo no cambia la web pública. El archivo `CNAME` y `.nojekyll` se conservan. Las restricciones de ramas, revisiones obligatorias y comprobaciones requeridas pueden configurarse en GitHub por el propietario; este documento por sí solo no las impone.

No se suben secretos, tokens ni archivos `.env` con valores privados. No usar `git push --force`, `git reset --hard` ni `git clean -fd` sin autorización explícita.
