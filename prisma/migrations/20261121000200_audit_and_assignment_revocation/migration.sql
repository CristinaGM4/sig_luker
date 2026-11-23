-- AlterTable
ALTER TABLE "professional_institutions" ADD COLUMN     "revoked_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "institution_id" UUID,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_target_id_occurred_at_idx" ON "audit_events"("target_id", "occurred_at");
