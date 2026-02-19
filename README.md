# Garmin Analyzer

Personal Garmin Connect dashboard built with **FastAPI** (Python/UV) + **Next.js**, deployed as two containers on **Google Cloud Run** via **GitHub Actions**.

Data is loaded on demand — no database needed. Each dashboard request fetches directly from the Garmin Connect API.

---

## Architecture

```
GitHub Actions
  │
  ├── build + push backend image  ──► Artifact Registry
  │     └─► Cloud Run: garmin-backend  (FastAPI, port 8080)
  │           └─ GARMIN_USERNAME / GARMIN_PASSWORD (env vars)
  │
  └── build + push frontend image ──► Artifact Registry
        └─► Cloud Run: garmin-frontend (Next.js, port 8080)
              └─ BACKEND_URL = garmin-backend Cloud Run URL
```

The frontend makes **server-side** requests to the backend — credentials stay off the browser.

---

## Local development

### Prerequisites

- [UV](https://docs.astral.sh/uv/getting-started/installation/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Node 20+
- A Garmin Connect account (no 2FA, or app-specific password)

### Backend

```bash
cd backend
cp ../.env.example .env        # fill in GARMIN_USERNAME / GARMIN_PASSWORD
uv sync                        # creates .venv and installs deps
uv run uvicorn app.main:app --reload --port 8080
```

Interactive docs: http://localhost:8080/docs

### Frontend

```bash
cd frontend
npm install
# Create .env.local with:
echo "BACKEND_URL=http://localhost:8080" > .env.local
npm run dev                    # http://localhost:3000
```

---

## GCP setup (one-time)

> Run these commands with the `gcloud` CLI authenticated as a project owner.

```bash
PROJECT_ID=your-project-id
REGION=us-central1
SA_NAME=garmin-deployer

# 1. Enable APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  --project "$PROJECT_ID"

# 2. Create Artifact Registry repo
gcloud artifacts repositories create garmin \
  --repository-format docker \
  --location "$REGION" \
  --project "$PROJECT_ID"

# 3. Create a deploy service account
gcloud iam service-accounts create "$SA_NAME" \
  --display-name "Garmin Analyzer Deployer" \
  --project "$PROJECT_ID"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# 4. Grant required roles
for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "$ROLE"
done

# 5. Set up Workload Identity Federation for GitHub Actions
POOL_NAME=github-pool
PROVIDER_NAME=github-provider
REPO=your-github-username/garmin-analyzer   # ← change this

gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location global \
  --project "$PROJECT_ID"

POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
  --location global --project "$PROJECT_ID" \
  --format "value(name)")

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --workload-identity-pool "$POOL_NAME" \
  --location global \
  --issuer-uri "https://token.actions.githubusercontent.com" \
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --project "$PROJECT_ID"

PROVIDER_ID=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --workload-identity-pool "$POOL_NAME" \
  --location global --project "$PROJECT_ID" \
  --format "value(name)")

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO}" \
  --project "$PROJECT_ID"

echo "Workload Identity Provider: $PROVIDER_ID"
```

---

## GitHub repository secrets & variables

Go to **Settings → Secrets and variables → Actions** and add:

### Secrets

| Name | Value |
|------|-------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_SERVICE_ACCOUNT` | `garmin-deployer@<project>.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output of `echo $PROVIDER_ID` above |
| `GARMIN_USERNAME` | Your Garmin email |
| `GARMIN_PASSWORD` | Your Garmin password |

### Variables (optional — defaults shown)

| Name | Default |
|------|---------|
| `GCP_REGION` | `us-central1` |
| `GCP_AR_REPO` | `garmin` |

---

## Deploy

Push to `main` — GitHub Actions will:
1. Build and push the backend Docker image
2. Deploy `garmin-backend` to Cloud Run
3. Build and push the frontend Docker image
4. Deploy `garmin-frontend` to Cloud Run (with `BACKEND_URL` set automatically)

Or trigger manually via **Actions → Deploy to Cloud Run → Run workflow**.

---

## API reference

The backend exposes these endpoints (all prefixed `/api`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/activities` | List activities (`limit`, `start`, `type`, `from_date`, `to_date`) |
| GET | `/api/activities/{id}` | Single activity detail |
| GET | `/api/health/stats` | Daily summary stats (`cdate`) |
| GET | `/api/health/heartrate` | Heart rate samples (`cdate`) |
| GET | `/api/health/sleep` | Sleep data (`cdate`) |
| GET | `/api/health/steps` | Intraday steps (`cdate`) |
| GET | `/api/health/stress` | Stress data (`cdate`) |
| GET | `/api/health/body-battery` | Body battery (`start_date`, `end_date`) |
| GET | `/api/health/summary` | Multi-day stat summary (`days`) |
| GET | `/health` | Liveness check |

Interactive docs available at `/docs` when running locally.

---

## Notes

- **2FA**: If your Garmin account has two-factor authentication enabled, the backend will fail to authenticate on startup. Disable 2FA or create a separate Garmin account without it.
- **Session**: The Garmin client authenticates once per container lifetime. If the session expires Cloud Run will re-authenticate on the next container cold start.
- **Security**: For a personal deployment this is fine. For anything beyond that, store `GARMIN_USERNAME`/`GARMIN_PASSWORD` in **Cloud Secret Manager** and reference them with `--set-secrets` in the deploy step.
