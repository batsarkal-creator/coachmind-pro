"""
CoachMind Pro - AI Coach Endpoints
AI-powered training analysis and recommendations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import (
    AIAnalysisRequest, AIAnalysisResponse,
    AITrainingPlanRequest, AITrainingPlanResponse,
    AIInsightResponse, AIInsightCreate
)
from app.services.ai_coach import ai_coach
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.post("/analyze-workout", response_model=AIAnalysisResponse)
async def analyze_workout(
    request: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze workout performance with AI"""
    from app.models.models import AIInsight
    from datetime import datetime, timezone

    result = await ai_coach.analyze_workout_performance(
        request.workout_data,
        request.user_metrics,
        user_id=current_user.id
    )

    # Persist insights to database
    for insight in result.insights:
        db_insight = AIInsight(
            user_id=current_user.id,
            title=insight.title,
            content=insight.content,
            insight_type=insight.insight_type.value if hasattr(insight.insight_type, 'value') else insight.insight_type,
            priority=insight.priority,
            confidence_score=insight.confidence_score,
            is_read=False,
            is_actioned=False
        )
        db.add(db_insight)
    db.commit()

    return result

@router.post("/analyze-recovery")
async def analyze_recovery(
    user_metrics: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze recovery status"""
    from app.models.models import AIInsight

    insights = await ai_coach.analyze_recovery_status(user_metrics, user_id=current_user.id)

    # Persist insights to database
    for insight in insights:
        db_insight = AIInsight(
            user_id=current_user.id,
            title=insight.title,
            content=insight.content,
            insight_type=insight.insight_type.value if hasattr(insight.insight_type, 'value') else insight.insight_type,
            priority=insight.priority,
            is_read=False,
            is_actioned=False
        )
        db.add(db_insight)
    db.commit()

    return {"insights": [i.model_dump() for i in insights], "status": "analyzed"}

@router.post("/generate-plan", response_model=AITrainingPlanResponse)
async def generate_training_plan(
    request: AITrainingPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI training plan"""
    from app.models.models import TrainingPlan

    plan = await ai_coach.generate_training_plan(request)

    # Save plan to database
    db_plan = TrainingPlan(
        name=plan.plan_name,
        description=plan.description,
        duration_weeks=request.duration_weeks,
        days_per_week=request.days_per_week,
        goal=request.goal,
        difficulty=request.experience_level,
        weeks=plan.weeks,
        is_ai_generated=True,
        created_by=current_user.id
    )
    db.add(db_plan)
    db.commit()

    return plan

@router.post("/predict-progress")
async def predict_progress(
    historical_data: list,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Predict future progress"""
    prediction = await ai_coach.predict_progress(current_user.id, historical_data)
    return prediction

@router.get("/insights", response_model=List[AIInsightResponse])
async def get_insights(
    limit: int = 10,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI insights for user"""
    from app.models.models import AIInsight

    query = db.query(AIInsight).filter(AIInsight.user_id == current_user.id)
    if unread_only:
        query = query.filter(AIInsight.is_read == False)

    insights = query.order_by(AIInsight.priority.desc(), AIInsight.created_at.desc()).limit(limit).all()
    return insights

@router.post("/insights/{insight_id}/read")
async def mark_insight_read(
    insight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark insight as read"""
    from app.models.models import AIInsight

    insight = db.query(AIInsight).filter(
        AIInsight.id == insight_id,
        AIInsight.user_id == current_user.id
    ).first()

    if not insight:
        raise HTTPException(status_code=404, detail="التوصية غير موجودة")

    insight.is_read = True
    db.commit()
    return {"message": "تم تحديث الحالة"}
