"""
CoachMind Pro - Backend API
FastAPI-based REST API for AI Fitness Training Platform
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.database import engine, Base
from app.services.ai_coach import AICoachService

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    Base.metadata.create_all(bind=engine)
    print("🚀 CoachMind Pro API Started")
    print(f"📊 Database: {settings.DATABASE_URL}")
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
