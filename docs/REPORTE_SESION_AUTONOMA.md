# Reporte de sesión autónoma

## Plan del 21 de noviembre de 2026

1. Listado de asignaciones institucionales para gestores con scope:manage.
2. Paginación por cursor de auditoría institucional.
3. Paginación de resultados versionados con ámbito por aplicación.
4. Preparación y pruebas de la supresión de un corte agregado sintético, sin ruta pública.
5. Verificación automatizada de correspondencia de las rutas operativas con Postman y OpenAPI.
   
Bloqueo de captura: faltan los formularios originales y reglas verificadas de consentimiento, obligación, opciones y salto, además del aprovisionamiento y vínculo de acudiente. No se habilitan rutas de formulario ni envío. Los contratos de publicación real y notificaciones permanecen pendientes.

## Ejecución cronológica

1. **Asignaciones (R01/R12).** Se añadió GET de asignaciones por institución para operadores con scope:manage, con filas vigentes y revocadas, cursor y auditoría. Integración validó rol sin permiso, cursor inválido, listado vigente y fecha después de revocación.
2. **Auditoría (R01/R12).** La ruta incorporó after y nextCursor. El cursor se valida dentro de la misma institución y las páginas se ordenan por fecha y UUID. La integración verificó exclusión de eventos sin institución, fechas empatadas y ninguna repetición entre páginas.
3. **Resultados (R04/R12).** Añadido cursor dentro de la aplicación, conservando truncated. La integración verificó 27 resultados sintéticos en dos páginas, rechazo de cursor inexistente o mal formado y revocación del ámbito. Se preservó la auditoría de cada lectura.
4. **Agregados sintéticos (R09/R12).** Preparado helper que retiene celdas por debajo del umbral explícito y suprime el total complementario. Verificado con 3 pruebas unitarias. No hay publicación, ruta, umbral institucional ni métricas nuevas.
5. **Contrato para clientes (R13).** Actualizados Postman y el contrato de consumo. Prueba automatizada compara los métodos, rutas y requisitos Bearer de Postman con el documento OpenAPI servido por Nest y PostgreSQL.

## Verificación ejecutada

- npm run build: aprobada durante los incrementos de endpoints y agregación.
- node --test test/aggregate-disclosure.test.mjs: 3 aprobadas, 0 fallidas.
- npm test con DATABASE_TEST_URL de sig_test, tras los cambios de rutas: 28 aprobadas, 0 fallidas.
- npm test con DATABASE_TEST_URL de sig_test, batería final: 32 aprobadas, 0 fallidas.
- npm run lint y npm run format:check: aprobados.
- npm run db:status: las ocho migraciones existentes están al día. No se creó ni aplicó otra migración en la sesión.

## Archivos modificados

- Controladores: src/ibite/assignments.controller.ts, src/ibite/institutional-audit.controller.ts y src/ibite/results.controller.ts.
- Funciones: src/ibite/query-cursor.ts y src/ibite/aggregate-disclosure.ts.
- Pruebas: test/ibite-results.test.mjs, test/aggregate-disclosure.test.mjs y test/openapi-postman.test.mjs.
- Contratos: asignaciones, auditoría, resultados, dashboard, consumo HTTP y colección Postman.
- Trazabilidad y seguimiento: matriz, ADR, pruebas, progreso, pendientes, README documental y CHANGELOG.

## Problemas y condiciones pendientes

La primera inspección de varios archivos usó una expansión que PowerShell no admite. Se reemplazó la consulta y se completó la lectura. El directorio no es un repositorio Git, por lo que no se calcularon cambios con git ni se hicieron commits.

El lote de cinco tareas quedó terminado. Se añadió un endpoint GET y se ampliaron dos. Las pruebas usaron solo la base aislada y datos sintéticos. No se expusieron nuevas rutas de captura ni publicación, se mantuvieron las reglas de puntuación y no se ejecutaron despliegues.

Para retomar: verificar los formularios y la política de consentimiento, cerrar el aprovisionamiento de campañas y acudientes, y con esos insumos validar el contrato de envío con idempotencia. Para el dashboard público, validar denominadores, cortes y control de inferencia entre agrupaciones. Los resultados y eventos históricos conservan la procedencia y siguen pendientes de una decisión de publicación.

## Segundo lote del 21 de noviembre de 2026

Plan: 1) detalle de habilitación propia con el mismo filtro que finalización; 2) recuperación de acuse propio; 3) idempotencia transaccional interna según CAP-04/05; 4) controles uniformes de caché y desafío Bearer para solicitudes protegidas; 5) diagnóstico técnico de alias normalizados sin asignación automática y pruebas sintéticas. La captura por HTTP continúa bloqueada por los formularios originales y las reglas pendientes de consentimiento y verificación de vínculo.

### Ejecución del segundo lote del 21 de noviembre

1. **Detalle de habilitación (R01/R02).** GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}; misma proyección y filtro que el listado. Se verificó detalle propio, UUID inválido y habilitación inexistente.
2. **Acuse propio (CAP-06).** GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}/acuse; solo ID del envío, ID de habilitación, versión y fecha. Pruebas antes y después del envío y tras revocarlo.
3. **Idempotencia del envío interno (CAP-04/05).** Novena migración aditiva de huellas en aplicaciones. Dos reintentos simultáneos convergen en un resultado y un acuse. El servicio rechaza cambios de contenido, conserva unicidad con otra clave y vuelve a validar la habilitación antes de recuperar un envío.
4. **Protección de respuestas (R01/R12).** El guard aplica no-store antes de autenticar y devuelve el desafío Bearer al fallar la sesión. El cliente puede distinguir este 401 del 403 por permisos. Verificado sobre HTTP.
5. **Sugerencias institucionales (R03).** Se añadió una clave ortográfica separada del alias directo. Un destino ortográfico único pasa a revisión y los múltiples destinos permanecen ambiguos. El extractor y el motor se verificaron con datos sintéticos, sin abrir de nuevo copias de respuestas reales.

### Archivos del segundo lote

- src/auth/session.guard.ts; src/ibite/my-assignments.controller.ts, application-persistence.ts y historical-reconciliation.ts.
- prisma/schema.prisma y prisma/migrations/20261121000600_ibite_submission_idempotency/migration.sql.
- scripts/diagnose-ibite-manizales.py; test/database.test.mjs, ibite-results.test.mjs, ibite-historical-reconciliation.test.mjs y test_ibite_manizales_extractor.py.
- Captura, consumo HTTP, importación, conciliación, matriz SDD, ADR, colección y entorno Postman, pruebas, progreso, pendientes y changelog.

La publicación de formularios/envíos, la revisión definitiva de lotes y la divulgación pública siguen requiriendo decisiones de consentimiento, autoridad, catálogo y política de publicación. No se ejecutaron operaciones de producción, activación de notificaciones ni escrituras sobre datos reales.

### Verificación y estado final del segundo lote

- npm test con sig_test habitual: 32 pruebas aprobadas después de implementar las rutas, los controles de sesión y la idempotencia.
- npm run db:migrate en una base nueva, dos veces: 9 migraciones aplicadas en la primera ejecución y 0 pendientes en la segunda. Prisma migrate diff con --exit-code no encontró diferencias.
- La primera compilación del lote completo detectó barras invertidas ausentes en dos expresiones Unicode del normalizador. Se repusieron y se repitió el ensayo con otra base recién creada.
- npm test contra la base desechable: 33 pasaron, 0 fallaron. Postman coincide con las 14 operaciones de OpenAPI y sus requisitos de autenticación. npm run lint y npm run format:check aprobados.
- unittest discover del extractor: 5 pasaron, 0 fallaron. Se validaron las sugerencias ortográficas con datos sintéticos.
- La base desechable se detuvo al terminar. La base de pruebas habitual siguió saludable. Se verificaron enlaces documentales y JSON de Postman. No hubo commits ni despliegues.

Próximo lote de captura: configurar y verificar formularios originales, consentimiento y habilitación con vínculo. Próximo lote histórico: aprobar alias, autoridad revisora y reglas de publicación por lote. No se iniciaron esos cambios operativos porque dependen de validaciones externas.

## Tercer lote autónomo

Plan: 1) validación técnica de la carga interna y copia normalizada para idempotencia; 2) verificación de acceso cruzado entre dos respondientes habilitados; 3) reproducción interna, autorizada y sin escritura de resultados IBITE; 4) conservar filas de cálculo con anclajes inválidos en el diagnóstico versionado; 5) automatizar la verificación completa en PostgreSQL desechable. Los formularios y el envío HTTP permanecen pendientes de validación.

### Ejecución del tercer lote

1. **Validación técnica (R02/CAP-04/05).** src/ibite/submission-input.ts, application-persistence.ts y test/ibite-submission-input.test.mjs. Valida tipos y claves, copia la carga antes de persistir y conserva la diferencia entre nulo y omitido. Se comprobó igualdad de huella cuando solo cambia el orden de claves.
2. **Autorización por objeto (R01/R12).** test/ibite-results.test.mjs verifica dos cuentas con permiso de responder. La segunda no lista ni recupera el detalle o acuse de la habilitación de la primera.
3. **Reproducción auditada (R04/R12).** src/ibite/application-replay.ts vuelve a calcular una aplicación prospectiva con su versión original y ámbito institucional vigente. La integración compara el cálculo con el resultado persistido y comprueba que el número de resultados permanece igual. Un evento de auditoría registra el acceso. Se verifica rechazo sin ámbito, con rol técnico y tras revocación.
4. **Diagnóstico histórico v2 (R03).** historical-reconciliation.ts, historical-review.ts, extractor Python, resumidor Node y pruebas conservan la coordenada de cálculo cuando sus anclajes no permiten resolver el origen. Se diferencia de una referencia válida hacia una fila vacía.
5. **Verificación limpia (R13).** scripts/verify-isolated-db.ps1 aprovisiona un PostgreSQL/PostGIS temporal y ejecuta dos despliegues de migraciones, diff, dos pruebas SQL, npm test, ESLint y Prettier. Se comprobó con un contenedor de pruebas y puerto local efímero.

### Comandos y resultados

- npm run build y node --test test/ibite-submission-input.test.mjs: compilación y 2 pruebas aprobadas.
- python -m unittest discover -s test -p test_ibite_manizales_extractor.py con Python del entorno: 5 aprobadas.
- ./scripts/verify-isolated-db.ps1: 9 migraciones instaladas desde cero, 0 al repetir, sin diferencias de Prisma. SQL de integridad y PostGIS aprobados. 36 pruebas Node aprobadas, cero fallos; lint y formato aprobados.
- OpenAPI y Postman mantienen 14 operaciones en paridad; este lote no añadió rutas ni migraciones.

Se completaron cinco tareas. La verificación terminó sin incidencias y retiró el contenedor y la red temporales. El directorio no tiene metadatos Git; no se hicieron commits. Se actualizaron los contratos de captura, resultados e histórico y el registro de verificación. Solo datos sintéticos. Faltan los formularios originales y el procedimiento de consentimiento y vinculación para exponer el envío; la publicación real requiere política de divulgación y decisiones de custodia.

## Cuarto lote autónomo

1. **Ámbito vigente (R01/R12).** `src/ibite/professional-scope.ts`, `results.controller.ts`, `institutional-audit.controller.ts` y `application-replay.ts` comparten la condición por objeto. El permiso efectivo puede provenir de cualquiera de los roles asignados, conforme a la sesión.
2. **Revocación de cuenta (R01/R12).** `test/ibite-results.test.mjs` verifica que una sesión emitida pierde acceso a resultados y auditoría si se desactiva la cuenta. El recálculo interno también deniega el acceso.
3. **Contexto y clave de reintento (R02/CAP-04/05).** `submission-input.ts` rechaza objetos que no representan un registro de campos y claves desconocidas. `application-persistence.ts` rechaza claves de tipos distintos a texto. Cubierto en `test/ibite-submission-input.test.mjs` y `test/ibite-results.test.mjs`.
4. **Persistencia DA-28 (R02/R04).** La prueba integral sintética verifica que 27 posiciones se rechazan sin crear aplicación y que 28 posiciones se guardan con la versión de regla esperada. Un reintento idéntico conserva el ID y un solo evento de finalización.
5. **Acuse DA-28 (R02/R12).** La prueba confirma que el respondiente habilitado consulta el acuse de DA-28 y otra cuenta con permiso de respuesta recibe 404.

Se ejecutó `./scripts/verify-isolated-db.ps1`. Resultado: 36 pruebas Node aprobadas, cero fallidas y cero omitidas. ESLint, Prettier y las comprobaciones SQL pasaron. Se verificaron las 9 migraciones existentes en una base desechable, la repetición sin pendientes, el diff sin diferencias y la paridad de las 14 operaciones OpenAPI/Postman. Sin migraciones nuevas ni cambios de contrato. Solo datos sintéticos.

Se actualizaron la matriz, los contratos de captura y resultados, los pendientes y el changelog. La siguiente apertura operativa requiere formularios originales, consentimiento y vínculo verificable. La importación real y el dashboard requieren reglas de revisión y divulgación.

## Quinto lote autónomo

1. **Unicidad entre instituciones y variantes (R02/CAP-04).** La prueba sintética en `test/ibite-results.test.mjs` verifica que un segundo envío de IBITE-17 de la misma persona y periodo se rechaza incluso con otra institución, variante y cuenta respondiente. La aplicación DA-28 del mismo participante y periodo sí existe como instrumento separado.
2. **Efectos del duplicado (R02/CAP-05).** La segunda habilitación no devuelve acuse y la institución del intento rechazado no recibe un evento de finalización.
3. **Recálculo DA-28 (R04/R12).** Después de restablecer la asignación explícita, el recálculo interno autorizado coincide con el resultado versionado guardado.
4. **Procedencia de recálculo (R04/R12).** `src/ibite/application-replay.ts` exige coincidencia entre la huella de origen y la referencia del instrumento. Con una discrepancia sintética, la operación se rechaza y permanece un solo evento de recálculo exitoso.
5. **Cursor de otra aplicación (R12).** La ruta de resultados rechaza con 404 un UUID existente de DA-28 usado para paginar un resultado de IBITE-17, incluso cuando ambas aplicaciones están dentro del ámbito del profesional.

`./scripts/verify-isolated-db.ps1` pasó con 36 pruebas Node, cero fallidas y cero omitidas. Se aplicaron las 9 migraciones existentes, con cero pendientes en el segundo pase y diff Prisma vacío. Pasaron las comprobaciones SQL, ESLint, Prettier y la paridad OpenAPI/Postman. Se amplió la prueba de integración existente. Sin rutas ni migraciones nuevas. Datos exclusivamente sintéticos.

Se actualizaron los contratos de captura y resultados, la matriz, el registro de pruebas y el changelog. Para habilitar captura HTTP siguen pendientes formularios originales, consentimiento y vinculación. La importación real y el dashboard público requieren reglas de revisión y divulgación.

## Sexto lote autónomo

1. **Decisión DF-14 (R02/R09/R12).** Se actualizó la trazabilidad. Si el estudiante acepta participar e indica que desconoce su autorización, se guardan las respuestas y la declaración para métricas autorizadas.
2. **Persistencia interna.** `src/ibite/application-persistence.ts` conserva la declaración en la carga original validada de IBITE-17 adolescente. Se verificó que DA-28 rechaza el campo. La puntuación y el acuse mantienen el contrato existente.
3. **Reintento.** La declaración forma parte de la huella cuando se indica. La huella original permanece compatible para las solicitudes que omiten el campo. La integración confirma que cambiar la declaración con la misma clave causa conflicto.
4. **Métricas internas.** `src/ibite/representative-authorization.ts` cuenta declaraciones afirmativas, inciertas y ausentes para una entrada por aplicación definitiva. Se amplió `test/ibite-results.test.mjs` y se añadieron dos pruebas en `test/ibite-representative-authorization.test.mjs`. Sin endpoint ni publicación.
5. **Verificación integral.** `./scripts/verify-isolated-db.ps1` terminó con 38 pruebas Node aprobadas, cero fallidas y cero omitidas. Pasaron integridad SQL, PostGIS, ESLint, Prettier y paridad OpenAPI/Postman. Las nueve migraciones existentes se aplicaron en la base temporal, sin pendientes al repetir y con diff Prisma vacío.

Se actualizaron decisiones funcionales, matriz, contratos de captura y dashboard, verificación de formularios, pendientes y changelog. Sin migraciones nuevas ni cambios del contrato HTTP. Próximas prioridades: especificar persistencia de negativas antes de la aplicación, cerrar Texto y obligatoriedad del formulario, confirmar vinculación y calendario. Los datos reales y las notificaciones continúan fuera de la ejecución.

## Recorrido REST de captura IBITE

**Capacidad verificada.** IBITE-17 adolescente sintético. Una cuenta autorizada consulta su formulario, envía sus opciones, conserva su aceptación y declaración de autorización, obtiene acuse y permite consulta del resultado versionado al profesional asignado. La prueba comprueba orden independiente de las respuestas, reintentos concurrentes con la misma clave, conflicto al cambiar contenido, envío definitivo único, rechazo a otras cuentas, revocación y ventana cerrada. Se verifica el recálculo conservando la procedencia y el alcance institucional.

**Contratos.** GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}/formulario y POST /api/v1/mis-aplicaciones-ibite/{habilitacionId}/envios en el arranque sintético explícito. GET /acuse ya está disponible como parte del arranque habitual. Se comprobó que las dos rutas nuevas no aparecen en OpenAPI habitual y que el ejemplo Postman reproduce el recorrido de pruebas.

**Archivos.** `src/app.ts`, `src/app.module.ts`, `src/catalogs/catalogs.module.ts`, `src/ibite/capture-form.ts`, `src/ibite/capture.controller.ts`, `src/ibite/application-persistence.ts`, `test/fixtures/ibite-synthetic-form.mjs`, `test/ibite-results.test.mjs`, `test/openapi-postman.test.mjs` y `docs/05-contratos-api/postman/ibite-captura-sintetica.postman_collection.json`. Se actualizaron contrato, trazabilidad, backlog, progreso, pruebas y changelog.

**Pruebas.** La primera ejecución de `npm run build` detectó tipos incompatibles al combinar el filtro Prisma de campaña y al inferir el tipo de autorización. Se ajustaron ambos y se ejecutó dos veces `./scripts/verify-isolated-db.ps1` con éxito. La última ejecución registró 39 entradas TAP aprobadas, incluidas 38 pruebas y el archivo de datos sintéticos detectado por Node. Cero fallos y cero omisiones. ESLint, Prettier e integridad SQL y PostGIS aprobados. Se aplicaron 9 migraciones existentes en la base desechable, con cero pendientes al repetir y diff vacío. Cero migraciones nuevas.

**Pendientes.** El arranque habitual carece de las nuevas rutas hasta disponer de un formulario operativo aprobado. Faltan archivar la decisión negativa antes de la aplicación, cerrar obligatoriedad, saltos y textos, vincular acudientes y confirmar el horario y periodo del piloto. DA-28 conserva su persistencia interna y espera el formulario original. El siguiente objetivo es abrir el recorrido operativo de IBITE-17 con la versión oficial, incluida la decisión de participación antes del envío definitivo.

## Recorrido integrado de decisión de participación

DF-11 · R02/R12 · CAP-02/CAP-05. Incorporados registro de negativa, estado en formulario, reintento idempotente, auditoría y exclusión mutua con la finalización. El POST de negativa es exclusivo del arranque sintético. La aceptación con autorización declarada incierta conserva su recorrido anterior.

Archivos principales: `prisma/schema.prisma`, `prisma/migrations/20261121000700_ibite_participation_refusals/migration.sql`, `src/ibite/assignment-lock.ts`, `participation-refusal.ts`, `application-persistence.ts`, `capture-form.ts` y `capture.controller.ts`. Se actualizaron la colección Postman sintética, la comprobación OpenAPI, el contrato, la matriz y el backlog.

Las pruebas en `test/ibite-results.test.mjs` comprobaron acceso ajeno, versión incorrecta, revocación, doble negativa concurrente, negativa posterior a un envío definitivo y envío posterior a una negativa. Una carrera entre negativa y envío sobre la misma habilitación produjo un 201, un 409 y exactamente un estado persistido. Una negativa no genera aplicación, resultado ni acuse. El formulario propio recupera su estado.

`./scripts/verify-isolated-db.ps1` pasó en el ensayo inicial y en el final. La corrida final tuvo 38 pruebas y un módulo de datos detectado por Node, con 39 entradas TAP aprobadas, cero fallidas y cero omitidas. Pasaron PostGIS, SQL, ESLint y Prettier. La base desechable recibió diez migraciones, incluida la nueva tabla. Al repetir quedaron cero pendientes y el diff fue vacío. No se aplicó la migración en otras bases.

Pendientes del siguiente bloque: validar formulario operativo de IBITE-17 por variante y su mapeo, definir los cambios de decisión y conservación, confirmar tratamiento de negativa de autorización del representante, verificar vínculo del acudiente y confirmar calendario. El ensayo usó datos sintéticos.

## Validación de formularios oficiales contra las fuentes disponibles

Se versionó la evidencia de las ramas adolescente y acudiente en `docs/06-reglas-negocio/ibite17-formularios-evidencia.v1.json`. Se extrajeron solo los encabezados de la exportación Excel. Se verificaron 34 referencias mediante la fila 2 de fórmulas y se confirmó que la huella del Excel coincide con el catálogo Prisma. El Word sirvió para corroborar la existencia y orden de las secciones de cada rama. `test/database.test.mjs` compara ambas variantes con el catálogo y protege la secuencia de columnas de consentimiento, capturas y puntuación.

`./scripts/verify-isolated-db.ps1` terminó con 38 pruebas más el módulo sintético detectado por Node, cero fallos y cero omitidas. Pasaron SQL, PostGIS, ESLint y Prettier. Las diez migraciones existentes se verificaron en la base desechable, con diff vacío. El cliente pg emitió un aviso de deprecación durante la prueba concurrente; queda registrado para seguimiento. No se añadieron migraciones ni rutas operativas.

Queda pendiente cotejar la configuración oficial de las rejillas, opciones y saltos y confirmar el texto de autorización, el vínculo y el tratamiento de negativas del representante antes de habilitar la captura real. Se actualizaron la especificación, la matriz y el backlog.

## Demostración de envíos y alertas IBITE-17

- R02/R04/R09/R12 y DF-14. El PDF se contrastó con el Word y el Excel. Quedó fijado el inventario v2 con números de rejilla, opciones y huella; se documentó la diferencia de obligatoriedad de la pregunta 23.
- `src/app.ts`, `src/app.module.ts`, `src/catalogs/catalogs.module.ts`, `src/ibite/capture-form.ts` y `capture.controller.ts` permiten seleccionar el formulario sintético de adolescente o acudiente a partir de la habilitación. El arranque habitual mantiene su contrato.
- `test/ibite-results.test.mjs`, `test/database.test.mjs` y `test/fixtures/ibite-synthetic-form.mjs` verifican la autorización incierta, captura de ambas ramas, 3 POST exitosos y acceso profesional a la alerta crítica, seguridad por aclarar o ausencia de señal. Las respuestas de demostración se capturaron en el [informe](08-pruebas/demo-ibite17-post.md) y se añadieron ejemplos Postman.
- `./scripts/verify-isolated-db.ps1` aprobó las pruebas de la primera corrida, pero ESLint detectó el import faltante de URL. Se corrigió y la repetición terminó con 39 entradas TAP aprobadas (38 pruebas y el módulo de datos sintéticos), cero fallidas u omitidas. SQL, PostGIS, ESLint y Prettier aprobados. Se aplicaron 10 migraciones existentes en la base temporal, la segunda ejecución no dejó pendientes y Prisma no encontró diferencias. Cero migraciones nuevas.
- Pendientes de despliegue real: configuración efectiva del formulario, aviso definitivo, negativa u omisión de autorización, verificación del vínculo, calendario y protocolo de atención. Las notificaciones reales continúan desactivadas.

## Calendario del piloto Periodo 2

DF-10/DF-13 · R02. El archivo `docs/02-requerimientos/ibite17-piloto-periodo-2.json` registra las diez instituciones y la ventana del 25 de noviembre al 10 de diciembre de 2026. Para fechas completas se usa medianoche de Bogotá y cierre exclusivo al iniciar el 11 de diciembre. `test/ibite-results.test.mjs` prueba los dos límites en PostgreSQL con una campaña sintética y el filtro utilizado por la API. `./scripts/verify-isolated-db.ps1` aprobó 39 entradas TAP, cero fallos, SQL, PostGIS, ESLint y Prettier. Se ajustaron decisiones, contrato y backlog. No se provisionaron campañas reales.

## Operación y consentimiento IBITE-17

- R01/R02/R12, DF-17. Se implementó `PUT /api/v1/interno/campanas-ibite/{campanaId}/estado` en `src/ibite/campaign-control.controller.ts`. Verificación del permiso explícito y de la institución, rechazo de DA-28, pausa y reanudación, auditoría idempotente y conservación de resultados. Filtro compartido de captura y bloqueo transaccional en `available-assignments.ts` y `assignment-lock.ts`.
- DF-11/DF-14. El registro sintético de negativas distingue participación y autorización del representante. La negativa del representante queda persistida y auditada, evita finalización y acuse, y permite reintentos idénticos. La autorización incierta conserva respuestas y cálculo. Archivos `capture-form.ts`, `capture.controller.ts` y `participation-refusal.ts`.
- Migraciones nuevas: `20261121000800_ibite_campaign_enabled` y `20261121000900_ibite_refusal_reason`. Cambios aditivos. Estados existentes se conservan como habilitados y negativas previas conservan tipo participación.
- `./scripts/verify-isolated-db.ps1` final: 39 entradas TAP (38 pruebas y un módulo de datos), cero fallos y cero omisiones. 12 migraciones desde cero en la base temporal, repetición sin pendientes, diff vacío, SQL/PostGIS y ESLint/Prettier aprobados. La primera corrida pasó las pruebas funcionales, pero detectó formato pendiente en un archivo que estaba en edición. Se formateó y se repitió la batería. Contratos OpenAPI y Postman en paridad.
- Actualizados los contratos, colecciones, deltas SDD, backlog y changelog. Quedan el flujo operativo con las variantes oficiales, aprovisionamiento masivo y vínculo desde padrón autorizado. Sigue pendiente el formulario DA-28. Sin migraciones aplicadas a bases reales ni activación de notificaciones.

## Inicio autónomo de estudiantes

DF-18 · R01/R02/R12. `src/ibite/student-start.controller.ts` incorpora inicio en campaña abierta con cuenta de estudiante, identidad interna estable, auditoría y reintento concurrente. La migración aditiva `20261121001000_ibite_student_self_start` agrega una relación opcional entre persona evaluada y cuenta propia sin modificar las filas históricas. OpenAPI, Postman, matriz y backlog actualizados.

El recorrido de `test/ibite-results.test.mjs` crea una cuenta sin historial, inicia dos veces, abre el formulario sintético y envía con autorización incierta. Comprueba una habilitación, un resultado de aplicación, una auditoría, rechazo de acceso ajeno y bloqueo tras revocar la habilitación. `./scripts/verify-isolated-db.ps1` aprobó 39 entradas TAP, cero fallos u omisiones, SQL, PostGIS, ESLint y Prettier. Las 13 migraciones se aplicaron en la base temporal, sin pendientes al repetir ni diferencias Prisma.

El formulario y envío se verificaron en el perfil sintético. Quedan el alta o autenticación inicial de participantes nuevos, el inicio de acudientes y la captura operativa. No se requiere padrón histórico para abrir el flujo.

## Identificación para el enlace público IBITE-17

DF-19/DF-20. Se revisó en navegador el selector de variantes y la entrada de identificación, edad e institución del sitio de ejemplo. No se enviaron datos a ese sitio. Se implementó el inicio sintético sin cuenta previa en `public-capture.controller.ts` y la selección de identificación por edad en `capture-identity.ts`. La migración `20261121001100_ibite_capture_identity` crea una huella opcional por participante y marca las cuentas del flujo público como limitadas a captura. El inicio habitual de estudiante descarta esas cuentas.

La prueba integra dos entradas separadas del mismo adolescente y confirma un solo envío, sin recuperar el acuse de la otra sesión. El mismo documento de acudiente completa dos formularios sintéticos para menores distintos y produce participantes distintos. Se conserva el cero inicial y se valida el límite de 11 años. Se actualizaron OpenAPI, Postman, matriz y backlog. `./scripts/verify-isolated-db.ps1` pasó con 40 entradas TAP (39 pruebas y un módulo de datos), cero fallos u omisiones. Aplicadas 14 migraciones en la base temporal, diff vacío, SQL/PostGIS, ESLint y formato aprobados.

Quedan clave administrada y estable para despliegue, controles de abuso, formularios operativos, y conciliación de filas históricas cuando exista una clave verificable. El flujo opera exclusivamente en la instancia sintética. No se actualizó el sitio externo.

## Duplicados después del reinicio de la aplicación

DF-20. El arranque sintético admite una clave de huella explícita en `createApp`. El caso de integración crea una clave aleatoria para la ejecución y la inyecta en dos instancias sucesivas de Nest. Entre ambas se cierra la primera, se conserva la base temporal y se inicia la segunda. El mismo documento se asocia al mismo participante. El segundo envío recibe 409, la segunda sesión no puede recuperar el acuse, y la original conserva acceso al suyo. Una única aplicación queda en PostgreSQL.

`./scripts/verify-isolated-db.ps1` terminó con 40 entradas TAP aprobadas (39 pruebas y el módulo sintético), cero fallos y cero omisiones. PostgreSQL, PostGIS, ESLint y Prettier aprobados. No se añadieron migraciones ni se habilitaron rutas reales.

## Arranque local del piloto sintético y reinicio de proceso

Se agregó `npm run start:ibite-demo` con clave de captura estable configurable, base local sig_test, dos campañas ficticias, Swagger y sesión psicosocial de demostración. `scripts/verify-ibite-demo.mjs` usa dos procesos Node y preserva la base y clave. Verificó POST 201 con autorización incierta, alerta crítica accesible al equipo y POST 409 tras reiniciar. El comando habitual permanece separado.

`./scripts/verify-isolated-db.ps1` finalizó con 41 entradas TAP (40 pruebas y el módulo sintético) sin omisiones, verificación de reinicio separada, SQL/PostGIS, 14 migraciones existentes, diff vacío, ESLint y Prettier. Una corrida previa encontró que ESLint no reconocía fetch en el script nuevo; se corrigió el uso de la API global. No hubo migraciones nuevas ni aprovisionamiento real.

Documentados el procedimiento de demostración, la configuración del secreto local y el backlog operativo. Para considerar cerrada la captura del piloto quedan formularios oficiales en el arranque real, controles de inicio público, campañas e identidades operativas. Para DA-28 falta el formulario oficial.

## Preparación de campañas del Periodo 2

DF-10/DF-13/DF-17 · R01/R02/R12. Se agregó `npm run plan:ibite-pilot -- CODIGO_DEL_PERIODO [UUID_DEL_OPERADOR]`. La ejecución de solo lectura sobre sig_test distingue instituciones ausentes, ambiguas o inactivas, verifica versión, periodo, alcance del operador y conflictos de campañas. El plan genera dos combinaciones por institución. Una campaña compatible mantiene su estado de habilitación. Se incorporó la versión de puntuación al manifiesto del piloto.

Pruebas: `test/ibite-pilot-plan.test.mjs` verifica 20 combinaciones, límites de calendario, conflictos y permisos. `scripts/verify-isolated-db.ps1` ejecutó además el CLI contra PostgreSQL con un periodo inexistente y verificó salida 2. Suite final con 45 entradas TAP (44 pruebas y el módulo de datos), cero fallos u omisiones, más reinicio de Node, SQL/PostGIS, ESLint y Prettier. Sin rutas ni migraciones nuevas. No se escribieron campañas.

Actualizados los documentos de preparación, cierre y trazabilidad. Quedan el aprovisionamiento real, la cuenta operativa y el formulario oficial. Las veinte combinaciones se verificaron con un catálogo completo sintético, no con el catálogo institucional real.

## Ítems de referencia en el recorrido local

El modo `npm run start:ibite-demo -- --verified-items` conecta ambas ramas de evidencia v2 con el formulario GET, identificación, POST definitivo y acuse. Los enunciados y opciones provienen del inventario contrastado con el PDF, Excel y formulario publicado. Las campañas y documentos de prueba siguen siendo sintéticos.

`./scripts/verify-isolated-db.ps1` verificó las 34 preguntas por HTTP, dos POST 201, acuse de acudiente, alerta crítica para el equipo y 409 de duplicado tras reiniciar Node. Pasaron 44 pruebas, más el módulo detectado por Node y el ensayo externo. PostgreSQL, PostGIS, diff Prisma, ESLint y Prettier aprobados. Sin rutas operativas nuevas ni migraciones. Se mantuvieron IDs estables por variante entre ambos modos locales.

Actualizados el archivo de cierre, matriz, backlog y guía de demostración. Falta conectar las secciones oficiales completas y ejecutar el plan con el catálogo autorizado y la cuenta del operador.

## MTTS Formato A

R05 / MTTS-A-01 a MTTS-A-04. Contrastado contra el Word original. Se agregaron consulta del formulario versionado, registro semanal, acuse y consulta de ficha. El alcance usa el rol psicosocial, los permisos de registros y la asignación institucional vigente. La ficha y la auditoría de creación se guardan en una transacción; la lectura se audita.

Archivos principales: `src/mtts/form-a.ts`, `src/mtts/form-a.controller.ts`, `prisma/schema.prisma` y `prisma/migrations/20261121001200_mtts_weekly_capture/migration.sql`. OpenAPI, Postman, el contrato, la matriz y el backlog quedaron sincronizados. El ensayo de integración verificó cero, NA y omisión, reglas de selección y conteos, dos escrituras concurrentes con respuestas 201 y 409, y pérdida de acceso tras revocación.

La primera corrida encontró un nombre de variable duplicado en el archivo de integración, que se corrigió. `./scripts/verify-isolated-db.ps1` terminó con 45 entradas TAP, incluidas 44 pruebas, cero fallos u omisiones, más el ensayo IBITE de reinicio. Pasaron PostgreSQL, PostGIS, ESLint, Prettier y paridad OpenAPI/Postman. Se aplicaron 15 migraciones desde cero en la base desechable. No se desplegó ni se usaron datos reales.

Pendientes: catálogo de sedes, obligatoriedad y correcciones para el uso operativo, prueba cognitiva y aprobación de las reglas de alerta. El módulo conserva valoraciones individuales y no genera puntajes globales o alertas automáticas.

## Consulta y analítica descriptiva MTTS

R05. `src/mtts/report-query.controller.ts` añade listado paginado y resumen descriptivo por institución y rango de inicios de semana. `src/mtts/form-a-summary.ts` valida el rango y calcula distribución y mediana por dimensión, NA, faltantes y frecuencias. No se produce un puntaje global. Los endpoints vuelven a comprobar el ámbito institucional y auditan sin copiar la carga. Se agregaron un índice de consultas por periodo y las dos operaciones Postman/OpenAPI.

El ensayo probó dos semanas con mediana 3, NA y faltante por separado, corte vacío, 26 fichas repartidas en dos páginas sin duplicados, cursor inválido y revocación de acceso. `./scripts/verify-isolated-db.ps1` registró 45 entradas TAP (44 pruebas y un módulo de datos), cero fallos y omisiones. Pasaron PostgreSQL/PostGIS, reinicio Node, paridad OpenAPI/Postman, ESLint y Prettier. Dieciséis migraciones en la base desechable, incluida la nueva, con diff vacío. Solo datos sintéticos.

Pendientes: flujo de corrección, catálogo de sedes y aprobación de las alertas. Los cambios de contrato, matriz y backlog quedaron registrados.

## Tendencia semanal y filtros de MTTS

R05. `src/mtts/form-a-summary.ts`, `form-a.ts` y `report-query.controller.ts` incorporan filtro por sede con normalización compartida y serie cronológica por fecha de inicio. El resumen total sigue disponible. El cursor se valida con los mismos filtros. El código devuelve métricas descriptivas por semana sin inferir semanas ausentes ni generar alertas.

La integración probó medianas semanales 4 y 2, NA al 100 % en un corte y dato faltante en el otro, búsqueda de sede con espacios y mayúsculas, rechazo de parámetros inválidos y de cursor de una sede ajena. `./scripts/verify-isolated-db.ps1` terminó con 45 entradas TAP (44 pruebas y un módulo), cero fallos ni omisiones. Pasaron SQL/PostGIS, reinicio IBITE, paridad OpenAPI/Postman, ESLint y Prettier. Las 16 migraciones existentes se verificaron en la base desechable. No hubo rutas o migraciones nuevas. Contrato, trazabilidad y backlog actualizados.

## Factibilidad de talleres

R06 · FACT-A-01 a FACT-A-04. `src/feasibility/workshop-form.controller.ts` expone el inventario parcial versionado de Jugar para cuidar. Contiene ocho campos visibles, diez etiquetas institucionales y dos rejillas marcadas como incompletas. La respuesta separa evidencia de captura futura. La prueba verificó sesión requerida, permiso, acceso con asignación, revocación y estado parcial. Se actualizaron OpenAPI, Postman, especificación, matriz y backlog.

`./scripts/verify-isolated-db.ps1` terminó con 45 entradas TAP (44 pruebas y un módulo), cero fallos u omisiones. Pasaron PostGIS, revisión de esquema, reinicio IBITE, paridad OpenAPI/Postman, ESLint y Prettier. Sin migraciones nuevas ni registros reales. Quedan el original vacío completo, unidad de registro y autorización de fichas multiinstitucionales antes de habilitar escritura.

## Evidencia v2 de Factibilidad

Las cuatro capturas del 21 de noviembre permiten conservar siete filas completas y Sí/Parcial/No en preparación y desarrollo, y tres filas completas y cinco opciones en análisis del proceso. Se actualizaron `src/feasibility/workshop-form.controller.ts`, sus comprobaciones HTTP y la documentación. El estado parcial permanece por la cobertura no confirmada y la obligatoriedad individual.

`./scripts/verify-isolated-db.ps1` pasó con 45 entradas TAP, de ellas 44 pruebas, sin fallos ni omisiones. PostgreSQL/PostGIS, reinicio Node, paridad OpenAPI/Postman, ESLint y Prettier verificados. Cero migraciones nuevas. Restan confirmación de cuadrículas, unidad de ficha y alcance multiinstitucional.

## Captura de Factibilidad del taller

R06. La confirmación de una sola institución y respuesta por fila permitió conectar el formulario, POST, acuse y detalle de Jugar para cuidar. `src/feasibility/workshop-form.controller.ts` valida fecha, versión, texto, siete opciones de preparación y tres de proceso. Un envío con lista de instituciones es inválido. La creación y consulta se auditan. `20261121001400_workshop_feasibility` agrega almacenamiento separado.

La integración verificó rechazo de omisión, opción de otra escala y múltiples instituciones, acuse, persistencia y pérdida de acceso tras revocar alcance. `./scripts/verify-isolated-db.ps1` terminó con 45 entradas TAP (44 pruebas y un módulo), cero fallos ni omisiones. Pasaron 17 migraciones, PostGIS, reinicio IBITE, OpenAPI/Postman, ESLint y Prettier. Solo datos sintéticos. Quedan clave de negocio de duplicados, correcciones e indicadores.

## Listado y reintentos de Factibilidad

R06. `workshop-form.controller.ts` incorpora GET por rango y cursor, sin respuestas ni autor en el listado, y reintento POST por Idempotency-Key opcional. La migración `20261121001500_workshop_feasibility_retries` agrega huellas y un índice único por institución, autor y clave. Los reintentos concurrentes devuelven el mismo acuse y una auditoría. Cambiar contenido devuelve 409. Se probó autorización tras revocar el ámbito, cursor fuera del corte, rango y respuesta mínima.

`./scripts/verify-isolated-db.ps1` terminó con 45 entradas TAP (44 pruebas y el módulo de datos), cero fallos y omisiones. Pasaron 18 migraciones en la base desechable, diff Prisma vacío, SQL/PostGIS, reinicio IBITE, OpenAPI/Postman, ESLint y Prettier. Se actualizaron contrato, backlog y trazabilidad. Sin datos reales. Quedan duplicados de negocio, correcciones e indicadores.

## Evidencia de Factibilidad e inventario de Matriz de resultados

H-41 conserva duplicados de negocio, correcciones e indicadores del taller como pendientes. R07/R12/R14 agrega el inventario v1 de 96 columnas, cotejado con el Excel de La Merced en solo lectura y sin filas de casos. Se preservaron las coordenadas, los dos niveles de encabezados, las sugerencias y la procedencia. Se documentó el primer contrato candidato de consulta y sus decisiones pendientes.

`node --test test/matrix-evidence.test.mjs`: 2 aprobadas. `npm run lint` y `npm run format:check` aprobados. No se ejecutó la suite de PostgreSQL para este bloque documental y de pruebas estáticas. Cero migraciones y rutas. No se procesaron expedientes.

## Preparación de la Matriz y estado global

R07/R12/R14. `src/matrix/source-review.ts` y `scripts/review-matrix-sources.mjs` incorporan revisión local por huella, hoja y fila contra un índice de coordenadas autorizado. Se verificaron referencias incompletas, coincidencias ambiguas y lotes con la misma fila. La herramienta rechaza cargas con campos nominales. El inventario v1 y el estado global se documentaron. No se crearon expedientes ni relaciones con aplicaciones reales.

`./scripts/verify-isolated-db.ps1` pasó con 50 entradas TAP (49 pruebas y un módulo de datos), cero fallos u omisiones. SQL/PostGIS, Prisma, reinicio IBITE, OpenAPI/Postman, ESLint y Prettier aprobados. Sin migraciones nuevas ni rutas. Quedan validar unidad del registro, acceso disciplinario e índice de procedencia para abrir la captura. Consultar [avance global](AVANCE_GLOBAL.md).

## Respaldo y recuperación

R12/R13. `scripts/verify-isolated-db.ps1`, `test/db/restore-fixtures.sql` y `test/db/restore-check.sql` verifican respaldo lógico y restauración en una base separada dentro del contenedor aislado. Se compararon migraciones, conteos y huellas de campañas, aplicaciones, resultados, MTTS, Factibilidad y auditoría, además de una operación PostGIS. El respaldo permaneció en el contenedor desechable.

La ejecución completa terminó con 50 entradas TAP, de ellas 49 pruebas, cero fallos y cero omisiones, más la demo de reinicio, el ensayo de restauración, SQL/PostGIS, paridad OpenAPI/Postman, ESLint y Prettier. Sin rutas ni migraciones nuevas. Queda la política institucional de respaldo y conservación. Fichas de campo espera su plantilla.

## Consulta SIG de puntos institucionales

R10/R12. `src/geo/institution-points.controller.ts` incorpora consulta interna por institución y bbox. La migración `20261122000100_sig_institution_map_points` crea geometría Point SRID 4326, restricciones de longitud y latitud e índices por institución y GiST. Se usó SQL parametrizado. Se verificaron recorte, orden longitud-latitud, GeoJSON, rechazo de bbox invertida y cursor exterior, permisos y revocación. Se actualizaron OpenAPI, Postman y trazabilidad.

`./scripts/verify-isolated-db.ps1` pasó con 50 entradas TAP (49 pruebas y un módulo), cero fallos y cero omisiones. Pasaron 19 migraciones, diff vacío, SQL/PostGIS, respaldo/restauración, reinicio IBITE, ESLint y Prettier. Solo geometrías ficticias. Quedan importación, metadatos y fuentes oficiales.

## Validación previa de capa geográfica

R10. `src/geo/layer-preview.ts` y `scripts/preview-sig-layer.mjs` revisan una capa GeoJSON sin acceso a base. Detectan geometrías y coordenadas inválidas, códigos desconocidos, etiquetas vacías y puntos repetidos. Conservan múltiples puntos distintos de una institución. El resultado es un diagnóstico por posición sin publicar coordenadas. Se actualizaron package, contrato de georreferenciación, matriz y backlog.

`./scripts/verify-isolated-db.ps1` aprobó 53 entradas TAP (52 pruebas y un módulo), cero fallos u omisiones, incluidos tres casos nuevos de SIG. Pasaron 19 migraciones existentes, diff vacío, SQL/PostGIS, respaldo/restauración, OpenAPI/Postman, ESLint y Prettier. Sin rutas ni migraciones nuevas. Falta la capa oficial, el catálogo autorizado y el procedimiento de carga.

## Fichas de campo y categorías

R08/R10/R12. Revisados el Word de talleres y reuniones y el PDF con taxonomía v1. Se documentaron sesión, hallazgo, lugar y recomendación, las diferencias de categorías, así como la ausencia de un esquema espacial separado en el Word sin recorrido. `src/field-notes/session-review.ts` y `scripts/preview-field-session.mjs` verifican códigos y enlaces sin persistir ni estimar coordenadas.

Pasaron `npm run build`, las dos pruebas de `test/field-session-review.test.mjs`, una ejecución CLI con un lote sintético, ESLint y Prettier. No se ejecutó la suite PostgreSQL en este incremento de solo lectura. Sin rutas ni migraciones nuevas. Falta confirmar el medio de carga y el esquema espacial.

## Revisión previa de fichas en XLSX

R08. Confirmada la captura en Excel. `scripts/preview-field-workbook.py` valida una estructura candidata de Sesion, Hallazgos y Lugares y reutiliza la revisión de referencias. Se comprueba que el diagnóstico preserve hoja y fila de Excel, omita datos capturados y rechace fórmulas. Tres pruebas XLSX sintéticas en `test/test_field_workbook_preview.py` aprobadas. No hubo importación, persistencia, migración ni cambio de API. Pendiente plantilla final y autorización de carga.

## Plantilla inicial de Fichas de campo

R08. Se generó `outputs/fichas-campo/Plantilla_Fichas_de_campo_v1.xlsx` con las tres hojas y encabezados del validador, primera fila inmovilizada y lista desplegable de estado pendiente. Se revisaron visualmente las hojas y se verificaron las características del archivo guardado. Una copia sintética con fecha de Excel, un hallazgo y un lugar pasó `preview-field-workbook.py`. También pasaron las tres pruebas del lector. Sin cambios de API, base de datos ni migraciones. Quedan categorías, recomendaciones, ficha espacial y persistencia del lote.

## Carga transaccional SIG

R10. El dashboard queda a cargo de frontend. La carga sintética usa `src/geo/institution-layer-import.ts` y `scripts/import-sig-test-layer.mjs`, validación compartida y SQL parametrizado. La migración `20261122000200_sig_point_source` registra huella y posición del archivo. La integración verificó cero inserciones en lote inválido, reintentos concurrentes con un solo punto y consulta del punto por bbox.

`./scripts/verify-isolated-db.ps1` pasó con 55 entradas TAP (54 pruebas más un módulo), cero fallos u omisiones. Veinte migraciones en la base desechable, diff Prisma vacío, PostGIS, respaldo y restauración, OpenAPI/Postman, ESLint y Prettier aprobados. Sin coordenadas reales ni nueva ruta. Pendientes fuente oficial, procedencia completa y tratamiento de nuevas versiones.

## Inspección de MapasCompilados

R10. Se inventariaron los GeoPackage en memoria con SQLite y se compararon 21 geometrías de puntos con los atributos de coordenadas. Se verificaron 139 polígonos de microzonificación y cero filas en las tablas de amenaza/riesgo y deslizamiento. Se documentaron el CRS y los cruces de sedes que requieren verificación. Sin transformaciones, importación, rutas ni migraciones. No se ejecutó la suite del backend en este bloque documental.

## Preparación de puntos institucionales desde GeoPackage

R10. `scripts/prepare-gpkg-institutions.py` revisó las 21 sedes desde el ZIP sin extraerlo y generó el inventario de códigos. La conversión produce GeoJSON solo con un cruce DANE completo. No consulta ni escribe en PostgreSQL. Se corrigió un byte nulo en la primera versión del lector y se repitió el inventario real. `python -m unittest discover -s test -p test_sig_gpkg_prepare.py` aprobó dos pruebas sintéticas. Falta el cruce con el catálogo interno y la leyenda de microzonificación.

## Microzonificación para revisión

R10. `scripts/prepare-gpkg-microzonification.py` exportó 139 MultiPolygon WGS84 preservando fid, zona y descripción. Se revisaron tipo, coordenadas, cierre y área de anillos, y se normalizó orientación. Salida local en `outputs/sig/microzonificacion-revision.geojson`. Se ejecutó `python -m unittest discover -s test -p test_sig_gpkg*.py` con cuatro pruebas aprobadas. Sin importación PostgreSQL, cambios de API o migraciones. La revisión estructural no incluye topología. Quedan leyenda, vigencia, licencia y contrato de la capa.

## Leyenda y topología de microzonificación

R10. Año 2002 y autorización de publicación cartográfica confirmados por el responsable. El contraste del GeoJSON mostró coincidencia en A y B y diferencia en P. T se conserva como límite zonificado. Se ejecutó la validación directa de la capa con PostGIS en Docker sin red, tabla temporal y rollback: 139 válidos de 139, 0 incompatibles. Sin rutas, migraciones ni cambios de base operativa. No se ejecutó la suite del backend en este bloque.

## Carga y consulta pública de microzonificación

R10. Se incorporaron la migración `20261122000300_sig_microzonification`, el modelo Prisma, el cargador local por huella y el endpoint público con caja espacial y cursor. La etiqueta P aprobada se sirve en GeoJSON y la descripción de origen se conserva en PostgreSQL. Se actualizaron OpenAPI, Postman, la matriz SDD y el inventario de mapas.

`./scripts/verify-isolated-db.ps1 -MicrozonificationPath outputs/sig/microzonificacion-revision.geojson` terminó con código 0. Se aplicaron 21 migraciones en la base desechable y el segundo paso quedó sin cambios. Diff Prisma vacío, 56 entradas TAP aprobadas, 0 fallos y 0 omisiones, paridad OpenAPI/Postman, SQL PostGIS, respaldo y restauración, ESLint y Prettier aprobados. La capa entregada registró 139 inserciones y 0 al repetirla (A 33, B 98, P 7, T 1). Se corrigieron un tipo implícito en TypeScript y tres referencias sin importación que detectó ESLint antes de repetir la verificación.

Queda la carga en la base operativa y el cruce DANE para incorporar las sedes.

## Preparación operativa de SIG e IBITE

R10. Se incorporó `GET /api/v1/publico/sig/capas` con los metadatos y la leyenda de la cartografía cargada. Se extendieron el servicio y los comandos de importación SIG con un plan de solo lectura. La edición revisada de microzonificación admite carga explícita con credenciales separadas. El plan de sedes usa el catálogo activo y conserva el diagnóstico por posición.

R01/R12. Se incorporó el límite de veinte solicitudes por dirección remota y minuto al inicio público sintético. La demostración verifica 429 y `Retry-After`. El plan previo del piloto admite una conexión separada, exige el operador al revisar un despliegue y consulta dentro de una transacción de solo lectura.

Verificación final. `./scripts/verify-isolated-db.ps1 -MicrozonificationPath outputs/sig/microzonificacion-revision.geojson` terminó con código 0. Pasaron 56 entradas TAP, sin omisiones, incluidos catálogo, paginación y planes SIG. Los planes de microzonificación informaron 139 pendientes antes de cargar y 0 después. Se verificaron 139 inserciones iniciales y 0 en la repetición, paridad OpenAPI/Postman, migraciones y diff Prisma, restauración, demo IBITE con reinicio y 429, diagnóstico del periodo y operador ausentes, ESLint y Prettier. Una ejecución anterior señaló formato pendiente en el script del plan. Se corrigió antes de repetir. `python -m unittest discover -s test -p 'test_sig_gpkg*.py'` aprobó cuatro pruebas.

Archivos revisados: controladores y servicios SIG, guardia de captura IBITE, scripts de importación, planificación y verificación, pruebas de integración, configuración de ejemplo, documentos SDD y colección Postman. El lote agregó un endpoint y ninguna migración nueva. Las verificaciones usaron la base desechable.

Pendientes de operación y especificación: vinculación institucional DANE, credenciales y carga en el entorno operativo, formulario completo de IBITE-17 en el arranque habitual y formulario oficial de DA-28. El control de cuota compartido debe formar parte de la configuración de exposición pública.
