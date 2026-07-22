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
from app.schemas.schemas import ProgressLogCreate, ProgressLogResponse

router = APIRouter()

@router.get("/", response_model=List[ProgressLogResponse])
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
    return logs

@router.post("/", response_model=ProgressLogResponse, status_code=201)
async def create_progress_log(
    data: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Log body measurements and metrics"""
    log = ProgressLog(user_id=current_user.id, **data.model_dump(exclude_unset=True))
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/latest", response_model=Optional[ProgressLogResponse])
async def get_latest_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get most recent progress log"""
    log = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id
    ).order_by(ProgressLog.logged_at.desc()).first()
    return log

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
