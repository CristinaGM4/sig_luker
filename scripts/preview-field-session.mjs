import process from "node:process";
import { reviewFieldSession } from "../dist/field-notes/session-review.js";

try {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 1_000_000) throw new Error("Sesión demasiado grande");
  }
  const report = reviewFieldSession(JSON.parse(input));
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (!report.ready) process.exitCode = 2;
} catch {
  process.stderr.write(
    "No se pudo revisar la estructura de la sesión de campo.\n",
  );
  process.exitCode = 1;
}
