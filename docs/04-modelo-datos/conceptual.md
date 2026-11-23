# Modelo conceptual preliminar

| Entidad candidata | Atributos principales | Relaciones y decisiones abiertas |
|---|---|---|
| Cuenta, credencial, rol y permiso | ID opaco, estado, vigencia, tipo de credencial, código de permiso | Cuenta N:M roles por ámbito mediante asignación; rol N:M permisos. Separar personas evaluadas y cuentas si la custodia y el flujo lo requieren |
| Institución y periodo | Código, nombre oficial, sector, vigencia, fechas | Institución 1:N sedes si el catálogo las distingue. La pertenencia cuenta–institución puede ser N:M y temporal |
| Instrumento, versión, pregunta y opción | Código, versión, estado, código de ítem y orden | Instrumento 1:N versiones, versión 1:N preguntas, pregunta 0:N opciones. Versiones publicadas inmutables |
| Campaña y aplicación individual | Tipo, ventana, institución, identificador de participante cuando proceda, estado | Campaña N:1 periodo y versión; campaña 1:N aplicaciones; aplicación N:1 institución. Cobertura institucional y cardinalidad por participante pendientes |
| Respuesta | Aplicación, pregunta, valor original y procedencia | Aplicación 1:N respuestas de ítem; máximo una entrada lógica por pregunta, sujeto a la estructura oficial. Ítem y opción deben pertenecer a la versión aplicada |
| Regla de puntuación y resultado | Versión, referencia metodológica, ejecución, puntuación y clasificación | Una aplicación puede tener varios resultados históricos; cada resultado referencia la regla aplicada y conserva procedencia |
| Intervención, actividad y registro de matriz | Fechas, responsables, estado, institución y periodo | Institución 1:N intervenciones; intervención 1:N actividades si lo confirma el protocolo. Vínculo a evaluaciones condicionado a metodología y custodia |
| MTTS y factibilidad | Versión, autor autorizado y contexto | Registros independientes; ambos N:1 a institución y periodo en el modelo candidato. Factibilidad puede vincularse a intervención |
| Archivo, lote, error de fila y ficha | Huella, procedencia, estado, fecha, referencia de origen y clave validada | Archivo 1:N intentos; intento 1:N incidencias y registros aceptados. Ficha vinculada a institución y eventualmente entidad espacial |
| Capa, versión y entidad espacial | Fuente, licencia, CRS, vigencia, ID de origen y geometría | Capa 1:N versiones; versión 0:N entidades almacenadas. Asociación a institución según semántica y precisión |
| Evento de auditoría | Actor, fecha, acción, objeto opaco, ámbito y resultado | Trazabilidad de operaciones sensibles con acceso restringido |

Normalizar códigos, alias, catálogos, relaciones y procedencia. Riesgos de duplicidad: sedes con nombres similares, mismas filas en exportaciones diferentes, reintentos concurrentes, variantes por población y solapamiento entre línea base y seguimiento. Usar claves de fuente y claves de negocio validadas por separado. Revisar obligatoriedad, unicidad compuesta, integridad referencial y política de conservación antes del esquema físico.

El [modelo mínimo de identidad y catálogos](identidad-catalogos.md) describe el alcance de la primera migración Prisma.

## Instrumentos y versiones de referencia

R02/R04. Persistencia de metadatos confirmados. Instrument identifica IBITE-17 e IBITE-DA-28 por código estable. InstrumentVersion identifica cada referencia por instrumento, variante y clave de fuente; registra la cantidad de ítems, la versión de reglas y el SHA-256 del archivo. IBITE-17 tiene variantes cuidador y adolescente. DA-28 usa una sola variante para docentes, administrativos y orientadores. El código de fuente identifica la referencia de trabajo y no equivale a una publicación de formulario.

La semilla crea las referencias de forma transaccional e idempotente. Si la referencia ya existe con metadatos distintos, aborta: una corrección necesita una nueva clave de versión. Los conteos se limitan a los positivos. No se almacenan preguntas, opciones, respuestas, archivos ni datos nominales. La habilitación y las aplicaciones conservan sus decisiones pendientes.

Aceptación: migración no destructiva, referencias reproducibles y distinguibles, rechazo de metadatos divergentes para una versión existente y de conteos inválidos.

## Migración del 21 de noviembre

Participant identifica de forma opaca a la persona evaluada. IbiteApplication referencia al participante, una cuenta respondiente cuando está identificada, institución, periodo y versión de instrumento. Almacena fecha, procedencia y respuestas originales, con unicidad para definitivas por participante, instrumento y periodo. IbiteResult añade múltiples resultados con reglas y procedencia propias. ProfessionalInstitution concede ámbito explícito, separado de la pertenencia ordinaria. No hay operaciones HTTP de escritura o eliminación para estas tablas. Las entidades de campaña, vínculos de acudiente y auditoría se detallarán con los contratos pendientes.

AuditEvent conserva actor, acción, objeto, institución y fecha. ProfessionalInstitution añade una fecha de revocación y conserva la fila. La persistencia de la aplicación registra respuestas y resultado versionado en la misma transacción.

IbiteCampaign configura institución, versión, periodo y ventana. IbiteAssignment vincula una cuenta respondiente a una persona evaluada dentro de una campaña y conserva revocación. Las nuevas aplicaciones definitivas creadas por el servicio conservan su habilitación de origen. La FK opcional preserva compatibilidad con registros anteriores e históricos.

HistoricalDiagnostic identifica una instantánea técnica por huella de fuente, versión de análisis y digest del diagnóstico. HistoricalReview referencia una incidencia de esa instantánea y agrega actor, estado técnico y fecha. Las observaciones de revisión no alteran la instantánea.

La novena migración agrega a IbiteApplication huellas opcionales y conjuntas de clave de reintento y contenido, únicas por habilitación y clave. Se conservan las aplicaciones históricas sin huellas.
