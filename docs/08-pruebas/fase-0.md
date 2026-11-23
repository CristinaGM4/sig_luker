# Verificación

Fase 0: inspección local del árbol, comprobación de Git y búsqueda de AGENTS.md, inventario por nombres, lectura del texto del PDF y consulta de fuentes oficiales. El índice documental y referencias locales se verifican al cierre.

Pruebas de aplicación ejecutadas: cero. Fallos de pruebas de aplicación observados: ninguno, dado que aún no se ejecutan. Pendientes por incremento: unitarias de dominio, integración con PostgreSQL/PostGIS aislado y E2E de contratos, permisos y errores. Usar fixtures sintéticos, controles negativos, pruebas de concurrencia/importación repetida y reconciliación de métricas con resultados oficiales de referencia.

## Especificación IBITE-17

- Ejecutado: inspección de las fórmulas de la fila 2, entradas de Escalas y trazabilidad de columnas. Preparados 11 casos sintéticos con expectativas razonadas.
- Ejecutado en Excel: 19 variantes de 11 casos con entradas codificadas sintéticas. 54 comprobaciones pasaron y cero fallaron. Se copiaron las fórmulas de AI:BE de la fila de referencia a un libro temporal sin registros reales. La prueba cubre salidas seleccionadas desde ítems ya codificados. La extracción desde las ramas, la búsqueda de opciones en Escalas y las salidas BF/BG quedan fuera de esta ejecución.
- Consistencia por fila: se compararon las fórmulas de R:BG en 7.557 filas con fórmulas, ajustando referencias relativas. Hubo 17 diferencias, todas en R7558:AH7558. Los 17 ítems apuntan a la fila 7560 del formulario.

## Verificación de respuestas y selección de orientación IBITE-17

Excel ejecutó 30 comprobaciones adicionales con las fórmulas originales de rama, búsqueda en Escalas, puntuación y selección de BF/BG en un libro sintético. Pasaron 30 y fallaron cero. Las cinco variantes cubrieron ambas ramas, perfiles sin alerta, alertas y un caso incompleto con una opción desconocida y dos blancos. Se usaron etiquetas sintéticas para verificar las claves de recomendación e infografía. La revisión de textos y vigencia de la orientación sigue pendiente.

La discrepancia de alineación se registra como [INC-IBITE-01](../09-importaciones/estrategia.md).

Formato A de MTTS: cotejo documental de las cinco secciones y definición de seis criterios de aceptación. Las pruebas de aplicación quedan pendientes del contrato y la implementación.

Matriz Piloto: verificados los encabezados, dimensiones de la hoja, ausencia de validaciones de celda y sumas de la guía. Pendiente la conciliación con las dos exportaciones IBITE y la validación del contrato.

IBITE-DA-28: realizada la inspección de Escalas y fórmulas de la fila 2. Definidos seis casos sintéticos. Pendiente recálculo en Excel y comparación entre filas.

## Ejecución de casos IBITE-DA-28

Excel recalculó 14 variantes de los seis casos DA-01 a DA-06 en un libro temporal con entradas sintéticas. Pasaron 33 comprobaciones y fallaron cero. Se verificaron claves de escala, límites emocionales y combinados, alertas, completitud y salidas ante faltantes. La ejecución no cubrió todos los perfiles ni la búsqueda de recomendaciones e infografías. El original no se modificó.

La comparación de referencias detectó [INC-IBITE-02](../09-importaciones/estrategia.md).
