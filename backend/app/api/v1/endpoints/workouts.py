"""
CoachMind Pro - Workout Endpoints
Training session management and logging
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.db.database import get_db
from app.schemas.schemas import WorkoutSessionCreate, WorkoutSessionUpdate, WorkoutSessionResponse
from app.models.models import WorkoutSession
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/", response_model=List[WorkoutSessionResponse])
async def list_workouts(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user's workouts with pagination"""
    query = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id)
    if status:
        query = query.filter(WorkoutSession.status == status)

    workouts = query.order_by(WorkoutSession.created_at.desc()).offset(skip).limit(limit).all()
    return workouts

@router.post("/", response_model=WorkoutSessionResponse, status_code=201)
async def create_workout(
    workout: WorkoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new workout session"""
    db_workout = WorkoutSession(
        **workout.model_dump(),
        user_id=current_user.id,
        status="planned"
    )
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

@router.get("/{workout_id}", response_model=WorkoutSessionResponse)
async def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get workout details"""
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")
    return workout

@router.put("/{workout_id}", response_model=WorkoutSessionResponse)
async def update_workout(
    workout_id: int,
    workout_update: WorkoutSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update workout"""
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")

    # Auto-calculate metrics
    if workout_update.status == "completed" and not workout.completed_at:
        workout.completed_at = datetime.now(timezone.utc)
        if workout.started_at:
            workout.duration_minutes = int((datetime.now(timezone.utc) - workout.started_at).total_seconds() / 60)

    if workout_update.status == "in_progress" and not workout.started_at:
        workout.started_at = datetime.now(timezone.utc)

    for field, value in workout_update.model_dump(exclude_unset=True).items():
        setattr(workout, field, value)

    db.commit()
    db.refresh(workout)
    return workout

@router.delete("/{workout_id}")
async def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete workout"""
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="التمرين غير موجود")

    db.delete(workout)
    db.commit()
    return {"message": "تم حذف التمرين بنجاح"}
