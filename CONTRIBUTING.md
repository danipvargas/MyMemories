# Contributing

MyMemories is a completed personal project and active feature development is currently closed. Documentation improvements, reproducible bug fixes, and small maintenance changes may still be useful.

## Before You Start

Read [`DEVELOPMENT.md`](DEVELOPMENT.md) for the local setup and test commands. Please check the existing code and documentation before proposing a change so that it fits the current architecture and scope.

Do not commit:

- Secrets, credentials, API keys, or `.env` files
- Files from `secrets/`
- Uploaded images under `storage/images/`
- Local database volumes or generated build output

## Making Changes

- Keep changes focused and consistent with the existing code style.
- Preserve the separation between the React frontend, FastAPI backend, map renderer, and PostgreSQL storage.
- Update documentation when behavior, configuration, or commands change.
- Add or update tests for backend behavior when practical.
- Avoid adding dependencies unless the change needs them and their license and maintenance status are understood.

## Checks Before a Pull Request

Run the checks relevant to your change:

```bash
# Frontend
cd frontend
npm ci
npm run lint
npm run build
```

```bash
# Backend
cd backend
uv sync
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

For changes spanning services, run the full Compose stack and verify the affected flow through the application and API documentation.

## Pull Requests

Pull requests should explain what changed, why it changed, and how it was verified. Include screenshots for visible frontend changes when useful. Call out configuration changes explicitly, especially changes to secrets, cookies, CORS, image handling, or data storage.

Please report potential security issues privately rather than opening a public issue. See the security disclaimer in [`README.md`](README.md).
