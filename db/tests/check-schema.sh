#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
container="devacademy-schema-${GITHUB_RUN_ID:-local}-$$"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# Publish on the loopback interface and let Docker choose an ephemeral free port.
docker run --detach --name "$container" --publish 127.0.0.1::5432 \
  --env POSTGRES_PASSWORD=local_only_test_password --env POSTGRES_DB=devacademy_test postgres:16-alpine >/dev/null
ready=false
for _ in $(seq 1 60); do
  if docker exec "$container" psql -U postgres -d devacademy_test -Atc "SELECT 1" >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  docker logs "$container" >&2
  exit 1
fi
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0001_learning_core.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0002_auth_sessions.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0003_execution_queue.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0004_code_assessment.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/migrations/0005_spaced_reviews.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/learning_core.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/auth_core.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/execution_queue.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/code_assessment.sql
docker exec -i "$container" psql -U postgres -d devacademy_test -v ON_ERROR_STOP=1 < db/tests/spaced_reviews.sql
echo "PostgreSQL schema integration PASS"

if [[ "${RUN_APP_TESTS:-}" == "1" ]]; then
  port="$(docker port "$container" 5432/tcp | tail -n1)"
  port="${port##*:}"
  export DATABASE_URL="postgresql://postgres:local_only_test_password@127.0.0.1:${port}/devacademy_test"
  export NEXT_TELEMETRY_DISABLED=1
  node apps/web/tests/auth-db.integration.mjs
  node apps/web/tests/execution-queue.integration.mjs
  node apps/web/tests/assessment-queue.integration.mjs
  node apps/web/tests/auth-http.integration.mjs
  node apps/web/tests/execution-http.integration.mjs
fi
