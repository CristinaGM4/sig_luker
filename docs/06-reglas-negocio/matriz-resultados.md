# Matriz de resultados del piloto La Merced

R07, R12 y R14. Borrador de especificación basado en Matriz Piloto.xlsx, hojas Matriz piloto y Guía de uso. Cotejo de encabezados y guía en solo lectura. La guía describe un flujo de trabajo del piloto. Su adopción como política del backend requiere validación.

## Estructura observada

La hoja principal tiene dos filas de encabezados y un rango de 226 filas por 96 columnas. La guía informa 224 registros. La inspección verifica la estructura y la cifra declarada en la guía. La cantidad de personas únicas y la integridad del cruce con IBITE requieren conciliación con las fuentes.

| Columnas | Grupo | Alcance candidato |
|---|---|---|
| A:O | Datos básicos e indicadores de tamizaje | Identificación, contexto escolar, señales y aspectos por trabajar. Mantener los identificadores directos bajo custodia acordada. Referenciar las evaluaciones IBITE por ID opaco |
| P:AA | Datos generales | Contexto y valoración. Confirmar finalidad, campos imprescindibles y duplicados como Edad en D y Q |
| AB:AG, AH:AT, AU:BI, BJ:BT y BU:CI | Medicina, psiquiatría, desarrollo familiar, psicología y atención prehospitalaria | Bloques con permisos de lectura y edición propios por definir. El archivo no contiene validaciones de celdas que determinen tipos, escalas u obligatoriedad |
| CJ:CN | Sugerencias por disciplina | Registrar propuesta y procedencia. La guía las describe como recomendaciones preliminares. Los eventos de atención requieren su propio registro verificable |
| CO | Derechos para garantizar o recuperar | Confirmar si es catálogo, texto o combinación, y quién puede registrarlo |
| CP:CR | Institución IBITE, fila de origen y prioridad | Conservar origen y versión del archivo. La prioridad requiere validación profesional según la guía |

## Hallazgos de procedencia y duplicidad

- La guía identifica dos ediciones del IBITE de La Merced: Respuestas-6 como base inicial y Respuestas-11 en la actualización del 16 de noviembre de 2026. La referencia de fila aislada en CQ puede ser ambigua entre archivos. Confirmar si cada fila conserva el lote de origen por otra vía. Para el proceso de importación, proponer conjunto de origen, versión o huella, hoja y fila.
- La conciliación aritmética de la guía es 184 registros previos + 40 nuevos = 224. La tabla por institución suma 184 y la distribución de la ampliación suma 40. Mantener separados los cortes si se presentan totales por institución.
- La guía indica que cada registro representa una respuesta IBITE y que la ampliación excluyó coincidencias por nombre. Úsese como antecedente de procedencia. La clave de vinculación del backend requiere validación independiente, considerando homónimos, cambios ortográficos y múltiples respuestas de una persona.

## Primer incremento candidato

Especificar con responsables una vista restringida que vincule la referencia IBITE, su institución, la prioridad de origen y las recomendaciones por disciplina. Acordar quién puede ver cada bloque, qué perfiles pueden registrar o validar recomendaciones, si se conserva el propio expediente disciplinario en esta plataforma y quién es custodio del vínculo nominal. Tratar el seguimiento de acciones efectivamente realizadas como un flujo asociado sujeto al protocolo de intervención.

Criterios propuestos: comprobar que una recomendación queda identificada como tal y su registro no aumenta conteos de atenciones; preservar procedencia al vincular con la evaluación; controlar permiso por institución y disciplina; verificar que una fila ambigua queda pendiente de resolución; y usar registros sintéticos en pruebas. Definir campos, cardinalidades y alcance de la plantilla fuera de La Merced antes de cerrar el contrato.

Huella SHA-256 del archivo revisado: 2DCDB48682BD710C4413C12B454FD881E3506F7A793F2BC54C2C1C801D5237CE.

## Inventario versionado y primer contrato candidato

El [inventario v1](matriz-resultados-evidencia.v1.json) conserva las 96 coordenadas de columna con los valores originales de las filas 1 y 2, agrupadas por bloque. Carece de filas de casos. Por ejemplo, D y Q permanecen como campos distintos aunque ambos se titulen Edad. Los blancos de los encabezados se conservan y las columnas CJ:CN siguen clasificadas como sugerencias.

Para una primera consulta interna se propone devolver identificador opaco de registro, institución, referencia de procedencia, estado de conciliación y sugerencias de disciplinas autorizadas. La referencia a una evaluación definitiva de IBITE puede quedar ausente hasta verificar el archivo, hoja y fila de origen. Requerir rol psicosocial, permiso de consulta y ámbito institucional, y filtrar por disciplina cuando se apruebe la matriz de acceso. Mantener los datos básicos nominales y las valoraciones fuera de la respuesta inicial.

Casos de aceptación propuestos: una fila de origen sin lote permanece sin conciliar, dos lotes con la misma coordenada siguen siendo orígenes distintos, una sugerencia no incrementa atenciones y una cuenta sin alcance recibe 404. El próximo cierre requiere confirmar quién consulta cada disciplina y cuál será la unidad del registro para el piloto de La Merced.

## Revisión técnica de procedencia

`scripts/review-matrix-sources.mjs` acepta por entrada estándar un JSON con `references` y `authorizedCoordinates`. Cada coordenada contiene `fileSha256`, `sheet` y `row`. Una referencia que todavía desconoce archivo u hoja puede omitir esos atributos. El resultado indica la posición de entrada y uno de los estados `invalid`, `missing_provenance`, `ambiguous`, `not_found` o `located`. Solo el último devuelve la coordenada encontrada. Una fila con lote u hoja faltante queda pendiente aunque exista un candidato. Una referencia localizada valida coordenadas del índice entregado, sin afirmar identidad ni crear un vínculo IBITE.

La revisión funciona sin base de datos y no acepta campos nominales. Las pruebas usan huellas y hojas sintéticas. Para pasar a captura y consulta de expedientes se requiere decidir la unidad de registro y permisos por disciplina y aportar un índice autorizado de procedencia. Se puede iniciar Fichas de campo en paralelo cuando exista su plantilla.
