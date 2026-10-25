-- ZexCore database roles (run ONCE as a database administrator).
--
--   psql "$SUPERUSER_URL" -v owner_pass="'<strong-pass-1>'" -v app_pass="'<strong-pass-2>'" \
--        -v dbname="zexcore_db" -f scripts/db-setup-roles.sql
--
-- Managed databases where you only get one primary user (e.g. Render): create just the runtime role and
-- use the primary user as the schema owner (ADMIN_DATABASE_URL):
--   psql "$PRIMARY_URL" -v app_pass="'<strong-pass>'" -v dbname="<db>" -v skip_owner=1 -f scripts/db-setup-roles.sql
--
-- zexcore_owner : owns the schema. Used ONLY by the API at boot (ADMIN_DATABASE_URL) to migrate and
--                 install policies/functions. Not superuser, no BYPASSRLS.
-- zexcore_app   : what the API uses to serve requests (DATABASE_URL). Not an owner, no BYPASSRLS,
--                 cannot create objects, cannot DISABLE RLS, cannot touch users/tenants directly and
--                 cannot modify the audit log. Table grants are applied by the API at boot.
\set ON_ERROR_STOP on

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zexcore_app') THEN
    CREATE ROLE zexcore_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB;
  END IF;
END $$;
ALTER ROLE zexcore_app PASSWORD :app_pass;
GRANT CONNECT ON DATABASE :"dbname" TO zexcore_app;

\if :{?skip_owner}
  \echo 'skip_owner set: using the connecting user as schema owner'
\else
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zexcore_owner') THEN
      CREATE ROLE zexcore_owner LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB;
    END IF;
  END $$;
  ALTER ROLE zexcore_owner PASSWORD :owner_pass;
  ALTER DATABASE :"dbname" OWNER TO zexcore_owner;
  REVOKE ALL ON DATABASE :"dbname" FROM PUBLIC;
  GRANT CONNECT ON DATABASE :"dbname" TO zexcore_app;
  GRANT CONNECT, CREATE ON DATABASE :"dbname" TO zexcore_owner;
  \connect :"dbname"
  ALTER SCHEMA public OWNER TO zexcore_owner;
  REVOKE ALL ON SCHEMA public FROM PUBLIC;
  GRANT USAGE ON SCHEMA public TO zexcore_app;
\endif
