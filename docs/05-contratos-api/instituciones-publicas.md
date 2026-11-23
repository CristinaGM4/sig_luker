# Sedes educativas públicas

Incremento autorizado por la usuaria el 23 de noviembre de 2026 para incorporar los 21 puntos aportados y navegar del visor al Componente 2 sin sesión.

GET `/api/v1/publico/sig/instituciones` devuelve una FeatureCollection con hasta 100 puntos en orden por identificador de origen. Esta edición tiene 21 registros de `instituciones.gpkg` en WGS84. No admite query parameters, ante parámetros desconocidos devuelve 400. Devuelve una colección vacía si no hay registros. No requiere Bearer.

Cada Feature tiene id numérico de origen, geometría Point y propiedades institutionKey (clave de navegación referencia-1 a referencia-10), label, dane, parentDane, principal, source, mappingBasis y mappingNote nullable. El DTO excluye los campos de contacto y atributos psicosociales del archivo original.

Las asociaciones se usan para navegación por nombre, sin cambiar los códigos originales. Siete registros llevan observaciones sobre código principal pendiente de validación. El punto de Institución Integ La Sultana se conserva en la ubicación del archivo, aunque queda fuera del área central. No se deducen niveles de riesgo ni pertenencia oficial a una zona.

La tabla pública se crea mediante la migración 20261123000100_public_institution_sites. Después de `npm run build` y `npm run db:migrate`, ejecutar `node --env-file=.env scripts/import-public-institutions.mjs`. El importador usa el artefacto revisado en outputs/sig y registra el SHA-256 del GeoPackage original. La carga usa transacción y bloqueo, permite repetir la misma edición y rechaza una edición diferente.

La ruta interna existente sigue exigiendo sesión. Esta ruta pública no modifica asignaciones institucionales ni los registros internos.

Aceptación comprobada con test/public-institutions.test.mjs, consulta HTTP sin token, rechazo de filtros desconocidos, 21 IDs únicos, diez claves de navegación, DTO sin contactos, colección vacía y protección de la ruta interna. El visor muestra los 21 puntos, filtra instituciones y abre Componente 2 con la selección.
