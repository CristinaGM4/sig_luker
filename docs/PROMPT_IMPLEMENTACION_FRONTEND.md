# Prompt para implementar el frontend de SIG-LUKER

Entrega este documento al ingeniero junto con el mockup `SIG_Escolar_Completo_Resumen_Ejecutivo.html` y acceso al backend. Los enlaces relativos de este documento apuntan al repositorio Backend.

## 1. Objetivo y fuentes

Actúa como ingeniero frontend senior. Implementa en Angular y TypeScript la interfaz de SIG-LUKER conectada al backend NestJS existente. Trabaja en un proyecto frontend separado. Conserva el aspecto general, la navegación lateral, la jerarquía visual y la interacción del mockup. Reconstruye sus pantallas como componentes Angular, sin incrustar el HTML original en iframes ni ejecutar sus scripts.

El mockup sirve como referencia visual. Sus cifras, identificadores, coordenadas, indicadores de atención, plazos y datos ficticios son ejemplos de diseño. La fuente contractual es el Swagger que genera la instancia activa en `/docs` y `/docs-json`, el código de los controladores y los [contratos del backend](05-contratos-api/). Importa las colecciones [habitual](05-contratos-api/postman/backend.postman_collection.json) y [demo IBITE](05-contratos-api/postman/ibite-captura-sintetica.postman_collection.json), con el [entorno local](05-contratos-api/postman/local.postman_environment.json). Si difieren, verifica la operación real y registra la discrepancia.

## 2. Vistas y navegación

| Ruta Angular propuesta | Función |
|---|---|
| `/resumen` | Resumen ejecutivo público. Conserva la composición del mockup. Los indicadores sin una API pública autorizada aparecen como «Datos no disponibles». |
| `/componente-1` | Bienestar y seguimiento. En sesión interna, enlaza el seguimiento IBITE, MTTS Formato A y Fidelidad. Renderiza únicamente los indicadores disponibles para esa sesión y ese colegio. |
| `/componente-2` | Hallazgos institucionales. Conserva la navegación y estructura del mockup. Las estadísticas temáticas, fichas de hallazgos, recomendaciones y coincidencias quedan sin datos hasta disponer de servicios. |
| `/mapa` | Visor cartográfico público con catálogo, leyenda y microzonificación. Puntos por institución solo en contexto interno autorizado. |
| `/operacion/captura` | **Nueva vista de Captura y carga.** Añade una opción al menú interno y cuatro pestañas con enlaces propios, estados y permisos. |
| `/operacion/ibite/resultados/:aplicacionId` | Resultados y alertas internas por aplicación conocida. |
| `/ibite/aplicar/:campanaId` | Entrada por enlace para el respondiente, separada del panel interno. Habilítala en configuración de demo hasta que exista la captura operativa. |

### Nueva vista de Captura y carga

1. **IBITE.** Muestra habilitaciones del respondiente si tiene sesión y ofrece la ruta pública de demo cuando está configurada. En el panel interno permite consultar resultados por ID de aplicación autorizado. La captura ingresa respuestas de formulario por REST. La importación de Excel histórico, la captura REST de DA-28 y el listado general de casos quedan pendientes de API.
2. **MTTS Formato A.** Selecciona un colegio, consulta la definición y muestra formulario semanal, historial, detalle y resumen. Carga las opciones y la versión devueltas por la API.
3. **Fidelidad.** Rotula la pestaña «Fidelidad del taller». El backend la implementa bajo las rutas `factibilidad` para Jugar para cuidar. Muestra formulario, historial y detalle. La ficha pertenece a un colegio y exige responder cada fila de las dos cuadrículas. Usa las opciones devueltas por el backend. No hay puntaje ni indicador derivado para esta ficha.
4. **Fichas de campo.** Reserva la pantalla de carga Excel `.xlsx` con estado explícito «Carga pendiente de integración». Mantén deshabilitado el envío y presenta el formato esperado sin inventar columnas. Existe revisión técnica local, pero falta el contrato REST de carga, errores, estado y persistencia. No subas, almacenes ni previsualices datos reales en la aplicación para simular este flujo.

## 3. Inventario de API habitual

Todas las rutas de las tablas son relativas a `/api/v1`. Hay 28 operaciones habituales con PostgreSQL y 4 adicionales en la demo. `I` significa `/interno/instituciones/{institucionId}` y `M` significa `/mis-aplicaciones-ibite`. Lee los esquemas del Swagger para tipar solicitudes y respuestas. Cada marcador con llaves se sustituye por el identificador entregado por la API o por la configuración autorizada.

| Método y ruta | Acceso y uso |
|---|---|
| GET `/health` | Público. Disponibilidad HTTP. |
| GET `/ready` | Público. Estado de PostgreSQL, 200 o 503. |
| GET `/auth/me` | Bearer. Identidad técnica, roles y permisos. |
| DELETE `/auth/session` | Bearer. Revoca la sesión actual, 204. |
| GET `/interno/catalogos/instituciones` | `records:read`. Catálogo, `limit` de 1 a 100 y `after` desde `nextCursor`. Usa UUID en las rutas, no el nombre ni el código. |
| GET `/interno/catalogos/periodos` | `records:read`. Misma paginación. Fechas ISO de calendario. |
| GET `/publico/sig/capas` | Público. Catálogo de capas cargadas y metadatos. |
| GET `/publico/sig/microzonificacion` | Público. `bbox=oeste,sur,este,norte`, `after` numérico opcional. Hasta 20 polígonos por página. |
| GET `I/sig/puntos` | `records:read` y alcance institucional. `bbox` y `after` UUID opcional. Hasta 100 puntos. |
| GET `I/auditoria` | `audit:read` y alcance institucional. Admite `after`. Registro interno de operaciones, sin respuestas. |
| GET `/interno/asignaciones-psicosociales/instituciones/{institucionId}` | `scope:manage`. Admite `after`. |
| PUT `/interno/asignaciones-psicosociales/{profesionalId}/{institucionId}` | `scope:manage`. Asignar a partir de IDs autorizados. |
| DELETE `/interno/asignaciones-psicosociales/{profesionalId}/{institucionId}` | `scope:manage`. Revocar asignación. |
| PUT `/interno/campanas-ibite/{campanaId}/estado` | `ibite:campaign-control` y pertenencia institucional. Envía `{"enabled":true}` o `false` como valor de la propiedad. Respuesta 204. La ventana sigue aplicando. |
| POST `M/campanas/{campanaId}/iniciar` | `ibite:complete`. Inicio autenticado de estudiante cuando cumple las condiciones de la campaña. |
| GET `M` | `ibite:complete`. Habilitaciones propias, admite `after`. |
| GET `M/{habilitacionId}` | `ibite:complete`. Detalle propio y estado. |
| GET `M/{habilitacionId}/acuse` | `ibite:complete`. Acuse propio cuando existe. |
| GET `/interno/aplicaciones-ibite/{aplicacionId}/resultados` | `records:read`, rol psicosocial y alcance vigente. Admite `after`. Muestra resultados versionados, clasificación y observaciones devueltas. |
| GET `I/mtts/formato-a` | `records:create`, rol psicosocial y alcance vigente. Definición y catálogos. |
| POST `I/mtts/fichas` | `records:create` y alcance. Devuelve acuse 201. Colisión de clave semanal devuelve 409. |
| GET `I/mtts/fichas` | `records:read` y alcance. `desde`, `hasta`, `sede` opcional y `after` opcional. |
| GET `I/mtts/fichas/{fichaId}` | `records:read` y alcance. Detalle. |
| GET `I/mtts/resumen` | `records:read` y alcance. `desde`, `hasta`, `sede` opcional y `porSemana=true` opcional. Si devuelve 422, acorta el intervalo. |
| GET `I/factibilidad/formulario` | `records:read` y alcance. Definición de Fidelidad. |
| POST `I/factibilidad/evaluaciones` | `records:create` y alcance. 201. Envía `Idempotency-Key` para repetir el mismo envío de forma segura. |
| GET `I/factibilidad/evaluaciones` | `records:read` y alcance. `desde`, `hasta`, `after` opcional. |
| GET `I/factibilidad/evaluaciones/{evaluacionId}` | `records:read` y alcance. Detalle. |

El catálogo general de colegios puede contener instituciones fuera del alcance de un recurso. El backend decide por objeto. El frontend debe mostrar un estado de acceso restringido ante 403 o 404 y limpiar la ficha visible al cambiar de institución. El backend actual recibe sesiones Bearer previamente emitidas, sin ruta pública de inicio de sesión por usuario y contraseña. En desarrollo utiliza el token emitido por la demo. Para asignaciones y campañas administrativas usa IDs aprovisionados y permisos específicos. No hay buscador de usuarios ni listado general de campañas en la API habitual.

### Operaciones adicionales de IBITE-17 en la demo

| Método y ruta | Contrato |
|---|---|
| POST `/ibite/campanas/{campanaId}/iniciar` | Público. Envía `age` como entero y `documentNumber` como texto, preservando ceros iniciales. De 5 a 10 años el documento es del acudiente y se exigen `studentName` y `contactPhone`. De 11 a 19 corresponde al adolescente. Devuelve `assignmentId`, `token`, `expiresAt` con 201. Ante 429 respeta `Retry-After`. |
| GET `M/{habilitacionId}/formulario` | Bearer del respondiente. Usa los textos, IDs de ítems y opciones, variante y `formVersion` de la respuesta. |
| POST `M/{habilitacionId}/negativa` | Bearer del respondiente. Envía `formVersion` y `reason` según contrato, por ejemplo `PARTICIPATION` o, para la rama aplicable, `REPRESENTATIVE_AUTHORIZATION`. Presenta el acuse y finaliza la captura. |
| POST `M/{habilitacionId}/envios` | Bearer del respondiente. Envía `Idempotency-Key` y `{formVersion, participation:"accepted", answers:[{questionId, optionId}]}` con los 17 ítems. En adolescente usa `reportedRepresentativeAuthorization` según sus opciones. «No sé» se envía como `unknown` y permite completar el envío. |

El acuse del respondiente se recupera por su GET habitual. Consulta de alertas solo con el token psicosocial y usando `applicationId` del acuse o una referencia autorizada. No muestres alertas, puntajes ni clasificaciones al respondiente. Las reglas de puntuación, criticidad, intervenciones y alertas corresponden al backend. Consulta [habilitación](05-contratos-api/ibite-habilitacion.md), [captura](05-contratos-api/ibite-captura.md), [resultados](05-contratos-api/ibite-resultados.md) y [demo](08-pruebas/demo-ibite17-post.md).

### Detalles para implementar los formularios

- **MTTS.** Solicitud ejemplo de la colección: `{"version":"mtts-formato-a/1","site":"Sede QA","weekStart":"2026-11-23","weekEnd":"2026-11-29","role":"Coordinación","activities":[],"countsUnavailable":true,"ratings":{"factibilidad":"NA"},"barriers":[],"facilitators":[],"adjustment":"No","status":"En curso según lo previsto","escalation":false}`. La UI distingue valor omitido, NA y cero. Bloquea conteos cuando se selecciona «no disponible». Las fechas son `YYYY-MM-DD`, con hasta siete días inclusivos en la ficha. En listas y resumen, `desde` y `hasta` filtran por inicio de semana, con hasta 366 días. Muestra denominador y valores nulos según [contrato MTTS](05-contratos-api/mtts-formato-a.md).
- **Fidelidad.** Envía `version`, `workshopDate`, `place`, `attendance` como texto, `facilitator`, `improvements`, `workshopDelivery` con siete opciones en orden y `process` con tres. `changes` y `materials` son opcionales. El colegio viene de la ruta. Para reintentos técnicos reutiliza la misma clave con la misma solicitud. Si cambia el contenido, es otra operación. El filtro de listado usa fecha de taller y máximo 366 días. Ver [contrato de Factibilidad](06-reglas-negocio/factibilidad-taller.md#captura-de-una-evaluación-por-institución).
- **Mapa.** Usa los `featuresPath` y la leyenda de `/publico/sig/capas`. Consulta por área visible en WGS84, con longitud antes de latitud. Cancela la consulta anterior al mover el mapa, conserva el mismo recorte al paginar y reinicia el cursor cuando cambie. La microzonificación es histórica de 2002. Distingue capa no cargada de área sin entidades. Evita inferir riesgo, asociar colegios a zonas o convertir los puntos ilustrativos del mockup en ubicaciones oficiales. Ver [contrato SIG](05-contratos-api/sig-microzonificacion.md).

## 4. Arranque local reproducible

Requisitos del backend: Docker Desktop con engine Linux, PowerShell 7, Node.js 22.13+ en la rama 22 o Node 24 y npm. Elige una versión estable de Angular con CLI y TypeScript compatibles con el Node seleccionado. Conserva el lockfile del frontend y documenta las versiones elegidas.

### Opción A. Demo de integración con sesión y captura de IBITE

Desde la raíz del Backend, ejecuta en la misma terminal de PowerShell. Los puertos 55433 y 3000 deben estar libres. Reutiliza estas variables y la misma clave al reiniciar el proceso durante la prueba.

```powershell
npm ci
npm run build

$env:POSTGRES_TEST_PASSWORD = [guid]::NewGuid().ToString('N')
$env:POSTGRES_TEST_PORT = '55433'
$env:DATABASE_TEST_URL = 'postgresql://sig_test:' + $env:POSTGRES_TEST_PASSWORD + '@127.0.0.1:55433/sig_test?schema=public'
$env:DATABASE_URL = $env:DATABASE_TEST_URL
$env:IBITE_DEMO_CAPTURE_KEY = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:HOST = '127.0.0.1'
$env:PORT = '3000'

docker compose -f compose.test.yaml up -d --wait db-test
npm run db:migrate
npm run start:ibite-demo -- --verified-items
```

La línea local `IBITE_DEMO` devuelve la URL, las dos campañas y un `psychosocialToken` temporal de una hora. Busca el UUID de la institución ficticia con el catálogo. Usa ese token para MTTS, Fidelidad y las consultas internas disponibles. Para IBITE usa los UUID de campaña y el token de respondiente emitido por cada inicio, mantenido separado del psicosocial. El token de demo no otorga todos los permisos administrativos. Usa un perfil de desarrollo con un campo de token temporal que no se incluya en producción. No copies tokens, claves ni contraseñas a archivos versionados.

La base de esta opción es efímera. Una campaña de demo conserva su ventana al reiniciar solo el proceso de Node. Si la ventana vence y necesitas repetir el ensayo, aprovisiona una base de prueba nueva e independiente. Detén el proceso HTTP con Ctrl+C.

### Opción B. Arranque habitual para integración sin captura sintética

Ejecuta en la raíz de Backend con la instancia anterior detenida si ambas usan el puerto 3000. Los comandos iniciales de instalación y compilación son los mismos.

```powershell
$env:POSTGRES_DEV_PASSWORD = '<contraseña local configurada para sig_dev>'
$env:POSTGRES_DEV_PORT = '55432'
$env:DATABASE_URL = 'postgresql://sig_dev:' + [Uri]::EscapeDataString($env:POSTGRES_DEV_PASSWORD) + '@127.0.0.1:55432/sig_dev?schema=public'
$env:HOST = '127.0.0.1'
$env:PORT = '3000'
$env:SWAGGER_ENABLED = 'true'

docker compose up -d --wait db
npm run db:migrate
npm run db:seed
npm start
```

`db:seed` carga catálogos técnicos y versiones. Las cuentas, sesiones y campañas requieren aprovisionamiento. Para probar una capa real autorizada en la base **local**, usa el GeoJSON revisado si está disponible. Se puede generar con `python scripts/prepare-gpkg-microzonification.py RUTA_ZIP --output RUTA_NUEVA_GEOJSON`. Desde la terminal con la URL local, define `$env:SIG_IMPORT_DATABASE_URL = $env:DATABASE_URL` y ejecuta primero `node scripts/import-sig-microzonification.mjs RUTA_GEOJSON --plan`, luego `node scripts/import-sig-microzonification.mjs RUTA_GEOJSON --apply`. El mismo comando funciona con la base de demo si señala explícitamente a ella. Una base vacía devuelve catálogo de capas vacío.

### Proxy Angular, verificación y problemas comunes

Usa `/api/v1` como prefijo relativo de la aplicación. En desarrollo crea `proxy.conf.json` y arranca Angular con `npm start` configurado para ese proxy o `npx ng serve --proxy-config proxy.conf.json`.

```json
{
  "/api/v1/**": {
    "target": "http://127.0.0.1:3000",
    "changeOrigin": true
  }
}
```

Verifica la coincidencia de rutas anidadas con el builder Angular elegido. En despliegue, usa un proxy inverso de mismo origen o la política CORS autorizada. No cambies la seguridad del backend para eliminar errores de desarrollo.

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
Invoke-RestMethod http://127.0.0.1:3000/api/v1/ready
Invoke-RestMethod http://127.0.0.1:3000/api/v1/publico/sig/capas
Invoke-RestMethod http://localhost:4200/api/v1/health
```

- Si `ready` falla, verifica contenedor y puerto, `DATABASE_URL`, contraseña y estado de migraciones. Si `health` responde pero el resto devuelve 404, revisa que el proceso tenga configurada la base y, para captura, que sea el arranque de demo.
- Si falla el proxy, verifica puerto y patrón de rutas en Angular. Si aparece `EADDRINUSE`, cambia `PORT` y el destino del proxy juntos.
- Si recibes 401, revisa el tipo de token y su vencimiento. Ante 403, revisa permisos. Si el UUID es válido y recibes 404, verifica ámbito, campaña o registro en la base activa.
- Para reproducir las pruebas backend en Windows usa `./scripts/verify-isolated-db.ps1`. Es un ensayo desechable, separado del backend de la sesión manual.

## 5. Implementación y entrega

1. Crea el shell adaptable con rutas de carga diferida, componentes de formulario reactivo, estados vacíos, mensajes en español y navegación por teclado. Mantén servicios HTTP tipados por dominio.
2. Implementa un interceptor Bearer solo para rutas de esta API que requieren sesión. Separa contexto de respondiente del profesional. Conserva tokens solo en memoria para esta integración. Limpia contexto y estados privados tras revocación, vencimiento o cambio de institución. Excluye respuestas, documentos, teléfonos y tokens de consola, URL, almacenamiento persistente, servicios de analítica y caché.
3. Implementa el visor público, después los flujos internos MTTS y Fidelidad, luego la demo IBITE y su consulta interna de resultados. Conecta las utilidades de administración cuando estén aprovisionados los permisos e IDs. Reserva los componentes sin API con estados explícitos.
4. Maneja 400 con corrección de campos, 401 con reingreso, 403 y 404 sin revelar información del objeto, 409 sin sobrescribir registros, 422 con ajuste de filtros y 429 con espera cuando corresponda. Durante un envío, deshabilita el botón. Reutiliza la clave para reintentar el mismo POST donde el contrato la admita. No reintentes automáticamente otros POST.
5. Entrega frontend compilable, README de ejecución, proxy, archivo de configuración de ejemplo sin secretos, lista de rutas, recursos realmente conectados y pruebas. Añade pruebas de formulario, paginación, estados HTTP y navegación por permisos. Ejecuta al menos una verificación contra el NestJS local con datos sintéticos para MTTS, Fidelidad, ambas ramas IBITE y consulta de acuse. Verifica negativa, autorización «No sé», conflicto por duplicado y consulta de alerta solo con sesión autorizada. Prueba el visor con catálogo vacío y capa cargada. Confirma que Fichas de campo no transmite el archivo.

La entrega se acepta cuando un segundo ingeniero puede levantar ambos proyectos a partir de los README, comparar las llamadas de red contra OpenAPI y recorrer la nueva vista sin confundir acciones disponibles con integraciones pendientes.
