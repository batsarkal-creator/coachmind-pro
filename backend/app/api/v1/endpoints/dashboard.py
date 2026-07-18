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

    # AI Insights
    insights = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id
    ).order_by(AIInsight.created_at.desc()).limit(5).all()

    # Upcoming workouts
    upcoming = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status.in_(["planned", "in_progress"])
    ).order_by(WorkoutSession.scheduled_date).limit(3).all()

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
