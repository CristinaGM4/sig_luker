# Consulta interna de instituciones y periodos

T02 / R01 y R02. Se proponen y habilitan operaciones de solo lectura para catálogos operativos. Requieren una sesión vigente con records:read, que en la semilla inicial corresponde al Equipo de Apoyo Psicosocial. El alcance inicial es institucional amplio. Las operaciones no devuelven datos de personas ni cambian los catálogos. Se incluyen instituciones activas e inactivas para permitir su identificación en contextos históricos.

| Método y ruta | Respuesta HTTP 200 |
|---|---|
| GET /api/v1/interno/catalogos/instituciones | items con id, code, name y active |
| GET /api/v1/interno/catalogos/periodos | items con id, code, label, startsOn y endsOn. Las fechas usan YYYY-MM-DD |

Ambas operaciones aceptan limit, entero de 1 a 100 con valor por defecto 25, y after, el código de continuación devuelto por la página previa. El orden es ascendente por código y el cursor nextCursor es nulo al final. Se devuelve HTTP 400 ante filtros desconocidos, repetidos o inválidos, 401 para una sesión inválida y 403 si la cuenta carece de records:read. Las rutas están disponibles al configurar PostgreSQL.

Aceptación: verificar acceso por permiso, paginación ordenada sin duplicados sobre un catálogo estable, validaciones de query y fechas de calendario, con registros sintéticos en la base sig_test.
