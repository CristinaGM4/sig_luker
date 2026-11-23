-- AlterTable
ALTER TABLE "ibite_applications" ADD COLUMN     "idempotency_key_digest" CHAR(64),
ADD COLUMN     "request_digest" CHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "ibite_applications_assignment_id_idempotency_key_digest_key" ON "ibite_applications"("assignment_id", "idempotency_key_digest");

ALTER TABLE "ibite_applications"
  ADD CONSTRAINT "ibite_applications_idempotency_pair"
  CHECK (
    ("idempotency_key_digest" IS NULL AND "request_digest" IS NULL)
    OR ("assignment_id" IS NOT NULL AND "idempotency_key_digest" IS NOT NULL AND "request_digest" IS NOT NULL)
  );
