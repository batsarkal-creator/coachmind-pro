"""
CoachMind Pro - Dashboard Endpoints
Aggregated data for dashboard view
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.database import get_db
from app.schemas.schemas import DashboardResponse, DashboardStats, RecentActivity
from app.api.v1.endpoints.auth import get_current_active_user, User
from app.models.models import WorkoutSession, AIInsight, File, Folder

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard data"""

    # Stats
    total_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).count()

    total_exercises = db.query(File).count()

    total_hours_result = db.query(func.sum(WorkoutSession.duration_minutes)).filter(
        WorkoutSession.user_id == current_user.id
    ).scalar()
    total_hours = (total_hours_result or 0) / 60

    # Completion rate
    completed = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "completed"
    ).count()
    completion_rate = (completed / total_workouts * 100) if total_workouts > 0 else 0

    stats = DashboardStats(
        total_workouts=total_workouts,
        total_exercises=total_exercises,
        total_hours=round(total_hours, 1),
        current_streak=0,
        completion_rate=round(completion_rate, 1),
        avg_performance=85.0
    )

    # Recent activities
    recent_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).order_by(WorkoutSession.created_at.desc()).limit(5).all()

    activities = []
    for w in recent_workouts:
        activities.append(RecentActivity(
            id=w.id,
            type="workout",
            title=w.title or "تمرين",
            timestamp=w.created_at,
            details=w.status
        ))

    # AI Insights - convert to Pydantic
    from app.schemas.schemas import AIInsightResponse, WorkoutSessionResponse as WSR
    insights_raw = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id
    ).order_by(AIInsight.created_at.desc()).limit(5).all()

    insights = []
    for i in insights_raw:
        try:
            insights.append(AIInsightResponse(
                id=i.id, user_id=i.user_id, title=i.title, content=i.content,
                insight_type=i.insight_type or "tip", priority=i.priority or 1,
                is_read=i.is_read or False, is_actioned=i.is_actioned or False,
                confidence_score=i.confidence_score, created_at=i.created_at
            ))
        except Exception:
            pass

    # Upcoming workouts - convert to Pydantic
    upcoming_raw = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status.in_(["planned", "in_progress"])
    ).order_by(WorkoutSession.scheduled_date).limit(3).all()

    upcoming = []
    for w in upcoming_raw:
        try:
            upcoming.append(WSR(
                id=w.id, user_id=w.user_id, title=w.title or "تمرين",
                description=w.description, scheduled_date=w.scheduled_date,
                started_at=w.started_at, completed_at=w.completed_at,
                duration_minutes=w.duration_minutes, exercises=w.exercises or [],
                total_volume=w.total_volume, total_sets=w.total_sets or 0,
                total_reps=w.total_reps or 0, avg_heart_rate=w.avg_heart_rate,
                max_heart_rate=w.max_heart_rate, calories_burned=w.calories_burned,
                status=w.status or "planned", ai_feedback=w.ai_feedback,
                performance_score=w.performance_score, created_at=w.created_at
            ))
        except Exception:
            pass

    from app.schemas.schemas import UserProfile, UserResponse

    return DashboardResponse(
        user=UserProfile(
            **UserResponse.model_validate(current_user).model_dump(),
            total_workouts=total_workouts,
            total_hours=round(total_hours, 1),
            current_streak=0
        ),
        stats=stats,
        recent_activities=activities,
        ai_insights=insights,
        upcoming_workouts=upcoming
    )
