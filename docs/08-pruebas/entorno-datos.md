# Verificación del entorno de datos

| Comprobación | Resultado |
|---|---|
| Docker Hub, manifiesto de postgis/postgis:17-3.7 | Confirmado el digest de la imagen Linux amd64 usado en Compose |
| docker compose config --quiet | Aprobado para desarrollo y pruebas con valores sintéticos |
| Separación de configuraciones | Confirmados proyectos y puertos distintos, publicación en 127.0.0.1 y almacenamiento persistente en desarrollo frente a temporal en pruebas |
| Prisma 7.10.1 validate | Validado un esquema temporal con proveedor PostgreSQL y columna Unsupported("geometry(Point,4326)") en Node.js 22.14.0. El esquema temporal no se incorporó al producto |
| Prisma migrate diff de la sonda | El comando no produjo un script verificable. La generación y aplicación de una migración siguen pendientes |
| Arranque de Docker y PostgreSQL de pruebas | Primer intento: bloqueado por falta de WSL. Tras el reinicio, WSL 2 y Docker Engine 29.9.3 Linux estuvieron disponibles. Compose inició la base aislada y confirmó el estado saludable |
| Prueba espacial SQL | Aprobada en PostgreSQL 17.12 y PostGIS 3.7.0. Verificadas creación de geometría Point 4326 e índice GiST, inserción, intersección, reproyección a 3857 y GeoJSON. La transacción terminó en ROLLBACK |
| Regresión HTTP | 4 pruebas aprobadas, 0 fallidas. Lint y formato aprobados |

La sonda espacial anterior no incluía un esquema de dominio. La primera migración de dominio se verifica en la sección siguiente. El entorno de desarrollo persistente no se inició en esta ejecución.

## Primera migración de identidad y catálogos

La migración 20261120000100_identity_catalogs fue generada con Prisma 7.10.1 y revisada para incorporar el CHECK de fechas. Se aplicó a sig_test en PostgreSQL 17.12. La segunda ejecución no encontró migraciones pendientes y el diff Prisma no detectó diferencias. La prueba SQL aceptó inserciones sintéticas válidas, rechazó código duplicado, asignación duplicada, referencia inexistente, periodo invertido y eliminación de una institución referenciada. ROLLBACK dejó cero filas en las ocho tablas de dominio.

## Conexión Nest y catálogo de acceso

Ejecutados npm run db:seed y la prueba de integración con DATABASE_TEST_URL de sig_test. Nest inició con Prisma conectado. Dos nuevas ejecuciones de la semilla conservaron los mismos identificadores y asignaciones: 6 roles, 10 permisos y 14 vínculos rol–permiso. No se crearon cuentas. Resultado final: 5 pruebas aprobadas, 0 fallidas, lint y formato aprobados y npm audit sin vulnerabilidades reportadas. El primer lint detectó una referencia global URL; se corrigió importándola de node:url y se ejecutaron de nuevo las verificaciones.

## Validación de sesiones internas

Aplicada la migración 20261120000200_auth_sessions en sig_test. Prisma confirmó dos migraciones al día. La integración verificó GET /api/v1/auth/me con sesión válida y comprobó HTTP 401 ante ausencia, formato inválido, huella desconocida, expiración, revocación y cuenta inactiva. Verificó la política no-store, el esquema OpenAPI con Bearer y el rechazo 403 del guard ante permiso ausente. Se eliminaron solo las filas sintéticas creadas por la propia prueba. La base de pruebas quedó con cero cuentas y cero sesiones. Resultado final: seis pruebas aprobadas, lint y formato aprobados. El primer lint detectó un parámetro de prueba sin uso y se corrigió antes de repetir las comprobaciones.

## Ciclo de sesión interna

La integración en sig_test verificó emisión de dos tokens distintos para una cuenta activa, persistencia únicamente de la huella, rechazo de caducidad pasada y de cuenta inactiva, HTTP 204 sin cuerpo al cerrar la sesión actual, HTTP 401 al reutilizarla y HTTP 200 con la otra sesión activa. Se corrigió un desajuste de tipos del primer intento de compilación. La ejecución final pasó las seis pruebas, lint y formato. La base aislada quedó con cero cuentas y cero sesiones sintéticas.

## Consultas de catálogos internos

Con un token del Equipo de Apoyo Psicosocial, la integración verificó paginación por código, instituciones activas e inactivas, fechas de periodo y la respuesta OpenAPI. Verificó 401 sin sesión, 403 para estudiante y 400 con límites o parámetros inválidos. El primer intento detectó una dependencia de SessionGuard que no se exportaba entre módulos; se corrigió y se repitió la batería. Resultado final: siete pruebas aprobadas, lint y formato aprobados. La base aislada quedó con cero cuentas, sesiones, instituciones y periodos sintéticos.

## Cálculo interno de dimensiones IBITE-17

Tres pruebas unitarias abarcaron los límites de malestar, faltantes, inversión de ítem 16, señales funcional y escolar, precedencia de seguridad y entradas inválidas. Contrastan los resultados esperados del Excel de referencia. La batería completa con PostgreSQL aislado terminó en diez pruebas aprobadas, sin fallos. Lint y formato aprobados. No se activaron alertas ni se escribieron resultados de puntuación.

## Cálculo interno IBITE-DA-28

Tres pruebas unitarias verificaron escala 0–4, límites, faltantes, núcleo frente a contexto, precedencia de seguridad y banderas por dominio. Contrastan los resultados esperados trazados desde Excel. La batería completa con PostgreSQL aislado terminó con 13 pruebas aprobadas y cero fallos. Lint y formato aprobados.

## Clasificación interna IBITE-17 e IBITE-DA-28

Cuatro pruebas unitarias añadidas. Cubren presencia, faltantes, perfiles, peso del contexto material y precedencia de riesgo en ambos Excel. Se usaron fórmulas de referencia y casos sintéticos. La batería con PostgreSQL aislado registró 17 pruebas aprobadas, cero fallos. ESLint y Prettier aprobados. No se escribieron resultados de puntuación.

## Sesión autónoma del 20 de noviembre de 2026

- Selectores de orientación: 20 pruebas aprobadas, cero fallos. Tres pruebas nuevas abarcan plazos, señales, claves, faltantes y precedencias.
- Contraste Excel: 27 comprobaciones adicionales aprobadas en nueve escenarios sintéticos de orientación. Se conservaron tipos y valores de claves de búsqueda, sustituyendo textos de orientación por etiquetas sintéticas.
- Disponibilidad PostgreSQL: 21 pruebas aprobadas, incluida respuesta normal 200 y caída simulada 503 sin detalles. La prueba de conexión normal usa PostgreSQL real.
- Catálogo y cálculo por referencia: 22 pruebas aprobadas. Se verificaron 2 instrumentos, 3 variantes, semillas repetibles, rechazo de mutación de metadatos y ejecución del cálculo con la referencia correspondiente.
- Herramientas: npm test con DATABASE_TEST_URL, npm run lint, npm run format:check y npm audit aprobados. Prisma migrate status confirma tres migraciones. Prisma migrate diff con --exit-code no detectó diferencias del esquema.
- PostgreSQL/PostGIS: en un contenedor nuevo se aplicaron las tres migraciones, la segunda ejecución no detectó pendientes y la semilla cargó los catálogos. La corrida final con node --test en esa base confirmó la instalación reproducible. Las pruebas SQL de integridad y PostGIS también se ejecutaron en una base de verificación independiente anterior al catálogo y en sig_test.
- Pendiente: pruebas de importación con mapeos autorizados, E2E de envío de aplicaciones y persistencia de resultados, validación institucional de alertas y escenarios de divulgación pública.

## Verificación del 21 de noviembre de 2026

- Prisma migrate deploy aplicó 20261121000100_ibite_applications_and_scope en sig_test. Prisma migrate diff con --exit-code no detectó diferencias.
- 24 pruebas pasaron, 0 fallaron, con DATABASE_TEST_URL y ejecución serial. El primer intento paralelo tuvo un fallo con pruebas que usan la misma base. Se ajustó la ejecución y se repitió.
- La integración verificó unicidad, múltiples resultados versionados, acceso 200 asignado, 404 fuera de ámbito o al retirar asignación, 403 técnico, 401 sin sesión y 400 para UUID mal formado. Verificó OpenAPI y encabezado no-store.
- La prueba unitaria verificó observación positiva y faltante simultáneos. ESLint y Prettier aprobados. Sin importaciones de datos personales ni notificaciones.

## Persistencia y asignaciones auditadas

24 pruebas aprobadas, cero fallos. Se renovó la prueba de integración para ensayar dos envíos definitivos simultáneos, una aceptación y un conflicto P2002; resultados versionados; gestión idempotente; lectura 404 sin asignación y tras revocarla con la misma sesión; 403 sin rol o permiso y cuatro eventos auditados. Prisma aplicó la quinta migración solo en sig_test y el diff no encontró diferencias. ESLint y Prettier aprobados. Sin notificaciones ni datos reales.

## Campañas y habilitaciones IBITE

Aplicada 20261121000300_ibite_campaigns_and_assignments solo en sig_test. Las comprobaciones rechazaron habilitación ajena y revocada, ventana cerrada y permiso retirado. La aplicación aceptada conservó habilitación, persona evaluada y respondiente distintos. La concurrencia siguió produciendo un solo envío definitivo. Un intento inicial dejó un rol sintético por un error de variable en el fixture; se corrigió y retiraron los registros identificables de ese caso en la base aislada. Resultado final: 24 pruebas aprobadas, cero fallos, lint y formato aprobados, Prisma sin diferencias.

## Consulta de asignaciones propias

24 pruebas aprobadas, lint y formato aprobados en sig_test. El caso HTTP verificó 401 sin sesión, 403 sin permiso, 400 con cursor inválido, aislamiento de la habilitación y ausencia de campos identificables, filtro por revocación y acuse propio antes y después del envío interno. Sin migración adicional.

## Diagnóstico histórico R03

27 pruebas aprobadas, ESLint y Prettier aprobados. Tres pruebas unitarias cubrieron conciliación de unidades, procedencia, referencias repetidas, alias ambiguos y validación estructural. El módulo reprodujo el informe de Manizales con metadatos locales y sin respuestas ni identificadores personales. No se crearon lotes ni se publicaron datos.

## Extracción local XLSX Manizales

3 pruebas Python aprobadas: selección de rama con datos transformados, cuarentena de anclaje divergente, rechazo de encabezado cambiado y de paquete con macros. La ejecución de solo lectura contra -23 reprodujo el conteo 7.554/7.557, tres referencias vacías y ningún desacuerdo entre referencias dentro de una fila. Se ejecutaron las 27 pruebas Node en sig_test, lint y formato. No hubo escrituras de histórico.

## Perfil de extracción DA-28

4 pruebas Python y 27 pruebas Node aprobadas. Lint y formato aprobados. Se ejecutaron los perfiles ibite17 y da28 sobre sus copias confirmadas en solo lectura; se conservaron los conteos -23 y se verificaron para DA-28 la referencia repetida a origen vacío y la extracción de anclajes. Sin migraciones ni escrituras de datos.

## Auditoría del diagnóstico histórico

28 pruebas aprobadas, lint y formato aprobados. Prisma aplicó la séptima migración a sig_test y el diff no detectó diferencias. Dos altas concurrentes produjeron un diagnóstico y un evento de registro. La integración comprobó rechazo por falta de permiso, incidencia ajena y estado no admitido, conservación de dos revisiones y de la instantánea original, y ausencia de etiquetas y candidatos en el snapshot. Solo se usaron datos sintéticos.

## Consulta de auditoría institucional

28 pruebas aprobadas, ESLint y Prettier aprobados. En sig_test se aplicó la octava migración para el índice de auditoría y el diff de Prisma no mostró diferencias. Se verificaron 401 sin sesión, 403 para rol técnico con permiso, 404 sin asignación y después de revocarla, y 200 con asignación vigente. Un evento no institucional quedó excluido. La respuesta incluyó solo metadatos y la consulta quedó auditada. Se usaron y retiraron únicamente registros sintéticos de la prueba.

## Lote autónomo de consultas y contratos

32 pruebas aprobadas con PostgreSQL aislado, cero fallos, lint y formato aprobados. Incluye cursores con empates, exclusión de registros fuera de ámbito, supresión sintética y comparación de las 12 operaciones de Postman con OpenAPI. Prisma informó ocho migraciones al día. Sin migraciones nuevas.

## Detalle, acuse y reintentos IBITE

33 pruebas Node y 5 Python aprobadas en la verificación final; lint y formato aprobados. Una compilación inicial se corrigió por escapes Unicode en el normalizador. En una base desechable, nueve migraciones se aplicaron desde cero, el segundo deploy no tuvo pendientes y Prisma no detectó diferencias. Se verificaron los 14 métodos/rutas y autenticación de Postman contra OpenAPI. La prueba concurrente obtuvo el mismo ID para dos reintentos y registró una sola aplicación y un resultado. Se verificaron conflicto de contenido, permiso, revocación y desafío Bearer. Solo datos sintéticos.

## Tercer lote y verificación por proyecto desechable

36 pruebas Node y 5 Python aprobadas. El script verificó las nueve migraciones desde cero, reaplicación sin pendientes, diff sin diferencias, integridad SQL y PostGIS. Pruebas de autorización cruzada, reproducción auditada sin crear resultados y conciliación de anclajes inválidos aprobadas. ESLint y Prettier aprobados. Sin nuevas migraciones o rutas.

Cuarto lote: `./scripts/verify-isolated-db.ps1` pasó con 36 pruebas Node, 0 fallos y 0 omitidas. Las 9 migraciones existentes se aplicaron desde cero y la repetición no dejó pendientes. Diff Prisma vacío, comprobaciones SQL, ESLint y Prettier aprobados.

Quinto lote: `./scripts/verify-isolated-db.ps1` pasó con 36 pruebas Node, cero fallidas y cero omitidas. Se verificaron PostgreSQL, PostGIS, integridad SQL, nueve migraciones existentes, diff Prisma, lint y formato.

Sexto lote: `./scripts/verify-isolated-db.ps1` aprobó 38 pruebas Node sin omisiones, migraciones, diff, pruebas SQL, ESLint y Prettier.

## Captura REST sintética

El script de verificación desechable aprobó 38 pruebas más la carga del archivo sintético detectado por Node. Verifica las rutas de formulario y envío en el arranque de prueba, su ausencia en el habitual y el contrato Postman.

Decisión de participación: `./scripts/verify-isolated-db.ps1` pasó con 39 entradas TAP, incluidas 38 pruebas, y 10 migraciones aplicadas desde cero. Repetición sin pendientes, diff vacío, integridad SQL y PostGIS, ESLint y Prettier aprobados.
