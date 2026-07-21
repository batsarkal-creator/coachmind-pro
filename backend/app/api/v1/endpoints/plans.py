"""
CoachMind Pro - Training Plan Endpoints
Manage AI-generated and manual training plans
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.models import TrainingPlan
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/")
async def list_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List training plans"""
    plans = db.query(TrainingPlan).filter(
        TrainingPlan.created_by == current_user.id
    ).order_by(TrainingPlan.created_at.desc()).offset(skip).limit(limit).all()

    return [{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "duration_weeks": p.duration_weeks,
        "days_per_week": p.days_per_week,
        "goal": p.goal,
        "difficulty": p.difficulty.value if p.difficulty else None,
        "weeks": p.weeks,
        "is_ai_generated": p.is_ai_generated,
        "created_at": p.created_at.isoformat() if p.created_at else None
    } for p in plans]

@router.get("/{plan_id}")
async def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get plan details"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.created_by == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="الخطة غير موجودة")

    return {
        "id": plan.id,
        "name": plan.name,
        "description": plan.description,
        "duration_weeks": plan.duration_weeks,
        "days_per_week": plan.days_per_week,
        "goal": plan.goal,
        "difficulty": plan.difficulty.value if plan.difficulty else None,
        "weeks": plan.weeks,
        "is_ai_generated": plan.is_ai_generated,
        "ai_notes": plan.ai_prompt.split("\n") if plan.ai_prompt else [],
        "created_at": plan.created_at.isoformat() if plan.created_at else None
    }

@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a training plan"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.created_by == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="الخطة غير موجودة")

    db.delete(plan)
    db.commit()
    return {"message": "تم حذف الخطة بنجاح"}
