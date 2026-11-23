import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { once } from "node:events";
import process from "node:process";
import { createInterface } from "node:readline";
import { verifiedIbiteForms } from "../test/fixtures/ibite-synthetic-form.mjs";

const { fetch } = globalThis;
const environment = {
  ...process.env,
  IBITE_DEMO_CAPTURE_KEY: randomBytes(32).toString("hex"),
  HOST: "127.0.0.1",
  PORT: "0",
};
let child;
async function launch() {
  child = spawn(
    process.execPath,
    ["scripts/start-ibite-demo.mjs", "--verified-items"],
    {
      env: environment,
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const lines = createInterface({ input: child.stdout });
  for await (const line of lines) {
    if (line.startsWith("IBITE_DEMO ")) return JSON.parse(line.slice(11));
  }
  throw new Error("El proceso de demo terminó antes de publicar la URL local");
}

async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill();
  await exited;
}

const documentNumber = String(BigInt("0x" + randomBytes(7).toString("hex")));
async function openForm(demo, variant) {
  const campaign = demo.campaigns.find((entry) => entry.variant === variant);
  const adolescent = variant === "ADOLESCENT";
  const started = await fetch(
    demo.baseUrl + "/api/v1/ibite/campanas/" + campaign.id + "/iniciar",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        adolescent
          ? { age: 11, documentNumber }
          : {
              age: 10,
              documentNumber,
              studentName: "Estudiante sintético IBITE",
              contactPhone: "3000000001",
            },
      ),
    },
  );
  assert.equal(started.status, 201);
  const { assignmentId, token } = await started.json();
  const url = demo.baseUrl + "/api/v1/mis-aplicaciones-ibite/" + assignmentId;
  const authorization = "Bearer " + token;
  const formResponse = await fetch(url + "/formulario", {
    headers: { authorization },
  });
  assert.equal(formResponse.status, 200);
  const form = await formResponse.json();
  const reference = verifiedIbiteForms.find(
    (entry) => entry.variant === variant,
  );
  assert.equal(form.variant, variant);
  assert.equal(form.formVersion, reference.formVersion);
  assert.equal(form.questions.length, 17);
  assert.deepEqual(
    form.questions,
    reference.questions.map(({ id, text, options }) => ({
      id,
      text,
      options: options.map((option) => ({ id: option.id, text: option.text })),
    })),
  );
  return { url, authorization, form, adolescent };
}

async function submit({ url, authorization, form, adolescent }) {
  return fetch(url + "/envios", {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      formVersion: form.formVersion,
      participation: "accepted",
      ...(adolescent ? { reportedRepresentativeAuthorization: "unknown" } : {}),
      answers: form.questions.map(({ id }) => ({
        questionId: id,
        optionId: id === "q7" ? "one" : "zero",
      })),
    }),
  });
}

try {
  const before = await launch();
  const adolescentForm = await openForm(before, "ADOLESCENT");
  const first = await submit(adolescentForm);
  assert.equal(first.status, 201);
  const { applicationId } = await first.json();
  const result = await fetch(
    before.baseUrl +
      "/api/v1/interno/aplicaciones-ibite/" +
      applicationId +
      "/resultados",
    { headers: { authorization: "Bearer " + before.psychosocialToken } },
  );
  assert.equal(result.status, 200);
  const { results } = await result.json();
  assert.equal(results[0].result.classification.risk, "critico_seguridad");
  const caregiverForm = await openForm(before, "CAREGIVER");
  const caregiverResponse = await submit(caregiverForm);
  assert.equal(caregiverResponse.status, 201);
  const caregiverReceipt = await caregiverResponse.json();
  const receipt = await fetch(caregiverForm.url + "/acuse", {
    headers: { authorization: caregiverForm.authorization },
  });
  assert.equal(receipt.status, 200);
  assert.deepEqual(await receipt.json(), caregiverReceipt);
  await stop();
  const after = await launch();
  assert.deepEqual(after.campaigns, before.campaigns);
  const duplicate = await submit(await openForm(after, "ADOLESCENT"));
  assert.equal(duplicate.status, 409);
  const invalidStart = () =>
    fetch(after.baseUrl + "/api/v1/ibite/campanas/campana-invalida/iniciar", {
      method: "POST",
      headers: { "x-forwarded-for": "192.0.2.1" },
    });
  for (let attempt = 0; attempt < 19; attempt++) {
    assert.equal((await invalidStart()).status, 400);
  }
  const limited = await invalidStart();
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal(limited.headers.get("cache-control"), "no-store");
  process.stdout.write(
    "Demo IBITE: ambos formularios de referencia con POST 201, acuse, alerta crítica, duplicado 409 tras reiniciar Node y límite de inicio 429.\n",
  );
} finally {
  await stop();
}
