#!/bin/sh

set -eu

profile_path="/app/storage/images/profiles/default_profile.jpg"

mkdir -p /app/storage/images/profiles

if [ ! -f "$profile_path" ]; then
    cp /src/seed/default_profile.jpg "$profile_path"
fi

exec uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
