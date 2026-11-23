# Contrato candidato del dashboard público

Estado: borrador para R09 y R12. El usuario confirmó que cualquier persona con la URL podrá consultar el dashboard sin iniciar sesión. La Universidad de Manizales custodia los registros individuales. La API pública sirve agregados aprobados para difusión.

## Primer alcance de publicación

Propuesta inicial: consultar campañas, periodos e instrumentos publicables y mostrar el volumen de aplicaciones incluidas y la distribución agregada de una dimensión previamente aprobada. La publicación por institución depende de la política de divulgación. El tablero público no usa el número de filas de un archivo como conteo de participantes. Los registros de IBITE-17 e IBITE-DA-28 se desglosan según instrumento y versión aprobados. Comparaciones conjuntas requieren una justificación metodológica específica.

| Métrica candidata | Numerador o unidad | Denominador y tratamiento |
|---|---|---|
| Aplicaciones incluidas | Conteo de aplicaciones válidas en el corte y conjunto aprobados | Unidad: aplicación. Confirmar elegibilidad y deduplicación antes de publicar. Una persona puede tener más de una aplicación según campaña y reglas |
| Distribución por dimensión | Aplicaciones con resultado válido en la categoría y versión seleccionadas | Aplicaciones elegibles con resultado válido en esa dimensión. Mostrar la definición de faltantes y su efecto en el denominador. Publicar el volumen de faltantes solo si supera los controles |
| Evolución en el tiempo | Repetición de una métrica aprobada por periodo | Confirmar equivalencia metodológica, cohorte, unidad y versión antes de presentar comparación. Separar retamizaje focalizado y campaña general hasta validar comparabilidad |

Los resultados de seguridad y criticidad, el detalle por sede y las visualizaciones geográficas quedan sujetos a aprobación expresa de publicación. Los registros nominales, respuestas detalladas, recomendaciones individuales, referencias de fila y listados de casos se consultan desde los servicios restringidos.

## Operaciones candidatas

| Método y ruta | Entrada | Salida |
|---|---|---|
| GET /api/v1/publico/dashboard/catalogo | Sin autenticación. Parámetros de paginación acotados si se necesitan | Catálogo de métricas, cortes, instrumentos/versiones y filtros que tienen autorización de publicación |
| GET /api/v1/publico/dashboard/indicadores | Código de métrica, identificador de corte y filtros admitidos por la métrica | Identificador de métrica, versión, unidad, fecha de corte y celdas publicables. Cada celda informa estado y, cuando está autorizada, conteo, denominador o porcentaje según su definición |

Usar 400 para parámetros mal formados o filtros fuera de catálogo y 404 para métricas/cortes sin publicación. Cuando una celda sea parte de una agrupación autorizada pero su valor esté retenido por política, devolver estado **no disponible** y omitir tanto el valor como el detalle que permitiría inferirlo. Representar un cero como dato solo cuando la política autorice publicar ese cero.

## Controles de publicación propuestos

1. Usar cortes publicados con filtros y agrupaciones predefinidos. Evitar consultas generadas a partir de listas arbitrarias de instituciones u otros segmentos.
2. Acordar un umbral mínimo con el custodio y los responsables del proyecto. Aplicarlo a categorías, denominadores y cruces según política. El número concreto queda pendiente.
3. Revisar inferencia por diferencia. Si el total y las celdas visibles permiten deducir una celda retenida, retener celdas adicionales, el total o el desglose, según la política aprobada. Revisar también combinaciones entre filtros permitidos y cortes sucesivos.
4. Publicar solo un conjunto de propiedades explícitamente aprobado. La protección se comprueba en el cuerpo de la API, aunque la interfaz oculte campos.
5. Mantener metadatos de fuente, versión de regla, criterios de inclusión y versión de la política de divulgación. Acordar correcciones y retiro de un corte ya publicado, incluida la invalidación de caché si aplica.

## Criterios de aceptación propuestos

| ID | Verificación |
|---|---|
| PUB-01 | Un visitante sin sesión consulta catálogo e indicadores de un corte autorizado y obtiene solo los campos públicos |
| PUB-02 | Parámetros de una institución o segmento no habilitado no generan consultas libres ni devuelven métricas internas |
| PUB-03 | Un conjunto sintético distingue cero publicable, dato faltante y dato retenido mediante la política aprobada |
| PUB-04 | Con totales y subtotales sintéticos, el consumidor no puede reconstruir una celda retenida por resta |
| PUB-05 | Una comparación entre cortes no permite reconstruir una variación de datos restringida por la política |
| PUB-06 | El numerador y denominador coinciden con la definición aprobada, incluidos registros inválidos, faltantes y versiones distintas |
| PUB-07 | Un retiro de publicación se refleja en la API y en las capas de caché cuando correspondan |

Decisiones pendientes: primer conjunto de métricas, cortes que se pueden publicar, nivel geográfico, filtros habilitados, política de divulgación y persona que autoriza publicación y retiro. El contrato usa ejemplos lógicos y no crea rutas operativas.

## Alcance confirmado el 21 de noviembre

El dashboard privado requiere sesión y autorización por rol y asignación institucional. Sus rutas se mantendrán separadas de las públicas. La consulta de resultados individual ya tiene [contrato restringido](ibite-resultados.md), y no constituye un dashboard. La publicación de datos reales queda pendiente de política autorizada de divulgación y supresión.

## Comprobación interna de un corte sintético

El helper de supresión recibe categorías excluyentes ya calculadas y un umbral entero suministrado por el invocador. Devuelve el conteo por categoría únicamente si llega al umbral. Si retiene una celda, omite el total del corte. Cero también se retiene cuando queda por debajo del umbral. Rechaza categorías repetidas y conteos inválidos. La función sirve para probar el contrato con datos sintéticos y no se utiliza para decidir qué información real puede publicarse. Falta validar cortes concurrentes, cruces, historiales, métricas y umbral institucional. No hay endpoint ni umbral implícito.

### Conteo interno de autorización declarada

DF-14. Para un conjunto interno de aplicaciones definitivas de IBITE-17 adolescente, con una entrada por aplicación, se cuentan por separado la autorización declarada, la incertidumbre y el estado omitido. Este conteo técnico no define denominadores de indicadores clínicos, cortes publicables ni criterios de divulgación. Se verifica con datos sintéticos y queda sin ruta pública.
