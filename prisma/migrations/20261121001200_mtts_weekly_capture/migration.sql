CREATE TABLE "mtts_weekly_reports" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "site" TEXT NOT NULL,
    "site_key" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "form_version" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mtts_weekly_reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mtts_weekly_reports_week_check" CHECK ("week_end" - "week_start" BETWEEN 0 AND 6),
    CONSTRAINT "mtts_weekly_reports_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mtts_weekly_reports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "mtts_weekly_report_unit_key" ON "mtts_weekly_reports"("institution_id", "author_id", "site_key", "week_start");
