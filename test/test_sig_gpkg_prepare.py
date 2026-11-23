import importlib.util
from pathlib import Path
import sqlite3
import struct
from tempfile import TemporaryDirectory
import unittest
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("prepare_gpkg", ROOT / "scripts/prepare-gpkg-institutions.py")
GPKG = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GPKG)


class PrepareInstitutionPointsTest(unittest.TestCase):
    def test_reads_and_converts_a_synthetic_point_with_an_explicit_mapping(self):
        db = sqlite3.connect(":memory:")
        try:
            db.execute("CREATE TABLE gpkg_geometry_columns(table_name, column_name, geometry_type_name, srs_id, z, m)")
            db.execute("INSERT INTO gpkg_geometry_columns VALUES (?, 'geom', 'POINT', 4326, 0, 0)", (GPKG.LAYER,))
            db.execute(f'CREATE TABLE "{GPKG.LAYER}" (fid, geom, cod_dane, cod_sede_p, sede_princ, nombre_ins)')
            blob = bytes([71, 80, 0, 1]) + struct.pack("<iBIdd", 4326, 1, 1, -75.5, 5.1)
            db.execute(f'INSERT INTO "{GPKG.LAYER}" VALUES (?, ?, ?, ?, ?, ?)',
                       (1, blob, "000000000001", "000000000001", "S", "Sede ficticia"))
            with TemporaryDirectory() as folder:
                file = Path(folder) / "demo.zip"
                with ZipFile(file, "w") as archive:
                    archive.writestr(GPKG.ENTRY, db.serialize())
                rows = GPKG.load_rows(file)
        finally:
            db.close()
        feature = GPKG.convert(rows, {"000000000001": "IE-QA"})["features"][0]
        self.assertEqual(feature["geometry"]["coordinates"], [-75.5, 5.1])
        self.assertEqual(feature["properties"]["institutionCode"], "IE-QA")
        with self.assertRaisesRegex(ValueError, "exactamente"):
            GPKG.convert(rows, {})

    def test_rejects_empty_and_wrong_srid(self):
        point = struct.pack("<BIdd", 1, 1, -75.5, 5.1)
        with self.assertRaisesRegex(ValueError, "SRID"):
            GPKG.read_point(bytes([71, 80, 0, 1]) + struct.pack("<i", 3857) + point)
        with self.assertRaisesRegex(ValueError, "vacío"):
            GPKG.read_point(bytes([71, 80, 0, 17]) + struct.pack("<i", 4326) + point)


if __name__ == "__main__":
    unittest.main()
