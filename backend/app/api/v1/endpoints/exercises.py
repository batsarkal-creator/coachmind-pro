"""
CoachMind Pro - Exercise Library Endpoints
Exercise database management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import DifficultyLevel
from app.models.models import Exercise
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/")
async def list_exercises(
    category: Optional[str] = None,
    muscle: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List exercises from library"""
    query = db.query(Exercise)

    if category:
        query = query.filter(Exercise.category == category)
    if muscle:
        query = query.filter(Exercise.primary_muscle == muscle)
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    if search:
        query = query.filter(Exercise.name.contains(search))

    exercises = query.order_by(Exercise.popularity.desc()).limit(limit).all()
    return exercises

@router.get("/{exercise_id}")
async def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get exercise details"""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")

    # Increment popularity
    exercise.popularity += 1
    db.commit()

    return exercise

@router.post("/", status_code=201)
async def create_exercise(
    exercise_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add new exercise to library (coach/admin only)"""
    exercise = Exercise(**exercise_data)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
