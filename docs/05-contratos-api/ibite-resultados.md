# Consulta interna de resultados IBITE

R01/R04/R12. GET /api/v1/interno/aplicaciones-ibite/{aplicacionId}/resultados requiere sesión, rol Equipo de Apoyo Psicosocial, permiso records:read y asignación explícita vigente a la institución de la aplicación. Un rol técnico o una pertenencia institucional ordinaria no otorgan acceso. HTTP 400 para UUID inválido, 401 sin sesión, 403 sin rol o permiso, 404 si el recurso es inexistente o no asignado. La respuesta 200 contiene el identificador de aplicación y hasta 25 resultados recientes, del más nuevo al más antiguo, con versión de regla, procedencia y fecha. La respuesta incluye truncated cuando hay más. No devuelve respuestas originales ni identificación nominal del participante. No admite caché. Trazabilidad de escritura y auditoría de acceso quedan pendientes antes de habilitar la ruta con datos reales.

La lectura exitosa registra auditoría en la misma transacción. La asignación se considera vigente cuando revokedAt es nulo.

## Continuación de resultados

El parámetro after acepta el UUID de un resultado de la aplicación. nextCursor es nulo al final. Los resultados se ordenan por calculatedAt descendente y UUID descendente; la segunda página excluye el ancla. Una aplicación o un cursor fuera de ámbito devuelve 404. La consulta vuelve a comprobar el ámbito y registra auditoría en cada página entregada.

## Reproducción interna de una aplicación

R04/R12. El servicio interno reproduce una aplicación prospectiva a partir de sus respuestas originales y referencia de instrumento. Exige cuenta activa, rol psicosocial, permiso records:read y asignación institucional vigente, comprobados en la consulta por objeto. Restringe la entrada a la estructura de captura prospectiva reconocida. Registra el acceso técnico dentro de la transacción. Devuelve el cálculo al invocador interno y conserva la aplicación y las versiones de resultados. No se registra endpoint y no se notifica a participantes.

## Revalidacion de la autorizacion por objeto

Las consultas internas de resultados y auditoria comprueban otra vez la cuenta activa, el rol psicosocial, el permiso de la operacion y la asignacion institucional vigente al buscar el recurso. El recalculo de resultados usa el mismo criterio que su consulta. La matriz de permisos de la cuenta sigue siendo aditiva. Las rutas y respuestas HTTP conservan su contrato.

El recálculo comprueba que la huella de la fuente guardada con la aplicación coincida con la referencia del instrumento. Si hay una discrepancia, la operación termina sin devolver un cálculo ni registrar un evento de recálculo exitoso. La comparación sintética de DA-28 verifica que el recálculo autorizado reproduce el resultado almacenado. Una prueba adicional confirma que un identificador de resultado válido para otra aplicación recibe 404 al usarse como cursor.
