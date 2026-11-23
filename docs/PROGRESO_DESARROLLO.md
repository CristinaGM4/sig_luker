# Progreso de desarrollo

## 20 de noviembre de 2026

### Punto de partida de la sesión autónoma

Base HTTP, PostgreSQL/PostGIS aislado, dos migraciones Prisma, catálogo de acceso, autenticación por sesión, consulta interna de instituciones y periodos y clasificación interna de IBITE-17/DA-28 implementados. Último registro previo: 17 pruebas aprobadas. El directorio de trabajo carece de metadatos Git. No se realizaron commits. Ver [plan priorizado](PENDIENTES.md).

### Incremento 1 · Selectores de orientación

- R04, salidas BB:BG de IBITE-17 y BT:BY de DA-28. Archivos: src/ibite/ibite17-orientation.ts, src/ibite/ibite-da28-orientation.ts, test/ibite-orientation.test.mjs y documentación de reglas.
- Código interno para acción, plazo, ruta, señales ordenadas y clave de recomendación. Se verificó la precedencia de seguridad antes de INCOMPLETO y el tratamiento de señales simultáneas.
- Se inspeccionaron las fórmulas y las claves de las hojas de referencia sin imprimir ni utilizar respuestas reales. Batería con sig_test: 20 pruebas aprobadas, lint y formato aprobados. Sin errores en este incremento.
- Queda pendiente validar mensajes, infografías, rutas y vigencia con el equipo responsable. Siguiente: disponibilidad técnica y verificación de la base.

### Incremento 2 · Disponibilidad técnica

- T01/R12/R13. GET /api/v1/ready comprueba PostgreSQL y devuelve 200/503 sin detalles. La ruta de vida permanece independiente. Archivos: src/database/readiness.controller.ts, database.module.ts, database.service.ts, pruebas HTTP, contrato y Postman.
- Prueba con conexión real y fallo simulado; regresión de salud y OpenAPI. 21 pruebas aprobadas, lint y formato aprobados. Se separó el servicio de su módulo para mantener los imports sin ciclos.
- Pendiente: políticas de observabilidad o sondeos del despliegue cuando se defina la infraestructura.

### Incremento 3 · Migraciones y verificación de base

- R12/R13. En una base efímera distinta se aplicaron dos migraciones desde cero y se repitió el deploy sin pendientes. Sin diferencias de esquema. Pruebas SQL de integridad y PostGIS aprobadas; contenedor temporal detenido. El entorno habitual siguió saludable.
- Se recalcularon 27 comprobaciones Excel adicionales de orientación con nueve escenarios sintéticos, copiando únicamente fórmulas y claves. Cero diferencias. No se alteraron los archivos fuente.

### Incremento 4 · Referencias de instrumentos

- R02/R04. Migración 20261120000300_ibite_instrument_versions, prisma/schema.prisma, src/database/instrument-catalog.ts, seed.ts y test/database.test.mjs. Dos instrumentos y tres variantes, versionados por fuente y regla, con SHA-256. Restricción de conteo positivo.
- Se probó repetición sin duplicados, rechazo de referencia divergente dentro de una transacción revertida y rechazo de conteo cero. 22 pruebas aprobadas, lint y formato aprobados; sin diferencias de esquema. La semilla conserva cuentas y datos de negocio intactos.

### Incremento 5 · Cálculo referenciado

- R04. src/ibite/reference-calculation.ts reúne dimensiones, clasificación y orientaciones con la procedencia que provee el catálogo. La integración verifica ejecución de las tres variantes y rechazo de reglas o variantes cruzadas.
- Regresión completa: 22 pruebas aprobadas, lint y formato aprobados. Al reproducir la instalación, las tres migraciones se aplicaron en una base nueva y una repetición quedó sin pendientes. La semilla se verificó sobre la base nueva.
- Pendiente: publicar formularios, persistir aplicaciones y resultados, y autorizar uso operativo. Los contratos que requieren reglas de captura, custodia o divulgación continúan en borrador.

## 21 de noviembre de 2026

- DF-01 a DF-07 incorporadas en requisitos, captura, seguridad, importación y dashboard. Migración 20261121000100_ibite_applications_and_scope con cuatro tablas, sin operaciones destructivas. Aplicada en PostgreSQL aislado.
- GET de resultados internos con rol, permiso y ámbito por consulta. OpenAPI y Postman actualizados. Añadido rol Directivo a la semilla. Las observaciones de seguridad mantienen faltantes y positivos de modo independiente.
- Revisados encabezados, fechas y alias de IBITE Manizales -23, en solo lectura. Las diferencias de conteo y cobertura se añadieron al registro.
- La primera batería paralela registró un fallo al compartir la base de pruebas. Se serializaron los archivos de prueba que usan el mismo entorno por medio del comando npm test. La ejecución final aprobó 24 pruebas, ESLint, Prettier y el diff de Prisma.

## Continuidad de captura y permisos

Persistencia transaccional en src/ibite/application-persistence.ts; auditoría y revocación en migración 20261121000200_audit_and_assignment_revocation; gestión, auditoría de lectura e integración concurrente probadas. Se corrigió la selección de institución para auditar y la forma JSON de la referencia Prisma antes de la batería final. Se conciliaron tres orígenes vacíos y se generó la tabla institucional local.

## Habilitaciones para el flujo de aplicación

Migración aditiva de campañas y habilitaciones, relación opcional con la aplicación previa y validación antes de guardar. Se comprobó autorización por cuenta, permiso vigente, revocación y ventana. Próximo: verificar originales, consentimiento y procedimiento de alta.

## Consulta de habilitaciones propias

Ruta GET /api/v1/mis-aplicaciones-ibite implementada con sesión, permiso y filtro por cuenta, ventana, institución y revocación. El filtro se comparte con la finalización. Cambios en el controlador, predicado compartido, pruebas HTTP, contrato y Postman.

## Diagnóstico histórico IBITE

Implementado src/ibite/historical-reconciliation.ts con trazabilidad por archivo, hoja y fila. IMP-01 e IMP-05 se cubren en dominio. Se verificó la copia -23 por coordenadas y los conflictos con datos sintéticos. Siguiente: extracción versionada, revisión de alias y definición del flujo auditado de resolución.

## Extracción local Manizales -23

R03. scripts/diagnose-ibite-manizales.py y scripts/summarize-ibite-history.mjs conectan el XLSX con el diagnóstico. Revisados tamaño, encabezados, rama, referencias y macros. Las pruebas sintéticas y el resumen de la copia real no requieren persistir datos. Próximo: guardar decisiones auditadas de conciliación y adaptador DA separado.

## Extractor histórico IBITE-DA-28

R03. Perfil da28 en scripts/diagnose-ibite-manizales.py y resumen de referencias repetidas incluso con origen vacío en scripts/summarize-ibite-history.mjs. Verificados los cuatro anclajes de contexto y los 28 ítems. Se precisó INC-IBITE-02 y se redactó la estructura candidata de resolución auditada.

## Registro auditado del diagnóstico histórico

R03/R12. Migración 20261121000400_historical_diagnostics, servicio src/ibite/historical-review.ts, catálogo de permisos y prueba PostgreSQL. El diagnóstico es idempotente y las revisiones observada/requiere_revision se agregan sin modificar la fuente. El permiso imports:review queda sin asignación. El flujo de publicación no está habilitado.

## Consulta de auditoría institucional

R01/R12. Ruta protegida, lectura limitada a eventos institucionales recientes y auditoría del acceso. Cambios en controlador, módulo de registro, esquema Prisma, octava migración, OpenAPI, Postman y prueba de integración.

Cinco tareas del [lote autónomo](REPORTE_SESION_AUTONOMA.md) completadas: listado de asignaciones, paginación de auditoría y resultados, supresión de corte sintético y paridad de contratos.

Segundo lote autónomo: detalle y acuse por habilitación, huellas de reintento, protección uniforme de caché y desafío Bearer, sugerencias ortográficas sin asignación automática. Ver [reporte](REPORTE_SESION_AUTONOMA.md).

Tercer lote: validación técnica de captura, pruebas de autorización entre respondientes, reproducción auditada interna, conciliación de referencias sin origen y verificación automatizada desde base nueva. Ver [reporte de sesión](REPORTE_SESION_AUTONOMA.md).

## Cuarto lote autónomo

Terminadas la revalidación por objeto, las pruebas de cuenta desactivada, la validación de claves y contexto y la cobertura integral sintética de persistencia y acuse DA-28. Consultar el [reporte del lote](REPORTE_SESION_AUTONOMA.md#cuarto-lote-autónomo) para archivos y comandos.

## Quinto lote autónomo

Verificadas la unicidad entre instituciones y variantes, la ausencia de acuse para el intento duplicado, la reproducción de DA-28 con procedencia válida y la separación de cursores entre aplicaciones. Ver [reporte](REPORTE_SESION_AUTONOMA.md#quinto-lote-autónomo).

## Sexto lote autónomo

DF-14 implementada en la persistencia interna de IBITE-17 adolescente. La incertidumbre se conserva en los datos de origen y tiene conteo propio. Ver [reporte del lote](REPORTE_SESION_AUTONOMA.md#sexto-lote-autónomo).

## Captura REST sintética

Verificado el flujo integral adolescente con formulario, envío, idempotencia, resultado versionado, auditoría y acuse en PostgreSQL aislado. Ver [reporte integrado](REPORTE_SESION_AUTONOMA.md#recorrido-rest-de-captura-ibite).

## Decisión de participación IBITE-17

El recorrido sintético guarda la negativa, protege el acceso al registro y garantiza que la misma habilitación no pueda quedar rechazada y finalizada simultáneamente. Ver [reporte](REPORTE_SESION_AUTONOMA.md#recorrido-integrado-de-decisión-de-participación).

## Demostración de las dos ramas de IBITE-17

Verificados 3 envíos POST, el acuse, la persistencia de autorización incierta y la consulta de señales restringida por institución. Resultados en [demostración](08-pruebas/demo-ibite17-post.md).

## Microzonificación de 2002

R10. Carga íntegra de los 139 polígonos verificada en PostGIS y consulta paginada documentada para frontend. La zona P usa la leyenda del responsable del proyecto. Ver [reporte de sesión](REPORTE_SESION_AUTONOMA.md#carga-y-consulta-pública-de-microzonificación).

## Preparación operativa de SIG e IBITE

Disponibles el catálogo público de capas y la verificación de solo lectura previa a cargas SIG. El inicio sintético de IBITE incorpora cuota temporal y el plan del piloto comprueba el periodo y el operador mediante una conexión separada de solo lectura. Ver [reporte de sesión](REPORTE_SESION_AUTONOMA.md#preparación-operativa-de-sig-e-ibite).
