"""
CoachMind Pro - Pydantic Schemas
Request/Response Models for API Validation
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================
class UserRole(str, Enum):
    ADMIN = "admin"
    COACH = "coach"
    ATHLETE = "athlete"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE = "elite"

class FileType(str, Enum):
    VIDEO = "video"
    PDF = "pdf"
    IMAGE = "image"
    SPREADSHEET = "spreadsheet"
    AUDIO = "audio"

class InsightType(str, Enum):
    TIP = "tip"
    WARNING = "warning"
    GOAL = "goal"
    ANALYSIS = "analysis"
    RECOMMENDATION = "recommendation"

# ==================== USER SCHEMAS ====================
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    weight: Optional[float] = Field(None, ge=20, le=300)
    height: Optional[float] = Field(None, ge=50, le=300)
    fitness_goal: Optional[str] = None
    experience_level: Optional[DifficultyLevel] = DifficultyLevel.BEGINNER

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[DifficultyLevel] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    resting_heart_rate: Optional[int]
    body_fat_percentage: Optional[float]
    total_workouts: int = 0
    total_hours: float = 0.0
    current_streak: int = 0

# ==================== AUTH SCHEMAS ====================
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    password: str

# ==================== FOLDER SCHEMAS ====================
class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon: Optional[str] = "📁"
    color: Optional[str] = "#10b981"
    parent_id: Optional[int] = None

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class FolderResponse(FolderBase):
    id: int
    file_count: int
    total_size: int
    is_system: bool
    created_at: datetime
    updated_at: Optional[datetime]
    children: List['FolderResponse'] = []

    class Config:
        from_attributes = True

# ==================== FILE SCHEMAS ====================
class FileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    file_type: FileType
    difficulty: Optional[DifficultyLevel] = DifficultyLevel.BEGINNER
    tags: List[str] = []
    muscle_groups: List[str] = []
    equipment: List[str] = []
    is_public: bool = False

class FileCreate(FileBase):
    folder_id: int

class FileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None
    muscle_groups: Optional[List[str]] = None

class FileResponse(FileBase):
    id: int
    file_path: Optional[str]
    file_size: Optional[int]
    thumbnail_path: Optional[str]
    duration: Optional[int]
    view_count: int
    download_count: int
    rating: float
    rating_count: int
    is_ai_generated: bool
    ai_summary: Optional[str]
    ai_difficulty_score: Optional[float]
    folder_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ==================== WORKOUT SCHEMAS ====================
class ExerciseSet(BaseModel):
    exercise_id: int
    sets: int = Field(..., ge=1, le=20)
    reps: int = Field(..., ge=1, le=100)
    weight: Optional[float] = None
    rest_seconds: int = 60
    notes: Optional[str] = None

class WorkoutSessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    exercises: List[ExerciseSet] = []

class WorkoutSessionCreate(WorkoutSessionBase):
    pass

class WorkoutSessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    exercises: Optional[List[ExerciseSet]] = None

class WorkoutSessionResponse(WorkoutSessionBase):
    id: int
    user_id: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_minutes: Optional[int]
    total_volume: Optional[float]
    total_sets: Optional[int] = 0
    total_reps: Optional[int] = 0
    avg_heart_rate: Optional[int]
    max_heart_rate: Optional[int]
    calories_burned: Optional[float]
    status: str
    ai_feedback: Optional[str]
    performance_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== AI INSIGHT SCHEMAS ====================
class AIInsightBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str
    insight_type: InsightType
    priority: int = Field(1, ge=1, le=5)

class AIInsightCreate(AIInsightBase):
    user_id: int
    related_workout_id: Optional[int] = None
    related_file_id: Optional[int] = None

class AIInsightResponse(AIInsightBase):
    id: int
    user_id: int
    is_read: bool
    is_actioned: bool
    confidence_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== PROGRESS SCHEMAS ====================
class ProgressLogCreate(BaseModel):
    weight: Optional[float] = Field(None, ge=20, le=500)
    body_fat: Optional[float] = Field(None, ge=0, le=70)
    muscle_mass: Optional[float] = Field(None, ge=0, le=200)
    bench_press_max: Optional[float] = Field(None, ge=0, le=1000)
    squat_max: Optional[float] = Field(None, ge=0, le=1000)
    deadlift_max: Optional[float] = Field(None, ge=0, le=1000)
    vo2_max: Optional[float] = Field(None, ge=0, le=100)
    resting_heart_rate: Optional[int] = Field(None, ge=30, le=200)
    mood: Optional[int] = Field(None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    progress_photos: Optional[List[str]] = []

class ProgressLogResponse(BaseModel):
    id: int
    user_id: int
    weight: Optional[float]
    body_fat: Optional[float]
    muscle_mass: Optional[float]
    bench_press_max: Optional[float]
    squat_max: Optional[float]
    deadlift_max: Optional[float]
    vo2_max: Optional[float]
    resting_heart_rate: Optional[int]
    mood: Optional[int]
    sleep_hours: Optional[float]
    energy_level: Optional[int]
    notes: Optional[str]
    progress_photos: Optional[List[str]]
    logged_at: datetime

    class Config:
        from_attributes = True

# ==================== EXERCISE SCHEMAS ====================
class ExerciseResponse(BaseModel):
    id: int
    name: str
    name_en: Optional[str]
    description: Optional[str]
    category: Optional[str]
    primary_muscle: Optional[str]
    secondary_muscles: Optional[List[str]]
    equipment: Optional[List[str]]
    instructions: Optional[List[str]]
    tips: Optional[List[str]]
    common_mistakes: Optional[List[str]]
    video_url: Optional[str]
    image_urls: Optional[List[str]]
    difficulty: Optional[DifficultyLevel]
    popularity: int
    avg_rating: float
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== TRAINING PLAN SCHEMAS ====================
class TrainingPlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    duration_weeks: int = Field(..., ge=1, le=52)
    days_per_week: int = Field(..., ge=1, le=7)
    goal: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = DifficultyLevel.BEGINNER
    weeks: Optional[List[Dict[str, Any]]] = []

class TrainingPlanResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    duration_weeks: Optional[int]
    days_per_week: Optional[int]
    goal: Optional[str]
    difficulty: Optional[DifficultyLevel]
    weeks: Optional[List[Dict[str, Any]]]
    is_ai_generated: bool
    user_count: int
    completion_rate: float
    avg_rating: float
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== DASHBOARD SCHEMAS ====================
class DashboardStats(BaseModel):
    total_workouts: int
    total_exercises: int
    total_hours: float
    current_streak: int
    completion_rate: float
    avg_performance: float

class RecentActivity(BaseModel):
    id: int
    type: str
    title: str
    timestamp: datetime
    details: Optional[str]

class DashboardResponse(BaseModel):
    user: UserProfile
    stats: DashboardStats
    recent_activities: List[RecentActivity]
    ai_insights: List[AIInsightResponse]
    upcoming_workouts: List[WorkoutSessionResponse]

# ==================== AI COACH SCHEMAS ====================
class AIAnalysisRequest(BaseModel):
    workout_data: Dict[str, Any]
    user_metrics: Dict[str, Any]
    analysis_type: str  # performance, recovery, nutrition, form

class AIAnalysisResponse(BaseModel):
    insights: List[AIInsightResponse]
    recommendations: List[str]
    predicted_performance: Optional[float]
    confidence: float

class AITrainingPlanRequest(BaseModel):
    goal: str
    duration_weeks: int = Field(..., ge=1, le=52)
    days_per_week: int = Field(..., ge=1, le=7)
    experience_level: DifficultyLevel
    available_equipment: List[str] = []
    limitations: Optional[str] = None

class AITrainingPlanResponse(BaseModel):
    plan_name: str
    description: str
    weeks: List[Dict[str, Any]]
    total_sessions: int
    estimated_duration_per_session: int
    ai_notes: List[str]

# Resolve recursive types
FolderResponse.model_rebuild()
