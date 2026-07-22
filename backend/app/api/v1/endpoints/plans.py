"""
CoachMind Pro - Training Plan Endpoints
Manage AI-generated and manual training plans
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.models import TrainingPlan
from app.schemas.schemas import TrainingPlanCreate, TrainingPlanResponse
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/", response_model=List[TrainingPlanResponse])
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
    return plans

@router.get("/{plan_id}", response_model=TrainingPlanResponse)
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
    return plan

@router.post("/", response_model=TrainingPlanResponse, status_code=201)
async def create_plan(
    data: TrainingPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new training plan"""
    plan = TrainingPlan(
        created_by=current_user.id,
        **data.model_dump(exclude_unset=True)
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

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
