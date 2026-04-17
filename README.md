# AcuityTalent

## Docker Setup (Frontend + Backend + AI + Postgres)

This repository includes Docker support for all services:

- `frontend` (Next.js) on port `3000`
- `backend` (NestJS) on port `4000`
- `ai` (FastAPI) on port `8000`
- `db` (Postgres with pgvector) on port `5432`

### Prerequisites

- Docker Desktop (or Docker Engine + Compose)

### Start Everything

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- AI API: `http://localhost:8000`

### Stop Everything

```bash
docker compose down
```

To also remove volumes (database data and uploaded files):

```bash
docker compose down -v
```

### Notes

- Backend uses `AI_SERVICE_URL` and defaults to `http://127.0.0.1:8000/api` for non-Docker local runs.
- Backend and AI both connect to the `db` service via the internal Docker network.
- Optional AI keys can be passed via environment variables when starting compose:

```bash
QWEN_API_KEY=your_key DASHSCOPE_API_KEY=your_key docker compose up --build
```
