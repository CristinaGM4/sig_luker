\set ON_ERROR_STOP on

SELECT version(), PostGIS_Full_Version();

BEGIN;

CREATE TEMP TABLE geo_probe (
  id integer PRIMARY KEY,
  location geometry(Point, 4326) NOT NULL
);

CREATE INDEX geo_probe_location_idx ON geo_probe USING gist (location);

INSERT INTO geo_probe (id, location)
VALUES (1, ST_SetSRID(ST_MakePoint(-75.5, 5.1), 4326));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM geo_probe
    WHERE ST_Intersects(location, ST_MakeEnvelope(-76, 5, -75, 6, 4326))
      AND ST_SRID(ST_Transform(location, 3857)) = 3857
      AND ST_AsGeoJSON(location)::jsonb ->> 'type' = 'Point'
  ) THEN
    RAISE EXCEPTION 'Falló la comprobación espacial';
  END IF;
END
$$;

ROLLBACK;
