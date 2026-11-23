# Autenticación interna por sesión y consulta de identidad

T02 / R01 y R12. Primera parte de autenticación. Tokens opacos aleatorios de 32 bytes codificados como base64url se presentan en Authorization: Bearer. La base almacena únicamente la huella SHA-256 y el periodo de vigencia. La validación exige sesión vigente y sin revocación, cuenta activa y permiso actual. Usar credenciales de prueba exclusivamente sintéticas. La emisión pública, el canal de entrega y el vínculo de participantes requieren su propia especificación.

GET /api/v1/auth/me devuelve 200 con ID opaco de cuenta, códigos de roles y códigos de permisos. Devuelve 401 para token ausente, inválido, vencido o revocado, cuenta inactiva o sesión no encontrada. No devuelve identidad nominal. La respuesta no se almacena en caché. La operación existe en el arranque con PostgreSQL configurado.

La autorización usa un guard reutilizable para declarar permisos requeridos por ruta. El guard devuelve 403 si la cuenta autenticada carece de un permiso requerido. La pertenencia institucional y el permiso por objeto deberán validarse en el servicio de cada caso de uso. La sesión no sustituye esas comprobaciones. La ruta de salud conserva su contrato público.

Aceptación: verificar acceso con sesión válida, rechazo de token inválido, expiración, revocación y cuenta inactiva, y denegación de una ruta de prueba por falta de permiso. La API no expone una ruta de emisión ni recibe contraseñas en este incremento.

## Emisión interna y cierre de sesión

T02 / R01 y R12. El servicio interno puede crear una sesión para una cuenta activa con una fecha de expiración futura suministrada por el flujo autorizado que lo invoque. Genera 32 bytes aleatorios y persiste solo su huella SHA-256. El token original se devuelve una vez al invocador interno. No se expone una ruta de emisión. La duración por perfil y el canal de entrega quedan pendientes.

DELETE /api/v1/auth/session revoca únicamente la sesión de la credencial Bearer presentada y devuelve 204 sin cuerpo. La petición no recibe identificadores ni acepta revocar sesiones ajenas. Si la credencial ya está revocada, vencida, ausente o inválida, devuelve 401. La ruta de salud conserva su contrato.

Aceptación: la emisión interna solo acepta cuentas activas y caducidades futuras; la base conserva la huella y no el token original; el cierre invalida la sesión utilizada y una segunda sesión activa de la misma cuenta sigue siendo válida.
