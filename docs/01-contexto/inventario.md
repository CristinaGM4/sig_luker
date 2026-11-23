# Contexto e inventario

Complejidad alta por el cruce de permisos por institución, trazabilidad histórica, información de menores, versiones metodológicas y fuentes espaciales heterogéneas. La estimación de volumen histórica es una hipótesis de planificación hasta conciliar fuentes y cortes.

**PM** identifica el prompt maestro. **PP** identifica el PDF local del piloto v9, antecedente de alcance y metodología que requiere confirmación de vigencia. El PP cita 7.345 estudiantes de 48 instituciones y un retamizaje de cierre de casos atendidos. También plantea adecuar el tablero del Censo Digital y mantener los nombres en la Universidad. El PM plantea una nueva plataforma, aplicación semestral y aproximadamente 8.000 registros. Hay que conciliar población, unidad de conteo, corte, alcance del producto y custodia antes de adoptar cualquiera de estas premisas para el piloto.

Se localizaron fuera de Backend dos DOCX, capturas, infografías, un HTML de tablero, cuatro XLSX candidatos (respuestas Manizales, DA, Seguimiento y Monitoreo), un archivo temporal de Office y un ZIP con copias de varios de esos insumos. Se inventariaron por nombre y se revisó el índice del ZIP. La inspección de contenido se limitó al PDF. La autoridad, vigencia y contenido de los demás insumos quedan por verificar.

| ID | Prioridad | Insumo y estado | Formato esperado y finalidad | Dependientes |
|---|---|---|---|---|
| I01 | P0 | IBITE-17 oficial por población, por confirmar | PDF/DOCX y tabla de ítems, opciones, versiones y aplicación | Captura, importación, puntuación |
| I02 | P0 | Metodología IBITE, pendiente de validación | Manual fechado y ejemplos aprobados, incluidos faltantes, clasificación y diferencias entre perfiles | Criticidad, dashboard, reportes |
| I03 | P0 | Histórico, cuatro XLSX candidatos localizados | Diccionario, cortes, procedencia y muestra desidentificada por archivo para mapear columnas, claves y unidades | Importación, línea base |
| I04 | P0 | Instituciones, sedes y periodos, por suministrar | CSV/XLSX con códigos oficiales, alias, sector, vigencia y calendario | Autorización, captura, SIG |
| I05 | P0 | Roles, permisos y custodia, por suministrar | Matriz rol × acción × ámbito, alta/baja, canal de acceso y política de tratamiento | Identidad, casos, exportación |
| I06 | P1 | MTTS, por identificar versión | Formulario PDF/DOCX, opciones, población, periodicidad y cálculo | Implementación y fidelidad |
| I07 | P1 | Factibilidad, por identificar versión | Formulario PDF/DOCX con criterios y ejemplos | Implementación y analítica |
| I08 | P1 | Matriz de resultados, por identificar versión | Plantilla XLSX/DOCX, diccionario y ejemplo sintético | Resultados e intervenciones |
| I09 | P1 | Fichas de campo, Word y PDF recibidos | Carga XLSX confirmada. Formato inicial documentado; falta estructura espacial y contrato operativo | Carga e integración SIG |
| I10 | P1 | Capas geográficas, por identificar fuentes | GeoJSON, GeoPackage, Shapefile o URL de servicio, con CRS, fecha, licencia y semántica | Catálogo y consultas SIG |
| I11 | P1 | Tablero, HTML y capturas candidatos | Mockup vigente, ficha de métricas, filtros, visibilidad y privacidad | Analítica y Angular |
| I12 | P1 | Intervención y seguimiento, PP como antecedente | Protocolo aprobado con estados, responsables, acceso, periodicidad y cierre | Casos, matriz y seguimiento |
| I13 | P2 | Reportes, por definir | Ejemplo sintético, audiencia, columnas, finalidad y entrega requerida | Exportación |

## Insumos revisados después del inventario inicial

- I01–I03. El usuario confirmó IBITE Manizales (respuestas)-23.xlsx como fuente de referencia para reproducir la puntuación. Sus hojas Puntuaciones y Escalas contienen la lógica y las tablas de referencia. Las ramas son A (cuidador de 5–10 años) y B (adolescente de 11–19 años). El libro permite trazar ítems, dimensiones, alertas, perfiles y acciones. Validar casos sintéticos, incluidos faltantes y códigos especiales, antes de habilitar clasificación. El catálogo de colegios del libro es una fuente de alias candidata. IBITE Monitoreo documenta seguimiento y prioridades operativas.
- I05. El usuario confirma que aún no cuenta con una matriz de permisos y custodia. Puede prepararse una propuesta en paralelo. La operación con expedientes reales requiere validar custodia y acceso.
- I06. Alcance confirmado por el usuario: solo Formato A del Word del piloto, ficha semanal por institución/sede diligenciada por el profesional responsable. Las reglas de alerta del anexo son propuestas sujetas a aprobación.
- I07. El usuario identifica las capturas como referencia del módulo Factibilidad. El formulario se titula Evaluación de la fidelidad de implementación y corresponde a un taller. Confirmar denominación funcional y obtener textos truncados y secciones faltantes antes de cerrar el contrato.
- I08. Matriz Piloto.xlsx y su guía aportan una estructura inicial con bloques por disciplina y referencia IBITE. Confirmar si la estructura se replica entre instituciones y qué campos alimentan el módulo.

La revisión fue local y de solo lectura. Se inspeccionaron encabezados, estructura, fórmulas y texto de instrumentos. La clasificación no se ejecutó ni se contrastó con casos de referencia.

### Variante de docentes administrativos y orientadores

El usuario confirmó IBITE DA (Manizales) (respuestas).xlsx como fuente del formulario de estos perfiles. El archivo identifica el instrumento como IBITE-DA-28 y aporta hojas de respuestas, puntuaciones, escalas, acciones, recomendaciones, catálogo institucional y tablero. Constituye un insumo separado de IBITE-17 cuidador/adolescente. Queda pendiente trazar las fórmulas y verificar los resultados de referencia DA con casos sintéticos.
