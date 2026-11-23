# Especificación inicial de puntuación IBITE-DA-28

R04. Fuente: IBITE DA (Manizales) (respuestas).xlsx, hojas Respuestas de formulario 1, Puntuaciones y Escalas. Inspección de fórmulas de la fila 2. Los casos iniciales se ejecutaron con datos sintéticos. Consultar el [registro de verificación](../08-pruebas/fase-0.md) y la [incidencia de referencias](../09-importaciones/estrategia.md).

## Entradas y dimensiones

Los ítems 1–28 corresponden a R:AS en Respuestas de formulario 1 y T:AU en Puntuaciones. Cada respuesta se busca en Escalas A2:B7: Nada/Nunca = 0, Poco = 1, Moderadamente = 2, Mucho = 3 y Completamente = 4. Blanco o respuesta desconocida producen un faltante según la fórmula. El instrumento usa un núcleo de 20 ítems y ocho ítems contextuales. La marca temporal habilita las salidas de perfil y riesgo, y la completitud exige los 20 valores numéricos del núcleo.

| Salida | Ítems | Cortes observados |
|---|---|---|
| AV/AW, malestar emocional | 1–4 | Bajo 0–3, Intermedio 4–7, Elevado 8–16 |
| AX/AY, malestar general y deterioro funcional | 5 y 6 | Suma 0–8. Bandera con ítem 6 ≥ 3 |
| AZ/BA, malestar combinado | AV + AX | Bajo 0–5, Intermedio 6–11, Elevado 12–24 |
| BB, señal de seguridad | 7 y 8 | Si falta uno, Sin datos. Con ambos presentes, alerta si alguno es ≥ 1; en otro caso Sin alerta |
| BC/BD, bienestar y recuperación | 9, 10 y 15 | Bajo 0–3, Intermedio 4–7, Alto 8–12 |
| BE/BF/BG, reintegración laboral | 11 y 12 | Bajo 0–2, Intermedio 3–5, Alto 6–8. Bandera si alguno ≤ 1 |
| BH/BI/BJ, recursos de afrontamiento | 13, 14 y 16 | Bajo 0–3, Intermedio 4–7, Alto 8–12. Bandera si alguno ≤ 1 |
| BK/BL/BM, sentido de comunidad | 17–20 | Bajo 0–4, Intermedio 5–10, Alto 11–16. Bandera si alguno ≤ 1 |
| BN y BO, señales contextuales | 24–27 y 21–22 | BN se activa si alguno de 24–27 es ≤ 1. BO si 21 o 22 es ≥ 3. Ambas fórmulas requieren sus ítems completos |

Las sumas requieren todos sus operandos. BZ y CA consolidan recursos y comunidad en riesgo a partir del nivel bajo o su bandera. BQ, BR y BS asignan perfil, tipo e indicador de riesgo. BT:BY contiene orientaciones, plazos y búsqueda de recomendación e infografía. Está trazado el orden de perfil y riesgo. Queda pendiente verificar las tablas de orientación. La comparación de fórmulas por fila detectó INC-IBITE-02.

## Casos iniciales

| ID | Variación sintética | Resultado esperado por inspección |
|---|---|---|
| DA-01 | Usar Nada y Nunca en respuestas equivalentes | Ambas opciones se codifican como 0 |
| DA-02 | Probar las sumas emocionales 3, 4, 7 y 8 y las combinadas 5, 6, 11 y 12 | Clasificación conforme a cada límite de la tabla |
| DA-03 | Ítems 7 y 8 iguales a 0, luego uno igual a 1 con el otro presente | Sin alerta en el primer caso. Alerta en el segundo |
| DA-04 | Ítem 7 positivo e ítem 8 faltante | BB Sin datos; núcleo incompleto |
| DA-05 | Ítems 7 y 8 presentes con alerta y un faltante en otro ítem del núcleo | Indicador general Sin datos suficientes; la acción y el plazo pueden seguir indicando valoración el mismo día |
| DA-06 | Mantener núcleo completo y omitir los ocho ítems contextuales | BP Sí; las señales contextuales sin operandos quedan vacías |

IBITE-DA-28 e IBITE-17 conservan reglas y resultados versionados por instrumento. Las métricas públicas deben declarar la variante y requieren justificación metodológica antes de comparar resultados entre poblaciones.

## Primer cálculo implementado

La función de dominio con versión ibite-da-28/excel-manizales/1 codifica las 28 posiciones, reproduce AV:BO y BZ:CA y determina si existen 20 respuestas válidas en el núcleo. Esta completitud es de ítems. La condición de presencia de registro por marca temporal se evaluará al integrar elegibilidad y persistencia. Las opciones desconocidas, incluido el texto de código 9 del otro instrumento, permanecen faltantes. El código interno sin_alerta representa Sin alerta del libro.

El cálculo de dimensiones entrega sus resultados sin recomendaciones. La clasificación se implementa en una función separada. No emite alertas, no guarda resultados y no se expone por HTTP.

## Clasificación interna de referencia

La función reproduce BP:BS como completitud, perfil 1–5, tipo principal e indicador general. La presencia de registro la informa el invocador y corresponde a la marca temporal del libro. Si el núcleo está incompleto, perfil queda en nulo y los dos indicadores de riesgo se marcan sin_datos_suficientes, aunque pueda existir una señal en los ítems de seguridad. En el núcleo completo se aplican, en orden, seguridad, malestar/deterioro, reintegración, recursos/comunidad y contexto estructural al seleccionar el riesgo principal. El indicador general usa la alerta de seguridad o el riesgo correspondiente al perfil.

El cálculo permanece interno. Las salidas BT:BY se reproducen como códigos técnicos de acción, plazo, ruta, señales y clave de consulta. La incorporación de textos, infografías y la automatización de orientación requieren validación.
