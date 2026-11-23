-- AlterTable
ALTER TABLE "ibite_applications" ADD COLUMN     "assignment_id" UUID;

-- CreateTable
CREATE TABLE "ibite_campaigns" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "instrument_code" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "source_version" TEXT NOT NULL,
    "opens_at" TIMESTAMPTZ(3) NOT NULL,
    "closes_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ibite_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ibite_assignments" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "respondent_id" UUID NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "ibite_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ibite_campaigns_institution_id_period_id_idx" ON "ibite_campaigns"("institution_id", "period_id");

-- CreateIndex
CREATE INDEX "ibite_assignments_respondent_id_revoked_at_idx" ON "ibite_assignments"("respondent_id", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "ibite_assignments_campaign_id_participant_id_respondent_id_key" ON "ibite_assignments"("campaign_id", "participant_id", "respondent_id");

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "ibite_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_campaigns" ADD CONSTRAINT "ibite_campaigns_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_campaigns" ADD CONSTRAINT "ibite_campaigns_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_campaigns" ADD CONSTRAINT "ibite_campaigns_instrument_code_variant_source_version_fkey" FOREIGN KEY ("instrument_code", "variant", "source_version") REFERENCES "instrument_versions"("instrument_code", "variant", "source_version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_assignments" ADD CONSTRAINT "ibite_assignments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ibite_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_assignments" ADD CONSTRAINT "ibite_assignments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_assignments" ADD CONSTRAINT "ibite_assignments_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ibite_campaigns"
  ADD CONSTRAINT "ibite_campaigns_valid_window" CHECK ("opens_at" < "closes_at");
