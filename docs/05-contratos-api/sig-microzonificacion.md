# Consulta de microzonificación de 2002

R10. `GET /api/v1/publico/sig/microzonificacion` es una consulta pública de la cartografía entregada en `MapasCompilados.zip`.

- `bbox` es obligatorio y recibe `oeste,sur,este,norte` en EPSG:4326. Ejemplo `-76,5,-75,6`.
- `after` es opcional. Usa el `nextCursor` de la página anterior con el mismo `bbox`.
- Respuesta `200 application/geo+json`. Devuelve hasta 20 entidades completas que intersectan la caja, ordenadas por identificador de origen. Cada entidad incluye su `MultiPolygon` y las propiedades `zone`, `label` y `mapYear`. `nextCursor` es nulo al terminar. Una caja sin coincidencias o una base sin capa devuelve una colección vacía.
- Respuesta `400` para parámetros inválidos.

En la zona P se publica «Rocas, flujos y depósitos de poco espesor». El atributo original «Area Intermedia B-C» queda en PostgreSQL para trazabilidad. El mapa documenta microzonificación histórica y la consulta no incluye datos institucionales ni personales.

## Verificación local

```powershell
./scripts/verify-isolated-db.ps1 -MicrozonificationPath outputs/sig/microzonificacion-revision.geojson
```

La migración incorpora una tabla dedicada y un índice espacial GiST. El cargador verifica la huella del GeoJSON revisado. En el modo de prueba predeterminado se limita a `sig_test` en localhost. Inserta la edición completa en una transacción y, si se repite el mismo archivo, conserva sus filas. Una geometría inválida o una edición con otra huella se rechazan.

## Preparación operativa

Tras compilar y aplicar la migración en el entorno autorizado, el operador suministra `SIG_IMPORT_DATABASE_URL` por el entorno del proceso. El plan funciona con un usuario de solo lectura. La carga requiere permisos de lectura, inserción y bloqueo sobre la tabla de la capa.

```powershell
node scripts/import-sig-microzonification.mjs archivo-revisado.geojson --plan
node scripts/import-sig-microzonification.mjs archivo-revisado.geojson --apply
```

El plan usa una transacción de solo lectura y devuelve `pending` con el número de entidades por cargar. El modo de aplicación revalida el estado dentro de su propia transacción. Una nueva edición requiere su propio procedimiento.

## Catálogo para el visor

`GET /api/v1/publico/sig/capas` responde `200` con `layers`. La microzonificación aparece cuando tiene filas cargadas. Incluye identificador, año, carácter histórico, CRS, tipo geométrico, fuente, ruta de entidades y leyenda. Los puntos institucionales y los datos psicosociales permanecen fuera del catálogo.

Los criterios de aceptación se verifican con la prueba HTTP con datos sintéticos, la paridad OpenAPI/Postman y la carga del archivo cartográfico en la base desechable.
