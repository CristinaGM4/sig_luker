ALTER TABLE "workshop_evaluations"
ADD COLUMN "idempotency_key_digest" CHAR(64),
ADD COLUMN "request_digest" CHAR(64),
ADD CONSTRAINT "workshop_evaluations_retry_pair"
CHECK (("idempotency_key_digest" IS NULL) = ("request_digest" IS NULL));

CREATE UNIQUE INDEX "workshop_evaluations_retry_key"
ON "workshop_evaluations"("institution_id", "author_id", "idempotency_key_digest");
