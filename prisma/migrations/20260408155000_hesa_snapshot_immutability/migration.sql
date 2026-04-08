-- HESA Snapshot Immutability Trigger
-- Prevents UPDATE and DELETE on hesa_snapshots table

CREATE OR REPLACE FUNCTION prevent_snapshot_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'HESA snapshots are immutable. UPDATE and DELETE operations are not permitted.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hesa_snapshot_immutable') THEN
    CREATE TRIGGER hesa_snapshot_immutable
    BEFORE UPDATE OR DELETE ON hesa_snapshots
    FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_mutation();
  END IF;
END $$;
