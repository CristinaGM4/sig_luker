\set ON_ERROR_STOP on

BEGIN;

-- El operador y la institución de la demostración se crean antes de esta prueba.
DO $$
DECLARE
  demo_institution UUID;
  demo_account CONSTANT UUID := '3ca843a0-bd5f-4fc0-9c71-51ddc6150100';
BEGIN
  SELECT id INTO STRICT demo_institution
  FROM institutions WHERE code = 'DEMO-IBITE-LOCAL';

  INSERT INTO mtts_weekly_reports (
    id, institution_id, author_id, site, site_key, week_start, week_end,
    form_version, payload
  ) VALUES (
    '3ca843a0-bd5f-4fc0-9c71-51ddc6150201', demo_institution, demo_account,
    'Sede ficticia de recuperación', 'sede ficticia de recuperación',
    DATE '2026-11-23', DATE '2026-11-29', 'mtts-formato-a/1',
    '{"ratings":{"factibilidad":"NA"},"counts":{"valoraciones":0}}'
  );

  INSERT INTO workshop_evaluations (
    id, institution_id, author_id, workshop_date, form_version, payload
  ) VALUES (
    '3ca843a0-bd5f-4fc0-9c71-51ddc6150202', demo_institution, demo_account,
    DATE '2026-11-23', 'jugar-para-cuidar/1',
    '{"place":"Lugar ficticio","process":["Alto","Aceptable","Alto"]}'
  );
END $$;

COMMIT;
