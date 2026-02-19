# ── Build stage ───────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation for faster startup
ENV UV_COMPILE_BYTECODE=1
# Use copy mode so the venv works after the bind-mount disappears
ENV UV_LINK_MODE=copy

# Install dependencies first (layer cached as long as pyproject.toml is unchanged)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-dev --no-install-project 2>/dev/null || \
    uv sync --no-dev --no-install-project

# Copy application source and do a full sync
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy the virtualenv from the builder
COPY --from=builder /app/.venv /app/.venv
# Copy application source
COPY --from=builder /app/app ./app

ENV PATH="/app/.venv/bin:$PATH"

# Cloud Run injects PORT; default to 8080
EXPOSE 8080
CMD uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
