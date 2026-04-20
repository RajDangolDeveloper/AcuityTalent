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

### Environment Variables

For the AI service, set these variables:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_token
```

Optional AI tuning variables:

```bash
CLOUDFLARE_AI_BASE_URL=https://api.cloudflare.com/client/v4
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3-8b-instruct
CLOUDFLARE_MAX_OUTPUT_TOKENS=1024
CLOUDFLARE_TEMPERATURE=0.7
CLOUDFLARE_TOP_P=0.9
CLOUDFLARE_TIMEOUT_SECONDS=120
```

Common app variables:

```bash
DATABASE_URL=postgresql://prisma:password@localhost:5432/acuitytalentdb
AI_SERVICE_URL=http://127.0.0.1:8000/api
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
DEBUG=True
```

Optional environment variables when starting compose:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id CLOUDFLARE_API_TOKEN=your_token docker compose up --build
```
