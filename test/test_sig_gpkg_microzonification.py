import importlib.util
from pathlib import Path
import struct
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "microzonification", ROOT / "scripts/prepare-gpkg-microzonification.py"
)
MICRO = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MICRO)


def shape(ring, srid=4326):
    header = bytes((71, 80, 0, 1)) + struct.pack("<i", srid)
    return (header + struct.pack("<BIIBIII", 1, 6, 1, 1, 3, 1, len(ring))
            + b"".join(struct.pack("<dd", *point) for point in ring))


class MicrozonificationTest(unittest.TestCase):
    def test_reads_wgs84_and_normalizes_exterior_orientation(self):
        clockwise = [[-75, 5], [-75, 6], [-74, 5], [-75, 5]]
        result = MICRO.read_multipolygon(shape(clockwise))
        self.assertEqual(result, [[list(reversed(clockwise))]])

    def test_rejects_open_ring_and_wrong_srid(self):
        open_ring = [[-75, 5], [-74, 5], [-74, 6], [-75, 6]]
        with self.assertRaisesRegex(ValueError, "Anillo abierto"):
            MICRO.read_multipolygon(shape(open_ring))
        with self.assertRaisesRegex(ValueError, "SRID"):
            MICRO.read_multipolygon(shape(open_ring, 3857))


if __name__ == "__main__":
    unittest.main()
