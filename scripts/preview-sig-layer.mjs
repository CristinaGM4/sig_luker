import { readFile, stat } from "node:fs/promises";
import process from "node:process";
import { previewInstitutionPoints } from "../dist/geo/layer-preview.js";

async function readJson(path) {
  const info = await stat(path);
  if (!info.isFile() || info.size > 5_000_000)
    throw new Error("Archivo inválido o mayor de 5 MB");
  return JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
}

async function main() {
  const [layerPath, codesPath, extra] = process.argv.slice(2);
  if (!layerPath || !codesPath || extra)
    throw new Error("Indica un GeoJSON y un JSON de códigos institucionales");
  const [layer, codes] = await Promise.all([
    readJson(layerPath),
    readJson(codesPath),
  ]);
  const report = previewInstitutionPoints(layer, codes);
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (!report.ready) process.exitCode = 2;
}

main().catch(() => {
  process.stderr.write(
    "No se pudo revisar la capa SIG. Comprueba los archivos y el formato.\n",
  );
  process.exitCode = 1;
});
