# Changelog

## SIG · 2026-11-22

- Incorporadas la carga transaccional y la consulta GeoJSON paginada de la microzonificación de 2002. La zona P usa la etiqueta confirmada y conserva la descripción de origen para trazabilidad.
- Incorporados el catálogo público de capas, los planes de solo lectura del SIG y del piloto IBITE, la carga operativa explícita de microzonificación y el límite temporal del inicio público sintético de IBITE.

## Fase 0 · 2026-11-20

- Levantamiento inicial, inventario, requisitos, modelo conceptual, arquitectura propuesta y backlog.
- Instrucciones permanentes de trabajo en AGENTS.md.

## Especificación IBITE-17

- Documentadas la codificación, las dimensiones, la precedencia y la cobertura inicial de casos sintéticos.

- Centralizados los hallazgos y documentados los campos visibles de Factibilidad del taller.

- Documentados bloques, trazabilidad y hallazgos de la Matriz Piloto La Merced.

- Incorporados los perfiles IBITE, el acceso del Equipo de Apoyo Psicosocial y el dashboard público a la matriz de permisos.

- Preparado el primer contrato candidato para captura IBITE y criterios de autorización, integridad e idempotencia.

- Documentada la propuesta de habilitación a campañas, alcance de sesión y unidades de respuesta pendientes.

- Especificado el contrato candidato del dashboard público, con catálogo de métricas, cortes y criterios de divulgación.

- Documentado el contrato candidato de importación histórica IBITE, conciliación de lotes y revisión de referencias ambiguas.

- Documentada la consulta interna del equipo psicosocial, la trazabilidad de resultados y la auditoría de acceso nominal y exportaciones.

- Consolidado el corte de descubrimiento y la preparación del MVP con decisiones y entregables por incremento.

## 0.1.0 · Base técnica

- Arranque NestJS con Express, configuración de entorno validada y ruta de salud versionada.
- Swagger y OpenAPI habilitables, colección Postman local y pruebas del proceso HTTP.

- Preparados entornos Compose separados para PostgreSQL/PostGIS y una comprobación espacial para la base de pruebas.

- Verificado el arranque de la base aislada y aprobada la comprobación espacial en PostgreSQL 17.12 con PostGIS 3.7.0.

- Aplicada y verificada la primera migración de Prisma para cuentas, roles, permisos, instituciones y periodos en el entorno aislado.

- Conectado el cliente Prisma al ciclo de vida de Nest y verificada la semilla idempotente del catálogo inicial de roles y permisos.

- Implementadas la validación de sesiones opacas, la consulta de identidad y la comprobación reutilizable de permisos de ruta.

- Añadidas la emisión interna de tokens opacos y la revocación de la sesión actual por API.

- Añadida la consulta paginada de instituciones y periodos con sesión y permiso de lectura interno.

- Implementadas y probadas las dimensiones de IBITE-17 como cálculo de dominio versionado.

- Implementado y verificado el cálculo versionado de dimensiones de IBITE-DA-28.

- Implementada y verificada la clasificación interna de perfiles y riesgo de IBITE-17 e IBITE-DA-28.

- Añadidos selectores internos de orientación para IBITE-17 y DA-28, consulta técnica de disponibilidad de PostgreSQL y catálogo de referencias versionado.
- Verificado el cálculo contra las referencias del catálogo y la instalación completa sobre una base desechable.

- Incorporadas las decisiones semestrales, persistencia versionada y ámbito institucional de resultados IBITE. La emisión de notificaciones permanece deshabilitada.

- Añadidos persistencia transaccional interna IBITE, auditoría y gestión de asignaciones; conciliadas las filas de referencia de Manizales.

- Configuradas campañas y habilitaciones IBITE con validación server-side antes de persistir una aplicación definitiva.

- Añadida la consulta paginada de habilitaciones IBITE propias con sesión y permiso de captura.

- Añadido el diagnóstico interno de conciliación histórica IBITE por procedencia y candidatos institucionales.

- Añadido el extractor local XLSX de Manizales -23 con resumen de conciliación sin datos nominales.

- Añadido el perfil local IBITE-DA-28 y conciliada la referencia repetida de INC-IBITE-02.

- Añadido el registro interno auditable de diagnósticos y revisiones del histórico IBITE.

- Añadida la consulta de auditoría institucional con alcance por asignación e índice de eventos recientes.

- Añadido el listado de asignaciones; paginadas las consultas de resultados y auditoría; comprobada la correspondencia de Postman con OpenAPI.
- Probado el helper interno de supresión de agregados sintéticos.

- Añadidos detalle y acuse de habilitación, idempotencia del envío interno, desafío Bearer sin caché y sugerencias ortográficas para revisar alias.

- Reforzadas la validación técnica y la autorización de IBITE. Añadida reproducción interna auditada y conservación de referencias históricas no resueltas.
- Añadida la verificación desechable de esquema, persistencia y PostGIS.

## Cuarto lote IBITE

- Centralizada la autorizacion vigente por objeto para auditoria, resultados y recalculo.
- Reforzada la validacion interna del contexto y las claves de reintento.
- Ampliada la prueba de integracion a la persistencia y el acuse propio de DA-28.

## Quinto lote IBITE

- El recálculo interno comprueba la huella de origen de la aplicación antes de reproducir el resultado.
- Se verificaron unicidad entre instituciones y variantes, acuse de duplicados, recálculo DA-28 y cursores de otra aplicación.

## Sexto lote IBITE

- La finalización interna de IBITE-17 adolescente conserva la autorización declarada, incluida la incertidumbre. Se añadió conteo interno y cobertura de persistencia y reintentos.

## Captura REST sintética

- Verificado el flujo IBITE-17 adolescente de formulario a acuse y resultado versionado en el arranque de pruebas.
- Incluidos el contrato OpenAPI de pruebas y una colección Postman sintética separada.

## Decisión de participación IBITE-17

- Añadidos registro sintético de negativa, estado del formulario propio y protección transaccional frente a finalización concurrente.

## Demostración IBITE-17 con el formulario impreso

- Incorporadas las escalas visibles del PDF al inventario de evidencia v2.
- Verificados los envíos REST sintéticos de adolescente y acudiente y la consulta de señales con permiso institucional.

## Control de campañas y decisiones IBITE-17

- Incorporado control autorizado de pausa y habilitación de campañas IBITE-17.
- Diferenciadas las negativas de participación y de autorización del representante en la captura sintética.

## Inicio autónomo IBITE-17

- Una cuenta de estudiante puede crear y recuperar su habilitación en una campaña abierta sin pertenecer a la muestra histórica.

## Demostración reproducible de IBITE-17

- Añadido `npm run start:ibite-demo` para abrir dos campañas ficticias y Swagger con una clave estable suministrada por el operador. La demo solo escucha en loopback y exige una base `sig_test`.
- Añadido ensayo de reinicio de Node con envío público, consulta autorizada de alerta crítica y rechazo del duplicado.

## MTTS Formato A

- Captura semanal versionada con autorización por institución, persistencia y auditoría.
- Consulta del formulario y de fichas, validación de opciones y conservación de cero, NA y dato faltante.

## Consulta y resumen MTTS Formato A

- Añadidos listado paginado y resumen por institución y rango semanal.
- Verificadas distribución y mediana, separación de NA y faltantes, frecuencia de opciones y revocación de alcance.

## Tendencia semanal MTTS

- Añadido el filtro de sede a listado y resumen.
- Añadida la serie semanal con histogramas, medianas y faltantes por corte.

## Factibilidad del taller

- Consultable el inventario versionado de campos observados en Jugar para cuidar bajo permiso institucional.
- Documentadas las dos rejillas incompletas y la información requerida para captura.

## Captura Factibilidad

- Una institución por ficha y respuesta requerida en las diez filas del taller. Persistencia, acuse, consulta y auditoría bajo ámbito institucional.

## Listado y reintentos de Factibilidad

- Listado restringido por institución y fecha de taller.
- Solicitudes concurrentes con la misma clave y carga comparten acuse y auditoría.

## Consulta espacial de puntos institucionales

- Añadidos almacenamiento PostGIS, índice espacial y consulta interna GeoJSON por caja WGS84 y ámbito institucional.

## Revisión previa de capas SIG

- Validación local de GeoJSON institucional WGS84, etiquetas, códigos y puntos duplicados.
- Diagnóstico de solo lectura por entidad.

## Carga de puntos SIG de prueba

- Agregada carga de GeoJSON validado con procedencia por archivo y posición.
- Verificados rechazo del lote inválido, reintentos concurrentes y recorte del punto importado.

## 2026-11-23 · Sedes públicas

Ruta pública, importación idempotente de 21 puntos, migración, trazabilidad de origen y pruebas. Siete asociaciones requieren validación de código principal.
