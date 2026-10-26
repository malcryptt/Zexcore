#!/usr/bin/env bash
# Local Postgres for development with the SAME two-role model as production:
#   zexcore_owner (schema owner, boot-time only)  /  zexcore_app (restricted runtime role)
set -e

CONTAINER_NAME="zexcore-postgres"
SUPER_USER="zexcore_admin"
SUPER_PASS="zexcore_admin_secret"
OWNER_PASS="zexcore_owner_secret"
APP_PASS="zexcore_secret"
DB_NAME="zexcore_db"

DB_PORT="5432"
if ss -tuln | grep -q ":5432 "; then
  echo "[dev-db] Port 5432 is occupied. Using port 5433 for the container."
  DB_PORT="5433"
fi

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
  echo "[dev-db] Container $CONTAINER_NAME is already running."
elif [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
  echo "[dev-db] Starting existing container $CONTAINER_NAME..."
  docker start $CONTAINER_NAME
else
  echo "[dev-db] Creating Postgres container $CONTAINER_NAME on port $DB_PORT..."
  docker run -d --name $CONTAINER_NAME \
    -e POSTGRES_USER=$SUPER_USER -e POSTGRES_PASSWORD=$SUPER_PASS -e POSTGRES_DB=$DB_NAME \
    -p 127.0.0.1:$DB_PORT:5432 postgres:16
fi

echo "[dev-db] Waiting for Postgres..."
until docker exec $CONTAINER_NAME pg_isready -U $SUPER_USER -d $DB_NAME > /dev/null 2>&1; do sleep 0.5; done

echo "[dev-db] Creating roles (idempotent)..."
docker cp "$(dirname "$0")/db-setup-roles.sql" $CONTAINER_NAME:/tmp/db-setup-roles.sql
docker exec $CONTAINER_NAME psql -v ON_ERROR_STOP=1 -U $SUPER_USER -d postgres \
  -v owner_pass="'$OWNER_PASS'" -v app_pass="'$APP_PASS'" -v dbname=$DB_NAME -f /tmp/db-setup-roles.sql > /dev/null

cat <<MSG
[dev-db] Ready. Put this in .env:
  DATABASE_URL=postgres://zexcore_app:$APP_PASS@localhost:$DB_PORT/$DB_NAME
  ADMIN_DATABASE_URL=postgres://zexcore_owner:$OWNER_PASS@localhost:$DB_PORT/$DB_NAME
MSG
