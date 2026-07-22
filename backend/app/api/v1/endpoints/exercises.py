"""
CoachMind Pro - Exercise Library Endpoints
Exercise database management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import DifficultyLevel, ExerciseResponse
from app.models.models import Exercise
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

def _require_coach_or_admin(current_user: User):
    if current_user.role.value not in ("coach", "admin"):
        raise HTTPException(status_code=403, detail="يتطلب صلاحيات مدرب أو مدير")

@router.get("/", response_model=List[ExerciseResponse])
async def list_exercises(
    category: Optional[str] = None,
    muscle: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List exercises from library with pagination"""
    query = db.query(Exercise)

    if category:
        query = query.filter(Exercise.category == category)
    if muscle:
        query = query.filter(Exercise.primary_muscle == muscle)
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    if search:
        from sqlalchemy import or_
        query = query.filter(or_(
            Exercise.name.contains(search),
            Exercise.name_en.contains(search),
            Exercise.primary_muscle.contains(search)
        ))

    exercises = query.order_by(Exercise.popularity.desc()).offset(skip).limit(limit).all()
    return exercises

@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get exercise details"""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")

    exercise.popularity += 1
    db.commit()
    return exercise

@router.post("/", response_model=ExerciseResponse, status_code=201)
async def create_exercise(
    exercise_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add new exercise to library (coach/admin only)"""
    _require_coach_or_admin(current_user)

    allowed_fields = {"name", "name_en", "description", "category", "primary_muscle",
                      "secondary_muscles", "difficulty", "equipment", "video_url", "tips", "instructions", "common_mistakes"}
    filtered = {k: v for k, v in exercise_data.items() if k in allowed_fields}

    exercise = Exercise(**filtered)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: int,
    exercise_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update exercise (coach/admin only)"""
    _require_coach_or_admin(current_user)
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")

    allowed = {"name", "name_en", "description", "category", "primary_muscle",
               "secondary_muscles", "difficulty", "equipment", "video_url", "tips", "instructions", "common_mistakes"}
    for k, v in exercise_data.items():
        if k in allowed:
            setattr(exercise, k, v)

    db.commit()
    db.refresh(exercise)
    return exercise

@router.delete("/{exercise_id}")
async def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete exercise (coach/admin only)"""
    _require_coach_or_admin(current_user)
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")
    db.delete(exercise)
    db.commit()
    return {"message": "تم حذف التمرين بنجاح"}
