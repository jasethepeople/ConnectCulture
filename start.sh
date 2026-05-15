#!/bin/bash
set -e

# Unset empty PG env vars that interfere with local PostgreSQL startup
unset PGPORT PGUSER PGHOST PGDATABASE PGPASSWORD

PG_DATA="/home/runner/workspace/.pg_data"
PG_SOCKET_DIR="/run/postgresql"
PG_PORT="5432"
DB_NAME="spacelink"
DB_USER="runner"

mkdir -p "$PG_SOCKET_DIR"

# Initialize database if needed
if [ ! -d "$PG_DATA" ] || [ ! -f "$PG_DATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL data directory..."
  initdb -D "$PG_DATA"
fi

# Start PostgreSQL if not already running
if ! pg_ctl -D "$PG_DATA" status > /dev/null 2>&1; then
  echo "Starting PostgreSQL..."
  postgres -D "$PG_DATA" -p "$PG_PORT" &
  PG_PID=$!
  echo "PostgreSQL starting with PID $PG_PID"
  
  # Wait for PostgreSQL to be ready
  for i in $(seq 1 30); do
    if psql -h "$PG_SOCKET_DIR" -p "$PG_PORT" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
      echo "PostgreSQL is ready"
      break
    fi
    sleep 1
  done
fi

# Create database if it doesn't exist
if ! psql -h "$PG_SOCKET_DIR" -p "$PG_PORT" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1; then
  echo "Creating database $DB_NAME..."
  psql -h "$PG_SOCKET_DIR" -p "$PG_PORT" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
fi

# Export DATABASE_URL for the app
export DATABASE_URL="postgresql://${DB_USER}@localhost:${PG_PORT}/${DB_NAME}"
echo "DATABASE_URL set to local PostgreSQL"

# Run the application
exec npm run dev
