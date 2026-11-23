"""Read a proposed field-work XLSX layout without writing any records."""

import argparse
from datetime import date, datetime
import json
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

from openpyxl import load_workbook

HEADERS = {
    "Sesion": ("CodigoSesion", "Fecha", "CodigoInstitucion"),
    "Hallazgos": ("CodigoHallazgo", "CodigosLugar", "Resumen"),
    "Lugares": ("CodigoLugar", "EstadoUbicacion", "Referencia"),
}
WORKSPACE = Path(__file__).resolve().parents[1]
MAX_FILE_BYTES = 5_000_000
MAX_ROWS = 5_000


def sheet_rows(sheet, headers):
    if sheet.max_row > MAX_ROWS or sheet.max_column != len(headers):
        raise ValueError(f"Dimensiones inválidas en {sheet.title}")
    rows = iter(sheet.iter_rows())
    if tuple(cell.value for cell in next(rows)) != headers:
        raise ValueError(f"Encabezados inválidos en {sheet.title}")
    result = []
    for position, cells in enumerate(rows, 2):
        if any(cell.data_type in {"f", "e"} for cell in cells):
            raise ValueError(f"Fórmula o error de celda en {sheet.title}, fila {position}")
        values = tuple(cell.value for cell in cells)
        if any(value is not None for value in values):
            result.append((position, values))
    return result


def inspect(path):
    if path.suffix.lower() != ".xlsx" or path.stat().st_size > MAX_FILE_BYTES:
        raise ValueError("Se admite un XLSX de hasta 5 MB")
    with ZipFile(path) as archive:
        files = archive.infolist()
        if len(files) > 2000 or sum(entry.file_size for entry in files) > 25_000_000:
            raise ValueError("El contenedor Excel supera los límites de revisión")
        if any(
            "vbaproject" in entry.filename.lower()
            or entry.filename.lower().startswith(("xl/externallinks/", "xl/embeddings/"))
            for entry in files
        ):
            raise ValueError("El archivo contiene macros, vínculos o archivos incrustados")
    book = load_workbook(path, read_only=True, data_only=False, keep_links=False)
    try:
        if set(book.sheetnames) != set(HEADERS):
            raise ValueError("Se requieren las hojas Sesion, Hallazgos y Lugares")
        session = sheet_rows(book["Sesion"], HEADERS["Sesion"])
        findings = sheet_rows(book["Hallazgos"], HEADERS["Hallazgos"])
        places = sheet_rows(book["Lugares"], HEADERS["Lugares"])
    finally:
        book.close()
    if len(session) != 1:
        raise ValueError("La propuesta requiere una sesión por libro")
    _, (session_code, raw_date, institution) = session[0]
    if not isinstance(raw_date, date):
        try:
            if not isinstance(raw_date, str) or date.fromisoformat(raw_date).isoformat() != raw_date:
                raise ValueError()
        except ValueError as error:
            raise ValueError("Fecha inválida en Sesion") from error
    if isinstance(raw_date, datetime) and raw_date.time() != datetime.min.time():
        raise ValueError("La fecha de sesión no debe incluir hora")
    if not isinstance(institution, str) or not institution.strip():
        raise ValueError("CodigoInstitucion requiere texto")

    projected_findings = []
    projected_places = []
    for position, (code, place_codes, summary) in findings:
        if place_codes is not None and not isinstance(place_codes, str):
            raise ValueError(f"CodigosLugar requiere texto en Hallazgos, fila {position}")
        if not isinstance(summary, str) or not summary.strip():
            raise ValueError(f"Resumen requerido en Hallazgos, fila {position}")
        projected_findings.append({
            "code": code,
            "placeCodes": [value.strip() for value in place_codes.split(";")] if place_codes and place_codes.strip() else [],
        })
    for position, (code, status, description) in places:
        if not isinstance(description, str) or not description.strip():
            raise ValueError(f"Referencia requerida en Lugares, fila {position}")
        projected_places.append({
            "code": code,
            "locationStatus": "pending" if status == "pendiente" else None,
        })
    return (
        {"sessionCode": session_code, "findings": projected_findings, "places": projected_places},
        {"findings": ("Hallazgos", [row for row, _ in findings]), "places": ("Lugares", [row for row, _ in places])},
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    args = parser.parse_args()
    try:
        batch, rows = inspect(args.workbook)
        review = subprocess.run(
            ["node", "scripts/preview-field-session.mjs"],
            cwd=WORKSPACE, input=json.dumps(batch), capture_output=True,
            text=True, encoding="utf-8", timeout=30, check=False,
        )
        if review.returncode not in {0, 2}:
            raise ValueError("Sesión inválida o comando no compilado; ejecute npm run build")
        report = json.loads(review.stdout)
        for issue in report["issues"]:
            sheet, positions = rows[issue["section"]]
            issue["sheet"] = sheet
            issue["row"] = positions[issue.pop("position") - 1]
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return review.returncode
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 1
    except Exception:
        print("No se pudo revisar el XLSX.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
