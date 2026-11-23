# Fichas de campo para talleres y reuniones

R08/R10/R12. Insumos revisados el 22 de noviembre de 2026. El Word aporta el formato de diligenciamiento y el PDF aporta una organización de categorías. El contenido de los documentos se usa como evidencia del instrumento. Los archivos no activan importaciones ni cambian permisos.

| Insumo | Alcance | SHA-256 |
|---|---|---|
| Ficha de campo sin recorrido.docx | Control de sesión, autorizaciones, preguntas temáticas, hallazgos y referencias de lugar | 67e7ab1fcf1227f13aeda41aa41d16a8a62716d9ce0baa6b03dc5c3c2c14bf5c |
| Organización de categorías V1 - Hoja 1.pdf | Taxonomía de tres niveles, ejemplos de hallazgos H y recomendaciones R | 44af0498f4d51ea645957f188cd9ef3bee3cd168510f32209afa79377ac47342 |

## Estructura candidata

- **Sesión S.** Fecha, referencia institucional, sede, componentes, asistencia agregada y estados de autorizaciones. Los datos de facilitador y relator que aparecen en el Word requieren una decisión de minimización. Las listas de asistencia y consentimientos individuales permanecen separados según el formato.
- **Hallazgo H.** Pertenece a una sesión y puede referirse a varios lugares L. Algunas respuestas carecen de lugar identificable y no requieren una geometría inventada. Conservar el origen de la observación como conversación, observación o documento donde aplique, y cartel o plenaria cuando corresponda al mural.
- **Lugar L.** Referencia local de espacio. El Word indica registrar una ficha espacial y marcar «pendiente» si faltan coordenadas. El archivo sin recorrido revisado no contiene una sección espacial autónoma con el esquema de coordenadas, CRS y precisión. Para integrar SIG queda obtener ese esquema o aprobar su versión estructurada.
- **Recomendación R.** El PDF muestra códigos de recomendación asociados a hallazgos en las categorías. Los ejemplos H001–H004 y R001–R004 se repiten entre bloques y no establecen un máximo ni identificadores globales. La cardinalidad de recomendación queda por confirmar antes de definir su clave.

## Correspondencia temática

| Formato Word | Taxonomía PDF | Observación |
|---|---|---|
| Reunión 1 | Terminología y preconceptos | Ocho conceptos, incluidos PEGR, cultura sísmica, PRAE y equipo psicosocial |
| Taller participativo | Factores protectores, dimensiones humana/social, institucional/pedagógica y física/espacial | El PDF distingue redes y activación internas/externas. La respuesta del Word puede referirse a más de una categoría. |
| Taller 1 | Cuidado socioemocional | Conservar la perspectiva de grupo y evitar relatos identificables. |
| Taller 3 | Aprendizaje institucional y capacidades de los comités | Las propuestas y fuentes se conservan separadas de acciones ejecutadas. |
| Cierre | Sin categoría equivalente visible en el PDF | Mantener como bloque de origen y confirmar clasificación posterior. |

La percepción de seguridad se registra como percepción. Cualquier verificación estructural se conserva con su fuente documental y no se deduce de una conversación o recorrido.

## Verificación inicial ejecutable

`npm run preview:field-session` recibe por entrada estándar un objeto JSON técnico con `sessionCode`, `findings` y `places`. Revisa códigos S/H/L, unicidad dentro del lote y vínculos a uno o varios lugares. Admite hallazgos sin lugar y lugares pendientes. Rechaza coordenadas en esta fase, campos nominales y referencias de lugares inexistentes. Devuelve conteos y motivos por posición, sin cargar ni persistir datos.

```json
{
  "sessionCode": "S01",
  "places": [{"code": "L001", "locationStatus": "pending"}],
  "findings": [{"code": "H001", "placeCodes": ["L001"]}]
}
```

El formato técnico se usa para validar la estructura de referencias con datos sintéticos. No es el formato definitivo de importación. El equipo confirmó que diligenciará y cargará un Excel. La propuesta de hojas y columnas se documenta a continuación. No se interpretan documentos Word como lotes operativos.

## Revisión previa de Excel

**Antecedente del prototipo.** Ver Formato de carga confirmado para el diseño vigente.

Confirmado por la dirección del proyecto: las fichas se diligencian en Excel y luego se cargan. R08. El diseño inicial propone un libro por sesión, con tres hojas y encabezados exactos en la primera fila:

| Hoja | Encabezados |
|---|---|
| Sesion | CodigoSesion, Fecha, CodigoInstitucion |
| Hallazgos | CodigoHallazgo, CodigosLugar, Resumen |
| Lugares | CodigoLugar, EstadoUbicacion, Referencia |

Una sesión contiene una fecha de calendario y un código de institución en texto. `CodigosLugar` admite varios códigos separados por punto y coma o puede quedar vacío. Para esta etapa `EstadoUbicacion` admite `pendiente` y conserva la referencia descriptiva. Los códigos H y L se revisan dentro de la sesión. Las categorías, recomendaciones y ficha espacial se incorporarán al cerrar sus contratos. El alcance de esta propuesta es una vista previa estructural.

Después de compilar y con openpyxl instalado según `scripts/requirements-ibite.txt`:

```powershell
python scripts/preview-field-workbook.py ficha.xlsx
```

El comando lee XLSX de hasta 5 MB, no ejecuta macros ni fórmulas y rechaza vínculos externos e incrustaciones. Valida encabezados, integridad S/H/L y conserva el número de fila original al reportar problemas. Omite filas vacías. El diagnóstico solo contiene conteos, estado y posición de problemas. Códigos de salida: 0 para revisión satisfactoria, 2 para incidencias de referencias y 1 para estructura o contenido de celda inválido. La revisión no autoriza códigos institucionales, verifica la anonimización de narrativas ni guarda registros.

## Plantilla inicial para diligenciar

**Antecedente del prototipo.** Ver Formato de carga confirmado para el diseño vigente.

La [plantilla Excel v1](../../outputs/fichas-campo/Plantilla_Fichas_de_campo_v1.xlsx) está vacía y usa los encabezados del validador. Para cada sesión use una copia, deje la primera fila de cada hoja intacta y escriba códigos H y L en texto. La hoja Lugares ofrece el estado `pendiente`. Separe varios códigos de lugar con punto y coma. Use el código de institución del catálogo y descripciones sin datos identificables.

Se comprobó visualmente cada hoja. En una copia temporal se guardó una fecha nativa de Excel y un hallazgo vinculado con un lugar pendiente. La vista previa devolvió un hallazgo y un lugar válidos. El archivo entregado mantiene vacías las filas de datos. Sigue pendiente confirmar el esquema espacial y extender la plantilla para cargar categorías y recomendaciones en el flujo transaccional.

## Formato de carga confirmado el 22 de noviembre de 2026

El Excel que se cargará seguirá únicamente la estructura visible del PDF **Organización de categorías V1 - Hoja 1**: categoría principal, categoría subsidiaria 1, categoría subsidiaria 2, hallazgos asociados y recomendaciones. Esta decisión sustituye la propuesta de carga en tres hojas Sesion, Hallazgos y Lugares. La plantilla y el validador anteriores quedan como antecedentes del prototipo. El Word conserva su función de insumo de diligenciamiento y diseño, sin imponer hojas ni campos adicionales al archivo de carga.

Pendiente recibir y revisar el Excel definitivo. De ese archivo se tomarán los encabezados exactos, las hojas, las celdas combinadas o vacías, la forma de representar el contenido y el alcance de los códigos H/R que se repiten entre categorías. Hasta entonces no se fija la clave de importación ni se aplican las reglas del validador anterior al nuevo Excel.
