# Habilitación y acceso a campañas IBITE

Borrador para R01, R02 y R12. Complementa el [contrato candidato de captura](ibite-captura.md). Las asignaciones y los códigos individuales son propuestas de diseño. Las rutas de acceso y los canales de distribución quedan sujetos a aprobación.

## Propuesta de flujo

1. Un operador autorizado de la Universidad registra campaña, periodo, institución, ventana y versión del instrumento. Autorizar la habilitación de participantes como permiso específico. Está pendiente quién tendrá esa facultad.
2. El operador crea o verifica la asignación con una referencia opaca del participante y, para la rama cuidador, un vínculo validado entre la persona que responde y la persona evaluada. Cada asignación identifica campaña, institución y versión. Registrar quién creó, corrigió o revocó el vínculo.
3. Emitir un código aleatorio de un solo uso, con vigencia, intentos limitados, uso atómico y almacenamiento protegido. Entregarlo por un canal institucional aprobado a la persona habilitada. Mantener el código fuera de URL, registros y reportes.
4. Al canjear el código, abrir una sesión revocable cuyo alcance se limita a la asignación. Revalidar el estado de la cuenta o credencial y de la asignación antes del envío. Si se reemite un código, invalidar el anterior. Acordar si la reemisión revoca sesiones activas.
5. Entregar un acuse opaco del envío. Cuando se apruebe el envío final único, bloquear un segundo envío válido mediante una restricción de persistencia sobre la unidad aprobada.

## Acudientes y unidad de respuesta

Propuesta para revisión: la unidad del cuidador es **persona evaluada y campaña**, con institución y variante derivadas de la aplicación. Una persona puede tener varias asignaciones de cuidador para diferentes personas evaluadas, y se trata cada asignación por separado. Para el primer incremento, se propone una asignación activa de cuidador por unidad. Un reemplazo autorizado revoca la asignación anterior antes de emitir otra. Si se permite más de un cuidador, definir si sus respuestas se conservan por separado y qué unidad cuenta en los indicadores.

Para estudiante y DA se propone vincular la asignación a la persona que responde y al contexto de campaña. Falta decidir si un integrante con varias vinculaciones institucionales de DA responde por cada institución o una sola vez por campaña. Esta decisión afecta el conteo de evaluados y la integridad de la importación.

El vínculo de acceso acredita la habilitación para responder. Las condiciones de consentimiento/asentimiento y quién puede otorgarlo se especifican por separado. La captura de autorizaciones y la restricción de respuestas incompletas dependen del instrumento aprobado.

## Alternativas de credenciales

| Alternativa | Ventaja | Decisión necesaria |
|---|---|---|
| Código individual de un solo uso | Reduce la carga de memorizar credenciales para campañas esporádicas | Identificar canal, reemisión, duración, límites de intento y soporte |
| Contraseña inicial aleatoria con activación | Sirve en accesos recurrentes y reutiliza el flujo de recuperación | Aprobar entrega, hash robusto, activación y recuperación |
| Inicio de sesión institucional para el Equipo de Apoyo Psicosocial | Permite gestionar ciclo de vida de cuentas desde la Universidad si existe una integración disponible | Confirmar proveedor y atributos de pertenencia al equipo, y decidir requisitos de segundo factor |

Propuesta inicial: código individual para participantes y evaluar identidad institucional para el equipo universitario. El dashboard público conserva acceso sin sesión y consulta de agregados aprobados.

## Criterios de aceptación propuestos

| ID | Caso |
|---|---|
| HAB-01 | Un código válido se canjea una sola vez incluso con dos solicitudes simultáneas |
| HAB-02 | Los intentos repetidos se limitan. La respuesta al error evita revelar identidades o asignaciones |
| HAB-03 | El código vencido o revocado no abre sesión. La reemisión invalida códigos anteriores |
| HAB-04 | Una sesión de participante solo obtiene su asignación y el alcance se comprueba nuevamente al enviar |
| HAB-05 | La reasignación de un cuidador conserva procedencia y respeta la unicidad aprobada para la persona evaluada |
| HAB-06 | Se auditan altas, revocaciones y reemisiones sin registrar el valor de la credencial ni información nominal del menor |

## Decisiones para aprobar

Acordar unidad de respuesta de cuidador y DA, operador habilitador, mecanismo de vínculo con la persona evaluada, canal de entrega y recuperación, regla de borradores o correcciones, y alcance de una sesión de participante. Definir vigencia y límites tras seleccionar el mecanismo. Especificar conservación y auditoría bajo custodia de la Universidad de Manizales.

## Campañas y habilitaciones implementables

R01/R02. Una campaña configura ventana en instantes UTC, institución, periodo y versión. La ventana se evalúa como apertura inclusiva y cierre exclusivo. La habilitación identifica participante y cuenta respondiente, y puede revocarse. La misma cuenta puede tener habilitaciones para varios participantes. La habilitación se crea solo después del procedimiento autorizado de verificación, pendiente de contrato operativo. No representa por sí sola consentimiento.

El servicio interno finaliza una solicitud ya validada por el futuro controlador de formularios. Recibe la cuenta autenticada y el ID de habilitación. Solo opera para la cuenta asignada y activa con ibite:complete, institución activa y ventana vigente. Deriva participante, institución, periodo, variante y versión desde la campaña, genera la fecha en servidor y registra la habilitación de origen. La aplicación, su cálculo y la auditoría mantienen la transacción y la unicidad ya verificadas. La solicitud no recibe contexto institucional del cliente. Sin rutas nuevas ni aprovisionamiento automático. Aceptación sintética: habilitación ajena, revocada, falta de permiso, ventana cerrada y éxito trazable.

### Operador designado para el posttest

R01/R02, DF-09. El Dr. Felipe Agudelo es el responsable designado de la habilitación masiva de estudiantes en el piloto IBITE-17. La emisión de accesos y la habilitación de acudientes siguen sujetas a las reglas documentadas. Faltan el permiso operativo, la cuenta institucional y la identificación autorizada del lote.

### Vinculación y gestión de campaña

DF-16. Los campos de búsqueda del vínculo son nombre del estudiante y Teléfono de contacto, tal como aparecen en la encuesta. El piloto espera una sola coincidencia por par en la fuente institucional autorizada. Falta identificar el listado de referencia que se utilizará para la búsqueda. Si un dato inesperado produce cero o varias coincidencias, no se crea ningún vínculo automático.

DF-17. Se confirman las operaciones del Dr. Felipe Agudelo para el piloto: habilitar estudiantes de forma masiva, activar campañas y desactivar campañas. Criterios propuestos: permiso comprobado en backend, auditoría con actor, campaña y fecha, y desactivación que impida nuevas capturas conservando las aplicaciones definitivas. Queda por definir si la activación manual puede abrir la campaña fuera de su ventana configurada.

### Inicio de una aplicación en campaña abierta

DF-18. La campaña se habilita una vez para las instituciones priorizadas y durante su ventana. El respondiente puede iniciar sin aprobación individual o pertenencia a la muestra anterior. El backend actual requiere una habilitación existente, por lo que el siguiente incremento es generar la habilitación al iniciar el flujo, aplicar consentimiento y conservar la unicidad definitiva por participante, instrumento y periodo. El mecanismo de identidad del nuevo participante debe resolverse sin exigir que exista en el histórico. Esta decisión no convierte el dashboard ni las consultas nominales en parte del flujo de captura.

### Inicio autónomo de estudiante implementado

DF-18. `POST /api/v1/mis-aplicaciones-ibite/campanas/{campanaId}/iniciar` requiere sesión de estudiante y `ibite:complete`. Devuelve 200 con `assignmentId`. Recibe el identificador de campaña por ruta. El código de institución y el periodo provienen de la campaña. No consulta el histórico ni pide nombres o teléfonos. Comprueba variante adolescente, institución activa, estado y ventana.

Una cuenta sin habilitación crea su participante interno y una habilitación en una sola transacción con auditoría. Los reintentos concurrentes recuperan la misma habilitación. Una habilitación previa vigente en la misma campaña se conserva. Si existe otra habilitación adolescente para el periodo en distinta campaña, hay varias candidatas o se revocó la única previa, devuelve 409. La respuesta es 400 ante UUID inválido, 401 ante sesión inválida, 403 sin rol o permiso y 404 para una campaña no disponible. El mecanismo de alta de cuentas operativas y el inicio de acudiente quedan pendientes.

### Acceso directo desde un enlace

DF-19. El acceso inicial no debe exigir una cuenta preexistente. La propuesta técnica es emitir una sesión de captura acotada a la campaña al iniciar el formulario y aplicar los controles de vigencia y consentimiento. Una sesión temporal puede impedir reenvíos desde la misma habilitación. La unicidad por persona al entrar de nuevo desde otro navegador requiere una forma aprobada de reconocerla. El enlace identifica la campaña y no concede acceso a datos de otros participantes.

### Inicio sin cuenta con identificación declarada

DF-19/DF-20. En el arranque sintético, `POST /api/v1/ibite/campanas/{campanaId}/iniciar` recibe `age` y `documentNumber` como texto. Para 5–10 años requiere también `studentName` y `contactPhone`. A los 11–19 años se solicita solo el documento del adolescente como identificador, además de la edad. El formato sintético admite de 4 a 24 dígitos y conserva los ceros iniciales.

Para una campaña habilitada, vigente y de la variante correspondiente, responde 201 con `assignmentId`, `token` y `expiresAt`. El token vence en una hora o al cerrar la campaña, lo que ocurra primero. Permite continuar al formulario, consentimiento y envío de esa habilitación. Una entrada nueva con el mismo documento no recupera ninguna sesión, respuesta ni acuse anterior. En acudientes, el mismo documento puede corresponder a más de un menor. El campo nuevo en PostgreSQL contiene una huella HMAC separada por periodo y variante. El flujo no escribe documento, nombre ni teléfono en claro.

En el arranque sintético, `createApp` admite una clave de 32 bytes como cuarto argumento. El ensayo de reinicio conserva esa clave y PostgreSQL al recrear Nest. Si se omite, la clave de la demostración vuelve a ser efímera. Para usarla en el piloto se necesita una clave estable administrada y control de abuso para el ingreso público. El documento declarado permite detectar duplicados del mismo identificador. Su ingreso no autentica a una persona ni verifica el vínculo jurídico del acudiente. La huella del acudiente, nombre y teléfono no garantiza reconocer al mismo menor si cambia el acudiente o los datos de contacto. Los históricos sin documento permanecen independientes.

El sitio de referencia presenta primero el selector Adolescente/Niños, después identificador, edad e institución, y luego consentimiento. Se usó como referencia de orden y separación de las ramas. El contenido y escalas de SIG-LUKER provienen del IBITE versionado.

## Límite técnico del inicio público

El inicio público sintético limita a 20 solicitudes por dirección remota por ventana de 60 segundos en cada proceso. Desde la solicitud 21 responde `429` con `Retry-After` en segundos. Las solicitudes inválidas también se contabilizan antes de validar el cuerpo y el identificador de campaña. El control usa la dirección de la conexión, sin confiar en cabeceras de reenvío, y nunca guarda documentos o teléfonos. Para apertura con proxy o varias réplicas se requiere configurar un límite compartido en la infraestructura.

