# Pendientes y plan de ejecución

El estado detallado de módulos sigue en la [matriz de requisitos](02-requerimientos/matriz.md) y el [corte MVP](12-plan-implementacion/corte-mvp.md).

## Plan priorizado de esta sesión

| Orden | Incremento | Condición de cierre |
|---|---|---|
| 1 | Reproducir selectores de orientación de referencia, empezando por IBITE-DA-28 | Trazar columnas del Excel, probar precedencias y selección de claves con entradas sintéticas; conservar códigos internos y dejar los contenidos operativos sujetos a validación |
| 2 | Verificar disponibilidad de PostgreSQL desde Nest y sincronizar contratos | Endpoint técnico sin detalles internos, pruebas de dependencia lista y no disponible, OpenAPI y Postman |
| 3 | Revisar integración, migraciones y controles de regresión | Verificar estado de migraciones, pruebas HTTP, SQL de integridad y PostGIS en sig_test |

## Pendientes con decisión de proyecto

| Área | Pendiente que bloquea el siguiente avance operativo |
|---|---|
| Captura IBITE R02 | Unidad de respuesta en múltiples instituciones, vínculo de acudiente, ventanas, obligatoriedad, consentimiento y correcciones. [Contrato de captura](05-contratos-api/ibite-captura.md) |
| Acceso R01 | Canal, duración, emisión y operador habilitador. [Habilitación](05-contratos-api/ibite-habilitacion.md) |
| Puntuación R04 | Validar tratamiento operativo de señales con faltantes y vigencia de textos, rutas e infografías. Persistencia y consulta individual requieren entidades de aplicación y revisión del contrato de elegibilidad |
| Histórico R03 | Resolver referencias de origen INC-IBITE-01 y 02, cortes, identidad entre exportaciones y conservación de resultados históricos. [Importaciones](09-importaciones/estrategia.md) |
| Consulta psicosocial R07/R14 | Definir caso, episodio o campaña y validar reglas del protocolo de intervención. [Consulta](05-contratos-api/consulta-psicosocial.md) |
| Dashboard R09/R12 | Aprobar agregados, cortes, filtros, nivel geográfico, controles de divulgación y responsable de publicación. [Dashboard](05-contratos-api/dashboard-publico.md) |
| Catálogos, SIG y reportes | Fuentes oficiales, licencias y CRS, permisos de edición y formatos autorizados |
| MTTS, Factibilidad y Matriz | Resolver campos, consolidación, permisos y metodología registrados en el [inventario](01-contexto/inventario.md) |

## Prioridades vigentes del 21 de noviembre

1. Verificar formularios y diccionario por variante, reglas de edad, consentimiento, ventana configurable y vínculo de acudiente. Implementar habilitación y escritura solo con estas reglas verificadas.
2. Diseñar gestión auditada de asignaciones y registro de operaciones relevantes. Aplicar alcance a las futuras consultas de casos, matriz, intervenciones y exportaciones. Validar esquema controlado de salida y servicio de escritura/reprocesamiento antes de usar datos reales.
3. Conciliar INC-IBITE-01/02, fechas, alias y registros incompletos; preparar diagnósticos y revisión del histórico. En paralelo, confirmar la política de divulgación y protocolos de notificación.

Siguiente: obtener formularios y configuración originales, cerrar vínculo verificable y consentimiento, y aprovisionar scope:manage por decisión institucional. La base transaccional y la gestión auditada ya están implementadas. El alcance general de auditoría de otros módulos sigue pendiente.

Las campañas y habilitaciones tienen persistencia y control interno. Quedan la habilitación auditada de participantes por operador autorizado, verificación de vínculo y consentimiento, cuestionarios completos y HTTP de captura.

El lector -23 ya produce diagnóstico local. Faltan el perfil DA-28, la resolución auditada de alias e incidencias y la aprobación del contrato de lotes antes de habilitar importación por HTTP.

Adaptadores locales Manizales -23 y DA-28 verificados. La revisión auditada necesita confirmar autoridad, decisiones permitidas, cortes e impacto de una resolución en la publicación.

Registro técnico interno disponible. Pendiente designar responsables de revisión, confirmar motivos y reglas de resolución, autorizar el contrato HTTP y decidir cómo una resolución afecta el corte publicable.

Cerrados el listado de asignaciones, cursores de auditoría/resultados y verificación de contrato. La captura HTTP requiere originales, consentimiento y aprovisionamiento. El helper de agregados no aprueba la publicación real. Consultar [reporte de sesión](REPORTE_SESION_AUTONOMA.md).

Captura: detalle, acuse y reintento interno disponibles. Formulario y POST requieren originales y validación de consentimiento. Histórico: alias directos y ortográficos sujetos a revisión del custodio.

La validación técnica de entrada y la reproducción interna se pueden probar sin formulario. El siguiente avance operativo sigue requiriendo originales, consentimiento y aprovisionamiento de acudientes. El histórico necesita aprobación de revisiones y publicación.

## Cuarto lote

La captura interna de DA-28 tiene cobertura de persistencia y acuse. Para habilitar la captura HTTP siguen pendientes los formularios verificados, el consentimiento y la vinculacion. La importacion y divulgacion con datos reales mantienen sus dependencias de custodia.

## Quinto lote

Quedaron verificadas la unicidad entre instituciones y variantes y la reproducción de DA-28. El envío HTTP, la importación real y la publicación quedan sujetos a las decisiones consignadas arriba.

## Insumos recibidos para el posttest IBITE-17

DF-08 a DF-10. Confirmados diez instituciones y responsable de habilitación masiva de estudiantes. El posttest del Periodo 2 está confirmado del 25 de noviembre al 10 de diciembre de 2026 según DF-13. Revisadas las capturas de cuidador y adolescente del Word. Quedan pendientes configuración de saltos y obligatoriedad por fila, verificación del vínculo, manejo operativo de negativas de autorización y cambios de decisión, texto de consentimiento definitivo, identificadores oficiales de institución. El formulario de DA-28 se entregará después. Ver [verificación de formularios](06-reglas-negocio/verificacion-formularios-ibite.md).

## Apertura operativa después del recorrido REST sintético

1. El inventario v1 de adolescente y acudiente fija textos exportados, preguntas y mapeo a puntuación. Obtener la configuración oficial, validar sus opciones, obligatoriedad y saltos por rama y cerrar la versión operativa de captura.
2. La negativa de participación ya se registra en el recorrido sintético (DF-11). Definir conservación, tratamiento de la negativa de autorización del representante, cambios de decisión y vinculación del acudiente.
3. Configurar piloto, calendario y operador de habilitación con las instituciones priorizadas.
4. Incorporar el formulario DA-28 cuando se reciba la fuente original. La persistencia y el motor DA-28 ya están probados internamente.

## Después de la demostración IBITE-17

1. Confirmar la pregunta 23 en la configuración activa. El PDF la muestra sin asterisco y el Word la muestra obligatoria. Definir el flujo para respuesta omitida y negativa explícita.
2. Confirmar saltos no visibles, obligatoriedad por fila y el aviso aplicable al posttest. Resolver el procedimiento de vínculo y habilitación de acudientes.
3. Usar el calendario confirmado del Periodo 2, asociar instituciones por identificador e implementar los permisos operativos. Revisar por separado el protocolo de atención, destinatarios y canales antes de activar notificaciones reales.

La vista de respondiente publicada confirmó la obligatoriedad de las 34 filas puntuables, las escalas v2 y los destinos de la pregunta 23. Ver [configuración del formulario publicado](06-reglas-negocio/verificacion-formularios-ibite.md#configuración-del-formulario-publicado).

El aviso actual queda confirmado (DF-15). DF-16 confirma el par nombre del estudiante y Teléfono de contacto de la encuesta, con coincidencia única esperada. Falta identificar el listado institucional autorizado de referencia. Para DF-17 queda especificar la interacción entre el control manual y la ventana, e implementar el permiso auditado.

## Alcance operativo de IBITE después del control de campañas

- Disponible el control auditado de campañas IBITE-17 con permiso expreso y pertenencia institucional. El control manual opera dentro de la ventana confirmada. Quedan el aprovisionamiento de la cuenta y las diez campañas reales.
- Disponible la negativa explícita del representante en la captura sintética. Para usar la captura con datos reales quedan el formulario operativo, la política de cambios de decisión y la habilitación autorizada.
- Pendientes el lote masivo y la búsqueda de vínculo. Se necesita el formato o un ejemplo sintético del padrón institucional que contenga los identificadores y el par nombre del estudiante y Teléfono de contacto. El formato histórico con respuestas no se puede presumir como padrón autorizado.
- DA-28 mantiene su cálculo y persistencia internos. El formulario original de docentes y administrativos sigue pendiente para la captura REST.

## Hallazgos del archivo padron.xlsx

Confirmada la estructura histórica de cinco columnas, con Codigo vacío, etiquetas institucionales sin normalizar y pares repetidos. El resultado se documentó en la [estrategia de importación](09-importaciones/estrategia.md#perfil-estructural-del-archivo-padronxlsx). El archivo es histórico de referencia. Sus candidatos repetidos se consideran únicamente en la conciliación histórica, sin fusionar filas originales.

### Prioridad vigente de apertura

DF-18 elimina el padrón como puerta de entrada. El siguiente bloque es la creación de una habilitación al iniciar dentro de una campaña activa, con consentimiento y unicidad de aplicación. La conciliación histórica es independiente de la apertura del Periodo 2.

### Después del inicio autónomo

El inicio de estudiantes con sesión en campaña abierta ya está disponible y probado con datos sintéticos. Para abrir el piloto faltan el acceso inicial sin preparación individual por operador, la captura operativa y el inicio de acudiente con vínculo verificable. DA-28 aún espera el formulario oficial. La muestra histórica queda fuera de la apertura.

DF-19. El acceso inicial se resolvió funcionalmente como enlace público sin cuenta previa. Implementación pendiente de sesión de captura y criterio de reconocimiento entre sesiones. Se conserva el inicio autenticado ya implementado.

### Identificación declarada por enlace

Se verificó el inicio público sintético con documento. Para habilitación operativa quedan la clave estable, controles de abuso y recuperación, formularios oficiales cargados en el arranque real y la vinculación histórica cuando exista un identificador verificable. DA-28 continúa separado.

## Preparación de la presentación IBITE

La demostración manual dispone de comando local, campañas sintéticas para las dos ramas y credencial psicosocial de prueba. Tiene una prueba de reinicio en procesos separados de Node. Paso operativo restante: usar los formularios oficiales en el arranque real, aprovisionar la campaña e instituciones, administrar la clave de captura y definir el control de abuso del endpoint público. El formulario oficial DA-28 sigue pendiente de entrega.

## Lista vigente para cerrar IBITE

Consultar [CIERRE_IBITE.txt](CIERRE_IBITE.txt) para distinguir los insumos pendientes, el trabajo técnico y las comprobaciones de salida. Esta lista refleja las decisiones posteriores de apertura por enlace y sustituye los pendientes anteriores de padrón previo y habilitación individual.

El aprovisionamiento del Periodo 2 cuenta con una [comprobación de solo lectura](08-pruebas/preparacion-piloto-ibite17.md). Queda ejecutar la preparación con el catálogo autorizado y la cuenta designada antes de crear campañas operativas.

### Captura con ítems de referencia

El modo de previsualización local ya conecta las 17 preguntas puntuables de cada rama al recorrido REST. Pendientes las secciones oficiales de aviso y contexto, su validación en el arranque operativo y la preparación con el catálogo institucional autorizado y la cuenta de Felipe.

## MTTS Formato A

La primera captura semanal ya cuenta con definición versionada, POST, acuse y consulta interna. Consultar [contrato REST](05-contratos-api/mtts-formato-a.md). El siguiente corte debe validar con el equipo el catálogo de sedes, las condiciones de obligatoriedad de textos, el flujo de correcciones y la prueba cognitiva del instrumento. Las alertas del anexo quedan pendientes de aprobación del comité.

Para las alertas MTTS quedan aprobación del comité, confirmación de la unidad de recurrencia y de las fuentes operativas, y pruebas del futuro motor con fichas sintéticas. Ver [especificación](06-reglas-negocio/mtts-alertas-formato-a.md).

MTTS Formato A cuenta con captura, consulta y resumen descriptivo por institución. Siguen pendientes las decisiones de sedes y correcciones para uso rutinario. Las alertas ya están especificadas y quedan pendientes de aprobación del comité.

MTTS cuenta con tendencia por inicio de semana y filtro por sede textual. Falta la resolución de alias con catálogo oficial, el procedimiento de correcciones y la aprobación de alertas. Las tendencias descriptivas se pueden consultar con fichas sintéticas.

### Factibilidad del taller

El [inventario parcial](06-reglas-negocio/factibilidad-taller.md#consulta-de-evidencia-por-rest) ya está disponible por API interna. El siguiente corte requiere el enlace del formulario vacío de Jugar para cuidar o capturas de configuración con todas las filas, opciones y obligatoriedad de ambas rejillas. Falta resolver el alcance de una evaluación que seleccione varias instituciones y la unidad de registro.

Las capturas nuevas de Factibilidad aportaron ambas escalas y los enunciados completos visibles. Para pasar a escritura queda confirmar que son todas las filas, su obligatoriedad individual, la unidad y los permisos de una ficha con varias instituciones.

Factibilidad ya cuenta con captura y detalle de una evaluación por institución. Pendientes la identificación de talleres repetidos, correcciones y cualquier indicador derivado. La asistencia se conserva como texto corto de la fuente.

Factibilidad cuenta con listado por fecha y reintento seguro por clave. Quedan la identificación de dos fichas del mismo taller, correcciones e indicadores. Ver [contrato](06-reglas-negocio/factibilidad-taller.md#listado-y-reintentos-de-factibilidad).

H-41. Quedan documentadas como evidencia las definiciones pendientes de Factibilidad: duplicados de negocio, correcciones e indicadores. Para Matriz de resultados se trazaron sus 96 columnas y se propone una consulta restringida. Faltan unidad, fuente de vinculación y autorización por disciplina antes de guardar expedientes.

La preparación técnica de la Matriz tiene inventario y revisión de coordenadas ejecutable. Queda la decisión de unidad, acceso disciplinario y fuente autorizada de vínculo. Fichas de campo puede iniciar en paralelo al disponer de la plantilla vacía. Ver [avance global](AVANCE_GLOBAL.md).

Se automatizó el ensayo de respaldo y restauración sintéticos. Quedan procedimiento institucional, destino protegido, retención y validación de recuperación en la infraestructura del piloto. Fichas de campo sigue pendiente de la plantilla.

SIG cuenta con consulta interna de puntos institucionales de prueba. Quedan archivo o servicio geográfico oficial, metadatos, CRS y permisos de uso, proceso de importación y capas adicionales. Fichas de campo sigue pendiente de su plantilla.

La revisión previa del SIG ya puede ensayarse con GeoJSON de puntos y códigos institucionales. Pendientes la entrega de la capa oficial con su ficha técnica y permisos, la validación del catálogo correspondiente y el procedimiento de carga.

## Fichas de campo

Recibidos el Word de diligenciamiento y el PDF de categorías. Ya se puede verificar la integridad de las referencias S/H/L con un lote técnico. Queda confirmar el formato que se diligenciará, la ficha espacial ausente del Word sin recorrido y la estructura de recomendaciones. Ver [especificación](06-reglas-negocio/fichas-de-campo.md).

El equipo diligenciará Fichas de campo en Excel. El validador ya revisa el diseño inicial de tres hojas. Quedan la plantilla final con categorías y recomendaciones, el catálogo institucional, la ficha espacial y el flujo REST de importación.

R08. El formato de carga definitivo se basará solo en el PDF de categorías. La plantilla de tres hojas y su validador son antecedentes. Pendiente cotejo del Excel para cerrar encabezados, niveles y procedencia por hoja y fila.

SIG cuenta con vista previa, carga transaccional sintética y consulta en GeoJSON. Para la carga operativa quedan fuente y catálogo autorizados, metadatos y tratamiento de actualizaciones. El tablero queda a cargo de frontend.

SIG recibió MapasCompilados.zip. Las capas de instituciones y microzonificación contienen datos WGS84. Para vincular las sedes al sistema queda el cruce DANE con el catálogo interno. Las capas de amenaza/riesgo y deslizamiento requieren una exportación con entidades.

La microzonificación de 2002 cuenta con catálogo público, consulta espacial, plan de solo lectura y comando de carga explícita. Queda ejecutar la carga con credenciales autorizadas al preparar el despliegue. Para sedes, el plan de solo lectura detecta discrepancias con el catálogo activo cuando exista el cruce DANE.

El inicio por enlace de IBITE incluye un límite por proceso probado en la demostración. La apertura operativa requiere el formulario oficial completo, la clave estable y el límite compartido en la infraestructura que se use. El plan de despliegue puede revisar periodo y operador con acceso de solo lectura.
