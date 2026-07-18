"""
CoachMind Pro - Database Models
SQLAlchemy ORM Models for Fitness Training Platform
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from app.db.database import Base

class UserRole(str, PyEnum):
    ADMIN = "admin"
    COACH = "coach"
    ATHLETE = "athlete"

class DifficultyLevel(str, PyEnum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE = "elite"

class FileType(str, PyEnum):
    VIDEO = "video"
    PDF = "pdf"
    IMAGE = "image"
    SPREADSHEET = "spreadsheet"
    AUDIO = "audio"

# ==================== USER MODEL ====================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    avatar_url = Column(String(500))
    role = Column(Enum(UserRole), default=UserRole.ATHLETE)

    # Profile
    age = Column(Integer)
    weight = Column(Float)  # kg
    height = Column(Float)  # cm
    fitness_goal = Column(String(100))  # muscle_gain, fat_loss, endurance, etc.
    experience_level = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER)

    # Health metrics
    resting_heart_rate = Column(Integer)
    max_heart_rate = Column(Integer)
    body_fat_percentage = Column(Float)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    workouts = relationship("WorkoutSession", back_populates="user")
    progress_logs = relationship("ProgressLog", back_populates="user")
    ai_insights = relationship("AIInsight", back_populates="user")
    folders = relationship("Folder", back_populates="owner")

# ==================== FOLDER MODEL ====================
class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    icon = Column(String(50), default="📁")
    color = Column(String(20), default="#10b981")

    # Hierarchy
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    children = relationship("Folder", backref="parent", remote_side=[id])

    # Metadata
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="folders")

    is_system = Column(Boolean, default=False)  # System folders (Strength, Cardio, etc.)
    sort_order = Column(Integer, default=0)

    # Stats
    file_count = Column(Integer, default=0)
    total_size = Column(Integer, default=0)  # bytes

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    files = relationship("File", back_populates="folder")

# ==================== FILE MODEL ====================
class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # File info
    file_type = Column(Enum(FileType), nullable=False)
    mime_type = Column(String(100))
    file_path = Column(String(500))
    file_size = Column(Integer)  # bytes
    thumbnail_path = Column(String(500))

    # Content
    content_text = Column(Text)  # For PDFs - extracted text
    duration = Column(Integer)  # For videos - seconds

    # Categorization
    folder_id = Column(Integer, ForeignKey("folders.id"))
    folder = relationship("Folder", back_populates="files")

    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER)
    tags = Column(JSON, default=list)  # ["chest", "strength", "compound"]
    muscle_groups = Column(JSON, default=list)  # ["chest", "triceps", "shoulders"]
    equipment = Column(JSON, default=list)  # ["barbell", "bench"]

    # AI Analysis
    ai_summary = Column(Text)
    ai_tags = Column(JSON, default=list)
    ai_difficulty_score = Column(Float)  # 0-100

    # Stats
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)

    # Ownership
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploader = relationship("User")

    is_public = Column(Boolean, default=False)
    is_ai_generated = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ==================== WORKOUT SESSION ====================
class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="workouts")

    # Session details
    title = Column(String(200))
    description = Column(Text)

    # Timing
    scheduled_date = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)

    # Performance
    exercises = Column(JSON, default=list)  # [{"exercise_id": 1, "sets": 4, "reps": 12, "weight": 60}]
    total_volume = Column(Float)  # Total weight lifted
    total_sets = Column(Integer)
    total_reps = Column(Integer)

    # Heart rate data
    avg_heart_rate = Column(Integer)
    max_heart_rate = Column(Integer)
    calories_burned = Column(Float)

    # Status
    status = Column(String(20), default="planned")  # planned, in_progress, completed, skipped

    # AI Analysis
    ai_feedback = Column(Text)
    ai_suggestions = Column(JSON, default=list)
    performance_score = Column(Float)  # 0-100

    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ==================== PROGRESS LOG ====================
class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="progress_logs")

    # Measurements
    weight = Column(Float)
    body_fat = Column(Float)
    muscle_mass = Column(Float)

    # Performance metrics
    bench_press_max = Column(Float)
    squat_max = Column(Float)
    deadlift_max = Column(Float)

    # Cardio
    vo2_max = Column(Float)
    resting_heart_rate = Column(Integer)

    # Photos
    progress_photos = Column(JSON, default=list)  # URLs

    # Notes
    notes = Column(Text)
    mood = Column(Integer)  # 1-10
    sleep_hours = Column(Float)
    energy_level = Column(Integer)  # 1-10

    logged_at = Column(DateTime(timezone=True), server_default=func.now())

# ==================== AI INSIGHT ====================
class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="ai_insights")

    # Insight content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    insight_type = Column(String(50))  # tip, warning, goal, analysis, recommendation

    # Context
    related_workout_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=True)
    related_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)

    # Priority & Status
    priority = Column(Integer, default=1)  # 1-5
    is_read = Column(Boolean, default=False)
    is_actioned = Column(Boolean, default=False)

    # AI Metadata
    confidence_score = Column(Float)  # 0-1
    ai_model_version = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ==================== EXERCISE LIBRARY ====================
class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    name_en = Column(String(200))
    description = Column(Text)

    # Classification
    category = Column(String(100))  # strength, cardio, flexibility, plyometric
    primary_muscle = Column(String(100))
    secondary_muscles = Column(JSON, default=list)
    equipment = Column(JSON, default=list)

    # Instructions
    instructions = Column(JSON, default=list)  # Step-by-step
    tips = Column(JSON, default=list)
    common_mistakes = Column(JSON, default=list)

    # Media
    video_url = Column(String(500))
    image_urls = Column(JSON, default=list)

    # Difficulty
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER)

    # Stats
    popularity = Column(Integer, default=0)
    avg_rating = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ==================== TRAINING PLAN ====================
class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # Plan structure
    duration_weeks = Column(Integer)
    days_per_week = Column(Integer)
    goal = Column(String(100))  # muscle_gain, fat_loss, strength, endurance
    difficulty = Column(Enum(DifficultyLevel))

    # Content
    weeks = Column(JSON, default=list)  # Detailed week-by-week plan

    # AI Generated
    is_ai_generated = Column(Boolean, default=False)
    ai_prompt = Column(Text)

    # Stats
    user_count = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    avg_rating = Column(Float, default=0.0)

    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
