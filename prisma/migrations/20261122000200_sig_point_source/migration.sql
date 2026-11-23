ALTER TABLE "institution_map_points"
ADD COLUMN "source_sha256" CHAR(64),
ADD COLUMN "source_position" INTEGER,
ADD CONSTRAINT "institution_map_points_source_pair"
CHECK (("source_sha256" IS NULL AND "source_position" IS NULL)
    OR ("source_sha256" IS NOT NULL AND "source_position" IS NOT NULL AND "source_position" > 0));

CREATE UNIQUE INDEX "institution_map_points_source_key"
ON "institution_map_points"("source_sha256", "source_position");
