#!/usr/bin/env bash
# Runs once on first container start (docker-entrypoint-initdb.d): creates the two ZexCore roles.
set -euo pipefail
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres \
  -v owner_pass="'${ZEX_OWNER_PASSWORD}'" -v app_pass="'${ZEX_APP_PASSWORD}'" -v dbname="${POSTGRES_DB}" \
  -f /scripts/db-setup-roles.sql
