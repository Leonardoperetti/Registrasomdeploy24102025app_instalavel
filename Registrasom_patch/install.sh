#!/usr/bin/env bash
set -euo pipefail
# Simple installer for Registrasom (checks + docker compose up)

NONINTERACTIVE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --non-interactive) NONINTERACTIVE=1; shift ;;
    --help|-h) echo "Usage: ./install.sh [--non-interactive]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "docker is required. Install it: https://docs.docker.com/get-docker/"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { echo "docker-compose or docker (with compose) is required."; }
docker --version
if ! docker compose version >/dev/null 2>&1; then
  echo "Warning: 'docker compose' not available. Trying 'docker-compose'..."
fi

if [ "$NONINTERACTIVE" -eq 0 ]; then
  read -p "This script will build and run containers (docker compose). Continue? [Y/n] " yn
  yn=${yn:-Y}
  if [[ ! "$yn" =~ ^[Yy]$ ]]; then
    echo "Aborted by user."
    exit 1
  fi
fi

echo "Starting docker compose..."
docker compose up --build -d

echo "Waiting for backend health..."
# wait for health (max 120s)
SECONDS=0
while [ $SECONDS -lt 120 ]; do
  if docker compose ps | grep backend | grep healthy >/dev/null 2>&1; then
    echo "Backend healthy."
    exit 0
  fi
  sleep 3
done
echo "Warning: backend didn't report healthy state within 120s. Check 'docker compose logs backend'."
exit 1
