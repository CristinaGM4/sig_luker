import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { URL } from "node:url";
import { planPilot } from "../scripts/plan-ibite-pilot.mjs";

const confirmed = JSON.parse(
  await readFile(
    new URL(
      "../docs/02-requerimientos/ibite17-piloto-periodo-2.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const config = {
  ...confirmed,
  institutions: Array.from({ length: 10 }, (_, i) => "IE sintética " + (i + 1)),
};
const snapshot = {
  period: {
    label: "Periodo 2",
    code: "QA-2",
    startsOn: new Date("2026-11-01"),
    endsOn: new Date("2026-12-31"),
  },
  institutions: config.institutions.map((name, i) => ({
    id: String(i),
    name,
    code: "QA-" + i,
    active: true,
  })),
  versions: ["ADOLESCENT", "CAREGIVER"].map((variant) => ({
    variant,
    sourceVersion: config.sourceVersion,
  })),
  campaigns: [],
};

test("prepara las dos variantes en las diez instituciones y conserva el calendario", () => {
  assert.equal(new Set(confirmed.institutions).size, 10);
  const plan = planPilot(config, snapshot);
  assert.deepEqual(plan.blockers, []);
  assert.equal(plan.entries.length, 20);
  assert.deepEqual(
    new Set(plan.entries.map(({ status }) => status)),
    new Set(["pending"]),
  );
  assert.equal(plan.opensAt.toISOString(), "2026-11-25T05:00:00.000Z");
  assert.equal(plan.closesAt.toISOString(), "2026-12-11T05:00:00.000Z");
});

test("distingue campañas compatibles de conflictos sin ocultar diferencias", () => {
  const existing = {
    id: "original",
    institutionId: "0",
    variant: "ADOLESCENT",
    opensAt: new Date(config.opensAt),
    closesAt: new Date(config.closesAtExclusive),
    sourceVersion: config.sourceVersion,
    enabled: false,
  };
  const plan = planPilot(config, {
    ...snapshot,
    campaigns: [
      existing,
      { ...existing, institutionId: "1", sourceVersion: "anterior" },
    ],
  });
  assert.deepEqual(
    plan.entries
      .filter(({ status }) => status === "configured")
      .map(({ campaignId, enabled }) => ({ campaignId, enabled })),
    [{ campaignId: "original", enabled: false }],
  );
  assert.deepEqual(
    plan.blockers.map(({ reason }) => reason),
    ["campaign_conflict"],
  );
});

test("detecta referencias, instituciones y periodo incompatibles", () => {
  const plan = planPilot(config, {
    ...snapshot,
    period: { ...snapshot.period, endsOn: new Date("2026-12-09") },
    institutions: [
      { ...snapshot.institutions[0], active: false },
      ...snapshot.institutions.slice(1, 9),
      { ...snapshot.institutions[1], id: "duplicado" },
    ],
    versions: snapshot.versions.slice(0, 1),
  });
  assert.deepEqual(
    plan.blockers.map(({ reason }) => reason),
    [
      "period_mismatch",
      "reference_not_found",
      "institution_inactive",
      "institution_ambiguous",
      "institution_not_found",
    ],
  );
});

test("distingue un operador sin permiso de uno con alcance parcial", () => {
  const unauthorized = planPilot(config, { ...snapshot, operator: null });
  assert.equal(unauthorized.operatorChecked, true);
  assert.deepEqual(unauthorized.blockers, [
    { reason: "operator_not_authorized" },
  ]);
  const partial = planPilot(config, {
    ...snapshot,
    operator: {
      institutions: snapshot.institutions
        .slice(0, 9)
        .map(({ id }) => ({ institutionId: id })),
    },
  });
  assert.deepEqual(partial.blockers, [
    {
      reason: "operator_out_of_scope",
      institutionName: config.institutions[9],
    },
  ]);
});
