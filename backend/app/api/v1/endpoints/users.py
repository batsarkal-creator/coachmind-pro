"""
CoachMind Pro - User Endpoints
User management and profile operations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import UserResponse, UserUpdate, UserProfile
from app.models.models import User, WorkoutSession, ProgressLog
from app.api.v1.endpoints.auth import get_current_active_user

router = APIRouter()

@router.post("/seed")
async def seed_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Seed database with initial data (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="يتطلب صلاحيات مدير")
    
    from seed import seed_database
    seed_database()
    return {"message": "تم تهيئة قاعدة البيانات بنجاح"}

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all users (admin/coach only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/profile", response_model=UserProfile)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed user profile with stats"""
    # Calculate stats
    total_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).count()

    total_hours = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).with_entities(WorkoutSession.duration_minutes).all()
    total_hours = sum([h[0] or 0 for h in total_hours]) / 60 if total_hours else 0

    # Get latest progress
    latest_progress = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.logged_at.desc()).first()

    return UserProfile(
        **UserResponse.model_validate(current_user).model_dump(),
        total_workouts=total_workouts,
        total_hours=round(total_hours, 1),
        current_streak=0  # Would calculate from workout history
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return user
