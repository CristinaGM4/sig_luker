# Backend de monitoreo psicosocial y SIG

API REST modular con Node.js, TypeScript y NestJS 12 sobre Express. El backend expone salud del proceso HTTP y, con PostgreSQL configurado, la consulta de identidad de una sesión válida. Consulta el [índice documental](docs/README.md) y las [instrucciones de trabajo](AGENTS.md).

## Requisitos e instalación

Usa Node.js 22.13 o posterior en la rama 22, o Node.js 24, con npm. La verificación local se ejecutó con Node.js 22.14.0 y npm 11.1.0. Instala desde el archivo de bloqueo y arranca:

```powershell
npm ci
Copy-Item .env.example .env
npm run build
npm start
```

La copia de .env es opcional y está pensada para una primera configuración local. Si ya existe, edítala según necesites. El arranque lee HOST, PORT y SWAGGER_ENABLED. Sus valores predeterminados son 127.0.0.1, 3000 y false.

## API y verificación

- GET /api/v1/health devuelve 200 con {"status":"ok"}. Comprueba que el proceso HTTP responde.
- Con DATABASE_URL configurada, GET /api/v1/ready comprueba PostgreSQL y devuelve 200 o 503.
- GET /api/v1/auth/me devuelve la identidad técnica de una sesión válida cuando DATABASE_URL está configurada. Consulta el [contrato de sesión](docs/05-contratos-api/sesion-interna.md).
- DELETE /api/v1/auth/session revoca el token de la sesión actual con HTTP 204.
- Las rutas internas de [instituciones y periodos](docs/05-contratos-api/catalogos-internos.md) requieren una sesión autorizada y usan paginación.
- Con SWAGGER_ENABLED=true y después de reiniciar, abre /docs para Swagger y /docs-json para OpenAPI.
- En Postman puedes importar la [colección](docs/05-contratos-api/postman/backend.postman_collection.json) y su [entorno local](docs/05-contratos-api/postman/local.postman_environment.json).
- Ejecuta npm test, npm run lint y npm run format:check para reproducir las comprobaciones.

Si el arranque falla con EADDRINUSE, configura otro PORT y ajusta la URL de prueba. Si recibes 404 en /docs, comprueba SWAGGER_ENABLED y reinicia el proceso. Si falta dist/main.js, ejecuta npm run build.

Los archivos Compose de PostgreSQL/PostGIS están preparados para [desarrollo y pruebas aisladas](docs/03-arquitectura/entorno-datos.md). El [modelo mínimo de identidad y catálogos](docs/04-modelo-datos/identidad-catalogos.md) tiene una primera migración de Prisma, verificada en PostgreSQL aislado. La carga de referencia registra roles, permisos y metadatos de instrumentos. No crea cuentas ni guarda respuestas. Los contratos de negocio bajo docs/05-contratos-api son borradores, salvo los contratos implementados de [salud](docs/05-contratos-api/salud.md), [consulta de sesión](docs/05-contratos-api/sesion-interna.md) y [catálogos internos](docs/05-contratos-api/catalogos-internos.md).

Con PostgreSQL configurado, la [consulta de resultados IBITE](docs/05-contratos-api/ibite-resultados.md) requiere rol psicosocial, permiso de lectura y una asignación institucional explícita.

[Gestión de asignaciones psicosociales](docs/05-contratos-api/asignaciones-psicosociales.md): PUT y DELETE requieren scope:manage, sin concesión por defecto.

GET /api/v1/mis-aplicaciones-ibite lista las habilitaciones vigentes de la cuenta con permiso ibite:complete. Ver [captura IBITE](docs/05-contratos-api/ibite-captura.md).

GET /api/v1/interno/instituciones/{institucionId}/auditoria lista metadatos de [auditoría institucional](docs/05-contratos-api/auditoria-institucional.md) dentro del ámbito del equipo psicosocial.

La [API pública del SIG](docs/05-contratos-api/sig-microzonificacion.md) incluye un catálogo de capas cargadas y la consulta GeoJSON de microzonificación. El mismo documento describe la verificación de solo lectura y la carga explícita de la edición revisada.

Consulta pública de las 21 sedes aportadas implementada en GET `/api/v1/publico/sig/instituciones`. Contrato en `docs/05-contratos-api/instituciones-publicas.md`.

## Frontend incluido

El proyecto Angular está en frontend/. Con Node 24 ejecutar `cd frontend`, `npm ci` y `npm start`. Abrir http://localhost:4200/mapa. El proxy apunta al backend local en 3002, como se configura en .env.example. Consultar frontend/README.md.
