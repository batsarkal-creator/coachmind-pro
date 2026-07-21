"""
CoachMind Pro - Progress Log Endpoints
Body measurement tracking and progress history
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.models import ProgressLog
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/")
async def list_progress_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user's progress logs"""
    logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.logged_at.desc()).offset(skip).limit(limit).all()

    return [{
        "id": l.id,
        "weight": l.weight,
        "body_fat": l.body_fat,
        "muscle_mass": l.muscle_mass,
        "bench_press_max": l.bench_press_max,
        "squat_max": l.squat_max,
        "deadlift_max": l.deadlift_max,
        "vo2_max": l.vo2_max,
        "resting_heart_rate": l.resting_heart_rate,
        "mood": l.mood,
        "sleep_hours": l.sleep_hours,
        "energy_level": l.energy_level,
        "notes": l.notes,
        "logged_at": l.logged_at.isoformat() if l.logged_at else datetime.now().isoformat()
    } for l in logs]

@router.post("/", status_code=201)
async def create_progress_log(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Log body measurements and metrics"""
    allowed = {"weight", "body_fat", "muscle_mass", "bench_press_max", "squat_max",
               "deadlift_max", "vo2_max", "resting_heart_rate", "mood", "sleep_hours",
               "energy_level", "notes", "progress_photos"}
    filtered = {k: v for k, v in data.items() if k in allowed}

    log = ProgressLog(user_id=current_user.id, **filtered)
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"id": log.id, "message": "تم تسجيل التقدم بنجاح", "logged_at": log.logged_at.isoformat()}

@router.get("/latest")
async def get_latest_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get most recent progress log"""
    log = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.logged_at.desc()).first()

    if not log:
        return None

    return {
        "id": log.id,
        "weight": log.weight,
        "body_fat": log.body_fat,
        "muscle_mass": log.muscle_mass,
        "bench_press_max": log.bench_press_max,
        "squat_max": log.squat_max,
        "deadlift_max": log.deadlift_max,
        "vo2_max": log.vo2_max,
        "resting_heart_rate": log.resting_heart_rate,
        "mood": log.mood,
        "sleep_hours": log.sleep_hours,
        "energy_level": log.energy_level,
        "logged_at": log.logged_at.isoformat() if log.logged_at else None
    }

@router.delete("/{log_id}")
async def delete_progress_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a progress log entry"""
    log = db.query(ProgressLog).filter(
        ProgressLog.id == log_id,
        ProgressLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
    db.delete(log)
    db.commit()
    return {"message": "تم حذف السجل بنجاح"}
