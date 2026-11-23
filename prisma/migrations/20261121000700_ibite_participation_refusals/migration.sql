CREATE TABLE "ibite_participation_refusals" (
    "assignment_id" UUID NOT NULL,
    "form_version" TEXT NOT NULL,
    "recorded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ibite_participation_refusals_pkey" PRIMARY KEY ("assignment_id")
);

ALTER TABLE "ibite_participation_refusals"
ADD CONSTRAINT "ibite_participation_refusals_assignment_id_fkey"
FOREIGN KEY ("assignment_id") REFERENCES "ibite_assignments"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
