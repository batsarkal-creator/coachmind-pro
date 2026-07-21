"""
CoachMind Pro - Dashboard Endpoints
Aggregated data for dashboard view
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.db.database import get_db
from app.api.v1.endpoints.auth import get_current_active_user, User
from app.models.models import WorkoutSession, AIInsight, File, Folder, Exercise

router = APIRouter()

@router.get("/")
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard data"""

    # Stats
    total_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).count()

    total_exercises = db.query(Exercise).count()

    total_hours_result = db.query(func.sum(WorkoutSession.duration_minutes)).filter(
        WorkoutSession.user_id == current_user.id
    ).scalar()
    total_hours = (total_hours_result or 0) / 60

    completed = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "completed"
    ).count()
    completion_rate = (completed / total_workouts * 100) if total_workouts > 0 else 0

    avg_result = db.query(func.avg(WorkoutSession.performance_score)).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.performance_score.isnot(None)
    ).scalar()
    avg_performance = round(avg_result, 1) if avg_result else 85.0

    stats = {
        "total_workouts": total_workouts,
        "total_exercises": total_exercises,
        "total_hours": round(total_hours, 1),
        "current_streak": 0,
        "completion_rate": round(completion_rate, 1),
        "avg_performance": avg_performance
    }

    # Recent activities
    recent_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).order_by(WorkoutSession.created_at.desc()).limit(5).all()

    activities = []
    for w in recent_workouts:
        activities.append({
            "id": w.id,
            "type": "workout",
            "title": w.title or "تمرين",
            "timestamp": w.created_at.isoformat() if w.created_at else datetime.now().isoformat(),
            "details": w.status
        })

    # AI Insights
    insights = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id
    ).order_by(AIInsight.created_at.desc()).limit(5).all()

    insights_list = []
    for i in insights:
        insights_list.append({
            "id": i.id,
            "user_id": i.user_id,
            "title": i.title,
            "content": i.content,
            "insight_type": i.insight_type or "tip",
            "priority": i.priority or 1,
            "is_read": i.is_read or False,
            "is_actioned": i.is_actioned or False,
            "confidence_score": i.confidence_score,
            "created_at": i.created_at.isoformat() if i.created_at else datetime.now().isoformat()
        })

    # Upcoming workouts
    upcoming_raw = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status.in_(["planned", "in_progress"])
    ).order_by(WorkoutSession.scheduled_date).limit(3).all()

    upcoming = []
    for w in upcoming_raw:
        upcoming.append({
            "id": w.id,
            "user_id": w.user_id,
            "title": w.title or "تمرين",
            "description": w.description,
            "scheduled_date": w.scheduled_date.isoformat() if w.scheduled_date else None,
            "started_at": w.started_at.isoformat() if w.started_at else None,
            "completed_at": w.completed_at.isoformat() if w.completed_at else None,
            "duration_minutes": w.duration_minutes,
            "exercises": w.exercises or [],
            "total_volume": w.total_volume,
            "total_sets": w.total_sets or 0,
            "total_reps": w.total_reps or 0,
            "status": w.status or "planned",
            "performance_score": w.performance_score,
            "created_at": w.created_at.isoformat() if w.created_at else datetime.now().isoformat()
        })

    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role.value if current_user.role else "athlete",
        "age": current_user.age,
        "weight": current_user.weight,
        "height": current_user.height,
        "fitness_goal": current_user.fitness_goal,
        "experience_level": current_user.experience_level.value if current_user.experience_level else "beginner",
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else datetime.now().isoformat(),
        "resting_heart_rate": current_user.resting_heart_rate,
        "body_fat_percentage": current_user.body_fat_percentage,
        "total_workouts": total_workouts,
        "total_hours": round(total_hours, 1),
        "current_streak": 0
    }

    return {
        "user": user_data,
        "stats": stats,
        "recent_activities": activities,
        "ai_insights": insights_list,
        "upcoming_workouts": upcoming
    }
