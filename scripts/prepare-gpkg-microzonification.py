"""Review or export the supplied microzonification layer without accessing PostgreSQL."""

import argparse
from collections import Counter
import json
import math
from pathlib import Path
import sqlite3
import struct
import sys
from zipfile import ZipFile

ENTRY = "MapasCompilados/microzonificacion.gpkg"
MAX_BYTES = 10_000_000


def read_multipolygon(blob):
    if not isinstance(blob, bytes) or len(blob) < 17 or blob[:3] != bytes((71, 80, 0)):
        raise ValueError("Cabecera GeoPackage inválida")
    flags = blob[3]
    envelope = (flags >> 1) & 7
    if flags & 0xF0 or envelope not in {0, 1}:
        raise ValueError("Se requiere geometría no vacía y bidimensional")
    endian = "<" if flags & 1 else ">"
    if struct.unpack_from(endian + "i", blob, 4)[0] != 4326:
        raise ValueError("SRID distinto de WGS84")
    offset = 8 + (32 if envelope else 0)

    def take(pattern, order):
        nonlocal offset
        layout = struct.Struct(order + pattern)
        if offset + layout.size > len(blob):
            raise ValueError("WKB incompleto")
        result = layout.unpack_from(blob, offset)
        offset += layout.size
        return result

    def geometry_header(expected):
        flag, = take("B", "<")
        if flag not in {0, 1}:
            raise ValueError("Orden de bytes WKB inválido")
        order = "<" if flag else ">"
        kind, count = take("II", order)
        if kind != expected or not 0 < count <= (len(blob) - offset) // 4:
            raise ValueError("Tipo o cantidad de componentes WKB inválidos")
        return order, count

    _, polygons = geometry_header(6)
    coordinates = []
    for _ in range(polygons):
        order, ring_count = geometry_header(3)
        polygon = []
        for ring_index in range(ring_count):
            point_count, = take("I", order)
            if not 4 <= point_count <= (len(blob) - offset) // 16:
                raise ValueError("Cantidad de vértices inválida")
            ring = []
            for _ in range(point_count):
                lon, lat = take("dd", order)
                if not (math.isfinite(lon) and math.isfinite(lat) and -180 <= lon <= 180 and -90 <= lat <= 90):
                    raise ValueError("Coordenada WGS84 inválida")
                ring.append([lon, lat])
            if ring[0] != ring[-1] or len({tuple(point) for point in ring}) < 3:
                raise ValueError("Anillo abierto o degenerado")
            origin_x, origin_y = ring[0]
            area = sum(
                (x - origin_x) * (next_y - origin_y) - (next_x - origin_x) * (y - origin_y)
                for (x, y), (next_x, next_y) in zip(ring, ring[1:])
            )
            if area == 0:
                raise ValueError("Anillo sin área")
            if (area > 0) != (ring_index == 0):
                ring.reverse()
            polygon.append(ring)
        coordinates.append(polygon)
    if offset != len(blob):
        raise ValueError("Datos adicionales al final de la geometría")
    return coordinates


def load_collection(path):
    if path.suffix.lower() == ".zip":
        with ZipFile(path) as archive:
            entries = [item for item in archive.infolist() if item.filename == ENTRY]
            if len(entries) != 1 or entries[0].file_size > MAX_BYTES:
                raise ValueError("GeoPackage de microzonificación ausente, duplicado o demasiado grande")
            data = archive.read(entries[0])
    elif path.suffix.lower() == ".gpkg" and path.stat().st_size <= MAX_BYTES:
        data = path.read_bytes()
    else:
        raise ValueError("Se admite MapasCompilados.zip o microzonificacion.gpkg")
    db = sqlite3.connect(":memory:")
    features = []
    try:
        db.deserialize(data)
        db.execute("PRAGMA trusted_schema=OFF")
        db.execute("PRAGMA query_only=ON")
        descriptor = db.execute(
            "SELECT column_name, geometry_type_name, srs_id, z, m FROM gpkg_geometry_columns WHERE table_name=?",
            ("microzonificacion",),
        ).fetchall()
        if descriptor != [("geom", "MULTIPOLYGON", 4326, 0, 0)]:
            raise ValueError("Se requiere la capa microzonificacion MultiPolygon WGS84")
        for fid, blob, zone, description in db.execute(
            "SELECT fid, geom, zona, descripcion FROM microzonificacion ORDER BY fid LIMIT 10001"
        ):
            if type(fid) is not int or not isinstance(zone, str) or not zone.strip() or not isinstance(description, str):
                raise ValueError("Identificador, zona o descripción inválidos")
            features.append({
                "type": "Feature",
                "id": fid,
                "geometry": {"type": "MultiPolygon", "coordinates": read_multipolygon(blob)},
                "properties": {"zona": zone, "descripcion": description},
            })
    finally:
        db.close()
    if not 0 < len(features) <= 10000:
        raise ValueError("Cantidad de entidades no admitida")
    if len({feature["id"] for feature in features}) != len(features):
        raise ValueError("Identificador de origen repetido")
    return {"type": "FeatureCollection", "features": features}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        collection = load_collection(args.input)
        features = collection["features"]
        if args.output:
            with args.output.open("x", encoding="utf-8") as file:
                json.dump(collection, file, ensure_ascii=False, separators=(",", ":"))
                file.write("\n")
        print(json.dumps({
            "features": len(features),
            "zones": dict(sorted(Counter(feature["properties"]["zona"] for feature in features).items())),
            "geometryType": "MultiPolygon",
            "srid": 4326,
        }, ensure_ascii=False))
        return 0
    except (OSError, ValueError, sqlite3.Error) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
