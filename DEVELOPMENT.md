# Development

This file contains the practical notes for running MyMemories locally. For the app presentation, see [`README_APP.md`](README_APP.md).

## Prerequisites

- Docker with Docker Compose
- Node.js 22 or later for frontend work outside Docker
- Python 3.14 or later and `uv` for backend work outside Docker

## Run the full app

The recommended local setup runs the frontend, API, PostgreSQL/PostGIS database, map renderer, and Adminer together:

```bash
docker compose up --build
```

Open these URLs when the services are ready:

- App: http://localhost:5173
- API: http://localhost:8000
- API documentation: http://localhost:8000/docs
- Adminer: http://localhost:8081

The Compose setup expects these local files to exist:

```text
secrets/postgres_user.txt
secrets/postgres_password.txt
secrets/postgres_database.txt
```

Put one local PostgreSQL value in each file. These files are ignored by Git and should never contain production credentials in a shared checkout.

Stop the services with:

```bash
docker compose down
```

The PostgreSQL data is stored in the `postgres_data` Docker volume. To remove the local database as well, use `docker compose down -v`.

## Frontend

Install dependencies and start Vite:

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

The API defaults to port `8000`. Set `VITE_API_BASE_URL` in `frontend/.env` when the API is running at a different address.

## Backend

Install the locked Python dependencies and run the API:

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

Run the backend test and quality checks with:

```bash
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

Running the backend directly requires a PostgreSQL/PostGIS database and the corresponding `POSTGRES_*` connection settings. The Compose setup provides these values automatically.

## Map renderer

The map renderer is included in the Compose setup. For standalone work:

```bash
cd map-renderer
npm ci
npm start
```

It listens on port `8080` by default and uses Playwright to render map previews for the API.
