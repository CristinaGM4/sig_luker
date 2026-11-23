# Conciliación histórica de IBITE Manizales

Fuente: IBITE Manizales (respuestas)-23.xlsx. Lectura local de encabezados, marcas temporales, fórmulas y columnas institucionales. La unidad de conteo es la fila, no la persona.

| Comprobación | Resultado |
|---|---|
| Filas con datos y marca temporal Excel nativa | 7.554 |
| Filas con referencias al origen en Puntuaciones | 7.557 |
| Referencias adicionales | Puntuaciones 7556 → formulario 7556; 7557 → 7557; 7558 → 7560 |
| Orígenes de las tres referencias adicionales | Las tres filas están vacías |
| Filas de formulario con datos sin referencia del primer ítem | 0 |
| Referencias repetidas del primer ítem | 0 |

INC-IBITE-01 se precisa: Puntuaciones 7558 apunta a 7560 tanto para el primer y último ítem como para número de fila, fecha, rama y campo nominal. No se observó mezcla de participantes. Los tres orígenes vacíos explican la diferencia exacta de conteo en esta copia. Conservar la trazabilidad y clasificar las referencias de filas vacías durante la revisión del lote. INC-IBITE-02 de DA-28 permanece separado. Los archivos originales y registros se conservaron íntegros.

## Tabla de revisión institucional

H y AQ corresponden a columnas institucionales de distintas ramas. Catalogo_Colegios aporta Variante y Etiqueta_unificada. La tabla CSV local IBITE-instituciones-revision-local.csv contiene 3.030 combinaciones columna–texto no canónico, con frecuencia, método y equivalencias candidatas. Se examinaron alias directos, coincidencias ortográficas y sugerencias de similaridad a partir de 0,87. Ninguna equivalencia se aplicó a los datos. El archivo contiene texto libre de origen y debe permanecer bajo custodia autorizada.

| Columna | Alias de catálogo | Ortográfica | Similaridad | Ambigua | Sin coincidencia |
|---|---:|---:|---:|---:|---:|
| H | 1.754 | 959 | 1.072 | 24 | 862 |
| AQ | 952 | 568 | 829 | 3 | 415 |

El diagnóstico de dominio se ejecutó contra metadatos de esta copia sin textos institucionales ni identificadores personales. Reprodujo 7.554 respuestas, 7.557 cálculos y los tres pares 7556/7556, 7557/7557 y 7558/7560. La resolución de alias se verificó aparte con datos sintéticos.

## Diagnóstico local reproducible

Para un libro autorizado con el formato Manizales -23, usa Node.js del proyecto y Python con la dependencia fijada en scripts/requirements-ibite.txt. Se verificó con openpyxl 3.1.5. Compila antes de utilizarlo:

```powershell
npm run build
python -m pip install -r scripts/requirements-ibite.txt
python scripts/diagnose-ibite-manizales.py "ruta-local-al-libro.xlsx"
python -m unittest discover -s test -p test_ibite_manizales_extractor.py
```

La instalación se omite cuando el entorno Python ya incluye esa versión. El lector local verifica hojas y encabezados, usa H o AQ según la rama, controla el tamaño del paquete y rechaza macros. Revisa las referencias de origen de A, B, D, E, R y AH de Puntuaciones. Si una fila tiene referencias internas divergentes, conserva su número en el resumen de incidencias y la excluye del emparejamiento. La herramienta no ejecuta fórmulas. Los nombres institucionales se transforman en huellas de comparación antes de pasar al cálculo Node. Las huellas del catálogo son referencias técnicas de etiquetas, no códigos institucionales oficiales. La salida contiene totales, categorías y una muestra acotada de coordenadas.

La ejecución en la copia confirmada detectó 7.554 respuestas, 7.557 filas de cálculo, cero discrepancias entre los anclajes revisados y tres referencias a filas vacías. Las 4.848 respuestas en revisión institucional se dividen en 4.734 sin alias directo y 114 con institución ausente. También se identificaron cuatro filas de alias incompletas y 113 etiquetas de destino distintas. La comparación directa no aplica las sugerencias ortográficas del CSV de revisión.

El extractor es local para archivos conocidos y autorizados. La consulta de lotes y la revisión auditada siguen pendientes. No escribe archivos de origen ni accede a PostgreSQL.

El lector ahora suministra una segunda huella institucional para sugerencias ortográficas. La nueva lógica se verificó con datos sintéticos. Los totales de la ejecución original corresponden al diagnóstico de alias directo y no fueron recalculados.
