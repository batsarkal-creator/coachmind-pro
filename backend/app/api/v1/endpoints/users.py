"""
CoachMind Pro - User Endpoints
User management and profile operations
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone
import os
import uuid

from app.db.database import get_db
from app.schemas.schemas import UserResponse, UserUpdate, UserProfile
from app.models.models import User, WorkoutSession, ProgressLog
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings

router = APIRouter()

def _calculate_streak(db: Session, user_id: int) -> int:
    """Calculate current workout streak"""
    today = datetime.now(timezone.utc).date()
    streak = 0
    check_date = today
    for _ in range(365):
        day_start = datetime.combine(check_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        has_workout = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at >= day_start,
            WorkoutSession.completed_at < day_end
        ).first()
        if has_workout:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return streak

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
    if current_user.role.value not in ("admin", "coach"):
        raise HTTPException(status_code=403, detail="يتطلب صلاحيات مدير أو مدرب")
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
        current_streak=_calculate_streak(db, current_user.id)
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
    """Get specific user by ID (own profile or admin/coach)"""
    if current_user.id != user_id and current_user.role.value not in ("admin", "coach"):
        raise HTTPException(status_code=403, detail="لا تملك صلاحية عرض هذا الملف")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return user

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload user avatar"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="صيغة الملف غير مدعومة. استخدم JPEG أو PNG أو WebP")
    
    max_size = 5 * 1024 * 1024  # 5MB
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="حجم الملف يتجاوز 5 ميجابايت")
    
    upload_dir = os.path.join("uploads", "avatars")
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user
