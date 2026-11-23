from datetime import datetime
from importlib.util import module_from_spec, spec_from_file_location
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from zipfile import ZipFile

from openpyxl import Workbook

script = Path(__file__).resolve().parents[1] / "scripts" / "diagnose-ibite-manizales.py"
spec = spec_from_file_location("ibite_manizales", script)
extractor = module_from_spec(spec)
spec.loader.exec_module(extractor)


class ManizalesMetadataTest(unittest.TestCase):
    def sample(self):
        book = Workbook()
        response = book.active
        response.title = extractor.RESPONSE_SHEET
        response["A1"] = "Marca temporal"
        response["B1"] = "Para continuar, indíquenos quién va a responder las preguntas de aquí en adelante:"
        response["H1"] = "Institución educativa"
        response["AQ1"] = "Tu institución educativa es"
        response.append([datetime(2026, 1, 1), extractor.CAREGIVER])
        response["H2"] = " Sintético "
        scores = book.create_sheet(extractor.SCORE_SHEET)
        scores["A1"] = "Fila"
        scores["R1"] = "Í1 Intrusión"
        for column in ("A", "B", "D", "E", "R", "AH"):
            scores[f"{column}2"] = f"='{extractor.RESPONSE_SHEET}'!B2"
            scores[f"{column}3"] = f"='{extractor.RESPONSE_SHEET}'!B3"
        scores["AH3"] = f"='{extractor.RESPONSE_SHEET}'!B4"
        aliases = book.create_sheet(extractor.ALIAS_SHEET)
        aliases.append(["Variante", "Etiqueta_unificada"])
        aliases.append(["sintético", "Institución sintética"])
        return book

    def bytes(self, book):
        stream = BytesIO()
        book.save(stream)
        return stream.getvalue()

    def test_extracts_branch_and_quarantines_mismatched_anchor(self):
        result = extractor.extract_metadata(self.bytes(self.sample()))
        self.assertEqual(result["responses"][0]["institutionLabel"], result["aliases"][0]["label"])
        self.assertTrue(result["responses"][0]["timestampValid"])
        self.assertEqual(result["scores"], [{"row": 2, "responseRow": 2}, {"row": 3, "responseRow": None}])
        self.assertEqual(result["extraction"]["scoringRowsRead"], 2)
        self.assertEqual(result["extraction"]["referenceIssueSample"], [3])
        self.assertNotIn("sintético", str(result).lower())

    def test_da_profile_checks_every_scored_item(self):
        book = Workbook()
        response = book.active
        response.title = extractor.RESPONSE_SHEET
        response["A1"] = "Marca temporal"
        response["H1"] = "Institución educativa"
        response["A2"] = datetime(2026, 1, 1)
        response["H2"] = "Institución sintética"
        scores = book.create_sheet(extractor.SCORE_SHEET)
        scores["A1"] = "Número"
        scores["AU1"] = "Í28 Apoyo externo (contextual)"
        for index in (1, 2, 4, 9, *range(20, 48)):
            scores.cell(2, index, f"='{extractor.RESPONSE_SHEET}'!A2")
            scores.cell(3, index, f"='{extractor.RESPONSE_SHEET}'!A2")
            scores.cell(4, index, f"='{extractor.RESPONSE_SHEET}'!A2")
        scores["Z4"] = f"='{extractor.RESPONSE_SHEET}'!X99"
        aliases = book.create_sheet("Catalogo_Instituciones")
        aliases.append(["Variante (minúsculas, sin espacios extremos)", "Nombre institucional normalizado"])
        aliases.append(["institución sintética", "Destino sintético"])
        result = extractor.extract_metadata(self.bytes(book), "da28")
        self.assertEqual(result["extraction"]["profile"], "da28")
        self.assertEqual(result["extraction"]["referenceIssueSample"], [4])
        self.assertEqual(result["responses"][0]["institutionLabel"], result["aliases"][0]["label"])
        self.assertEqual(result["scores"], [{"row": 2, "responseRow": 2}, {"row": 3, "responseRow": 2}, {"row": 4, "responseRow": None}])
        with self.assertRaises(extractor.LayoutError):
            extractor.extract_metadata(self.bytes(book), "ibite17")

    def test_orthographic_keys_ignore_diacritics_and_punctuation(self):
        self.assertEqual(
            extractor.orthographic_key("Institución - Sintética"),
            extractor.orthographic_key("institucion sintetica"),
        )
        self.assertEqual(extractor.orthographic_key(" --- "), "")

    def test_rejects_replaced_header(self):
        book = self.sample()
        book[extractor.RESPONSE_SHEET]["H1"] = "Otra estructura"
        with self.assertRaises(extractor.LayoutError):
            extractor.extract_metadata(self.bytes(book))

    def test_rejects_macro_package(self):
        with TemporaryDirectory() as directory:
            sample = Path(directory) / "test.xlsx"
            with ZipFile(sample, "w") as archive:
                archive.writestr("xl/vbaProject.bin", "synthetic")
            with self.assertRaises(extractor.LayoutError):
                extractor.read_workbook(sample)


if __name__ == "__main__":
    unittest.main()
