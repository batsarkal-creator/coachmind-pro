"""
CoachMind Pro - API Router v1
Main router aggregating all endpoint modules
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, folders, files, workouts, ai_coach, dashboard, exercises, progress, plans

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# User routes
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Content Management
api_router.include_router(folders.router, prefix="/folders", tags=["Folders"])
api_router.include_router(files.router, prefix="/files", tags=["Files"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["Exercises"])

# Training
api_router.include_router(workouts.router, prefix="/workouts", tags=["Workouts"])
api_router.include_router(plans.router, prefix="/plans", tags=["Training Plans"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress Logs"])

# AI & Analytics
api_router.include_router(ai_coach.router, prefix="/ai", tags=["AI Coach"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
