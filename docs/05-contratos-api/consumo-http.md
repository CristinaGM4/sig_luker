# Consumo del contrato HTTP

Swagger genera el contrato vigente en /docs-json cuando se habilita SWAGGER_ENABLED. Para documentar también rutas persistentes, iniciar con PostgreSQL configurado. La colección Postman refleja las operaciones del contrato con PostgreSQL. Los documentos de diseño que todavía son borradores no forman parte de Swagger ni de la colección.

El cliente envía la sesión en Authorization: Bearer donde OpenAPI indica bearer. HTTP 401 se trata como sesión inválida, 403 como rol o permiso insuficiente y 404 como recurso o cursor no disponible. Conservar las páginas previamente cargadas solo dentro del ámbito de la sesión. Al cambiar de institución, aplicación o sesión, descartar el cursor y comenzar desde la primera página.

Para páginas siguientes, reutilizar el valor nextCursor como parámetro after sin deducir identificadores. Un nextCursor nulo termina la paginación. Las rutas de auditoría y resultados conservan truncated por compatibilidad. Las rutas de captura del formulario y entrega del envío no están operativas.

El guard devuelve WWW-Authenticate: Bearer para una credencial ausente o inválida. El detalle de habilitación y su acuse utilizan el mismo UUID del listado y conservan la política de no-cache.

La reproducción técnica de resultados y la conciliación histórica son servicios internos. No forman parte de OpenAPI ni de Postman.
