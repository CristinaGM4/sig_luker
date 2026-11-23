\set ON_ERROR_STOP on

SELECT 'migraciones|' || count(*) FROM "_prisma_migrations"
WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL;

SELECT 'campanas|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(c)::text, '' ORDER BY id)), '')
FROM ibite_campaigns AS c;

SELECT 'aplicaciones|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(a)::text, '' ORDER BY id)), '')
FROM ibite_applications AS a;

SELECT 'resultados|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(r)::text, '' ORDER BY id)), '')
FROM ibite_results AS r;

SELECT 'mtts|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(m)::text, '' ORDER BY id)), '')
FROM mtts_weekly_reports AS m;

SELECT 'factibilidad|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(f)::text, '' ORDER BY id)), '')
FROM workshop_evaluations AS f;

SELECT 'auditoria|' || count(*) || '|' ||
       coalesce(md5(string_agg(to_jsonb(a)::text, '' ORDER BY id)), '')
FROM audit_events AS a;

SELECT 'postgis|' || ST_AsText(ST_SetSRID(ST_MakePoint(-75.5, 5.1), 4326));
