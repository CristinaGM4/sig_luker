CREATE INDEX "audit_events_institution_recent_idx"
  ON "audit_events" ("institution_id", "occurred_at", "id");
