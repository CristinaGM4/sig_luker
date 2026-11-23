# Gestión interna de asignaciones

R01 y R12. PUT y DELETE /api/v1/interno/asignaciones-psicosociales/{profesionalId}/{institucionId} requieren permiso scope:manage. El permiso existe en el catálogo y no se concede automáticamente a ningún rol. El operador debe estar designado por la Universidad. PUT requiere profesional activo con rol psicosocial e institución existente. DELETE revoca la asignación conservando la fila. Una gestión repetida sin cambio devuelve 204 y no duplica auditoría. Cada cambio y cada lectura exitosa de resultados deja actor, acción, objeto, institución y fecha, sin incluir respuestas, resultados o datos nominales. La auditoría y el cambio se escriben en la misma transacción.

Respuestas: 204 sin cuerpo, 400 para UUID inválido, 401 sin sesión, 403 sin permiso, 404 si una alta no tiene destino elegible. La revocación se aplica a las consultas posteriores de la sesión existente. No hay provisión automática de gestores ni UI.

## Listado para operadores autorizados

GET /api/v1/interno/asignaciones-psicosociales/instituciones/{institucionId} exige scope:manage. Devuelve las asignaciones vigentes y revocadas con profesional opaco y fecha de revocación, ordenadas por UUID del profesional. Devuelve hasta 25 elementos, con el cursor after, que corresponde al UUID del profesional. No lista datos nominales ni respuestas. Devuelve 404 para institución inexistente. El listado queda auditado por institución.
