ALTER TABLE "participants" ADD COLUMN "ibite_capture_digest" CHAR(64);
CREATE UNIQUE INDEX "participants_ibite_capture_digest_key"
ON "participants"("ibite_capture_digest");

ALTER TABLE "accounts" ADD COLUMN "capture_only" BOOLEAN NOT NULL DEFAULT false;
