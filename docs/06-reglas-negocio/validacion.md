# Validación metodológica

Confirmar instrumento y variantes por población, ventanas, tratamiento de respuestas parciales, unidad de análisis, clave de unicidad y precedencia de las fuentes. Describir puntuación y casos de referencia usando el manual oficial aprobado. Para cada indicador registrar universo, numerador, denominador, faltantes, unidad, comparabilidad, desagregación permitida y versión. Distinguir campaña semestral y retamizaje focalizado hasta conciliar su relación.

## Referencia confirmada para puntuación IBITE-17

El usuario confirmó `IBITE Manizales (respuestas)-23.xlsx` como referencia para reproducir la puntuación. La huella SHA-256 del archivo local revisado es `9D7B11C584F21741B1ABE9EDAB746EEFA41458923BC43DC0B26A07F74C33780E`.

Trazabilidad inicial: Puntuaciones R–AH y Escalas para codificación de ítems; Puntuaciones AI–AY para dimensiones, señales y completitud; AZ–BG y las hojas Acciones y Recomendaciones para perfil y salidas derivadas. Verificar las fórmulas efectivas y su precedencia por rama, incluidos faltantes, códigos especiales de seguridad y límites de clasificación. Usar casos sintéticos y contrastar los resultados esperados con el libro. El cálculo todavía está pendiente de verificación.

La [especificación de puntuación y los casos sintéticos](ibite-puntuacion.md) documentan el cálculo trazado y las decisiones de seguridad pendientes.

El [Formato A de MTTS](mtts-formato-a.md) tiene un borrador de captura y aceptación para R05.

La [especificación inicial de IBITE-DA-28](ibite-da-puntuacion.md) traza codificación, dimensiones y casos propuestos.

## Selectores de orientación de referencia

Incremento R04. Se reproducen en funciones internas las decisiones de BB:BG del libro -23 y BT:BY del DA. La salida usa códigos técnicos para rama, plazo, ruta, orden de señales y clave de consulta, conservando una correspondencia explícita con las fórmulas del libro. La selección de clave precede por seguridad a INCOMPLETO aunque el indicador de riesgo general sea insuficiente. Sin registro de origen, el selector queda vacío.

La aceptación comprueba precedencias independientes entre acción, plazo y ruta, mezcla de señales, faltantes y claves A/B o DA. Los textos, archivos y canales de orientación requieren validación de contenido y vigencia antes de habilitar su uso. Este incremento no obtiene ni publica textos/infografías y no emite notificaciones.

## Invocación interna con referencia de instrumento

R04. El punto de entrada recibe una versión de instrumento del catálogo, las respuestas en el orden de su variante y la presencia de registro de origen. Verifica combinación instrumento–variante, versión de regla y cantidad de ítems. Devuelve procedencia, dimensiones, clasificación y códigos de orientación. Rechaza referencias no compatibles y evita aplicar ramas de IBITE-17 a DA-28. Consumir este cálculo no registra una aplicación, no escribe resultados ni otorga elegibilidad operativa. La integración futura con persistencia deberá comprobar acceso por objeto y conservar la versión utilizada.

## Política de señales del 21 de noviembre

Las observaciones internas conservan los ítems positivos aunque falte el otro ítem de seguridad, y enumeran faltantes o códigos no aclarados. Un resultado incompleto sigue marcado como insuficiente según su contrato. La reproducción histórica del Excel conserva sus fórmulas para comparación. No se generan notificaciones ni orientaciones para participantes. Cualquier flujo futuro debe dirigirse solo al Equipo de Apoyo Psicosocial asignado a la institución y requiere aprobación de protocolo, destinatarios y contenido.
