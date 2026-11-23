-- CreateTable
CREATE TABLE "historical_diagnostics" (
    "id" UUID NOT NULL,
    "source_sha256" CHAR(64) NOT NULL,
    "analysis_version" TEXT NOT NULL,
    "digest" CHAR(64) NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_reviews" (
    "id" UUID NOT NULL,
    "diagnostic_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "incident_key" TEXT NOT NULL,
    "review_state" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "historical_diagnostics_source_sha256_analysis_version_diges_key" ON "historical_diagnostics"("source_sha256", "analysis_version", "digest");

-- CreateIndex
CREATE INDEX "historical_reviews_diagnostic_id_created_at_idx" ON "historical_reviews"("diagnostic_id", "created_at");

-- AddForeignKey
ALTER TABLE "historical_reviews" ADD CONSTRAINT "historical_reviews_diagnostic_id_fkey" FOREIGN KEY ("diagnostic_id") REFERENCES "historical_diagnostics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "historical_reviews"
  ADD CONSTRAINT "historical_reviews_valid_state" CHECK ("review_state" IN ('observada', 'requiere_revision'));
