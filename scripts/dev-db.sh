#!/usr/bin/env bash
set -e

CONTAINER_NAME="zexcore-postgres"
DB_USER="zexcore"
DB_PASS="zexcore_secret"
DB_NAME="zexcore_db"

# Check if port 5432 is in use, if so fallback to 5433
DB_PORT="5432"
if ss -tuln | grep -q ":5432 "; then
  echo "[dev-db] Port 5432 is already occupied by local service. Using port 5433 for container."
  DB_PORT="5433"
fi

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
  echo "[dev-db] Container $CONTAINER_NAME is already running."
elif [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
  echo "[dev-db] Starting existing container $CONTAINER_NAME..."
  docker start $CONTAINER_NAME
else
  echo "[dev-db] Creating and starting Postgres container $CONTAINER_NAME on port $DB_PORT..."
  docker run -d \
    --name $CONTAINER_NAME \
    -e POSTGRES_USER=$DB_USER \
    -e POSTGRES_PASSWORD=$DB_PASS \
    -e POSTGRES_DB=$DB_NAME \
    -p $DB_PORT:5432 \
    postgres:16
fi

echo "[dev-db] Waiting for Postgres to accept connections on port $DB_PORT..."
until docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; do
  sleep 0.5
done

echo "[dev-db] Provisioning zexcore_app role with NOBYPASSRLS for strict RLS enforcement..."
docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'zexcore_app') THEN
    CREATE ROLE zexcore_app WITH LOGIN PASSWORD 'zexcore_secret' NOSUPERUSER NOBYPASSRLS;
  END IF;
END
\$\$;
GRANT ALL PRIVILEGES ON DATABASE zexcore_db TO zexcore_app;
GRANT ALL ON SCHEMA public TO zexcore_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO zexcore_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO zexcore_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zexcore_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO zexcore_app;

DO \\\$\\\$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' OWNER TO zexcore_app';
  END LOOP;
END
\\\$\\\$;

-- Enforce append-only audit log: application cannot mutate or delete historical audits
REVOKE UPDATE, DELETE ON audit_log FROM zexcore_app;
" > /dev/null 2>&1

echo "[dev-db] Postgres is ready at postgres://zexcore_app:$DB_PASS@localhost:$DB_PORT/$DB_NAME"
