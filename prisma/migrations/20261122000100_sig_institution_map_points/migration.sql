CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "institution_map_points" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "location" geometry(Point,4326) NOT NULL,
    CONSTRAINT "institution_map_points_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "institution_map_points_institution_id_fkey"
      FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "institution_map_points_wgs84"
      CHECK (NOT ST_IsEmpty("location") AND ST_X("location") BETWEEN -180 AND 180
             AND ST_Y("location") BETWEEN -90 AND 90)
);

CREATE INDEX "institution_map_points_institution_idx" ON "institution_map_points"("institution_id");
CREATE INDEX "institution_map_points_location_idx" ON "institution_map_points" USING GIST ("location");
