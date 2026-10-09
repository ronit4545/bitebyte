#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
(cd client && [ -d node_modules ] || npm install --prefix client)
(cd client && npm run build)
cd server-java
echo "Starting on http://localhost:5000"
mvn spring-boot:run
