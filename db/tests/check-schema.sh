#!/usr/bin/env bash
# Validates DDL and constraints using disposable Docker-only PostgreSQL.
set -euo pipefail
cd "$(dirname "$0")/../.."
container="devacademy-schema-${GITHUB_RUN_ID:-local}-$$"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --detach --name "$container" --env POSTGRES_PASSWORD=local_only_test_password --env POSTGRES_DB=devacademy_test postgres:16-alpine >/dev/null
ready=false
for _ in $(seq 1 60); do
  if docker exec "$container" pg_isready -U postgres -d devacademy_test >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  docker logs "$container" >&2
  echo "PostgreSQL container was not ready" >&2
  exit 1
fi

docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0001_learning_core.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/learning_core.sql
echo "PostgreSQL learning schema integration PASS"
