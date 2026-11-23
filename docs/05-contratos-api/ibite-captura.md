# Contrato candidato de captura IBITE

Estado: borrador SDD para R01, R02 y R12. Las operaciones de este documento están propuestas para revisión. No se han publicado como API operativa.

## Participantes y aplicaciones

| Perfil habilitado | Versión de instrumento que puede asignarse | Fuente |
|---|---|---|
| Estudiante | IBITE-17, rama adolescente de 11 a 19 años | Excel -23 y decisión de perfiles |
| Acudiente | IBITE-17, rama cuidador de una persona de 5 a 10 años | Excel -23 y decisión de perfiles |
| Docente, Administrativo, Orientador | IBITE-DA-28 | Excel DA y confirmación del usuario |

Las edades de las ramas provienen del instrumento de referencia. La autorización será específica para una aplicación. El backend verifica cuenta activa, permiso de respuesta, asignación, institución, periodo, ventana y versión. La asignación debe provenir de una fuente administrada por el proyecto. Para acudientes debe corresponder a la persona evaluada habilitada sin exponer su identidad en la URL. Confirmar si se habilitan varios acudientes y cómo se resuelve un envío entre ellos.

## Operaciones propuestas

Las rutas se proponen bajo /api/v1. Todas las operaciones de captura requieren una credencial válida del participante.

| Método y ruta | Permiso y propósito | Entrada | Respuesta propuesta |
|---|---|---|---|
| GET /api/v1/mis-aplicaciones-ibite | Consultar asignaciones propias | Sin cuerpo. La identidad proviene de la sesión | 200. Lista acotada con aplicación, institución autorizada, campaña, periodo, versión, apertura, cierre y estado de envío |
| GET /api/v1/mis-aplicaciones-ibite/{aplicacionId}/formulario | Obtener el formulario asignado | Identificador opaco de aplicación | 200. Versión, rama, ítems y preguntas de contexto aprobadas, tipos y opciones visibles. La respuesta incluye textos de instrumento sin reglas de puntuación ni registros individuales |
| POST /api/v1/mis-aplicaciones-ibite/{aplicacionId}/envios | Enviar respuestas de la aplicación asignada | Identificador opaco, cabecera Idempotency-Key, y cuerpo de captura | 201. Identificador opaco de envío, aplicación, versión aplicada, fecha y estado recibido. Un reintento idéntico con la misma clave devuelve el resultado del envío previo |

Formato base de solicitud de envío:

```json
{
  "versionInstrumentoId": "versión-asignada",
  "respuestas": [
    { "preguntaId": "ítem-asignado", "opcionId": "opción-del-ítem" }
  ]
}
```

El ejemplo muestra la estructura de una respuesta de opción única. Los demás tipos, datos de contexto, consentimiento o asentimiento y obligatoriedad se incorporan al esquema al verificar el formulario y las condiciones de recolección de cada variante. Conservar el valor de origen recibido o la opción histórica inmutable que lo representa. Guardar la versión aplicada y la fecha del servidor. La solicitud no admite campos de institución, participante, clasificación, permisos o puntuación controlados por el cliente. El acuse no devuelve resultados individuales.

## Errores propuestos

| HTTP | Caso |
|---|---|
| 400 | JSON inválido, identificador con formato inválido o clave de idempotencia mal formada |
| 401 | Credencial inválida o vencida |
| 403 | Cuenta autenticada sin permiso de captura |
| 404 | Aplicación inexistente o fuera de alcance. Usar la misma respuesta para evitar enumeración |
| 409 | Periodo o ventana cerrados, versión de aplicación cambiada, clave reutilizada con otro contenido o envío duplicado según la regla aprobada |
| 422 | Pregunta duplicada en la solicitud, pregunta ajena a la versión, opción inválida para el ítem u omisión de un campo obligatorio ya aprobado |

## Integridad y concurrencia

Propuesta: persistir el envío y sus respuestas en una transacción. Asociar la clave de idempotencia a la cuenta y la aplicación. Crear una restricción de unicidad para impedir duplicados de captura conforme a la unidad de respuesta aprobada. Esta restricción es distinta de la clave de idempotencia: impide que dos solicitudes con claves distintas generen dos envíos para la misma unidad cuando se autorice un solo envío. No usar el número de fila de los Excel como identificador de una aplicación nueva.

La autorización de publicación y las consultas de resultados individuales se especifican en contratos separados. Los accesos de participantes a su formulario y acuse utilizan el mínimo contexto necesario para completar la tarea. El Equipo de Apoyo Psicosocial autorizado de la Universidad es el único perfil de consulta de registros individuales.

## Criterios propuestos

| ID | Verificación |
|---|---|
| CAP-01 | Cada perfil consigue la variante asignada y puede enviar respuestas válidas durante su ventana |
| CAP-02 | Enumeración de una aplicación ajena, envío cruzado e intento de consulta de resultados desde cuenta de participante quedan bloqueados |
| CAP-03 | Se rechazan opción de otro ítem, referencia a otra versión, duplicado de pregunta y campos de contexto controlados por el servidor |
| CAP-04 | La repetición idéntica de la misma clave recupera el mismo envío y dos cargas distintas con esa clave generan conflicto |
| CAP-05 | Dos envíos simultáneos con claves diferentes respetan la unidad de respuesta aprobada. Si falla una escritura, la transacción mantiene la consistencia |
| CAP-06 | La respuesta original y la versión son trazables; el acuse omite datos nominales y puntuaciones |

## Cierre pendiente

1. Confirmar unidad de respuesta y si hay borradores, reanudación, correcciones o reapertura. Propuesta inicial para revisión: envío final único por aplicación habilitada.
2. Definir cómo se vincula al acudiente con la persona evaluada y cómo se gestionan múltiples acudientes o asistencias fuera de las ramas observadas.
3. Validar ventanas y catálogos de campaña, institución y sede. Conciliar campañas semestrales y retamizaje focalizado.
4. Completar el diccionario de campos por variante: obligatoriedad, representación del consentimiento/asentimiento, contexto mínimo y autorización de uso.
5. Elegir el mecanismo de credenciales y definir cómo se aprovisionan, revocan y recuperan accesos.

La [propuesta de habilitación](ibite-habilitacion.md) desarrolla las unidades de respuesta candidatas y el flujo de acceso.

## Reglas aprobadas el 21 de noviembre de 2026

Las campañas son semestrales. Cada persona evaluada puede tener una aplicación definitiva por instrumento y periodo, con independencia de institución o variante. El posttest IBITE-17 del Periodo 2 se realiza del 25 de noviembre al 10 de diciembre de 2026 en las diez instituciones priorizadas. El rol Directivo entra en DA-28. La cuenta de acudiente es individual, solo representa a menores de 11 años y puede vincular a varios menores con autorización verificable. Mantener por separado participante evaluado y respondiente. Estas definiciones sustituyen las propuestas previas de unicidad por aplicación y DA por cada institución.

Antes de cerrar el contrato de escritura se requieren los formularios originales completos, la obligatoriedad y asignación por variante, el vínculo verificable, las ventanas, el consentimiento y el procedimiento de corrección. El acuse omite orientaciones clínicas individualizadas.

[Verificación de formularios y persistencia interna](../06-reglas-negocio/verificacion-formularios-ibite.md). La ruta POST sigue en borrador.

## Consulta de habilitaciones propias

Implementación de GET /api/v1/mis-aplicaciones-ibite. Requiere una sesión vigente y el permiso ibite:complete. Devuelve hasta 25 habilitaciones propias activas, de instituciones activas y campañas abiertas, ordenadas por UUID de habilitación. Admite after como cursor UUID y devuelve nextCursor nulo al finalizar. Cada entrada identifica habilitación y campaña, los códigos de institución y periodo, instrumento, variante, versión, apertura, cierre y si la cuenta ya envió una aplicación por esa habilitación. El acuse se limita a la propia habilitación y no revela actividad de otro respondiente. No devuelve identificadores del evaluado, respuestas, puntuación ni reglas clínicas. 400 para parámetros inválidos, 401 para sesión ausente o inválida y 403 para permiso ausente. Respuesta sin caché.

Los contratos de formulario y envío permanecen pendientes de validación. El identificador de habilitación es el candidato a aplicacionId en las rutas de captura mientras se distingue de la aplicación definitiva.

## Detalle y acuse de habilitación propia

GET /api/v1/mis-aplicaciones-ibite/{habilitacionId} devuelve una sola habilitación con los mismos campos y filtros del listado. GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}/acuse devuelve applicationId, assignmentId, sourceVersion y submittedAt del envío propio. Ambas operaciones requieren ibite:complete y una habilitación disponible para esa sesión, incluida la ventana vigente. UUID inválido recibe 400; ausencia de sesión o permiso recibe 401 o 403; recurso fuera de ámbito, revocado, cerrado, o acuse inexistente recibe 404. No hay datos nominales ni correcciones. Usar no-store incluso en errores de sesión.

## Reintentos en el servicio interno

CAP-04/CAP-05. La finalización interna admite una clave de reintento opaca de 16–128 caracteres alfanuméricos, guion o guion bajo. El servicio conserva las huellas de clave y contenido de manera conjunta, acotadas a la habilitación. Un reintento idéntico recupera el mismo ID sin crear otra aplicación, resultado o auditoría. Otro contenido con la misma clave genera conflicto; otra clave mantiene la restricción de una aplicación definitiva. Antes de recuperar el acuse se comprueba nuevamente la autorización por asignación y ventana. El adaptador HTTP futuro deberá exigir Idempotency-Key cuando se apruebe el formulario de envío.

### Validación técnica de la finalización

El servicio interno acepta ítems de texto o nulo y los cuatro campos de contexto ya definidos para la regla. Rechaza tipos inesperados, posiciones ausentes en una lista y claves extra de contexto. Conserva la diferencia entre nulo explícito y campo omitido. El tipo válido no acredita consentimiento ni obligatoriedad de captura. La huella de reintento se calcula sobre una copia estable para que el orden de las claves no altere el resultado.

La clave de reintento se valida como texto en tiempo de ejecucion. El contexto debe ser un registro de campos, incluidas las llamadas internas. La prueba de integracion de DA-28 cubre el rechazo de una lista de 27 posiciones, la finalizacion con la referencia versionada, el reintento sin duplicar la auditoria y el acuse reservado al respondiente habilitado.

### Aplicaciones en más de una institución

La restricción de una aplicación definitiva se comprueba por participante, instrumento y periodo. La prueba sintética intenta otro envío de IBITE-17 con otra institución, variante y cuenta respondiente. PostgreSQL rechaza el duplicado y la habilitación del intento rechazado no genera acuse ni evento de finalización. El mismo participante puede tener simultáneamente un resultado DA-28 en el mismo periodo, porque corresponde a otro instrumento.

### Criterios propuestos para registrar consentimiento

- DF-11. Dada una negativa explícita, conservar el valor recibido asociado a la habilitación y pregunta correspondiente. Una negativa de participación debe quedar disponible para su consulta autorizada sin crear una aplicación definitiva ni puntuarla.
- DF-12. Dado un estudiante mayor de edad habilitado para la variante adolescente, presentar las mismas decisiones de consentimiento y aplicar las mismas validaciones que en la variante adolescente.
- DF-14. Si el estudiante acepta participar e indica que desconoce su autorización, se conservan las respuestas y el estado declarado. Puede contribuir a métricas autorizadas. La negativa explícita de participación conserva el tratamiento de DF-11.
- Quedan por definir la conservación del registro y el tratamiento de reintentos y cambios de decisión antes de cerrar el contrato de escritura.

### Persistencia interna de la autorización declarada

El servicio de finalización guarda `reportedRepresentativeAuthorization` junto a las respuestas originales de la variante adolescente ya validada. Admite `unknown` y `authorized` como declaraciones. Para aplicaciones anteriores o llamadas internas sin ese campo, conserva el campo omitido. El estado declarado forma parte del contenido comparado en reintentos. La huella previa de solicitudes sin declaración conserva compatibilidad. La puntuación y el acuse vigente no incluyen este dato. La pantalla y su envío por HTTP siguen pendientes de cerrar el contrato.

## Recorrido integrado en entorno sintético

La aplicación de pruebas registra un formulario sintético de IBITE-17 adolescente mediante el tercer argumento de `createApp`. El arranque habitual omite ese argumento. La captura requiere la base local `sig_test` en `127.0.0.1`. El formulario de prueba usa IDs y opciones sintéticos para verificar el transporte y las reglas de acceso. Su versión identifica la aceptación guardada y es distinta de la versión del instrumento que utiliza el motor de puntuación.

| Operación de prueba | Resultado |
|---|---|
| GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}/formulario | 200 con la versión, preguntas, opciones visibles y estados admitidos en el recorrido sintético |
| POST /api/v1/mis-aplicaciones-ibite/{habilitacionId}/envios | 201 con el mismo acuse que devuelve el GET /acuse. Requiere Idempotency-Key y aceptación de participación. El mismo envío con la misma clave conserva el acuse |
| GET /api/v1/mis-aplicaciones-ibite/{habilitacionId}/acuse | 200 una vez finalizada la aplicación propia. Antes del envío, 404 |

El POST recibe `formVersion`, `participation`, `reportedRepresentativeAuthorization` y `answers` con `questionId` y `optionId`. La sesión y el permiso `ibite:complete` se comprueban en cada acceso. Solo se permite finalizar durante la ventana vigente para una habilitación propia. El servicio revalida esa información y la referencia asignada en la transacción. La aplicación, las respuestas originales con la aceptación y versión de formulario, el resultado versionado y el evento de auditoría se guardan juntos. El acuse omite respuestas, puntuaciones e identidad nominal.

HTTP 400 para UUID, clave o estructura inválidos. HTTP 401 o 403 según sesión y permiso. HTTP 404 para formulario o habilitación ajena, revocada, inexistente, fuera de ventana o cuya versión no está configurada. HTTP 409 para versión de formulario discordante, reintento con contenido modificado o aplicación ya finalizada. HTTP 422 para preguntas, opciones o decisiones inválidas para el recorrido sintético.

El contrato OpenAPI de las operaciones sintéticas se genera en la aplicación de pruebas y se verifica junto con la [colección Postman sintética](postman/ibite-captura-sintetica.postman_collection.json). La prueba `test/ibite-results.test.mjs` crea la campaña, el respondiente, la sesión y la habilitación sintéticos. El comando `./scripts/verify-isolated-db.ps1` ejecuta el recorrido completo con PostGIS en una base desechable. El OpenAPI y la colección habituales solo anuncian las rutas habilitadas por el arranque habitual.

### Negativa de participación antes del envío

DF-11, CAP-02, CAP-05. En el arranque sintético, `POST /api/v1/mis-aplicaciones-ibite/{habilitacionId}/negativa` recibe exclusivamente `{"formVersion":"<versión vigente>"}`. Responde 201 con `assignmentId`, `formVersion` y `recordedAt`. Un reintento para la misma habilitación y versión devuelve el mismo registro. El formulario propio incluye `participationDeclined` para recuperar el estado. Esta operación corresponde a la pregunta de participación del estudiante.

La negativa se conserva en una tabla separada y registra un evento de auditoría en la misma transacción. El bloqueo de fila por habilitación serializa la negativa y la finalización. Una negativa registrada impide finalizar esa habilitación. Si el envío definitivo ya existe, la negativa recibe 409. El recorrido sintético carece de transición de cambio de decisión. Otra cuenta, una asignación revocada o una campaña cerrada reciben 404. La respuesta «No sé» sobre autorización del representante continúa por el flujo de respuestas si el estudiante acepta participar.

Quedan pendientes el alcance operativo de una negativa de autorización del representante, los cambios posteriores de decisión y la política de conservación. La ruta de negativa solo se registra en el arranque sintético.

## Demostración sintética de ambas ramas

El arranque de pruebas admite un catálogo de formularios sintéticos, seleccionados por instrumento, variante y versión de la habilitación. En el POST, `reportedRepresentativeAuthorization` es obligatorio para el formulario sintético adolescente y se omite para acudiente. Ambas ramas usan las escalas de las rejillas de IBITE.pdf para sus opciones de prueba. Las señales se exponen en la consulta de resultados ya autorizada, fuera del acuse. Ver [casos POST y salida observada](../08-pruebas/demo-ibite17-post.md).

## Negativa de autorización del representante

En el recorrido sintético adolescente, `POST /api/v1/mis-aplicaciones-ibite/{habilitacionId}/negativa` permite enviar `reason: "REPRESENTATIVE_AUTHORIZATION"` cuando se elige «No lo autorizó». El registro conserva el motivo, la versión y la fecha. La ausencia de `reason` conserva el comportamiento anterior de negativa de participación. Las negativas previas permanecen con el motivo `PARTICIPATION`.

El formulario propio devuelve `refusalReason` y el acuse de negativa incluye `reason`. La negativa de autorización se audita por separado e impide generar una aplicación, un resultado o un acuse de envío. Un reintento idéntico recupera la misma negativa. Cambiar el motivo para esa habilitación recibe 409. El motivo de autorización del representante solo está disponible en adolescente. Este motivo explícito es diferente de «No sé», que conserva respuestas, cálculo y participación en métricas autorizadas.
