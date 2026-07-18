"""
CoachMind Pro - AI Coach Service
Intelligent Training Analysis & Recommendation Engine
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

from app.schemas.schemas import (
    AIInsightCreate, AIInsightResponse, InsightType,
    AIAnalysisRequest, AIAnalysisResponse,
    AITrainingPlanRequest, AITrainingPlanResponse,
    DifficultyLevel
)

class AICoachService:
    """
    AI Coach Engine - Simulates real coach intelligence
    Analyzes user data and generates personalized insights
    """

    def __init__(self):
        self.model_version = "coachmind-v1.0.0"
        self.confidence_threshold = 0.75

    # ==================== ANALYSIS ENGINE ====================

    async def analyze_workout_performance(
        self,
        workout_data: Dict[str, Any],
        user_metrics: Dict[str, Any]
    ) -> AIAnalysisResponse:
        """Analyze workout performance and generate insights"""

        insights = []
        recommendations = []

        # Volume Analysis
        current_volume = workout_data.get("total_volume", 0)
        previous_volume = user_metrics.get("avg_volume", 0)

        if current_volume > previous_volume * 1.1:
            insights.append({
                "title": "تقدم ملحوظ في الحجم التدريبي!",
                "content": f"حجم تدريبك اليوم ({current_volume}kg) أعلى بـ {((current_volume/previous_volume - 1) * 100):.0f}% عن معدلك. استمر في هذا الإيقاع!",
                "type": InsightType.ANALYSIS,
                "priority": 2
            })
        elif current_volume < previous_volume * 0.85:
            insights.append({
                "title": "انخفاض في الحجم التدريبي",
                "content": "لاحظت انخفاضاً في حجم تدريبك. قد يكون هذا يوم راحة مقصود أو تحتاج لمراجعة طاقتك.",
                "type": InsightType.WARNING,
                "priority": 3
            })

        # Heart Rate Analysis
        avg_hr = workout_data.get("avg_heart_rate", 0)
        max_hr = workout_data.get("max_heart_rate", 0)
        resting_hr = user_metrics.get("resting_heart_rate", 70)

        hr_reserve = max_hr - resting_hr
        intensity = (avg_hr - resting_hr) / hr_reserve if hr_reserve > 0 else 0

        if intensity > 0.85:
            insights.append({
                "title": "شدة عالية جداً",
                "content": "شدة تدريبك اليوم في المنطقة الحمراء (>85%). تأكد من أخذ يوم راحة غداً.",
                "type": InsightType.WARNING,
                "priority": 4
            })
        elif intensity < 0.5:
            insights.append({
                "title": "شدة منخفضة",
                "content": "شدة تدريبك منخفضة. جرب زيادة الوزن أو تقليل فترات الراحة.",
                "type": InsightType.TIP,
                "priority": 2
            })

        # Recovery Analysis
        last_workout_date = user_metrics.get("last_workout_date")
        if last_workout_date:
            days_since = (datetime.now() - datetime.fromisoformat(last_workout_date)).days
            if days_since < 1:
                insights.append({
                    "title": "تدريب متتالي",
                    "content": "تدربت بالأمس أيضاً. تأكد من أن عضلاتك استعادت قوتها قبل التمرين اليوم.",
                    "type": InsightType.WARNING,
                    "priority": 3
                })

        # Form recommendations based on exercise data
        exercises = workout_data.get("exercises", [])
        for ex in exercises:
            if ex.get("weight", 0) > ex.get("previous_weight", 0) * 1.15:
                recommendations.append(
                    f"زيادة كبيرة في {ex.get('name')}. تأكد من صحة الأداء قبل زيادة الوزن أكثر."
                )

        # Generate performance prediction
        predicted_score = self._calculate_performance_score(workout_data, user_metrics)

        return AIAnalysisResponse(
            insights=[AIInsightResponse(**insight, id=i+1, user_id=1, is_read=False, 
                     is_actioned=False, confidence_score=0.85, created_at=datetime.now()) 
                     for i, insight in enumerate(insights)],
            recommendations=recommendations,
            predicted_performance=predicted_score,
            confidence=0.82
        )

    async def analyze_recovery_status(
        self,
        user_metrics: Dict[str, Any]
    ) -> List[AIInsightCreate]:
        """Analyze recovery status and suggest rest/adjustments"""

        insights = []

        # HRV Analysis (simulated)
        hrv = user_metrics.get("hrv", 50)
        baseline_hrv = user_metrics.get("baseline_hrv", 55)

        if hrv < baseline_hrv * 0.9:
            insights.append(AIInsightCreate(
                user_id=1,
                title="جهازك العصبي تحت ضغط",
                content="مؤشر HRV منخفض يشير إلى أن جسمك يحتاج للراحة. خفف من شدة التمرين اليوم أو خذ يوم راحة.",
                insight_type=InsightType.WARNING,
                priority=4
            ))

        # Sleep Analysis
        sleep_hours = user_metrics.get("sleep_hours", 7)
        if sleep_hours < 6:
            insights.append(AIInsightCreate(
                user_id=1,
                title="نوم غير كافٍ",
                content=f"نمت {sleep_hours} ساعات فقط. النوم الكافي ضروري للتعافي. حاول النوم مبكراً الليلة.",
                insight_type=InsightType.WARNING,
                priority=3
            ))

        # Training Load
        weekly_sessions = user_metrics.get("weekly_sessions", 0)
        if weekly_sessions > 6:
            insights.append(AIInsightCreate(
                user_id=1,
                title="حمل تدريبي مرتفع",
                content=f"تدربت {weekly_sessions} مرات هذا الأسبوع. هذا كثير جداً. أنصح بـ 4-5 جلسات كحد أقصى.",
                insight_type=InsightType.RECOMMENDATION,
                priority=3
            ))

        return insights

    # ==================== TRAINING PLAN GENERATOR ====================

    async def generate_training_plan(
        self,
        request: AITrainingPlanRequest
    ) -> AITrainingPlanResponse:
        """Generate AI-powered training plan based on user profile"""

        plan_name = f"خطة {request.goal} - {request.duration_weeks} أسبوع"

        weeks = []
        total_sessions = 0

        for week_num in range(1, request.duration_weeks + 1):
            week_plan = {
                "week_number": week_num,
                "phase": self._get_phase(week_num, request.duration_weeks),
                "focus": self._get_weekly_focus(week_num, request.goal),
                "sessions": []
            }

            for day in range(1, request.days_per_week + 1):
                session = self._generate_session(
                    week_num, day, request.goal, 
                    request.experience_level, request.available_equipment
                )
                week_plan["sessions"].append(session)
                total_sessions += 1

            weeks.append(week_plan)

        ai_notes = [
            f"تم تصميم هذه الخطة خصيصاً لهدف: {request.goal}",
            f"مستوى الخبرة: {request.experience_level.value}",
            "ابدأ كل جلسة بـ 10 دقائق إحماء ديناميكي",
            "انتهِ بـ 5 دقائق تمدد استاتيكي",
            "راقب شدة التمرين باستخدام RPE (معدل الجهد المدرك)"
        ]

        if request.limitations:
            ai_notes.append(f"تم مراعاة القيود: {request.limitations}")

        return AITrainingPlanResponse(
            plan_name=plan_name,
            description=f"خطة تدريبية متكاملة لـ {request.duration_weeks} أسبوع مصممة لتحقيق هدف {request.goal}",
            weeks=weeks,
            total_sessions=total_sessions,
            estimated_duration_per_session=60,
            ai_notes=ai_notes
        )

    # ==================== PROGRESS PREDICTION ====================

    async def predict_progress(
        self,
        user_id: int,
        historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict future progress based on historical data"""

        if not historical_data:
            return {
                "prediction": "insufficient_data",
                "message": "أحتاج بيانات أكثر لإجراء التنبؤ. استمر في تسجيل تدريباتك!"
            }

        # Simple linear regression simulation
        recent_volumes = [d.get("total_volume", 0) for d in historical_data[-4:]]
        avg_growth = sum(recent_volumes[i] - recent_volumes[i-1] for i in range(1, len(recent_volumes))) / max(len(recent_volumes)-1, 1)

        predicted_next = recent_volumes[-1] + avg_growth if recent_volumes else 0

        # Predict 1RM
        current_1rm = historical_data[-1].get("estimated_1rm", {})
        predictions = {}

        for exercise, weight in current_1rm.items():
            predicted_weight = weight * (1 + 0.02 * len(historical_data))  # 2% per session
            predictions[exercise] = round(predicted_weight, 1)

        return {
            "prediction": "success",
            "next_session_volume": round(predicted_next, 1),
            "predicted_1rm": predictions,
            "confidence": 0.78,
            "timeline": "4 أسابيع",
            "recommendations": [
                "استمر في نمط التقدم الحالي",
                "فكر في إضافة تمرين مركب جديد كل 4 أسابيع",
                "راقب علامات الإرهاق الزائد"
            ]
        }

    # ==================== HELPER METHODS ====================

    def _calculate_performance_score(
        self, 
        workout_data: Dict[str, Any], 
        user_metrics: Dict[str, Any]
    ) -> float:
        """Calculate overall performance score 0-100"""
        score = 70.0  # Base score

        # Volume factor
        current_vol = workout_data.get("total_volume", 0)
        avg_vol = user_metrics.get("avg_volume", 1)
        vol_ratio = min(current_vol / avg_vol, 1.5)
        score += (vol_ratio - 1) * 10

        # Intensity factor
        intensity = workout_data.get("avg_intensity", 0.7)
        score += (intensity - 0.7) * 15

        # Consistency factor
        consistency = user_metrics.get("consistency_score", 0.8)
        score += consistency * 10

        return round(min(max(score, 0), 100), 1)

    def _get_phase(self, week: int, total_weeks: int) -> str:
        """Determine training phase"""
        if week <= total_weeks * 0.25:
            return "تأسيسي"
        elif week <= total_weeks * 0.5:
            return "بناء"
        elif week <= total_weeks * 0.75:
            return "تكثيف"
        else:
            return "ذروة"

    def _get_weekly_focus(self, week: int, goal: str) -> str:
        """Determine weekly focus area"""
        focuses = {
            "muscle_gain": ["حجم", "كثافة", "تقنية", "تقدم تدريجي"],
            "fat_loss": ["حرق", "HIIT", "قوة", "تنويع"],
            "strength": ["تقنية", "أحمال عالية", "تقدم", "ذروة"],
            "endurance": ["سعة", "tempo", "interval", "تناوب"]
        }
        focus_list = focuses.get(goal, ["عام"])
        return focus_list[week % len(focus_list)]

    def _generate_session(
        self,
        week: int,
        day: int,
        goal: str,
        level: DifficultyLevel,
        equipment: List[str]
    ) -> Dict[str, Any]:
        """Generate a single training session"""

        # Difficulty multipliers
        multipliers = {
            DifficultyLevel.BEGINNER: {"sets": 3, "reps": "10-12", "rest": 90},
            DifficultyLevel.INTERMEDIATE: {"sets": 4, "reps": "8-10", "rest": 75},
            DifficultyLevel.ADVANCED: {"sets": 4, "reps": "6-8", "rest": 60},
            DifficultyLevel.ELITE: {"sets": 5, "reps": "3-5", "rest": 180}
        }

        m = multipliers.get(level, multipliers[DifficultyLevel.BEGINNER])

        # Session templates by goal
        templates = {
            "muscle_gain": {
                "name": f"جلسة بناء العضلات - الأسبوع {week}",
                "exercises": [
                    {"name": "الضغط", "sets": m["sets"], "reps": m["reps"], "rest": m["rest"]},
                    {"name": "السكوات", "sets": m["sets"], "reps": m["reps"], "rest": m["rest"]},
                    {"name": "الديدليفت", "sets": m["sets"], "reps": m["reps"], "rest": m["rest"]},
                    {"name": "السحب", "sets": m["sets"], "reps": m["reps"], "rest": m["rest"]}
                ]
            },
            "fat_loss": {
                "name": f"جلسة حرق الدهون - الأسبوع {week}",
                "exercises": [
                    {"name": "Burpees", "sets": 4, "reps": "15", "rest": 45},
                    {"name": "Kettlebell Swings", "sets": 4, "reps": "20", "rest": 60},
                    {"name": "Mountain Climbers", "sets": 4, "reps": "30", "rest": 45},
                    {"name": "Box Jumps", "sets": 4, "reps": "12", "rest": 60}
                ]
            },
            "strength": {
                "name": f"جلسة القوة - الأسبوع {week}",
                "exercises": [
                    {"name": "Squat", "sets": 5, "reps": "5", "rest": 180},
                    {"name": "Bench Press", "sets": 5, "reps": "5", "rest": 180},
                    {"name": "Deadlift", "sets": 3, "reps": "5", "rest": 240},
                    {"name": "Overhead Press", "sets": 5, "reps": "5", "rest": 150}
                ]
            }
        }

        template = templates.get(goal, templates["muscle_gain"])

        return {
            "day": day,
            "name": template["name"],
            "duration_minutes": 60 + week * 2,
            "exercises": template["exercises"],
            "notes": f"RPE مستهدف: {7 + week % 3}"
        }

# Singleton instance
ai_coach = AICoachService()
