# Contrato de salud del proceso

T01 / R12 / R13. GET /api/v1/health permite comprobar que el proceso HTTP responde. Es una operación sin autenticación ni entradas de negocio. Devuelve HTTP 200 y JSON {"status":"ok"}. El resultado describe la disponibilidad del proceso HTTP. No consulta la base ni otras dependencias. Las rutas inexistentes responden 404.

La aplicación arranca con HOST y PORT validados. Por defecto escucha en 127.0.0.1:3000. SWAGGER_ENABLED admite true o false y su valor por defecto es false. Al habilitarlo se publican Swagger UI en /docs y OpenAPI 3.x en /docs-json. La configuración inválida detiene el arranque.

Aceptación: comprobar la respuesta HTTP, el estado 404 de una ruta no registrada, Swagger desactivado por defecto, el contrato cuando Swagger se habilita y el fallo de arranque ante configuración inválida.

## Disponibilidad de PostgreSQL

T01 / R12 y R13. GET /api/v1/ready se registra cuando DATABASE_URL está configurada. Ejecuta una comprobación SELECT 1 sobre la conexión activa de Prisma y devuelve 200 con {"status":"ready"} o 503 con {"status":"unavailable"}. La ruta es técnica y no expone detalles de conexión, excepciones, nombres de tablas, credenciales ni datos de dominio. Con la base HTTP sin PostgreSQL la ruta devuelve 404. GET /api/v1/health conserva el contrato de vida del proceso sin comprobar dependencias.

Aceptación: comprobar la consulta real contra sig_test, respuesta 503 sin detalles ante un error simulado de la consulta, continuidad de la ruta de salud y presencia de respuestas 200/503 en OpenAPI cuando se configura la base.
