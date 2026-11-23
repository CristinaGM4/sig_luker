"""Preview DANE references or convert approved institutional point mappings."""

import argparse
import json
import math
from pathlib import Path
import re
import sqlite3
import struct
import sys
from zipfile import ZipFile

ENTRY = "MapasCompilados/instituciones.gpkg"
LAYER = "mtss_10_instituciones__instituciones_priorizadas"
MAX_BYTES = 10_000_000


def read_point(blob):
    if not isinstance(blob, bytes) or len(blob) < 29 or blob[:3] != b"GP\x00":
        raise ValueError("Cabecera de geometría inválida")
    flags = blob[3]
    envelope = (flags >> 1) & 7
    if flags & 0xF0 or envelope not in {0, 1}:
        raise ValueError("Se requiere un punto simple y no vacío")
    endian = "<" if flags & 1 else ">"
    if struct.unpack_from(endian + "i", blob, 4)[0] != 4326:
        raise ValueError("SRID del punto distinto de 4326")
    offset = 8 + (32 if envelope == 1 else 0)
    if len(blob) != offset + 21 or blob[offset] not in {0, 1}:
        raise ValueError("Punto WKB inválido")
    endian = "<" if blob[offset] else ">"
    geometry, lon, lat = struct.unpack_from(endian + "Idd", blob, offset + 1)
    if geometry != 1 or not (math.isfinite(lon) and math.isfinite(lat) and -180 <= lon <= 180 and -90 <= lat <= 90):
        raise ValueError("Se requieren longitud y latitud WGS84 válidas")
    return [lon, lat]


def load_rows(path):
    if path.suffix.lower() == ".zip":
        with ZipFile(path) as archive:
            entries = [item for item in archive.infolist() if item.filename == ENTRY]
            if len(entries) != 1 or entries[0].file_size > MAX_BYTES:
                raise ValueError("GeoPackage institucional ausente, duplicado o demasiado grande")
            data = archive.read(entries[0])
    elif path.suffix.lower() == ".gpkg" and path.stat().st_size <= MAX_BYTES:
        data = path.read_bytes()
    else:
        raise ValueError("Se admite MapasCompilados.zip o instituciones.gpkg")
    db = sqlite3.connect(":memory:")
    try:
        db.deserialize(data)
        db.execute("PRAGMA trusted_schema=OFF")
        db.execute("PRAGMA query_only=ON")
        descriptor = db.execute(
            "SELECT column_name, geometry_type_name, srs_id, z, m FROM gpkg_geometry_columns WHERE table_name=?",
            (LAYER,),
        ).fetchall()
        if descriptor != [("geom", "POINT", 4326, 0, 0)]:
            raise ValueError("No se encontró la capa institucional POINT WGS84 esperada")
        rows = db.execute(
            f'SELECT fid, geom, cod_dane, cod_sede_p, sede_princ, nombre_ins FROM "{LAYER}" ORDER BY fid'
        ).fetchall()
    finally:
        db.close()
    if not rows or len(rows) > 10000:
        raise ValueError("Cantidad de puntos no admitida")
    result = []
    seen = set()
    for fid, blob, dane, parent, principal, label in rows:
        if not isinstance(dane, str) or not re.fullmatch(r"[0-9]{12}", dane) or dane in seen:
            raise ValueError("Código DANE de sede inválido o repetido")
        if not isinstance(label, str) or not label.strip() or len(label) > 160:
            raise ValueError("Etiqueta institucional inválida")
        seen.add(dane)
        result.append({
            "fid": fid, "dane": dane, "parentDane": parent, "principal": principal == "S",
            "label": label, "coordinates": read_point(blob),
        })
    return result


def convert(rows, mapping):
    if not isinstance(mapping, dict) or any(
        not isinstance(code, str) or not code or code != code.strip() or len(code) > 120
        for code in mapping.values()
    ):
        raise ValueError("El cruce debe ser un objeto DANE → código SIG-LUKER")
    codes = {row["dane"] for row in rows}
    if codes != mapping.keys():
        raise ValueError("El cruce debe cubrir exactamente los códigos DANE del archivo")
    return {"type": "FeatureCollection", "features": [
        {
            "type": "Feature",
            "id": row["fid"],
            "geometry": {"type": "Point", "coordinates": row["coordinates"]},
            "properties": {
                "institutionCode": mapping[row["dane"]], "label": row["label"],
                "dane": row["dane"], "parentDane": row["parentDane"],
            },
        }
        for row in rows
    ]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--mapping", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        if bool(args.mapping) != bool(args.output):
            raise ValueError("Especifique --mapping y --output juntos")
        rows = load_rows(args.input)
        if args.mapping:
            with args.mapping.open(encoding="utf-8-sig") as file:
                collection = convert(rows, json.load(file))
            with args.output.open("x", encoding="utf-8") as file:
                json.dump(collection, file, ensure_ascii=False, indent=2)
                file.write("\n")
            print(f"Preparados {len(rows)} puntos para revisión local")
        else:
            principals = {row["dane"] for row in rows if row["principal"]}
            inventory = [
                {key: value for key, value in row.items() if key != "coordinates"}
                | {"principalInFile": row["parentDane"] in principals}
                for row in rows
            ]
            print(json.dumps(inventory, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, OSError, sqlite3.Error) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
