from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

from openpyxl import Workbook

ROOT = Path(__file__).resolve().parents[1]


class FieldWorkbookPreviewTest(unittest.TestCase):
    def run_example(self, link="L001", summary="Actividad sintética"):
        with TemporaryDirectory() as directory:
            file = Path(directory) / "ficha-sintetica.xlsx"
            book = Workbook()
            session = book.active
            session.title = "Sesion"
            session.append(["CodigoSesion", "Fecha", "CodigoInstitucion"])
            session.append(["S01", "2026-11-22", "IE-QA"])
            findings = book.create_sheet("Hallazgos")
            findings.append(["CodigoHallazgo", "CodigosLugar", "Resumen"])
            findings.append([None, None, None])
            findings.append(["H001", link, summary])
            places = book.create_sheet("Lugares")
            places.append(["CodigoLugar", "EstadoUbicacion", "Referencia"])
            places.append(["L001", "pendiente", "Lugar ficticio"])
            book.save(file)
            return subprocess.run(
                [sys.executable, "scripts/preview-field-workbook.py", str(file)],
                cwd=ROOT, capture_output=True, text=True, timeout=40,
            )

    def test_valid_workbook(self):
        result = self.run_example()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('"ready": true', result.stdout)
        self.assertNotIn("Lugar ficticio", result.stdout)

    def test_reference_reports_original_excel_row(self):
        result = self.run_example(link="L099")
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assertIn('"row": 3', result.stdout)
        self.assertIn('"sheet": "Hallazgos"', result.stdout)
        self.assertIn('"reason": "place_not_found"', result.stdout)

    def test_formula_is_rejected_without_output(self):
        result = self.run_example(summary="=1+1")
        self.assertEqual(result.returncode, 1)
        self.assertIn("Hallazgos, fila 3", result.stderr)
        self.assertEqual(result.stdout, "")


if __name__ == "__main__":
    unittest.main()
