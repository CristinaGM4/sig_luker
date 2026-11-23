CREATE TABLE public_institution_sites (
  source_id integer PRIMARY KEY,
  institution_key text NOT NULL CHECK (institution_key ~ '^referencia-([1-9]|10)$'),
  label text NOT NULL,
  dane text NOT NULL UNIQUE CHECK (dane ~ '^[0-9]{12}$'),
  parent_dane text NOT NULL,
  principal boolean NOT NULL,
  mapping_note text,
  source_sha256 text NOT NULL,
  location geometry(Point,4326) NOT NULL,
  CHECK (NOT ST_IsEmpty(location) AND ST_X(location) BETWEEN -180 AND 180 AND ST_Y(location) BETWEEN -90 AND 90)
);
CREATE INDEX public_institution_sites_location_idx ON public_institution_sites USING gist(location);
