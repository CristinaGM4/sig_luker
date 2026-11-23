# Consulta interna de auditoría institucional

R01/R12. GET /api/v1/interno/instituciones/{institucionId}/auditoria devuelve hasta 25 eventos recientes de la institución asignada, ordenados por fecha descendente y UUID como desempate. El campo truncated indica si hay más eventos. Requiere sesión vigente, rol PSYCHOSOCIAL_SUPPORT, permiso audit:read y asignación institucional vigente. Una pertenencia ordinaria no concede acceso. UUID inválido devuelve 400, sesión inválida 401, falta de rol o permiso 403 e institución inexistente o fuera de ámbito 404. La respuesta 200 no se guarda en caché.

Cada evento incluye identificador, actor opaco, acción, objeto opaco y fecha. La lectura misma se audita con acción audit.institution.read y se incorpora al historial en una consulta posterior. No se devuelven datos nominales, respuestas, textos ni eventos de otros ámbitos. Los eventos históricos sin institución requieren un contrato separado. La ruta no modifica eventos anteriores.

## Continuación del historial

El parámetro after acepta un UUID de evento devuelto por la página previa. nextCursor contiene el último UUID de la página cuando quedan eventos. Un cursor perteneciente a otra institución devuelve el mismo 404 que un cursor inexistente. La lectura posterior usa fecha y UUID para excluir el evento ancla. Los eventos nuevos, incluida la auditoría del acceso, no aparecen en la continuación cuando son más recientes que el cursor.
