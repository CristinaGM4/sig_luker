import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countReportedRepresentativeAuthorization,
  readReportedRepresentativeAuthorization,
} from "../dist/ibite/representative-authorization.js";

test("cuenta autorización declarada, incertidumbre y ausencia por separado", () => {
  assert.deepEqual(
    countReportedRepresentativeAuthorization([
      "authorized",
      "unknown",
      "unknown",
      undefined,
    ]),
    { authorized: 1, unknown: 2, missing: 1 },
  );
  assert.deepEqual(countReportedRepresentativeAuthorization([]), {
    authorized: 0,
    unknown: 0,
    missing: 0,
  });
});

test("rechaza valores impropios para una captura ya validada", () => {
  for (const value of ["denied", "no lo sé", null, false, {}]) {
    assert.throws(
      () => readReportedRepresentativeAuthorization(value),
      RangeError,
    );
  }
});
