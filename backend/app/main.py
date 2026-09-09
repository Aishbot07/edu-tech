import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.api.v1 import (
    auth,
    institutions,
    departments,
    academic_years,
    files,
    audit_log,
    dashboard,
)

app = FastAPI(
    title="NAAC Accreditation Platform",
    description="Foundation API for managing NAAC accreditation workflows",
    version="0.1.0",
)

# ── CORS ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request ID + Timing Middleware ─────────────────────────────────────
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{elapsed_ms}ms"
    return response


# ── Routers ────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(institutions.router, prefix="/api/v1")
app.include_router(departments.router, prefix="/api/v1")
app.include_router(academic_years.router, prefix="/api/v1")
app.include_router(files.router, prefix="/api/v1")
app.include_router(audit_log.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
