# Especificación de reproducción de la puntuación IBITE-17

Estado: borrador trazado contra las fórmulas de la fila 2 de Puntuaciones y la tabla Escalas del [libro de referencia confirmado](validacion.md). Requisito R04. El recálculo de las salidas seleccionadas y la comparación de fórmulas por fila se documentan en el registro de pruebas.

## Entradas y codificación

La rama A corresponde al cuidador de una persona de 5–10 años y usa las columnas T:AJ de Respuestas de formulario 1. La rama B corresponde al adolescente de 11–19 años y usa BC:BS. Ambas secuencias mapean los ítems 1–17 a R:AH de Puntuaciones en el mismo orden. La rama se toma de la opción de diligenciamiento elegida. Conservar la respuesta original y vincular el resultado con la versión de la regla.

Cada ítem busca la opción en Escalas A2:B12. Nunca/No = 0. Varios días/Algunos días/Sí, una vez = 1. Más de la mitad de los días/Muchos días/Sí, más de una vez = 2. Casi todos los días/Sí, actualmente o de forma repetida = 3. No sé o no puedo responder = 9, código técnico previsto para seguridad (ítems 7 y 8). Un blanco o una opción sin equivalencia produce un valor faltante. En el cálculo reproducido, el 9 de seguridad cuenta como numérico para completitud. Verificar en el formulario las opciones habilitadas por ítem antes de cerrar validaciones de captura.

## Dimensiones y señales

Cada suma se calcula cuando todos sus operandos están disponibles. Los tramos de las tablas incluyen ambos extremos.

| Salida | Cálculo | Clasificación |
|---|---|---|
| AI/AJ · Postraumático | Suma 1–4 | Bajo 0–2, Intermedio 3–5, Elevado 6–12 |
| AK/AL · General y funcional | AK suma 5–6. AL requiere el ítem 6 y se activa con 2 o más | Señal Sí/No |
| AM/AN · Combinado | AI + AK | Bajo 0–4, Intermedio 5–9, Elevado 10–18 |
| AO · Seguridad | En orden: falta 7 u 8 → Sin datos. Alguno vale 1–3 → Alerta. Alguno vale 9 → Seguridad no aclarada. Resto → Ninguna | Alerta y seguridad no aclarada son salidas distintas |
| AP/AQ/AR · Escolar | Suma 9–11; con los tres presentes, señal si algún ítem vale 2 o más | Bajo 0–1, Intermedio 2–4, Elevado 5–9 |
| AS/AT · Recursos personales | Suma 12–14 | Bajo 0–3, Intermedio 4–6, Alto 7–9 |
| AU/AV · Recursos familiares | Í15 + (3 − Í16) + Í17 | Bajo 0–3, Intermedio 4–6, Alto 7–9 |
| AW · Riesgo material | Coincidencia con cualquiera de las opciones exactas de O, N o M indicadas en AW2: daño grave/no habitable, no ha regresado o conviviente herido | Sí/No |
| AX · Necesidades básicas | Si P está vacío, vacío. Si contiene «Ninguna», No. En otro caso, Sí | Coincidencia de subcadena |
| AY · Completitud | Con E presente y al menos 15 de 17 valores numéricos | Sí/No cuando E está presente |

## Orden de decisión

- AZ, perfil. E vacío deja la salida vacía. Un registro incompleto queda «Incompleto - sin perfil». Después se selecciona el primer criterio aplicable: perfil 3 si hay alerta o seguridad no aclarada, malestar combinado elevado, deterioro funcional, nivel escolar elevado o señal de desescolarización. Perfil 1 si el malestar combinado es bajo y ambos recursos altos. Perfil 4 si el malestar es bajo/intermedio y ambos recursos bajos. Perfil 5 si el malestar es bajo/intermedio y un recurso es bajo mientras el otro difiere de Bajo, lo que en la fórmula incluye un valor faltante. Perfil 2 por defecto.
- BA, indicador de riesgo. E vacío deja la salida vacía. Aplicar la primera condición: incompleto → Sin datos suficientes; alerta → Crítico; seguridad no aclarada → Alto por seguridad; señal material → Alto por riesgo material; perfiles 3/4/5/2/1 → Alto/Medio-Alto/Medio/Bajo-Medio/Bajo.
- BB–BG, salidas de orientación. Cada columna tiene su propia precedencia. BB–BD priorizan seguridad y pueden devolver una salida aunque AY indique incompleto. BE compone varias señales. BF/BG buscan primero ALERTA por rama, luego INCOMPLETO o el código perfil–rama en Recomendaciones. Verificar texto, ruta, vigencia y permisos con el equipo responsable antes de activar orientación operativa. BH no forma parte del cálculo trazado.
- E es el campo nominal que usa la hoja como condición de presencia de registro y C contiene consentimiento/asentimiento. El contrato deberá definir cómo identificar registros elegibles mediante claves opacas y política aprobada. La equivalencia con la condición de E y los efectos de C se validarán por separado.

## Casos sintéticos de referencia

Partir de 17 respuestas codificadas en 0 y registro presente, salvo indicación. Cada caso modifica solo lo indicado. Resultados esperados derivados por inspección y contrastados en Excel con entradas codificadas sintéticas.

| Caso | Cambio | Resultado a verificar |
|---|---|---|
| IB-01 | Ejecutar ambas ramas con opciones equivalentes; en 12–15 y 17 usar 3 | AI y AM = 0, AS y AU = 9, perfil 1, riesgo Bajo |
| IB-02 | Variar la suma de 1–4 entre 2, 3, 5 y 6 | AJ pasa por Bajo, Intermedio, Intermedio y Elevado |
| IB-03 | Variar AM entre 4, 5, 9 y 10 con ítems 1–6 válidos | AN pasa por Bajo, Intermedio, Intermedio y Elevado |
| IB-04 | Mantener 15 y 17 en 0; variar 16 de 0 a 3 | AU baja de 3 a 0 |
| IB-05 | Í7 = 9, Í8 = 1 | AO alerta el mismo día; perfil 3 y BA crítico |
| IB-06 | Í7 = 9, Í8 = 0 | AO seguridad no aclarada, AY Sí, BA Alto por seguridad |
| IB-07 | Í7 = 1, Í8 faltante | AO Sin datos, AY Sí; verificar precedencia del faltante |
| IB-08 | Í7 = 1 y tres faltantes fuera de seguridad | AY No, AZ incompleto, BA Sin datos suficientes; BB y BC indican valoración el mismo día |
| IB-09 | Í2 e Í3 faltantes | AY Sí; AI, AJ, AM y AN vacíos |
| IB-10 | Í15 faltante, AS bajo y AM bajo | AU y AV vacíos; AZ perfil 5 según la comparación del libro |
| IB-11 | E vacío con los ítems codificados | AY, AZ y BA vacíos; registrar este comportamiento para acordar la adaptación a identidad seudónima |

Agregar casos de opciones fuera de catálogo, cortes escolares y de recursos, señales simultáneas y prioridad material antes de aprobar el contrato. Validar explícitamente IB-07, IB-08 e IB-10 con los responsables. Preservar la procedencia del resultado histórico para cualquier cambio deliberado de comportamiento.

## Incidencia de alineación histórica

Los 17 ítems de Puntuaciones R7558:AH7558 toman las respuestas de la fila 7560 del formulario, mientras que el patrón general toma la fila del mismo número. Conservar el libro original y resolver con quien generó la exportación qué correspondencia se debe adoptar antes de importar esa fila. El hallazgo identifica referencias distintas y no determina qué registro debe prevalecer.

La reproducción desde opciones de respuesta y la selección de claves BF/BG se ampliaron con casos sintéticos en el [registro de verificación](../08-pruebas/fase-0.md). El seguimiento de la fila desplazada corresponde a [INC-IBITE-01](../09-importaciones/estrategia.md).

## Primer cálculo implementado

La función de dominio calcula los ítems codificados y las salidas AI:AV a partir de 17 posiciones en el orden del formulario, con versión ibite-17/excel-23/1. El resultado incluye el número de respuestas codificadas, sin usar el nombre para decidir completitud. Las opciones desconocidas producen faltantes. La función rechaza el código técnico 9 fuera de los ítems 7 y 8 de acuerdo con el dominio esperado. Esta validación de entrada es deliberadamente más estricta que el VLOOKUP genérico de la hoja ante una opción fuera del dominio del ítem.

La señal de seguridad reproduce la precedencia documentada para comprobación interna. La función no persiste resultados, no genera notificaciones y no es una ruta HTTP. La clasificación de referencia se implementó por separado, como se describe a continuación.

## Clasificación interna de referencia

La función de clasificación reproduce AW:BA del Excel -23. Recibe la presencia de registro como un indicador explícito proporcionado por el origen y no requiere el nombre para calcular. Devuelve completitud, perfil 1–5 y un código interno de riesgo. Un registro presente con menos de 15 ítems codificados queda sin perfil, con riesgo sin_datos_suficientes. Un registro ausente conserva ambos valores en nulo. La clasificación conserva la precedencia de seguridad y contexto material del libro y la regla de perfil 5 con uno de los recursos faltante. La presencia de registro no acredita consentimiento ni elegibilidad para atención.

Las salidas BB:BG tienen un selector interno de códigos de acción, plazo, ruta, señales y clave de recomendación. El selector no entrega los textos, archivos ni recomendaciones a terceros. No activa alertas y no persiste resultados. Falta acordar el uso operativo de los casos con faltantes antes de integrar la clasificación con una ruta o un flujo de seguimiento.
