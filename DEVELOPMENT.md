# Development

This guide covers local setup, service configuration, testing, and deployment-oriented settings for MyMemories. For the project overview, see [`README.md`](README.md).

## Project Layout

- `frontend/`: React, TypeScript, and Vite client.
- `backend/`: FastAPI application, database access, authentication, and image processing.
- `map-renderer/`: Node.js service that generates map preview images with Playwright.
- `storage/postgres/`: PostGIS image and database initialization files.
- `shared/maps/`: Shared map style configuration.
- `resources/`: Project documentation assets.

## Prerequisites

- Docker with Docker Compose
- Node.js 22 or later for frontend and map-renderer work outside Docker
- Python 3.14 or later and [`uv`](https://docs.astral.sh/uv/) for backend work outside Docker
- A MapTiler API key for map tiles and map previews

## First-Time Setup

The Compose stack reads credentials from files under `secrets/`. The directory is ignored by Git and must never be committed.

```bash
mkdir -p secrets
printf 'mymemories\n' > secrets/postgres_user.txt
printf 'mymemories\n' > secrets/postgres_database.txt
openssl rand -base64 32 > secrets/postgres_password.txt
openssl rand -base64 48 > secrets/auth_secret_key.txt
```

Put your MapTiler API key in `secrets/maptiler_api_key.txt`:

```text
your-maptiler-api-key
```

The `auth_secret_key.txt` file is important: it is the signing key for the JWT authentication cookie. Without it, the Compose setup will not start. Generate a new value for each environment; do not reuse the example or commit the file.

## Run the Full App

The recommended setup runs the frontend, API, PostgreSQL/PostGIS, map renderer, and Adminer together:

```bash
docker compose up --build
```

Open these URLs when the services are ready:

- App: <http://localhost:5173>
- API: <http://localhost:8000>
- API documentation: <http://localhost:8000/docs>
- Adminer: <http://localhost:8081>

Stop the services without deleting the database:

```bash
docker compose down
```

The database is stored in the `postgres_data` Docker volume and uploaded images are stored in `storage/images/`. To remove the local database as well:

```bash
docker compose down -v
```

## Configuration

### Authentication and production settings

Compose injects the JWT signing key through `AUTH_SECRET_KEY_FILE=/run/secrets/auth_secret_key`. The backend also supports `AUTH_SECRET_KEY_FILE` or `AUTH_SECRET_KEY` when run outside Docker, but a secret file is the recommended approach.

For an internet-facing deployment, configure all of the following through the deployment environment or secret manager:

- `APP_ENV=production`
- A unique `AUTH_SECRET_KEY` with at least 32 characters, or an `AUTH_SECRET_KEY_FILE`
- `AUTH_COOKIE_SECURE=true` so authentication cookies are sent only over HTTPS
- `AUTH_COOKIE_SAMESITE` according to the deployment topology
- `ALLOWED_ORIGINS` containing only the exact frontend origins that may call the API
- Database credentials and the MapTiler key outside the repository

The backend rejects the development JWT secret in production and refuses to start with insecure production cookie settings. The default Compose values are intentionally suitable for local HTTP development only.

### Frontend

The frontend assumes the API is available on port `8000`. To use another API address, create `frontend/.env` with:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Run the frontend directly with:

```bash
cd frontend
npm ci
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
```

### Backend

Install the locked dependencies and run the API directly:

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

Direct backend work requires a reachable PostgreSQL/PostGIS database and `POSTGRES_*` connection settings. It also requires `AUTH_SECRET_KEY_FILE` or `AUTH_SECRET_KEY`; point the file setting at the local secret created above when possible.

Run backend tests and quality checks with:

```bash
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

### Map renderer

The map renderer is included in Compose. For standalone work, first make the shared style available at the path expected by the service, then install dependencies and provide a MapTiler key through `MAPTILER_API_KEY_FILE`:

```bash
cd map-renderer
cp ../shared/maps/style.json src/assets/style.json
npm ci
MAPTILER_API_KEY_FILE=/absolute/path/to/maptiler_api_key.txt \
npm start
```

It listens on port `8080` by default. Set `MAP_RENDERER_URL=http://localhost:8080` when running the API outside Compose as well.

## Pre-Commit Checks

The backend includes Ruff and general repository checks through pre-commit. From `backend/`:

```bash
uv run pre-commit install
uv run pre-commit run --all-files
```

## Working With Data

Uploaded images are intentionally kept outside Git in `storage/images/`. The Compose database uses a named volume. Do not add credentials, generated images, `.env` files, or secret files to commits.

The API creates database tables when it starts. There are currently no migration commands; schema changes should be reviewed carefully against `backend/src/models/` and `storage/postgres/init/`.
