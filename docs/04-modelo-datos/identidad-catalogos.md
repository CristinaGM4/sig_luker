# Modelo mínimo de identidad y catálogos

T02 / R01, R02 y R12. Primera migración de estructura. Los nombres técnicos en inglés se mantienen en Prisma y SQL. Este incremento agrega persistencia base y no habilita autenticación ni operaciones HTTP de negocio.

- Account representa una cuenta mediante un identificador UUID y estado activo. La identidad de inicio de sesión, las credenciales y las sesiones se incorporarán con el mecanismo aprobado.
- Role y Permission son catálogos con códigos únicos. RolePermission y AccountRole describen relaciones N:M. La asignación de rol identifica capacidades. El ámbito institucional se comprueba por separado y nunca se infiere como acceso global a partir de una pertenencia.
- Institution conserva un código único y un nombre. AccountInstitution relaciona una cuenta con sus instituciones sin repetir la combinación. Las sedes y el origen oficial de los códigos quedan para el contrato de catálogos.
- AcademicPeriod tiene código único, etiqueta y fechas de calendario, con cierre igual o posterior a la apertura. Las ventanas de aplicación de instrumentos son un concepto separado.
- Las relaciones usan eliminación restringida como regla inicial para preservar referencias. Todas las asignaciones usan claves compuestas. Se indexa el lado inverso de las relaciones para consultas y control referencial.
- La primera migración no incluye registros nominales ni datos históricos. La prueba de integridad debe insertar solo datos sintéticos en una transacción y revertirlos al terminar.

Aceptación: migración aplicable y reaplicable de forma idempotente por Prisma; rechazo de código repetido, asignación duplicada, referencia inexistente y periodo invertido; verificación de eliminación restringida.

## Catálogo inicial de permisos

T02 / R01 y R12. La semilla registra cinco perfiles de respuesta —Estudiante, Acudiente, Docente, Orientador y Administrativo— con ibite:complete. El Equipo de Apoyo Psicosocial recibe permisos explícitos de lectura individual y nominal, creación, corrección, aprobación, eliminación, importación, exportación y consulta de auditoría. La eliminación requiere reglas de conservación y auditoría antes de habilitar una operación. El catálogo no concede administración de cuentas, asignación de permisos, habilitación de campañas ni publicación de métricas. El público no se representa como rol de cuenta.

La semilla es idempotente y transaccional. Puede repetirse para crear y actualizar los elementos del catálogo inicial. Conserva otras asignaciones existentes. No crea cuentas, contraseñas, pertenencias, instituciones ni periodos. El catálogo aún no se aplica a rutas HTTP. La comprobación de pertenencia a la Universidad, el ámbito y la autorización efectiva se incorporarán en el incremento de autenticación y autorización.

Prisma se activa en Nest cuando DATABASE_URL tiene valor. El arranque comprueba la conexión y el cierre libera el cliente. La ruta de salud sigue midiendo el proceso HTTP. Con DATABASE_URL vacía, la base HTTP arranca sin conexión, para permitir el entorno mínimo y las pruebas de transporte.

Instituciones y periodos tienen [rutas internas de consulta](../05-contratos-api/catalogos-internos.md). El suministro de los catálogos oficiales y la definición de quién podrá modificarlos siguen pendientes.
