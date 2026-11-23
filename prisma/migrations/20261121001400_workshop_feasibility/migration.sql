CREATE TABLE "workshop_evaluations" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "workshop_date" DATE NOT NULL,
    "form_version" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workshop_evaluations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workshop_evaluations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "workshop_evaluations_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "workshop_evaluations_institution_date_idx"
ON "workshop_evaluations"("institution_id", "workshop_date");
