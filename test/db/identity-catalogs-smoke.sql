\set ON_ERROR_STOP on

BEGIN;

INSERT INTO accounts (id) VALUES ('00000000-0000-4000-8000-000000000001');
INSERT INTO roles (id, code, label) VALUES ('00000000-0000-4000-8000-000000000002', 'SYNTHETIC_ROLE', 'Rol sintético');
INSERT INTO permissions (id, code, label) VALUES ('00000000-0000-4000-8000-000000000003', 'SYNTHETIC_PERMISSION', 'Permiso sintético');
INSERT INTO institutions (id, code, name) VALUES ('00000000-0000-4000-8000-000000000004', 'SYNTHETIC_INSTITUTION', 'Institución sintética');
INSERT INTO account_roles (account_id, role_id) VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002');
INSERT INTO role_permissions (role_id, permission_id) VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003');
INSERT INTO account_institutions (account_id, institution_id) VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000004');
INSERT INTO academic_periods (id, code, label, starts_on, ends_on)
VALUES ('00000000-0000-4000-8000-000000000005', 'SYNTHETIC_PERIOD', 'Periodo sintético', '2026-01-01', '2026-06-30');

DO $$
BEGIN
  BEGIN
    INSERT INTO institutions (id, code, name)
    VALUES ('00000000-0000-4000-8000-000000000006', 'SYNTHETIC_INSTITUTION', 'Código repetido');
    RAISE EXCEPTION 'Se aceptó un código repetido';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO account_roles (account_id, role_id)
    VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002');
    RAISE EXCEPTION 'Se aceptó una asignación duplicada';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO account_institutions (account_id, institution_id)
    VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000099');
    RAISE EXCEPTION 'Se aceptó una referencia inexistente';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO academic_periods (id, code, label, starts_on, ends_on)
    VALUES ('00000000-0000-4000-8000-000000000007', 'INVALID_PERIOD', 'Periodo invertido', '2026-06-30', '2026-01-01');
    RAISE EXCEPTION 'Se aceptó un periodo invertido';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    DELETE FROM institutions WHERE id = '00000000-0000-4000-8000-000000000004';
    RAISE EXCEPTION 'Se eliminó una institución referenciada';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END
$$;

ROLLBACK;
