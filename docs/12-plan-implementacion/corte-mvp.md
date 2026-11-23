# Corte de descubrimiento y preparación del MVP

Estado: propuesta para revisión de alcance. Los contratos existentes están en borrador. Este corte recoge las decisiones confirmadas hasta H-37 y las condiciones para avanzar por incremento.

## Alcance confirmado

- La Universidad de Manizales custodia los datos. La base del proyecto conservará los registros completos. La consulta individual se reserva al Equipo de Apoyo Psicosocial autorizado de la Universidad, con facultades operativas amplias en la etapa inicial.
- Estudiantes y acudientes completan las ramas aplicables de IBITE-17. Docentes, administrativos y orientadores usan IBITE-DA-28. Los perfiles de respuesta acceden al formulario asignado y al acuse de su envío.
- El dashboard se consulta sin iniciar sesión y su contrato propone agregados aprobados para difusión.
- MTTS se acota al Formato A. Factibilidad y Matriz Piloto conservan especificaciones propias. Angular requiere autorización expresa.

## Secuencia de entrega propuesta

| Incremento | Alcance y entregable verificable | Decisiones que afectan su inicio o cierre |
|---|---|---|
| 1. Base técnica | Entorno de desarrollo y pruebas aislado, configuración sin secretos, calidad de código, migración inicial acotada al esquema aprobado y prueba de arranque | Aprobar apertura de implementación y ADR de framework y versiones. Confirmar disponibilidad de entornos y política de configuración |
| 2. Identidad y catálogos | Cuentas, permisos, instituciones, periodos y auditoría inicial con datos sintéticos. Pruebas de acceso permitido, denegado y revocado | Identidad del equipo, operador habilitador y catálogo mínimo. La implementación de catálogos sintéticos puede preceder a la carga oficial |
| 3. Captura prospectiva IBITE | Consulta de asignaciones, formulario versionado y envío verificable para IBITE-17 e IBITE-DA-28. Contrato OpenAPI y pruebas de permisos e integridad | Aprobar unidad de respuesta, vínculo de acudiente, ventanas, consentimiento/asentimiento, obligatoriedad y política de correcciones |
| 4. Puntuación y consulta interna | Reproducir resultados del libro por versión y consultar resultados con alcance restringido y auditoría | Cerrar validación de perfiles y orientación DA. Acordar el tratamiento operativo de alertas con faltantes y la unidad de caso |
| 5. Histórico | Diagnóstico, conciliación, revisión y publicación transaccional de un lote piloto | Aprobar fuentes y cortes, resolver INC-IBITE-01 e INC-IBITE-02, aprobar clave entre exportaciones y política de puntuaciones de origen y recalculadas |
| 6. Dashboard público | Publicar un corte con métricas aprobadas y pruebas de inferencia por resta entre filtros | Aprobar denominadores, nivel de agregación y política de divulgación. Puede desarrollarse con datos sintéticos antes de disponer del primer lote aprobado |
| 7. Segunda etapa | MTTS A, Factibilidad, Matriz Piloto, seguimiento, SIG y reportes por incrementos | Confirmar detalles de cada instrumento, protocolo, fuentes espaciales y formatos de exportación |

El corte inicial propuesto para el MVP es **identidad, catálogos y captura IBITE prospectiva**, con un flujo sintético íntegro y verificable antes de operar con datos reales. Las definiciones de histórico, seguimiento y publicación pública no bloquean la preparación de la base técnica. Cualquier corte que incluya resultados operativos exige validar la elegibilidad, la puntuación y los permisos correspondientes.

## Decisiones propuestas para revisión conjunta

| ID | Decisión | Propuesta inicial | Consecuencia |
|---|---|---|---|
| C-01 | Framework y arquitectura | NestJS con adaptador Express, en monolito modular | Permite cerrar estructura inicial y preparar el entorno. Antes de instalar, comprobar versiones disponibles y compatibilidad |
| C-02 | Identidad de participantes y equipo | Código individual de un solo uso para participantes; evaluar identidad institucional del personal de la Universidad | Afecta emisión, recuperación, revocación y asignación de alcance |
| C-03 | Unidad de captura | Un envío final por aplicación habilitada. Para acudientes, una asignación activa por persona evaluada y campaña. Definir tratamiento para personal vinculado a varias instituciones | Determina autorización, unicidad, corrección y denominadores |
| C-04 | Origen y validación de los resultados | Mantener puntuación de origen y recalculada con procedencia separada si se aprueba conservar ambas | Facilita conciliación sin sobrescribir el histórico |
| C-05 | Unidad de caso operativo | Validar si el expediente agrupa a la persona y mantiene episodios separados, o si el caso corresponde a una campaña | Determina cardinalidad, estados y atribución de atención |
| C-06 | Publicación y conservación | Acordar filtros públicos aprobados, umbral de divulgación y autoridad para publicar y retirar. Acordar conservación de archivos, registros nominales, respaldos y exportaciones | Determina qué cortes y datos se pueden usar en operación |

## Verificación del corte

Los contratos y pruebas documentales de referencia están enlazados desde el [índice](../README.md). Se ejecutaron en Excel 84 comprobaciones de IBITE-17 y 33 de IBITE-DA-28 con datos sintéticos. Los resultados verifican los casos ensayados y no sustituyen pruebas automatizadas del backend. El libro de DA y el -23 conservan incidencias de correspondencia abiertas. Los estados de los incrementos cambian cuando se apruebe el alcance y se cumpla la aceptación correspondiente.

Se aprobó la apertura de implementación y NestJS con Express. T01 cuenta con base HTTP implementada y verificada. Quedan por preparar el entorno de persistencia, las migraciones y las pruebas aisladas de base de datos una vez aprobado su modelo.
