# Entornos PostgreSQL y PostGIS

La base de desarrollo usa PostgreSQL 17 y PostGIS 3.7 de docker-postgis. La imagen Linux amd64 se verificó en el registro y está fijada por digest en ambos archivos Compose. El puerto se publica solo en la interfaz local. Estos entornos son para desarrollo y pruebas sintéticas. La infraestructura de custodia de la Universidad se definirá por separado.

| Entorno | Proyecto Compose | Base y usuario | Puerto local predeterminado | Almacenamiento |
|---|---|---|---|---|
| Desarrollo | sig-piloto-pago | sig_dev | 55432 | Volumen persistente |
| Pruebas | sig-piloto-pago-test | sig_test | 55433 | Memoria temporal del contenedor |

Copia .env.example a .env si aún no existe y completa POSTGRES_DEV_PASSWORD y POSTGRES_TEST_PASSWORD con contraseñas locales distintas. Si ya tienes un .env, agrega solo las variables nuevas. Las contraseñas vacías impiden validar el archivo Compose correspondiente. El proyecto de pruebas conserva los datos durante la vida del contenedor. Utiliza datos sintéticos.

## Arranque y comprobación espacial

Con el motor de contenedores Linux funcionando, ejecuta desde la raíz:

```powershell
docker compose up -d --wait db
docker compose -f compose.test.yaml up -d --wait db-test
Get-Content -Raw ./test/db/postgis-smoke.sql | docker compose -f compose.test.yaml exec -T db-test psql -U sig_test -d sig_test
```

La prueba exige PostGIS inicializado y verifica geometría Point con SRID 4326, creación de un índice GiST, intersección espacial, transformación a 3857 y serialización GeoJSON. Usa una tabla temporal dentro de una transacción que termina en ROLLBACK. El índice se crea como comprobación de DDL. La selección del plan de índices requiere datos y consultas representativos en una prueba posterior.

## Prisma

Candidato estable: Prisma ORM 7.10.1, cuyos requisitos de Node admiten la versión 22.14.0 instalada. Para las operaciones espaciales, declarar la geometría como Unsupported cuando corresponda y encapsular consultas SQL parametrizadas. Las migraciones controladas deberán declarar la extensión en entornos gestionados y de verificación de migraciones. La imagen de desarrollo inicializa PostGIS en su base por defecto.

La extensión oficial tipada PostGIS está documentada para Prisma 8. En el registro consultado, Prisma 8 y su extensión PostGIS corresponden a versiones candidatas. Prisma 8 requiere además una versión de Node superior a la instalada. La propuesta inicial conserva Prisma 7 estable. El cliente definitivo, el esquema de dominio y las migraciones se incorporarán con el primer modelo aprobado.

[Imagen docker-postgis](https://github.com/postgis/docker-postgis) · [Tipos no soportados en Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/unsupported-database-features) · [Extensión PostGIS en Prisma 8](https://www.prisma.io/docs/orm/extensions/postgis)

Consulta el [registro de verificación](../08-pruebas/entorno-datos.md) para conocer el alcance de las comprobaciones y el bloqueo del motor local.

## Primera migración de dominio

Prisma CLI 7.10.1 queda fijado como dependencia de desarrollo. La configuración lee DATABASE_URL del entorno o de .env. Para la base de pruebas, configura la URL con host 127.0.0.1, puerto 55433, base y usuario sig_test, y la contraseña definida en POSTGRES_TEST_PASSWORD. Usa la contraseña codificada como componente de URL cuando tenga caracteres reservados. Verifica el entorno destino antes de aplicar:

```powershell
npm run db:validate
npm run db:migrate
npm run db:status
Get-Content -Raw ./test/db/identity-catalogs-smoke.sql | docker compose -f compose.test.yaml exec -T db-test psql -U sig_test -d sig_test
```

La primera migración contiene tablas de identidad y catálogos. PostGIS sigue inicializándose en la base local mediante la imagen. El modelo todavía no necesita columnas espaciales. El ajuste de dependencia de desarrollo fija Effect 3.22.5 dentro de @prisma/config para corregir el aviso GHSA-7589-6fvf-x4pw detectado en el conjunto anterior.

## Cliente Nest y catálogo inicial

Con DATABASE_URL configurada, Nest comprueba la conexión a PostgreSQL antes de escuchar y libera el cliente Prisma al cerrar. Con la variable vacía se puede usar la base HTTP sin persistencia. Después de migrar el entorno autorizado, ejecuta npm run build y npm run db:seed para cargar el catálogo. La semilla no crea cuentas ni credenciales.

Para ejecutar la prueba de integración en la base aislada, exporta DATABASE_TEST_URL en la sesión de PowerShell con la misma URL de sig_test antes de ejecutar npm test. La prueba comprueba que los roles y sus permisos esperados permanezcan iguales al repetir la semilla.

## Verificación desechable reproducible

Desde la raíz, con PowerShell 7, Docker Linux y las dependencias npm instaladas:

```powershell
./scripts/verify-isolated-db.ps1
```

El script crea un proyecto Compose temporal con nombre único, una contraseña efímera y puerto asignado por Docker en 127.0.0.1. Comprueba migraciones desde cero y repetición, diferencias de Prisma, integridad relacional, PostGIS, pruebas Node.js, lint y formato. Al terminar detiene el contenedor que creó e intenta retirar su red temporal. Restaura las variables de la sesión y no apunta a la base habitual. Las pruebas Python del extractor se ejecutan por separado.
