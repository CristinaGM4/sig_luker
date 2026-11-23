# Ensayo de recuperación de SIG-LUKER

R12 y R13. El ensayo reproduce un respaldo lógico y una restauración con los comandos de PostgreSQL. Usa exclusivamente el contenedor desechable creado por `./scripts/verify-isolated-db.ps1`.

1. Aplicar las migraciones, ejecutar la batería de pruebas y generar campañas y aplicaciones IBITE sintéticas.
2. Insertar una ficha MTTS y una evaluación de Factibilidad de prueba en la base temporal.
3. Crear un respaldo lógico en formato personalizado con `pg_dump`.
4. Crear la base independiente `sig_restore_verify` dentro del mismo contenedor.
5. Restaurar el respaldo con `pg_restore`, en una transacción y con error fatal ante cualquier fallo.
6. Comparar origen y destino mediante conteos y huellas de las filas de campañas, aplicaciones, resultados, MTTS, Factibilidad y auditoría. Verificar las migraciones aplicadas y una operación PostGIS.
7. Eliminar el contenedor desechable al terminar. El archivo queda dentro del contenedor.

Las huellas SQL comparan contenido de las tablas piloto y se consumen dentro del ensayo. No se usan para cifrado ni se publican. El script no extrae un respaldo del equipo ni abre una base real. No se probaron restauración en infraestructura institucional, pérdida de un servidor, retención, cifrado de copias ni objetivos de tiempo y pérdida de datos. Esos aspectos quedan para el procedimiento operativo bajo custodia de la Universidad de Manizales.
