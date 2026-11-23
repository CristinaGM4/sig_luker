-- CreateTable
CREATE TABLE "professional_institutions" (
    "professional_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,

    CONSTRAINT "professional_institutions_pkey" PRIMARY KEY ("professional_id","institution_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" UUID NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ibite_applications" (
    "id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "respondent_id" UUID,
    "institution_id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "instrument_code" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "source_version" TEXT NOT NULL,
    "applied_at" TIMESTAMPTZ(3) NOT NULL,
    "provenance" JSONB NOT NULL,
    "original_responses" JSONB NOT NULL,

    CONSTRAINT "ibite_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ibite_results" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "rule_version" TEXT NOT NULL,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provenance" JSONB NOT NULL,
    "result" JSONB NOT NULL,

    CONSTRAINT "ibite_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "professional_institutions_institution_id_idx" ON "professional_institutions"("institution_id");

-- CreateIndex
CREATE INDEX "ibite_applications_institution_id_period_id_idx" ON "ibite_applications"("institution_id", "period_id");

-- CreateIndex
CREATE INDEX "ibite_applications_respondent_id_idx" ON "ibite_applications"("respondent_id");

-- CreateIndex
CREATE UNIQUE INDEX "ibite_applications_participant_id_instrument_code_period_id_key" ON "ibite_applications"("participant_id", "instrument_code", "period_id");

-- CreateIndex
CREATE INDEX "ibite_results_application_id_calculated_at_idx" ON "ibite_results"("application_id", "calculated_at");

-- AddForeignKey
ALTER TABLE "professional_institutions" ADD CONSTRAINT "professional_institutions_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_institutions" ADD CONSTRAINT "professional_institutions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_applications" ADD CONSTRAINT "ibite_applications_instrument_code_variant_source_version_fkey" FOREIGN KEY ("instrument_code", "variant", "source_version") REFERENCES "instrument_versions"("instrument_code", "variant", "source_version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibite_results" ADD CONSTRAINT "ibite_results_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "ibite_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
