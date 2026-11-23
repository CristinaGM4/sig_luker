# Inventario de MapasCompilados

Revisión del 22 de noviembre de 2026. SHA-256 del ZIP: `d5c81e117faa475cfb5543ad1e9f8d71b79a38c5e699f67a8f5df909b4181e26`. Se inspeccionaron los GeoPackage en memoria y se excluyeron las entradas auxiliares de macOS. No se cargaron datos en PostgreSQL.

| Archivo | Capa y geometría | Conteo | Hallazgo |
|---|---|---:|---|
| instituciones.gpkg | mtss_10_instituciones__instituciones_priorizadas, Point WGS84 EPSG:4326 | 21 | Los 21 códigos DANE de entidad son distintos y las 21 geometrías coinciden con los campos longitud y latitud. |
| microzonificacion.gpkg | microzonificacion, MultiPolygon WGS84 EPSG:4326 | 139 | Campo zona con A: 33, B: 98, P: 7 y T: 1 polígonos. Falta confirmar el significado de cada clase y la fuente oficial. |
| amenazariesgo.gpkg | Tabla amenazariesgo sin capa publicada en gpkg_contents | 0 | El archivo define un CRS local CartManizalesMAGNA, pero no trae entidades para revisar. |
| deslizamiento_u5.gpkg | Tabla deslizamiento_u4 sin capa publicada en gpkg_contents | 0 | No trae entidades. La etiqueta de la tabla no coincide con el nombre del archivo. |

## Correspondencia institucional

El campo `sede_princ` marca nueve puntos como sedes principales y doce como no principales. Siete de los doce tienen un código `cod_sede_p` que aparece como sede principal en otra fila del mismo archivo. Los otros cinco registros corresponden a dos sedes del Instituto Latinoamericano y una de Fe y Alegría La Paz, La Asunción y La Sultana. En total aparecen catorce valores distintos de `cod_sede_p`.

Para preparar la carga se requiere un cruce explícito entre código DANE de sede, código de sede principal e identificador interno de institución. No se deben asociar puntos por semejanza de nombre. Las denominaciones abreviadas y las variantes de sedes deben conservar su etiqueta de origen. No es necesario importar correo, teléfono ni dirección para la primera capa.

## Orden recomendado de incorporación

1. Revisar el cruce institucional por DANE y preparar un GeoJSON de puntos con código SIG-LUKER, etiqueta y procedencia para usar el importador probado.
2. Registrar microzonificación como capa separada de polígonos. Cotejar leyenda, vigencia, autoridad y condiciones de uso. Mantener zona y descripción como atributos de origen.
3. Solicitar nuevas exportaciones de amenaza/riesgo y deslizamiento con entidades, después de confirmar la capa u hoja de origen y el CRS. La definición CRS local no debe interpretarse como un código EPSG.

La microzonificación no determina por sí sola el riesgo de una escuela. La capa institucional y la microzonificación no se han publicado.

## Inventario de sedes y conversión controlada

El [inventario de cruce DANE v1](cruce-dane-sedes.v1.json) lista las 21 sedes, código DANE, código de sede principal, etiqueta de origen e indicador de sede principal presente en el archivo. Se omiten coordenadas y campos de contacto en este inventario. Los cinco puntos no principales sin su sede principal en el GeoPackage conservan el código que declara la fuente.

```powershell
python scripts/prepare-gpkg-institutions.py MapasCompilados.zip
python scripts/prepare-gpkg-institutions.py MapasCompilados.zip --mapping cruce-validado.json --output instituciones.geojson
```

El cruce aprobado es un objeto JSON de código DANE de sede a código interno de institución. Debe cubrir exactamente los códigos del archivo. Se permiten varias sedes para un mismo código interno. El conversor lee las geometrías originales, comprueba que sean puntos WGS84 y genera el GeoJSON para el validador SIG. No sobrescribe un archivo existente. La conversión no inventa correspondencias ni escribe en PostgreSQL.

## Microzonificación disponible para revisión local

`python scripts/prepare-gpkg-microzonification.py MapasCompilados.zip --output microzonificacion.geojson` lee solo la capa MultiPolygon WGS84. El archivo [GeoJSON de revisión](../../outputs/sig/microzonificacion-revision.geojson) conserva identificador de origen, zona y descripción, además de las coordenadas originales. Se verificaron los 139 registros y se normalizó la orientación de anillos para GeoJSON: exteriores antihorarios e interiores horarios. El comprobador rechaza coordenadas fuera de rango, anillos abiertos o sin área, y SRID incompatibles.

La verificación estructural se complementó con la prueba de validez por entidad en PostGIS descrita abajo.

## Leyenda, año y validación topológica

El responsable del proyecto confirmó que el mapa es de **2002** y autorizó publicar las capas cartográficas entregadas. La autorización queda registrada para este alcance. La fecha proviene de la confirmación del proyecto.

| Zona | Descripción del archivo | Estado de interpretación |
|---|---|---|
| A | Cenizas | Coincide con la confirmación del responsable |
| B | Rellenos | Coincide con la confirmación del responsable |
| P | Area Intermedia B-C | Etiqueta pública aprobada por el responsable: «Rocas, flujos y depósitos de poco espesor». Se conserva el valor original en la base. |
| T | Limite_zonificado | Texto conservado del archivo |

Se ejecutaron `ST_GeomFromGeoJSON`, `ST_IsValid`, `ST_SRID` y `GeometryType` en un contenedor desechable sin red, con tabla temporal y rollback. Resultado: **139 de 139 MultiPolygon válidos en EPSG:4326**, con 33 A, 98 B, 7 P y 1 T. No se detectaron geometrías incompatibles. La prueba comprueba validez por entidad. No mide solapamientos entre zonas ni vigencia cartográfica. No se cargó la capa en la base operativa.

La [consulta pública de microzonificación](../05-contratos-api/sig-microzonificacion.md) usa la leyenda aprobada y presenta el año 2002 como fecha histórica del mapa.
