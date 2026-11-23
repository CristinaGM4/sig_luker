# Factibilidad del taller Jugar para cuidar

R06 / I07. Borrador parcial basado en las cuatro capturas del 19 de noviembre de 2026. El usuario identifica el insumo como Factibilidad. El formulario de origen se titula Evaluación de la fidelidad de implementación. Las instrucciones visibles de Google Forms son parte de la evidencia del instrumento. El 21 de noviembre se incorporaron cuatro capturas que completan los enunciados visibles de las cuadrículas. La autorización de acceso se define a nivel del proyecto.

## Campos observados

| Grupo | Campo visible | Evidencia |
|---|---|---|
| Contexto | Fecha del taller | Selector de fecha y marca de obligatorio |
| Contexto | Lugar | Respuesta corta obligatoria |
| Contexto | Número de asistentes | Respuesta corta obligatoria en el formulario. Propuesta de entero no negativo en la API, pendiente de confirmar límites |
| Cobertura | Familias vinculadas al colegio | Casillas, campo obligatorio y diez opciones institucionales visibles. Propuesta de mapear etiquetas a IDs oficiales y confirmar mínimo/máximo |
| Facilitación | Nombre del facilitador o facilitadora | Respuesta corta obligatoria. Confirmar si se registra una referencia a una cuenta, un nombre externo o ambos |
| Cuadrícula parcial | Una fila visible comienza «Mantuve un clima respe...» | Aparecen tres opciones. Encabezados, demás filas y configuración por confirmar |
| Análisis del proceso | Las personas que asistieron al taller | Cuadrícula marcada como obligatoria. Escala visible: Muy bajo, Bajo, Aceptable, Alto, Muy alto. Tres enunciados aparecen truncados |
| Adaptaciones | Cambios al taller y motivo, materiales que fallaron o faltaron | Respuestas largas sin marca de obligatorio |
| Mejora | ¿Qué mejoraría para la próxima vez? | Respuesta larga obligatoria |

Las diez instituciones visibles sirven para identificar opciones del taller y contrastarlas con el catálogo oficial. El listado no acredita códigos, sedes ni vigencia. La selección de varias instituciones es una característica visible de las casillas. El alcance por institución y la autorización para un envío con varias selecciones requieren aprobación.

## Cierre del contrato

- Confirmar si el formulario es específico de Jugar para cuidar o una plantilla para varios talleres. Confirmar la unidad de registro y si puede haber varias evaluaciones por taller.
- Obtener el formulario vacío completo o una transcripción íntegra de ambas cuadrículas, sus opciones, obligatoriedad por fila y reglas de salto.
- Validar quién registra, corrige y consulta las evaluaciones según el equipo psicosocial, con atención especial a los talleres que incluyan varias instituciones.
- Confirmar cualquier definición de indicador. Las etiquetas de una escala ordinal pueden conservarse tal como aparecen y su conversión a puntajes queda pendiente de metodología.

Criterios candidatos: conservar fecha, lugar, asistentes e instituciones válidas; validar la escala por fila cuando se disponga del instrumento completo; exigir los campos marcados obligatorios; aplicar ámbito institucional y permisos; y diferenciar este flujo de la ficha semanal MTTS. Probar los casos con registros sintéticos.

## Consulta de evidencia por REST

`GET /api/v1/interno/instituciones/{institucionId}/factibilidad/formulario` devuelve 200 con la versión `jugar-para-cuidar-evidencia/2` y estado `partial`. Requiere sesión, rol psicosocial, permiso records:read y asignación vigente para la institución solicitada. 400 si el UUID es inválido, 401 sin sesión, 403 sin permiso y 404 si la institución está inactiva, no existe o está fuera del ámbito. La respuesta se entrega sin caché.

La respuesta incluye ocho campos visibles, las diez etiquetas observadas de instituciones y el inventario de dos rejillas incompletas. Para las rejillas conserva únicamente etiquetas, fragmentos, número de filas u opciones cuya evidencia es visible. Un fragmento de fila no es una pregunta completa. Las etiquetas institucionales pertenecen a la fuente y carecen de identificadores de catálogo. El servicio no usa estas etiquetas para habilitar permisos sobre otras instituciones y no admite envíos.

### Criterios de aceptación de esta etapa

- FACT-A-01. Profesional con asignación vigente obtiene el inventario y la versión. Otra cuenta o una asignación revocada quedan fuera del recurso.
- FACT-A-02. Viajan las cinco opciones visibles de análisis del proceso en su orden original. La versión 2 incorpora los enunciados completos visibles y conserva la advertencia de evidencia parcial.
- FACT-A-03. Se distingue el dato observado de las validaciones candidatas. Asistentes conserva el tipo de respuesta corta de Google Forms.
- FACT-A-04. OpenAPI y Postman anuncian la consulta de evidencia. El contrato de escritura se podrá cerrar con el original vacío completo y la regla de alcance multiinstitución.

## Cuadrículas observadas en la versión 2

| Cuadrícula | Filas observadas | Opciones visibles |
|---|---:|---|
| En la preparación y desarrollo | 7 | Sí, Parcial, No |
| Las personas que asistieron al taller | 3 | Muy bajo, Bajo, Aceptable, Alto, Muy alto |

Se conservan los enunciados completos en `observedRows`. Ambas cuadrículas tienen asterisco en el encabezado. Las vistas tienen cortes entre capturas. Queda confirmar que no se omite ninguna fila y si Google Forms exige respuesta en cada fila. La versión mantiene `status: partial` y los niveles se preservan como etiquetas ordinales. Siguen pendientes la unidad de registro y el alcance de una ficha con varias instituciones. La API todavía ofrece consulta de evidencia.

## Captura de una evaluación por institución

La confirmación del proyecto fija una sola institución por ficha y una respuesta en cada fila. Se utiliza la versión `jugar-para-cuidar/1` con las diez filas visibles confirmadas para este incremento. La institución se toma del UUID en la ruta. Las etiquetas de la fuente sirven como referencia del formulario.

| Método y ruta relativos a /api/v1/interno/instituciones/{institucionId}/factibilidad | Permiso | Resultado |
|---|---|---|
| GET /formulario | records:read | 200 con versión activa, campos y ambas cuadrículas |
| POST /evaluaciones | records:create | 201 con identificador, versión y fecha de registro |
| GET /evaluaciones/{evaluacionId} | records:read | 200 con el registro y su institución |

Las operaciones requieren rol psicosocial y asignación institucional vigente. El POST admite `version`, fecha ISO `workshopDate`, `place`, `attendance`, `facilitator`, `improvements` y los arreglos `workshopDelivery` y `process`. Requiere siete opciones de preparación y tres de análisis, en orden, con los valores de su propia cuadrícula. `changes` y `materials` son opcionales. La asistencia sigue la fuente como texto corto. Los campos se limitan técnicamente a 2.000 caracteres. Campos adicionales, dos instituciones o respuestas incompletas o inválidas reciben 400. Una sesión inválida recibe 401, un permiso faltante recibe 403 y una institución o evaluación fuera de ámbito recibe 404. Se evita caché mediante el guard de sesión.

Creación y auditoría se guardan en una transacción. El detalle se audita sin copiar los datos de la ficha al evento. La ficha usa un ID por registro. La detección de duplicados de un mismo taller depende de una clave de negocio pendiente. Se conservan las categorías observadas sin cálculo de puntaje.

## Listado y reintentos de Factibilidad

`GET /api/v1/interno/instituciones/{institucionId}/factibilidad/evaluaciones` requiere `records:read`, rol psicosocial y alcance vigente. Los filtros obligatorios `desde` y `hasta` son fechas ISO inclusivas de taller, hasta 366 días. La respuesta contiene hasta 25 referencias con identificador, fecha de taller, versión y fecha de registro. Se ordena por fecha de taller descendente y UUID descendente. `after` admite el UUID entregado en `nextCursor`. Un cursor que no pertenece a la institución o al rango devuelve 404. El listado omite el autor y las respuestas, y deja una entrada de auditoría. Un rango, fecha o cursor inválido recibe 400.

El POST admite `Idempotency-Key` opcional de 16 a 128 caracteres alfanuméricos, guiones o guiones bajos. Repetir una solicitud válida con la misma clave, cuenta e institución devuelve el mismo acuse 201 y conserva un solo evento de registro. La misma clave con otro contenido devuelve 409. El backend guarda las huellas de clave y contenido, y vuelve a verificar el alcance. Las solicitudes sin clave conservan el comportamiento anterior. La comparación por clave identifica un reintento técnico. La identificación de dos evaluaciones del mismo taller depende de una clave de negocio pendiente.
