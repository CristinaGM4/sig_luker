import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { test } from "node:test";
import {
  captureIdentityDigest,
  readCaptureIdentity,
} from "../dist/ibite/capture-identity.js";

test("aplica el corte de 11 años y mantiene separado a cada menor del mismo acudiente", () => {
  const documentNumber = "00001234";
  const caregiver = {
    age: 10,
    documentNumber,
    studentName: "Estudiante A",
    contactPhone: "3000000001",
  };
  const first = readCaptureIdentity(caregiver);
  const second = readCaptureIdentity({
    ...caregiver,
    studentName: "Estudiante B",
  });
  const adolescent = readCaptureIdentity({ age: 11, documentNumber });
  assert.equal(first.variant, "CAREGIVER");
  assert.equal(adolescent.variant, "ADOLESCENT");
  const secret = Buffer.alloc(32, 1);
  const digest = (identity, period = "periodo-2") =>
    captureIdentityDigest(secret, period, identity);
  assert.equal(
    digest(first),
    digest(
      readCaptureIdentity({
        ...caregiver,
        studentName: " ESTUDIANTE   A ",
        contactPhone: "(300) 000-0001",
      }),
    ),
  );
  assert.notEqual(digest(first), digest(second));
  assert.notEqual(digest(first), digest(adolescent));
  assert.notEqual(digest(first), digest(first, "otro-periodo"));
  assert.throws(() => readCaptureIdentity({ age: 10, documentNumber }));
  assert.throws(() => readCaptureIdentity({ age: 11, documentNumber: 1234 }));
});
