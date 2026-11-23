# SIG Escolar · Frontend Angular

Incremento del 23 de noviembre de 2026. Se priorizan Componente 2 y visor geográfico según el diseño suministrado y el backend de Mate. Se reutiliza la base Angular de esta carpeta, separada del repositorio backend.

## Ejecutar el frontend

Usar Node.js 24 y npm. Angular instalado 21.2, TypeScript 5.9, Leaflet 1.9.4 y Tailwind 4. El lockfile conserva las versiones resueltas.

```sh
npm ci
npm start
```

Abrir http://localhost:4200/componente-2 o http://localhost:4200/mapa.

Con Angular CLI directamente, incluir el proxy

```sh
npx ng serve --proxy-config proxy.conf.json --poll 1500
```

La configuración de `ng serve` también declara el proxy en `angular.json`. El archivo `proxy.conf.json` apunta `/api/v1/**` al backend local `http://127.0.0.1:3002`. Cambiar ese destino si Mate usa otro puerto. En producción se necesita un proxy inverso del mismo origen para `/api/v1`.

```sh
npm test
npm run build
```

El resultado compilado queda en `dist/sig-escolar/browser`. El servidor de archivos debe redirigir las rutas Angular a `index.html`. La caché de compilación está desactivada por una interrupción nativa previamente observada en este equipo. El polling evita límites de vigilancia de archivos.

## Levantar el backend

Seguir el README y `docs/PROMPT_IMPLEMENTACION_FRONTEND.md`, si está disponible, del repositorio https://github.com/macardonama/sig_luker. Esta revisión usó el commit `d7fea67`.

El backend necesita PostgreSQL/PostGIS, migraciones y los catálogos configurados. Su arranque sin `DATABASE_URL` habilita solo salud. Que `/api/v1/health` responda no significa que las rutas SIG estén habilitadas.

Para consultas públicas basta la instancia con base configurada. La microzonificación aparece en el catálogo después de importar la capa autorizada. Los puntos y el catálogo institucional necesitan una sesión con `records:read` y ámbito vigente. Pedir a Mate la instancia configurada o los pasos de aprovisionamiento local, el archivo cartográfico autorizado si corresponde y el procedimiento para obtener un token temporal.

## Acceso público

Componente 2 y visor geográfico abren sin inicio de sesión. El shell no presenta el panel de token. Los filtros usan los diez nombres del catálogo de referencia suministrado para el piloto, con claves locales `referencia-1` a `referencia-10`. Estas claves sirven para navegar y no son UUID del backend. Este catálogo está separado de los mocks de indicadores y coordenadas del prototipo anterior.

Las vistas públicas solo consultan los recursos SIG públicos. Las ubicaciones institucionales están pendientes de una fuente pública de coordenadas. La ruta interna de puntos del backend no es consumida por estas pantallas. La sesión y los servicios internos preparados en el incremento previo quedan fuera de este flujo público.

## Rutas de este incremento

| Ruta | Estado |
| --- | --- |
| `/` | Redirige a Componente 2 |
| `/resumen` | Accesos a las dos áreas, indicadores pendientes de API pública |
| `/componente-1` | Etapa siguiente, indicada explícitamente |
| `/componente-2` | Estructura temática, filtro de área, categorías desplegables y catálogo de referencia público |
| `/mapa` | Visor Leaflet público y selección del catálogo de referencia |

El prototipo anterior sigue accesible por sus rutas originales `/dashboard`, `/instituciones`, `/fichas-campo`, `/criticidad`, `/reportes` y `/demo/mapa`. Estas vistas históricas siguen usando mocks DEMO. Están fuera de la navegación principal de integración y no son fuentes del nuevo Componente 2 ni del nuevo visor.

## Recursos HTTP utilizados

| Recurso | Uso |
| --- | --- |
| GET `/api/v1/publico/sig/capas` | Catálogo y leyenda públicos |
| GET `featuresPath` del catálogo | Se admite la ruta vigente `/api/v1/publico/sig/microzonificacion` |

El mapa consulta WGS84 con longitud antes que latitud. Cada recorte conserva el mismo bbox durante la paginación, reinicia cursor cuando cambia y cancela la solicitud anterior. Se acumulan las páginas antes de renderizar para evitar mostrar una respuesta parcial como completa. Se detectan cursores repetidos. Se distinguen catálogo vacío, capa oculta, área sin geometrías y error HTTP.

El interceptor añade Bearer solo a rutas internas y de sesión relativas de esta API. No lo envía a OpenStreetMap ni a las capas públicas. Al recibir 401 limpia sesión y contexto privado. Ante 403 y 404 utiliza un mismo mensaje. Los datos de texto se renderizan mediante Angular o `textContent`, sin insertar HTML de la API. Los servicios internos de sesión y puntos no son consumidos por estas dos pantallas públicas.

## Componente 2 y datos pendientes

Se tomaron únicamente nombres, descripciones de áreas y categorías del diseño HTML. Los cuatro grupos incluyen Terminología y preconceptos, Factores protectores institucionales, Cuidado socioemocional y Aprendizaje y capacidades institucionales.

El backend revisado no publica servicios de estadísticas temáticas, hallazgos, coincidencias, recomendaciones ni carga Excel de fichas. Se muestran estados pendientes. La carga está deshabilitada, sin selector de archivo ni transmisión. No se reutilizan cifras, porcentajes, coordenadas ni narraciones ficticias del diseño como resultados institucionales. No se calculan niveles de riesgo, índices ni asociaciones automáticas de escuelas con zonas.

## Archivos principales

- `src/app/features/componente-2/` contiene la pantalla y la taxonomía de referencia.
- `src/app/features/mapa/public-map.ts` contiene el visor conectado.
- `src/app/core/api/` contiene modelos de contrato, servicios HTTP, sesión, interceptor y paginación.
- `src/app/features/integracion/` contiene conexión de desarrollo y vistas de alcance.
- `src/app/layout/shell.ts` y `src/app/app.routes.ts` contienen navegación y rutas.
- `proxy.conf.json` configura la API local.
- `tests/contracts.test.mjs` verifica paginación, cancelación, seguridad de rutas y estados HTTP.
- `tests/sig-fixture.mjs` es una API sintética aislada para QA. No se inicia con `npm start` ni se usa como fallback.

## QA sintético opcional

En una terminal ejecutar `node tests/sig-fixture.mjs`. Sirve solo en `127.0.0.1:3001` con identificadores y geometrías expresamente sintéticos. Crear un proxy de prueba que apunte a ese puerto y servir Angular en otro puerto, por ejemplo 4201. El token fijo `synthetic-qa-token` solo pertenece a ese fixture.

El fixture permite los escenarios `loaded`, `empty`, `no-features` y `forbidden` mediante POST local a `/__scenario?value=ESCENARIO`. Su catálogo cargado devuelve dos páginas. Estos ensayos comprueban el frontend y no sustituyen integración real con PostgreSQL/PostGIS. Detener los procesos sintéticos al finalizar.

Consultar `VERIFICACION.md` para los resultados y límites comprobados.

## Estado de conexión actual

Verificado el 23 de noviembre de 2026 contra el backend de Mateo y PostgreSQL 17.12 / PostGIS 3.5 instalados localmente mediante Postgres.app. La instancia del proyecto usa 127.0.0.1:55432 y la base sig_dev, con migraciones y catálogos aplicados.

La cartografía revisada del repositorio fue importada con el cargador oficial, tras comprobar su SHA-256. Se preservaron las coordenadas y propiedades del archivo, y se normalizó únicamente su terminador LF a CRLF para reproducir la huella revisada por el backend.

GET /api/v1/ready devuelve ready directamente y a través de Angular. El catálogo publica microzonificacion-2002. Se recuperaron 139 entidades MultiPolygon en siete páginas mediante el proxy y se comprobaron 139 polígonos en Leaflet, sin errores de consola durante la observación.

La instalación local usa una distribución precompilada de Postgres.app porque Homebrew exigía Xcode completo. La copia instalada pasa codesign --verify --deep --strict. El arranque de PostgreSQL se realizó desde Terminal de macOS debido a restricciones de memoria compartida del entorno de herramientas. Mantener abierta la terminal del backend mientras se utiliza la aplicación.

Los hallazgos, recomendaciones, estadísticas y coincidencias del Componente 2 siguen pendientes de servicios públicos en el backend revisado. El catálogo institucional del frontend continúa siendo de referencia y las ubicaciones institucionales requieren una fuente pública.

## Sedes públicas conectadas

El backend actualizado usa el puerto 3002, configurado en proxy.conf.json, y publica GET /api/v1/publico/sig/instituciones. La instancia anterior en 3000 se conserva sin cambios. Se importaron 21 puntos a la base, manteniendo los campos originales y publicando solo identificadores institucionales, nombres, coordenadas y observaciones de asociación. Siete códigos principales están pendientes de validación. El cruce con las diez instituciones de referencia se hace por nombre para navegación, señalado explícitamente en la respuesta.

Se comprobaron 21 puntos en Leaflet, tres sedes al filtrar Fe y Alegría La Paz, ocultar/mostrar capa, popup, detalle y navegación al Componente 2 con institución seleccionada. La microzonificación continúa activa. No se rellenaron estadísticas ni hallazgos pendientes.

El backend incluye migración, importador idempotente, contrato, colección Postman y tres pruebas específicas exitosas (DTO público, colección vacía, HTTP sin token y protección interna). Build de ambos proyectos correcto.
