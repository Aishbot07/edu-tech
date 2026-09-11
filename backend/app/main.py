from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router


app = FastAPI(
    title="EduVerse NAAC API",
    description="Backend API for EduVerse NAAC Accreditation System",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Authentication Routes
app.include_router(auth_router)


@app.get("/")
def root():
    return "Backend API for EduVerse NAAC Accreditation System"