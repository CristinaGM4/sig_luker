CREATE TABLE "microzonification_zones" (
  "id" INTEGER PRIMARY KEY CHECK ("id" > 0),
  "source_sha256" CHAR(64) NOT NULL,
  "zone" TEXT NOT NULL CHECK ("zone" IN ('A', 'B', 'P', 'T')),
  "source_description" TEXT NOT NULL,
  "geometry" geometry(MultiPolygon,4326) NOT NULL,
  CHECK (NOT ST_IsEmpty("geometry") AND ST_IsValid("geometry")
    AND ST_CoveredBy("geometry", ST_MakeEnvelope(-180, -90, 180, 90, 4326)))
);
CREATE INDEX "microzonification_zones_geometry_idx" ON "microzonification_zones" USING GIST ("geometry");
