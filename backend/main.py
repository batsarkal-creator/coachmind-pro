"""
CoachMind Pro - Backend API
FastAPI-based REST API for AI Fitness Training Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    Base.metadata.create_all(bind=engine)
    print("🚀 CoachMind Pro API Started")
    print(f"📊 Database: {settings.DATABASE_URL}")

    # Auto-seed if database is empty
    from app.db.database import SessionLocal
    from app.models.models import User
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("🌱 Database empty - seeding...")
            from seed import seed_database
            seed_database()
        else:
            print(f"✅ Database has {db.query(User).count()} users")
    finally:
        db.close()

    yield
    # Shutdown
    print("👋 CoachMind Pro API Stopped")

app = FastAPI(
    title="CoachMind Pro API",
    description="AI-Powered Fitness Training Platform Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Read from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://coachmind-pro.netlify.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "name": "CoachMind Pro",
        "version": "1.0.0",
        "status": "running",
        "ai_coach": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["database", "ai_engine", "auth"]}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
