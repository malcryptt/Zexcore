#!/usr/bin/env bash
# One-time production database bootstrap for managed Postgres where you only get one primary user (e.g. Render).
#
#   PRIMARY_URL='postgres://...primary...'  APP_PASSWORD='<new strong password>'  ./scripts/db-init-production.sh
#
# Creates the restricted runtime role `zexcore_app` (no superuser, no BYPASSRLS, cannot create objects).
# The API itself creates the schema, RLS policies and grants on boot using ADMIN_DATABASE_URL (the primary user).
# Afterwards set DATABASE_URL on the API service to:
#   postgres://zexcore_app:<APP_PASSWORD>@<same host>/<db name>   (add ?sslmode=require for external hosts)
set -euo pipefail

: "${PRIMARY_URL:?Set PRIMARY_URL to the managed database's primary connection string}"
: "${APP_PASSWORD:?Set APP_PASSWORD to a new strong password for the runtime role}"
if [ "${#APP_PASSWORD}" -lt 24 ]; then echo "APP_PASSWORD must be at least 24 characters" >&2; exit 1; fi
case "$APP_PASSWORD" in *"'"*) echo "APP_PASSWORD must not contain a single quote" >&2; exit 1;; esac
command -v psql >/dev/null || { echo "psql is required (apt install postgresql-client)" >&2; exit 1; }

DB_NAME="$(psql "$PRIMARY_URL" -Atc 'select current_database()')"
echo "[db-init] database: $DB_NAME"
psql "$PRIMARY_URL" -v ON_ERROR_STOP=1 \
  -v app_pass="'${APP_PASSWORD}'" -v dbname="$DB_NAME" -v skip_owner=1 \
  -f "$(dirname "$0")/db-setup-roles.sql"
echo "[db-init] done. Now set DATABASE_URL on the API service using zexcore_app and the password you chose."
