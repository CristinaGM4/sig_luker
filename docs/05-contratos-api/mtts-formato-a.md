# Contrato REST de MTTS Formato A

R05. Solo Formato A. Base de recursos `/api/v1/interno/instituciones/{institucionId}/mtts`.

| Operación | Permiso | Respuesta |
|---|---|---|
| GET /formato-a | records:create | 200 con versión, roles, actividades, conteos, ocho dimensiones y sus enunciados, escala, barreras, facilitadores y estados |
| POST /fichas | records:create | 201 con id, formVersion y createdAt |
| GET /fichas/{fichaId} | records:read | 200 con identificador, institución, sede, intervalo, versión, fecha y carga capturada |

Además del permiso se requiere pertenecer al Equipo de Apoyo Psicosocial y tener asignación vigente a la institución. Se comprueba el UUID de la institución y de la ficha. 401 sin sesión, 403 sin permiso y 404 fuera de ámbito o recurso inexistente. El guard establece no-store. El registro y la lectura de la ficha se auditan. La carga no permite enviar un ID de autor o institución ni campos desconocidos. El rol declarado se conserva como contexto.

El registro usa una sede no vacía y fechas ISO con un intervalo de hasta siete días contados incluyendo ambos extremos. Las valoraciones admiten 1–5 y NA. Un campo omitido permanece faltante. Las listas de barreras y facilitadores aceptan hasta tres opciones distintas. Los conteos explícitos deben ser enteros no negativos. La casilla de bloque no disponible es incompatible con conteos explícitos. Los campos narrativos son opcionales y tienen límite de longitud. El formulario informa que no se deben incluir datos identificables de estudiantes. La validación técnica de texto no verifica identidades ni garantiza anonimización.

La clave semanal usa institución, autor, sede normalizada y fecha de inicio. Dos envíos simultáneos para esa clave producen un 201 y un 409. La consulta no incluye el ID del autor. Quedan por acordar la nomenclatura de sedes, los ajustes de obligatoriedad y el flujo de correcciones. El Formato B, Factibilidad y alertas automáticas quedan fuera del contrato inicial.

## Listado y resumen por intervalo

Ambas operaciones requieren `records:read`, rol psicosocial y asignación vigente. Los filtros `desde` y `hasta` son fechas ISO inclusivas sobre el inicio de la semana. Se acepta un intervalo de hasta 366 días naturales. Fechas, cursores y parámetros adicionales inválidos reciben 400. El intervalo y la versión activa se aplican en la consulta del objeto. Ambas consultas registran auditoría sin incluir la carga de una ficha.

| Operación | Respuesta |
|---|---|
| GET /fichas?desde=2026-11-23&hasta=2026-12-06 | 200 con hasta 25 referencias y `nextCursor`. |
| GET /resumen?desde=2026-11-23&hasta=2026-12-06 | 200 con total, dimensiones, barreras y facilitadores. Si el corte supera 2.000 fichas, 422 para solicitar un intervalo menor. |

El listado ordena por inicio de semana descendente y UUID descendente. `after` acepta el UUID devuelto en `nextCursor`. Un ancla ajena al intervalo, a la versión o a la institución recibe 404. El listado no devuelve autor, carga ni texto narrativo. La consulta de detalle sigue disponible por identificador.

Por cada dimensión, `distribution` contiene cinco conteos en el orden 1 a 5. `median` usa solo valores numéricos. `rated`, `notApplicable` y `missing` son categorías excluyentes y suman el total de fichas. El porcentaje NA usa como denominador todas las fichas incluidas y es nulo cuando no hay fichas. Un corte sin valores numéricos devuelve mediana nula. Cada opción de barreras y facilitadores cuenta como máximo una vez por ficha. Los conteos se refieren a fichas, con posibilidad de varias selecciones por ficha. El resumen conserva cada dimensión por separado y no devuelve narraciones.

## Filtros por sede y tendencia semanal

El listado y el resumen admiten `sede` opcional. Se busca con la misma normalización de espacios, Unicode y mayúsculas que usa la captura. Los alias de sede requieren un catálogo para agruparse. El cursor se valida con el filtro de sede y de fechas aplicado. Una cadena vacía o un parámetro repetido devuelve 400.

`GET /resumen?desde=2026-11-23&hasta=2026-12-06&sede=Sede%20QA&porSemana=true` conserva los totales del corte y agrega `weeks`, ordenado por fecha de inicio semanal de menor a mayor. Cada semana tiene las mismas métricas y sus propios denominadores. Se incluyen solo fechas de inicio que tienen fichas en el corte. Las semanas con fechas de inicio distintas permanecen separadas. Cuando no hay fichas, `weeks` es vacío. El resumen de rango completo conserva su forma si se omite `porSemana` o se indica `false`.

La agrupación describe lo registrado. La identificación de alertas y el análisis de recurrencias para escalamiento tienen su propia especificación, pendiente de aprobación.
