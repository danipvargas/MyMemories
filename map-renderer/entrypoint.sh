#!/bin/sh

set -eu

# Keep the full style URL configurable while supporting the existing local
# MapTiler secrets for the default Compose setup.
if [ -z "${MAP_STYLE_POSTCARD:-}" ] \
    && [ -r /run/secrets/maptiler_apikey ] \
    && [ -r /run/secrets/maptiler_style_id ]; then
    api_key=$(tr -d '\r\n' < /run/secrets/maptiler_apikey)
    style_id=$(tr -d '\r\n' < /run/secrets/maptiler_style_id)
    export MAP_STYLE_POSTCARD="https://api.maptiler.com/maps/${style_id}/style.json?key=${api_key}"
fi

exec npm start
