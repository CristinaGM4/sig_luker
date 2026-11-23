"""Diagnostica localmente las exportaciones IBITE Manizales -23 y DA-28."""
import argparse
from collections import Counter
from datetime import datetime
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from zipfile import BadZipFile, ZipFile

from openpyxl import load_workbook

RESPONSE_SHEET = "Respuestas de formulario 1"
SCORE_SHEET = "Puntuaciones"
ALIAS_SHEET = "Catalogo_Colegios"
CAREGIVER = "El padre, la madre o el cuidador principal, en nombre de un niño o niña de 5 a 10 años."
ADOLESCENT = "El propio adolescente de 11 a 19 años, respondiendo directamente."
SOURCE_REF = re.compile(r"'Respuestas de formulario 1'!\$?[A-Z]+\$?(\d+)")
MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_EXPANDED_BYTES = 192 * 1024 * 1024


class LayoutError(Exception):
    pass


def label_key(value):
    return sha256(value.strip().lower().encode("utf-8")).hexdigest()


def orthographic_key(value):
    folded = "".join(
        character for character in unicodedata.normalize("NFKD", value)
        if not unicodedata.category(character).startswith("M")
    ).lower()
    normalized = " ".join(
        "".join(character if character.isalnum() else " " for character in folded).split()
    )
    return label_key(normalized) if normalized else ""


def read_workbook(path):
    if path.suffix.lower() != ".xlsx":
        raise LayoutError("Se requiere un archivo .xlsx")
    with path.open("rb") as source:
        data = source.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise LayoutError("El archivo supera el límite local")

    with ZipFile(BytesIO(data)) as package:
        entries = package.infolist()
        if (
            len(entries) > 256
            or sum(entry.file_size for entry in entries) > MAX_EXPANDED_BYTES
            or any(entry.filename.lower().endswith("vbaproject.bin") for entry in entries)
        ):
            raise LayoutError("El paquete XLSX supera los límites o contiene macros")

    return data


def rows_with_headers(book, sheet_name, columns, expected):
    if sheet_name not in book.sheetnames:
        raise LayoutError(f"Falta la hoja requerida: {sheet_name}")
    rows = book[sheet_name].iter_rows(max_col=columns, values_only=True)
    header = next(rows, ())
    if any(len(header) <= index or header[index] != label for index, label in expected.items()):
        raise LayoutError(f"Encabezados distintos del perfil seleccionado en {sheet_name}")
    return enumerate(rows, start=2)


def extract_metadata(data, profile="ibite17"):
    is_da = profile == "da28"
    response_headers = {0: "Marca temporal", 7: "Institución educativa"}
    if not is_da:
        response_headers.update({
            1: "Para continuar, indíquenos quién va a responder las preguntas de aquí en adelante:",
            42: "Tu institución educativa es",
        })
    score_headers = {0: "Número", 46: "Í28 Apoyo externo (contextual)"} if is_da else {
        0: "Fila", 17: "Í1 Intrusión",
    }
    anchors = (0, 1, 3, 8, *range(19, 47)) if is_da else (0, 1, 3, 4, 17, 33)
    alias_sheet = "Catalogo_Instituciones" if is_da else ALIAS_SHEET
    alias_headers = {0: "Variante (minúsculas, sin espacios extremos)", 1: "Nombre institucional normalizado"} if is_da else {
        0: "Variante", 1: "Etiqueta_unificada",
    }
    workbook = load_workbook(BytesIO(data), read_only=True, keep_links=False)
    try:
        responses = []
        unknown_branches = 0
        for row_number, row in rows_with_headers(workbook, RESPONSE_SHEET, 45 if is_da else 71, response_headers):
            if not any(value is not None for value in row):
                continue
            if is_da or row[1] == CAREGIVER:
                label = row[7]
            elif row[1] == ADOLESCENT:
                label = row[42]
            else:
                label = None
                unknown_branches += 1
            responses.append({
                "row": row_number,
                "timestampValid": isinstance(row[0], datetime),
                "institutionLabel": label_key(label) if isinstance(label, str) and label.strip() else None,
                "institutionComparisonKey": orthographic_key(label) if isinstance(label, str) else "",
            })

        scores = []
        reference_issues = []
        for row_number, row in rows_with_headers(workbook, SCORE_SHEET, 47 if is_da else 34, score_headers):
            # Compare origin anchors and the scoring columns defined by the profile.
            formula_values = [getattr(row[i], "text", row[i]) for i in anchors]
            if all(value is None for value in formula_values):
                continue
            sources = [
                set(SOURCE_REF.findall(value)) if isinstance(value, str) else set()
                for value in formula_values
            ]
            if len(sources[0]) != 1 or any(group != sources[0] for group in sources):
                reference_issues.append(row_number)
                scores.append({"row": row_number, "responseRow": None})
                continue
            scores.append({"row": row_number, "responseRow": int(next(iter(sources[0])))})

        aliases = []
        invalid_alias_rows = 0
        catalog_targets = Counter()
        for _, (alias, target) in rows_with_headers(workbook, alias_sheet, 2, alias_headers):
            if alias is None and target is None:
                continue
            if not isinstance(alias, str) or not alias.strip() or not isinstance(target, str) or not target.strip():
                invalid_alias_rows += 1
                continue
            clean_target = target.strip()
            catalog_targets[clean_target] += 1
            # A digest distinguishes catalog labels without treating them as official codes.
            aliases.append({
                "label": label_key(alias),
                "comparisonKey": orthographic_key(alias),
                "institutionCode": sha256(clean_target.encode("utf-8")).hexdigest(),
            })
        return {
            "sourceSha256": sha256(data).hexdigest(),
            "responseSheet": RESPONSE_SHEET,
            "scoringSheet": SCORE_SHEET,
            "responses": responses,
            "scores": scores,
            "aliases": aliases,
            "extraction": {
                "profile": profile,
                "unknownBranches": unknown_branches,
                "scoringRowsRead": len(scores),
                "scoringRowsWithUnresolvedReference": len(reference_issues),
                "referenceIssueSample": reference_issues[:25],
                "invalidAliasRows": invalid_alias_rows,
                "catalogLabels": len(catalog_targets),
            },
        }
    finally:
        workbook.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--profile", choices=("ibite17", "da28"), default="ibite17")
    args = parser.parse_args()
    try:
        metadata = extract_metadata(read_workbook(args.workbook), args.profile)
        runner = Path(__file__).with_name("summarize-ibite-history.mjs")
        result = subprocess.run(
            ["node", str(runner)], input=json.dumps(metadata), text=True,
            encoding="utf-8", check=False,
        )
        return result.returncode
    except LayoutError as error:
        print(f"No se pudo preparar el diagnóstico: {error}", file=sys.stderr)
    except (OSError, BadZipFile, ValueError, KeyError):
        print("No se pudo abrir el libro o el ejecutor local", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
