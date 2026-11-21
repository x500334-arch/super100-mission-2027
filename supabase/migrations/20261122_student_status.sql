-- Applied to Supabase project bbujondhglcrihoksmio on 2026-11-22 (IST).
-- Migration history: 20261121232517_separate_student_blocked_status_20261122
-- Reference copy of the already-applied migration. DO NOT run it a second time.
-- Old profiles.approved=false records could mean either pending or previously
-- blocked; their old state cannot be inferred. No historic records were reclassified.

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
REVOKE ALL ON SCHEMA app_private FROM anon;
REVOKE ALL ON SCHEMA app_private FROM authenticated;

ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
 ADD CONSTRAINT profiles_not_approved_and_blocked
 CHECK (NOT (approved AND blocked));

CREATE OR REPLACE FUNCTION app_private.guard_student_status_transition()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $status$
DECLARE actor uuid;
BEGIN
 IF NEW.approved AND NEW.blocked THEN
  RAISE EXCEPTION 'An account cannot be approved and blocked simultaneously';
 END IF;
 IF NEW.approved IS DISTINCT FROM OLD.approved
    OR NEW.blocked IS DISTINCT FROM OLD.blocked THEN
  IF OLD.admin OR NEW.admin THEN
   RAISE EXCEPTION 'Student management cannot change administrator account status';
  END IF;
  actor := auth.uid();
  IF actor IS NULL OR NOT EXISTS (
   SELECT 1 FROM public.profiles p
   WHERE p.id=actor AND p.admin=true AND p.approved=true AND p.blocked=false
  ) THEN
   RAISE EXCEPTION 'Only an approved administrator may change student status';
  END IF;
  IF OLD.blocked THEN
   IF NEW.approved OR NEW.blocked THEN
    RAISE EXCEPTION 'Blocked students must return to pending before approval';
   END IF;
  ELSIF OLD.approved THEN
   IF NEW.approved OR NOT NEW.blocked THEN
    RAISE EXCEPTION 'Approved students may only transition to blocked';
   END IF;
  ELSE
   IF NOT NEW.approved OR NEW.blocked THEN
    RAISE EXCEPTION 'Pending requests may only transition to approved';
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END;
$status$;

REVOKE ALL ON FUNCTION app_private.guard_student_status_transition() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.guard_student_status_transition() FROM anon;
REVOKE ALL ON FUNCTION app_private.guard_student_status_transition() FROM authenticated;

DROP TRIGGER IF EXISTS guard_student_status_transition ON public.profiles;
CREATE TRIGGER guard_student_status_transition
BEFORE UPDATE OF approved, blocked ON public.profiles
FOR EACH ROW EXECUTE FUNCTION app_private.guard_student_status_transition();
