# Contrato candidato de importación histórica IBITE

Borrador SDD para R03, R04 y R12. La Universidad de Manizales custodia los archivos y registros. El Equipo de Apoyo Psicosocial autorizado de la Universidad opera la importación y consulta sus resultados internos. El detalle de identidades, trazabilidad y errores queda fuera de los servicios públicos.

## Fuentes y unidad de origen

| Fuente | Uso propuesto |
|---|---|
| IBITE Manizales (respuestas)-23.xlsx | Fuente candidata de histórico para cuidador y adolescente, y referencia de puntuación confirmada |
| IBITE DA (Manizales) (respuestas).xlsx | Fuente candidata de histórico para docentes, administrativos y orientadores. Fórmulas DA verificadas parcialmente con casos sintéticos |
| IBITE Monitoreo.xlsx | Fuente candidata para seguimiento operativo. Requiere mapeo propio y validación de correspondencias |
| Matriz Piloto.xlsx y exportaciones La Merced | Incorpora datos de resultados y referencias a otras exportaciones. Su importación requiere validar lotes, custodia y duplicados por separado |

Cada fila se identifica por lote de origen, hoja y número de fila. El lote conserva huella, instrumento, periodo, versión de mapeo y actor. Si existe una puntuación derivada, conservar referencias separadas a la fila de respuestas y a la fila de cálculo. La coordenada de archivo respalda trazabilidad y la clave de negocio aprobada determina si una aplicación ya existe entre archivos diferentes.

## Flujo propuesto

1. Recibir el archivo mediante un canal privado y registrar un lote con su huella. Validar tamaño, formato, hojas esperadas, estructura y límites de descompresión. Leer datos sin ejecutar contenido activo.
2. Preparar un diagnóstico de solo lectura. Mover a revisión los encabezados ambiguos, claves sin correspondencia, problemas de catálogos, faltantes, referencias desplazadas e inconsistencias entre respuestas y puntuaciones.
3. Presentar totales y resolver incidencias con un actor autorizado. La interfaz de revisión usa coordenadas de origen y códigos de incidencia. El diagnóstico general omite nombres, documentos, contactos y texto de respuestas.
4. Sellar el diagnóstico con la versión de mapeo y la huella del archivo. Publicar solo si el lote cumple la política de aceptación aprobada y el operador confirma el diagnóstico vigente. Como primera política candidata, exigir que los conflictos bloqueantes estén resueltos antes de escribir las aplicaciones.
5. Registrar el resultado. La publicación actualiza las aplicaciones y su trazabilidad en una transacción. Si falla, el registro del intento queda disponible y los datos publicados permanecen consistentes.

## Operaciones candidatas

| Método y ruta | Entrada | Salida propuesta |
|---|---|---|
| POST /api/v1/importaciones/ibite | Archivo XLSX y referencia a instrumento, campaña y mapeo aprobado | 202 con identificador del lote y estado inicial. Repetir la misma carga con huella y contexto equivalentes recupera el lote previo |
| GET /api/v1/importaciones/ibite/{loteId} | Identificador opaco del lote | 200 con estado, versión de mapeo, fecha, totales y resumen por código de incidencia |
| GET /api/v1/importaciones/ibite/{loteId}/incidencias | Identificador opaco, paginación y filtros de código o estado | 200 con coordenadas de origen, códigos y estado de revisión |
| POST /api/v1/importaciones/ibite/{loteId}/publicacion | Identificador de revisión vigente y confirmación de publicación | 202 con resultado consultable en el lote. Reintentos del mismo diagnóstico conservan la publicación previa |

Estados candidatos: recibido, en validación, requiere revisión, listo para publicar, publicado y fallido. Definir si la gestión de incidencias será por operación específica o mediante una nueva versión del mapeo, según cómo revisen los datos los responsables.

Errores propuestos: 400 para solicitud mal formada, 401 para sesión ausente, 403 para permiso insuficiente, 404 para lote no visible, 409 para diagnóstico obsoleto o lote no publicable, 413 para tamaño excedido, 415 para formato no admitido y 422 para estructura o mapeo inválidos cuando se detecten antes de aceptar el lote. Los errores de validación posterior se consultan en el estado del lote.

## Conciliación y tratamiento de incidencias

Para cada hoja de datos, registrar filas leídas y su clasificación excluyente: publicables, rechazadas, duplicadas o pendientes de resolución. Si hay incidencias múltiples por fila, contarlas por separado y conservar una sola clasificación para conciliar el total. Una fila con datos faltantes conserva su valor original. Su tratamiento depende de las reglas aprobadas por instrumento.

- INC-IBITE-01: el cálculo de la fila 7558 lee respuestas de la fila 7560. Suspender la asociación automática hasta validar la correspondencia.
- INC-IBITE-02: los saltos de referencia en DA pueden ser intencionales. Puntuaciones 1000 y 1001 apuntan a la misma respuesta de origen, 1228. Suspender la publicación de correspondencias ambiguas y registrar la decisión del custodio.
- La huella identifica repetición de un archivo. Detectar registros repetidos entre archivos distintos exige una clave de negocio aprobada. El nombre por sí solo no identifica una aplicación.
- Decidir si las puntuaciones existentes se conservan como resultados de origen, se recalculan con la regla versionada o se conservan ambas con procedencia separada. Una diferencia entre ambos resultados necesita revisión; no sobrescribir el valor histórico automáticamente.

## Criterios de aceptación propuestos

| ID | Verificación |
|---|---|
| IMP-01 | La vista previa clasifica todas las filas leídas y mantiene los datos publicados intactos |
| IMP-02 | Reintentos de carga y publicación, incluidos los simultáneos, no crean duplicados |
| IMP-03 | Una falla de publicación no deja resultados o respuestas parcialmente persistidos |
| IMP-04 | Dos archivos distintos con un registro equivalente se tratan según la clave aprobada y conservan procedencia |
| IMP-05 | Los escenarios sintéticos de las incidencias 01 y 02 quedan pendientes de revisión y no asignan resultados a otro participante |
| IMP-06 | Una sesión sin autorización no consulta lotes ni incidencias y el resumen no expone datos nominales |
| IMP-07 | El diagnóstico identifica una hoja faltante o un archivo inválido y conserva trazabilidad del intento |

Decisiones para cierre: fuentes y cortes históricos autorizados, identidad por variante, campaña y sede, clave entre exportaciones, publicación parcial o total y tratamiento de puntuaciones históricas. Referencia: [estrategia e incidencias de importación](../09-importaciones/estrategia.md).

## Diagnóstico de filas de un libro

Incremento interno de R03, criterios IMP-01 e IMP-05. La entrada contiene la huella del libro, observaciones por coordenada de la hoja de respuestas, referencias extraídas de la hoja de cálculos y alias de catálogo con códigos institucionales. El diagnóstico opera sobre un solo libro. Asigna procedencia por huella, hoja y fila. No recibe nombres, teléfonos ni identificadores de personas.

- Una referencia de cálculo se clasifica como conciliada, origen vacío o ausente, o referencia repetida. Todas las referencias repetidas a un origen poblado requieren revisión. Nunca se elige una como ganadora.
- Las respuestas se clasifican como conciliadas o en revisión según marca temporal, alias institucional y número de cálculos asociados. La correspondencia de un alias se compara sin distinguir mayúsculas y recortando los extremos. Un alias con más de un código deja la institución sin asignar. La correspondencia única es candidata para revisión.
- Dos hojas con coordenadas inválidas o repetidas se rechazan como entrada estructural inválida. El resultado reconcilia las unidades por separado. Una fila conciliada por este diagnóstico no se considera aprobada para publicar.
- La función no ejecuta fórmulas, no vincula personas, no crea lotes en PostgreSQL y no expone endpoints. La extracción de libros y el procedimiento auditado de revisión conectarán con esta función en otro incremento.

El [extractor local de Manizales -23](../09-importaciones/conciliacion-ibite-manizales.md) ya conecta el archivo con el diagnóstico interno. Las rutas HTTP y el registro auditado de resoluciones siguen en borrador.

## Propuesta de registro de resoluciones

R03/IMP-05/IMP-06. Preparar resolución versionada por identificador opaco de lote, huella, hoja y fila, código de incidencia, decisión, justificación controlada y actor autorizado. Preservar la observación inicial. Incluir la revisión de diagnóstico sobre la que se tomó la decisión y rechazar cambios basados en una revisión obsoleta. Registrar la decisión y la auditoría en una transacción. Cuando la justificación necesite pruebas externas, guardar una referencia institucional autorizada y mantener el registro técnico sin datos nominales.

Para una referencia a origen vacío, proponer conservar la fila de cálculo como incidencia y excluirla de los candidatos de aplicación, previa validación del custodio. Para un alias ambiguo, proponer confirmación explícita contra código institucional oficial. Para referencias repetidas con datos, mantener todos los cálculos en revisión hasta acordar su uso. La autoridad de revisión, los motivos permitidos y las condiciones de aprobación deben cerrarse antes de habilitar escritura o publicación.

## Registro interno de diagnósticos y revisiones

R03, R12 e IMP-01/05/06. Guardar una revisión por huella de fuente, versión de análisis y huella de diagnóstico. La misma revisión se identifica de forma determinista. Registrar totales, coordenadas y códigos de incidencia; omitir originales, etiquetas y candidatos institucionales. Permisos de servicio: imports:execute para registrar; imports:review para añadir revisiones. El segundo permiso se crea sin concesiones automáticas. Cada anotación agrega el código observada o requiere_revision y deja auditoría transaccional. Es un estado de revisión técnica sin efecto en la publicación. Las revisiones anteriores se preservan. Operaciones internas, sin rutas nuevas.

### Sugerencias ortográficas de alias

R03. Cuando falta un alias directo, el diagnóstico puede comparar una segunda clave sin diacríticos, puntuación y diferencias de espacio. Un destino único queda marcado para revisión ortográfica y no asigna un código; varios destinos quedan ambiguos. No sustituye un alias directo aprobado ni intenta vincular personas. El extractor produce huellas de ambas claves para que el dato textual quede fuera del resumen.

### Conciliación de anclajes incompatibles

El diagnóstico debe contabilizar una fila de cálculo aun si sus referencias internas no permiten identificar una sola fila de respuesta. Se conserva la propia coordenada, con origen de respuestas nulo y estado referencia_no_resuelta. La fila no se asocia con participantes ni se considera columna de origen vacía. La instantánea versionada conserva su incidencia.
