# Matriz inicial

Confirmado significa solicitado en el PM. La aceptación de cada fila es una propuesta a verificar en su incremento.

| ID | Módulo | Tipo | Prioridad | Fuente | Validación | Dependencias | Requisito | Aceptación propuesta |
|---|---|---|---|---|---|---|---|---|
| R01 | Identidad | F | P0 | PM §5.1 | Confirmado | I04, I05 | Autenticar y autorizar por permiso y ámbito | Cuenta inactiva y acceso cruzado se rechazan; acción autorizada queda auditada |
| R02 | IBITE | F | P0 | PM §5.2 | Confirmado | R01, I01, I04 | Capturar IBITE por versión, institución y periodo; preservar respuestas | Respuestas válidas persisten; pregunta ajena a versión y duplicado según regla aprobada se rechazan |
| R03 | Histórico | F | P0 | PM §5.2 | Confirmado | R02, I03 | Importar con trazabilidad, conciliación e idempotencia | Total leído conciliado por estado y repetición sin duplicados |
| R04 | Puntuación | F | P1 | PM §5.3 | Confirmado | R02, I02 | Reproducir puntuación y criticidad con reglas versionadas | Casos de referencia aprobados coinciden, incluidos límites y faltantes |
| R05 | MTTS | F | P1 | PM §5.4 | Confirmado | R01, I06 | Diligenciar formulario independiente | Esquema oficial validado y perfiles no habilitados rechazados |
| R06 | Factibilidad | F | P1 | PM §5.4 | Confirmado | R01, I07 | Registrar factibilidad por equipo psicosocial autorizado | Se acepta entrada válida y se deniega a otros perfiles |
| R07 | Resultados | F | P1 | PM §5.5 | Confirmado | R01, I08, I12 | Registrar matriz y vincular contexto de intervención | Se valida relación con institución, actividad y periodo según especificación |
| R08 | Fichas | F | P1 | PM §5.6 | Confirmado | R01, I09, I04 | Validar, cargar y consultar fichas con procedencia | Archivo inválido deja cero cambios en datos publicados y el intento queda registrado |
| R09 | Analítica | F | P1 | PM §5.7 | Confirmado | R04–R08 según métrica, I11 | Exponer indicadores agregados con filtros autorizados | Resultados contrastados con ejemplos y pruebas de inferencia |
| R10 | SIG | F | P1 | PM §5.8 | Confirmado | I04, I10 | Catalogar fuentes y entregar entidades filtradas | GeoJSON validado, CRS verificable y semántica publicada |
| R11 | Reportes | F | P2 | PM §5.9 | Confirmado | I13, R01, fuente de cada reporte | Generar reportes autorizados y auditar exportación sensible | Archivo coincide con alcance y deja evento de auditoría |
| R12 | Privacidad | NF | P0 | PM §6 | Confirmado | I05 | Minimizar datos, restringir casos, proteger secretos y respaldos | Pruebas de acceso negativo, inspección de registros y restauración aislada |
| R13 | Verificación | NF | P0 | PM §7–8 | Confirmado | Incremento autorizado | Contrato trazable y pruebas automatizadas | OpenAPI, pruebas y colección coinciden con rutas entregadas |
| R14 | Intervención | F | P1 | PM §4, §5.5 y §5.7 | Confirmado | R01, I12 | Registrar y consultar seguimiento autorizado | Transiciones y responsables verificables contra protocolo |

## Vacíos de información

| ID | Afecta | Estado | Definición pendiente |
|---|---|---|---|
| V01 | R02–R04, R09 | Pendiente | Separar campaña ordinaria, línea base y retamizaje del piloto; conciliar 7.345 estudiantes con el estimado de registros |
| V02 | R01, R12 | Pendiente | Custodia, finalidades, conservación, autorización, canal de credenciales y pertenencia a múltiples instituciones |
| V03 | R02, R03 | Pendiente | Unidad de respuesta, parciales, reintentos, identidad longitudinal y clave de deduplicación |
| V04 | R04, R09 | Pendiente | Fórmulas, umbrales, denominadores, comparabilidad y política de protección de agregados |
| V05 | R05–R08, R14 | Pendiente | Versiones de formularios, reglas de aplicación, estados y alcance de intervención |
| V06 | R10, R11 | Pendiente | Autoridad y licencia de capas, CRS, entregables y formato de cada reporte |
| V07 | R09, R14 | Pendiente | Convivencia o integración con Censo Digital y autoridad de datos por sistema |

### Alcance confirmado tras revisar insumos

R05 queda acotado al Formato A de seguimiento semanal por institución/sede. R06 usa las capturas como fuente parcial para Factibilidad, con la denominación de fidelidad del taller pendiente de conciliar. R04 tiene como fuente confirmada el libro IBITE Manizales (respuestas)-23.xlsx. Queda pendiente verificar la reproducción de su lógica con casos sintéticos de referencia. R07 cuenta con la matriz y su guía como insumos de especificación.

R05: disponible el [borrador de captura y aceptación del Formato A](../06-reglas-negocio/mtts-formato-a.md).

R06: disponible el [borrador parcial de Factibilidad del taller](../06-reglas-negocio/factibilidad-taller.md). Consultar el [registro de hallazgos](../01-contexto/hallazgos.md) para decisiones pendientes.

R07: disponible el [borrador de la Matriz Piloto La Merced](../06-reglas-negocio/matriz-resultados.md).

### Decisiones de acceso confirmadas

R01 y R02: Estudiante, Acudiente, Orientador y Docente solo tienen permiso interno para completar IBITE; el Equipo de Apoyo Psicosocial puede consultar toda la información. R09: el dashboard es público por URL. R12: están pendientes la custodia, el alcance institucional, las operaciones de escritura/exportación y las condiciones de publicación de agregados. Ver [permisos y custodia](../07-seguridad/permisos-custodia.md).

R02: Docente, Administrativo y Orientador usan IBITE-DA-28. R01: el Equipo de Apoyo Psicosocial tiene acceso y facultades operativas amplias en la etapa inicial. La cobertura de todas las instituciones se registra como interpretación inicial para revisión. Ver [permisos y custodia](../07-seguridad/permisos-custodia.md).

R01 y R12: la Universidad de Manizales es el custodio confirmado. La base alojará los datos completos y el acceso a registros individuales corresponde exclusivamente al Equipo de Apoyo Psicosocial de la Universidad. R09 conserva la consulta pública de indicadores aprobados.

R02: disponible el [contrato candidato de captura IBITE](../05-contratos-api/ibite-captura.md). Pendientes la unidad de respuesta, los permisos de habilitación, las ventanas y la obligatoriedad por variante.

R09: disponible el [borrador de contrato del dashboard público](../05-contratos-api/dashboard-publico.md), con métricas candidatas y criterios de divulgación.

R03: disponible el [contrato candidato de importación histórica](../05-contratos-api/ibite-importacion-historica.md), con tratamiento explícito de las incidencias 01 y 02.

R01, R04, R07, R11, R12 y R14: disponible el [contrato candidato de consulta interna psicosocial](../05-contratos-api/consulta-psicosocial.md).

R04: implementada internamente la codificación y el cálculo AI:AV de [IBITE-17](../06-reglas-negocio/ibite-puntuacion.md). Quedan pendientes perfil, riesgo, orientación, persistencia y autorización operativa.

R04: implementadas la codificación, completitud de ítems núcleo y dimensiones de [IBITE-DA-28](../06-reglas-negocio/ibite-da-puntuacion.md). Pendientes elegibilidad, perfil, riesgo, orientación y persistencia.

R04: implementadas completitud y clasificación de referencia para IBITE-17 e IBITE-DA-28, incluido el tipo principal de riesgo DA. Las recomendaciones, el uso operativo de alertas y la persistencia siguen pendientes.

## Matriz de trazabilidad del 21 de noviembre

| Decisión | Requisitos | Especificación y evidencia | Estado |
|---|---|---|---|
| DF-01, DF-02 | R01, R02 | [Captura](../05-contratos-api/ibite-captura.md), unicidad de aplicación por participante, instrumento y periodo | Base de datos y rol Directivo. Captura y vínculo pendientes |
| DF-03 | R01, R04, R07, R11, R12, R14 | [Resultados](../05-contratos-api/ibite-resultados.md), asignaciones y prueba de acceso cruzado | Consulta de resultados probada con datos sintéticos. Gestión auditada y otros recursos pendientes |
| DF-04 | R04, R12 | [Reglas de puntuación](../06-reglas-negocio/validacion.md), cálculo separado de observaciones | Implementación interna; notificaciones deshabilitadas |
| DF-05 | R03 | [Estrategia histórica](../09-importaciones/estrategia.md), inspección de encabezados y catálogo | Sin importación real. Pendientes correspondencias y revisión |
| DF-06 | R09, R12 | [Dashboard](../05-contratos-api/dashboard-publico.md) | Contrato público candidato. Consulta privada y política de divulgación pendientes |
| DF-07 | R02, R04 | [Modelo conceptual](../04-modelo-datos/conceptual.md), migración de aplicaciones y resultados | Relaciones y consulta. Escritura y auditoría pendientes |

Ver [decisiones funcionales](decisiones-2026-11-21.md).

R01/R02/R03/R04/R12: [asignaciones auditadas](../05-contratos-api/asignaciones-psicosociales.md), [persistencia y requisitos de formulario](../06-reglas-negocio/verificacion-formularios-ibite.md) y [conciliación histórica](../09-importaciones/conciliacion-ibite-manizales.md).

R02 y HAB-04: operativa la consulta de habilitaciones propias. Comparte el filtro de vigencia con la persistencia. La lectura del formulario y el envío por HTTP siguen pendientes.

R03: implementado el diagnóstico interno de conciliación de respuestas, cálculos y alias. La publicación y el flujo de revisión continúan pendientes.

R01/R12: implementada [lectura de auditoría por institución asignada](../05-contratos-api/auditoria-institucional.md).

R01/R04/R09/R12/R13: listado autorizado de asignaciones, paginación de auditoría y resultados, helper sintético de supresión y paridad Postman/OpenAPI verificados. Ver [reporte de sesión](../REPORTE_SESION_AUTONOMA.md).

CAP-02/04/05/06 y R03: detalle y acuse de habilitación, reintento interno con huellas y sugerencias ortográficas verificados. El contrato HTTP de envío y la adjudicación de alias siguen pendientes.

R02/R04/R12: validadas entradas internas, aislamiento entre dos respondientes y reproducción de una aplicación ya enviada con auditoría. R03: las filas con anclaje no resuelto permanecen visibles en diagnóstico versión 2. R13: verificación desechable automatizada.

R01/R12: comprobacion compartida de cuenta, rol, permiso y alcance institucional en la consulta del objeto. R02/R04: cobertura integral sintetica de DA-28 para almacenamiento, resultado versionado, reintento y acuse. Ver el [cuarto lote](../REPORTE_SESION_AUTONOMA.md#cuarto-lote-autónomo).

R02/CAP-04/05: unicidad definitiva verificada entre instituciones, variantes y respondientes. R04/R12: verificada la coincidencia de procedencia para recálculo DA-28 y el rechazo de cursores de otra aplicación. Ver el [quinto lote](../REPORTE_SESION_AUTONOMA.md#quinto-lote-autónomo).

DF-11 a DF-13 · R02/R12. Confirmados el registro de negativas y el mismo consentimiento de la variante adolescente para estudiantes mayores de edad. La apertura operativa queda pendiente de fecha y hora. Consultar [decisiones del posttest](decisiones-2026-11-21.md#consentimiento-y-programación-del-posttest) y [criterios propuestos de captura](../05-contratos-api/ibite-captura.md#criterios-propuestos-para-registrar-consentimiento).

DF-14 · R02/R09/R12. La [captura interna](../05-contratos-api/ibite-captura.md#persistencia-interna-de-la-autorización-declarada) conserva el estado incierto y las respuestas. El [conteo interno](../05-contratos-api/dashboard-publico.md#conteo-interno-de-autorización-declarada) mantiene categorías separadas. Verificación sintética, sin habilitar publicación ni captura HTTP.

### CAP-01 a CAP-06 en el entorno de pruebas

R01/R02/R04/R12. El [recorrido REST sintético](../05-contratos-api/ibite-captura.md#recorrido-integrado-en-entorno-sintético) enlaza formulario, decisión de aceptación, captura versionada, resultado, auditoría y acuse para IBITE-17 adolescente. Las dos rutas nuevas solo se registran en el entorno de pruebas. El registro previo de negativas y la captura operativa por variante quedan pendientes.

DF-11 · R02/R12 · CAP-02/CAP-05. [Negativa de participación](../05-contratos-api/ibite-captura.md#negativa-de-participación-antes-del-envío) implementada para el recorrido sintético. Se comprueban reintentos, aislamiento, revocación y exclusión mutua con la finalización.

R02/R04/R12 · CAP-01 y CAP-03. Versionada la evidencia de las dos variantes con 34 ítems y las referencias a puntuación contrastadas. La activación operativa queda pendiente de configuración y validaciones de consentimiento y vínculo. Ver [inventario y criterios pendientes](../06-reglas-negocio/verificacion-formularios-ibite.md#inventario-de-referencia-versionado).

R02/R04/R09/R12 · DF-14. La evidencia v2 vincula las rejillas del PDF con los 34 ítems de ambas ramas. [Prueba integrada](../08-pruebas/demo-ibite17-post.md) de POST, acuse, señal de seguridad en resultado versionado y acceso institucional. Ante autorización incierta se guardan las respuestas y la declaración. Activación real pendiente de resolución de diferencias entre fuentes y reglas del piloto.

DF-15 a DF-17 · R01/R02/R12. Aviso actual confirmado. Nombre y teléfono para búsqueda del vínculo. Activación y desactivación de campaña por operador designado. Ver [criterios propuestos](../05-contratos-api/ibite-habilitacion.md#vinculación-y-gestión-de-campaña).

DF-11/DF-14/DF-17 · R01/R02/R12. Se implementaron el [control auditado de campañas](../05-contratos-api/ibite-campanas.md), la comprobación de pausa en el flujo de captura y el [registro sintético de negativa del representante](../05-contratos-api/ibite-captura.md#negativa-de-autorización-del-representante). La incertidumbre mantiene el envío.

DF-18 · R01/R02/R12. Apertura por campaña para participantes nuevos y anteriores, sin aprobación individual ni padrón como condición de entrada. Ver [inicio en campaña abierta](../05-contratos-api/ibite-habilitacion.md#inicio-de-una-aplicación-en-campaña-abierta).

DF-18 · R01/R02/R12. Implementado el [inicio autónomo de estudiante](../05-contratos-api/ibite-habilitacion.md#inicio-autónomo-de-estudiante-implementado) en campaña abierta. Sin consulta del padrón. Probado con envío REST sintético y una cuenta nueva.

DF-19 · R01/R02/R12. Confirmada la entrada pública por enlace, sin cuenta previa. Pendientes el contrato de sesión de captura y el criterio de unicidad entre sesiones. Ver [acceso directo](../05-contratos-api/ibite-habilitacion.md#acceso-directo-desde-un-enlace).

DF-19/DF-20 · R01/R02/R12. [Inicio sin cuenta con identificación declarada](../05-contratos-api/ibite-habilitacion.md#inicio-sin-cuenta-con-identificación-declarada) integrado a la captura sintética de ambas ramas. Los resultados históricos siguen separados y los documentos no se guardan en claro.

DF-10/DF-13/DF-17 · R01/R02/R12. [Preparación del piloto](../08-pruebas/preparacion-piloto-ibite17.md) con diagnóstico por institución, variante, calendario y alcance del operador. Verificación sintética y CLI de solo lectura.

R02/R04/R12 · CAP-01/CAP-03/CAP-06. Los 34 enunciados puntuables y sus escalas de evidencia v2 se exponen y prueban con ambos perfiles en la [demostración con ítems de referencia](../08-pruebas/demo-ibite17-post.md#presentar-los-ítems-de-referencia). Captura operativa completa pendiente.

R05 · MTTS-A-01 a MTTS-A-04. Disponible el [contrato REST de Formato A](../05-contratos-api/mtts-formato-a.md). Se verifican consulta, persistencia semanal por profesional, competencia concurrente por la misma clave, rechazo fuera de alcance, NA, faltante y conteo cero. Los umbrales de alerta esperan validación del comité.

R05 · MTTS-AL-01 a MTTS-AL-04. Definidos los disparadores y nueve casos de aceptación en la [especificación de alertas MTTS](../06-reglas-negocio/mtts-alertas-formato-a.md). Estado documental, pendiente de aprobación e implementación.

R05. Listado y resumen interno de MTTS por institución e intervalo. Aceptación: paginación estable, cálculo de mediana sobre valores válidos, NA y faltantes separados, opciones contadas por ficha, corte vacío y denegación tras revocación. Ver [contrato](../05-contratos-api/mtts-formato-a.md#listado-y-resumen-por-intervalo).

R05. [Tendencia semanal y filtro por sede](../05-contratos-api/mtts-formato-a.md#filtros-por-sede-y-tendencia-semanal) usan la clave semanal capturada, preservan denominadores semanales y verifican cursores en el mismo filtro.

R06 · FACT-A-01 a FACT-A-04. [Consulta REST de evidencia parcial del taller](../06-reglas-negocio/factibilidad-taller.md#consulta-de-evidencia-por-rest) con permiso y alcance institucional. Las rejillas truncadas siguen marcadas como incompletas. Captura y cálculo pendientes del formulario completo y validación multiinstitucional.

R06 · FACT-A-02. La versión de evidencia 2 agrega siete enunciados visibles de preparación y tres de participación, con sus escalas. Quedan cobertura y obligatoriedad por fila y el contrato multiinstitucional.

R06. [Captura de una evaluación por institución](../06-reglas-negocio/factibilidad-taller.md#captura-de-una-evaluación-por-institución) implementada para una sola institución y diez filas obligatorias. Verificados acuse, persistencia, detalle y alcance institucional.

R06. [Listado y reintentos de Factibilidad](../06-reglas-negocio/factibilidad-taller.md#listado-y-reintentos-de-factibilidad) con fechas de taller, cursor, auditoría e idempotencia opcional. Dictamen de duplicados de negocio y flujo de corrección pendientes.

R07/R12/R14. [Inventario v1 de la Matriz de resultados](../06-reglas-negocio/matriz-resultados-evidencia.v1.json) trazado a 96 coordenadas del Excel. Verificadas separación de sugerencias y procedencia, cobertura de columnas y ausencia de filas de casos. Contrato inicial de consulta en revisión.

R07/R12/R14. Disponible la [revisión de coordenadas IBITE](../06-reglas-negocio/matriz-resultados.md#revisión-técnica-de-procedencia) con pruebas sintéticas de lotes, ambigüedad y cadenas faltantes. No crea vínculos ni atenciones.

R12/R13. [Ensayo de recuperación](../08-pruebas/recuperacion-datos.md) integrado al entorno desechable. Compara contenido de IBITE, MTTS, Factibilidad y auditoría después de restaurar, además del esquema migrado y PostGIS. Infraestructura y políticas institucionales pendientes.

R10/R12. [Consulta SIG institucional](../10-georreferenciacion/criterios.md#consulta-interna-de-puntos-institucionales) con caja espacial y GeoJSON WGS84, permiso vigente y auditoría. Aceptación sintética. Las capas oficiales esperan sus fuentes.

R10. [Revisión local del GeoJSON](../10-georreferenciacion/criterios.md#validación-local-previa-de-una-capa-de-puntos) con reporte por posición, filtros de geometría y validez, códigos de catálogo y duplicados. Casos sintéticos. La escritura espera fuente oficial y decisión de actualización de capas.

R08/R10/R12. [Ficha de campo y taxonomía](../06-reglas-negocio/fichas-de-campo.md) cotejadas. Revisión local de sesión y vínculos H/L, con pendientes de estructura de importación, ficha espacial y cardinalidad de recomendaciones.

R08. Confirmada carga XLSX. [Vista previa](../06-reglas-negocio/fichas-de-campo.md#revisión-previa-de-excel) valida estructura y referencias con reporte de hoja y fila. Quedan plantilla final, permisos de carga y persistencia transaccional.

R10. Carga transaccional de puntos probada contra PostGIS aislado. [Contrato de carga](../10-georreferenciacion/criterios.md#carga-transaccional-de-una-capa-de-prueba). Queda capa oficial y acuerdo sobre sustitución de versiones.

R10. [Inventario del ZIP de mapas](../10-georreferenciacion/inventario-mapas-compilados.md) con geometría y CRS de dos capas y diagnóstico de dos tablas vacías. No se ejecutó carga institucional.

R10. [Inventario DANE y conversión controlada](../10-georreferenciacion/inventario-mapas-compilados.md#inventario-de-sedes-y-conversión-controlada) de las 21 sedes con correspondencia explícita y pruebas de geometría y procedencia.

R10. [Conversión local de microzonificación](../10-georreferenciacion/inventario-mapas-compilados.md#microzonificación-disponible-para-revisión-local) con atributos de origen, WGS84 y revisión estructural. Pendiente topología, metadatos y consulta espacial en PostgreSQL.

R10. Confirmados el año 2002 y permiso de publicación de las capas del ZIP. Topología por entidad aprobada en PostGIS para los 139 polígonos. La descripción de P difiere entre el archivo y la confirmación del proyecto. Ver [leyenda y validación](../10-georreferenciacion/inventario-mapas-compilados.md#leyenda-año-y-validación-topológica).

R10. [Consulta pública de microzonificación](../05-contratos-api/sig-microzonificacion.md). La etiqueta P confirmada queda en el contrato público y se retiene la descripción fuente. La aceptación cubre carga atómica, repetición, GeoJSON paginado, filtro espacial y rechazo de parámetros inválidos en PostGIS aislado.

R10. El catálogo del visor lista las capas públicas cargadas. Las verificaciones de solo lectura anticipan inserciones y bloqueos de microzonificación y puntos institucionales contra PostgreSQL.

R01/R12. El inicio público sintético aplica una cuota por conexión de origen y responde 429 con tiempo de espera al agotarla. El plan previo de IBITE usa una transacción de solo lectura con verificación del operador.
