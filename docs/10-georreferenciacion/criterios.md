# Georreferenciación

Clasificar institución/sede, microzonificación, amenaza, vulnerabilidad y riesgo según metadatos oficiales. Por fuente, validar licencia, autoridad, escala, geometría, CRS de origen, vigencia, cobertura y calidad. Evaluar archivo local para reproducibilidad, ArcGIS REST o WFS para entidades remotas y WMS para visualización. Documentar disponibilidad y límites de cada fuente.

Probar transformación a GeoJSON en longitud/latitud WGS84, validez, filtros de caja espacial, tipo geométrico y uso de índices GiST con muestras autorizadas. Para distancias o áreas, acordar proyección métrica o geografía según consulta. Las uniones por ubicación necesitan reglas para coincidencias múltiples y precisión insuficiente. Reservar cualquier índice derivado para metodología aprobada.

## Consulta interna de puntos institucionales

R10/R12. `GET /api/v1/interno/instituciones/{institucionId}/sig/puntos` requiere sesión, rol psicosocial, permiso `records:read` y asignación institucional vigente. La consulta se audita y la respuesta usa `Cache-Control: no-store`.

`bbox` requiere cuatro decimales separados por coma, en orden oeste, sur, este y norte. Se comprueba el rango WGS84 y la extensión positiva. El corte usa intersección e incluye el borde. La API devuelve hasta 100 entidades GeoJSON de tipo Point, con longitud antes de latitud. Las propiedades contienen etiqueta y fuente. `nextCursor` permite recorrer más resultados manteniendo los filtros. La consulta rechaza un cursor fuera del recorte o de la institución.

Se devuelve 400 para una caja inválida, parámetros duplicados o desconocidos y UUID inválido. 401 para sesión inválida, 403 para permiso faltante y 404 para institución fuera de ámbito, inactiva o inexistente, o cursor fuera del corte.

PostGIS almacena puntos con SRID 4326 y un índice GiST. Prisma representa la geometría mediante `Unsupported`. SQL parametrizado filtra la caja y convierte la geometría a JSON. Se usaron dos puntos ficticios. Falta incorporar fuentes oficiales, metadatos y reglas de publicación. Las capas de amenaza o riesgo y sus interpretaciones permanecen fuera de este incremento.

Fuente técnica: [Prisma ORM v7 y campos no soportados](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/unsupported-database-features).

## Validación local previa de una capa de puntos

R10. Ejecutar después de compilar:

```powershell
npm run preview:sig -- instituciones.geojson codigos-institucionales.json
```

El archivo de códigos es un arreglo JSON de códigos institucionales exactos y únicos del catálogo autorizado. La capa preparada debe ser una GeoJSON FeatureCollection de puntos bidimensionales WGS84 en orden longitud–latitud. Cada entidad requiere `properties.institutionCode` y `properties.label`. El comando rechaza declaraciones `crs`, geometría distinta de Point, coordenadas no finitas o fuera de rango, etiquetas vacías, códigos desconocidos y puntos repetidos para la misma institución y coordenada. Dos puntos distintos de una institución pueden representar sedes.

El reporte JSON da totales y motivos por posición. Usa código de salida 0 si la revisión no encuentra problemas, 2 si algunas entidades se rechazan y 1 si los archivos o la configuración son inválidos. El reporte carece de coordenadas y etiquetas originales. El proceso no conecta a PostgreSQL ni carga entidades.

Límites técnicos de la revisión local: 5 MB por archivo y 10.000 entidades por capa. Los puntos válidos en rango no garantizan que el archivo tenga sus ejes bien declarados o que el punto esté en Manizales. Antes de una carga se verificará autoridad, licencia, versión, CRS original, cobertura y correspondencia con el catálogo. Si la fuente usa otro CRS deberá transformarse de forma explícita y documentada antes de la revisión.

## Carga transaccional de una capa de prueba

```powershell
npm run import:sig:test -- capa-sintetica.geojson "Fuente sintética"
```

El comando exige `DATABASE_TEST_URL` local para `sig_test`. El archivo debe pasar la misma validación de puntos que la vista previa. Se usan los códigos exactos de las instituciones activas de la base. Cuando hay incidencias, el lote completo deja cero inserciones. La escritura usa SQL parametrizado y PostGIS 4326.

Cada punto conserva la etiqueta de fuente, SHA-256 del archivo original y posición de la entidad. La clave única evita duplicar puntos al repetir byte por byte el archivo, incluso con dos cargas simultáneas. Se informa el número de puntos nuevos y existentes. Si cambia el contenido del archivo, su huella cambia. La sustitución de versiones y la conciliación de puntos entre distintas fuentes requieren un procedimiento separado.

La prueba usa una capa ficticia. Comprueba que un lote con un código desconocido deje la base sin inserciones, que dos cargas del mismo archivo guarden un solo punto y que ese punto aparezca en el recorte GeoJSON autorizado. Pendiente la fuente institucional oficial y su ficha técnica antes de autorizar una carga operativa.

[Inventario de MapasCompilados](inventario-mapas-compilados.md): 21 puntos institucionales y 139 polígonos de microzonificación. Las otras dos tablas se entregaron vacías. Pendiente cruce DANE y confirmación de metadatos.

## Plan de puntos contra un catálogo en PostgreSQL

`npm run import:sig:test -- instituciones.geojson "Fuente" --plan` valida los códigos de la capa contra las instituciones activas de `SIG_IMPORT_DATABASE_URL` dentro de una transacción de solo lectura. Informa posiciones rechazadas y, si el archivo es válido, cuántos puntos ya existen para su huella y cuántos quedan pendientes. La correspondencia DANE debe estar documentada al preparar el GeoJSON. La escritura de puntos sigue limitada a la base de prueba.
