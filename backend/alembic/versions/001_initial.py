"""Initial migration - all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-07-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('role', sa.Enum('admin', 'coach', 'athlete', name='userrole'), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('height', sa.Float(), nullable=True),
        sa.Column('fitness_goal', sa.String(100), nullable=True),
        sa.Column('experience_level', sa.Enum('beginner', 'intermediate', 'advanced', 'elite', name='difficultylevel'), nullable=True),
        sa.Column('resting_heart_rate', sa.Integer(), nullable=True),
        sa.Column('max_heart_rate', sa.Integer(), nullable=True),
        sa.Column('body_fat_percentage', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'])

    op.create_table('folders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('color', sa.String(20), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('is_system', sa.Boolean(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('file_count', sa.Integer(), nullable=True),
        sa.Column('total_size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['folders.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_folders_id', 'folders', ['id'])

    op.create_table('workout_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('exercises', sa.JSON(), nullable=True),
        sa.Column('total_volume', sa.Float(), nullable=True),
        sa.Column('total_sets', sa.Integer(), nullable=True),
        sa.Column('total_reps', sa.Integer(), nullable=True),
        sa.Column('avg_heart_rate', sa.Integer(), nullable=True),
        sa.Column('max_heart_rate', sa.Integer(), nullable=True),
        sa.Column('calories_burned', sa.Float(), nullable=True),
        sa.Column('status', sa.String(20), nullable=True),
        sa.Column('ai_feedback', sa.Text(), nullable=True),
        sa.Column('ai_suggestions', sa.JSON(), nullable=True),
        sa.Column('performance_score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workout_sessions_id', 'workout_sessions', ['id'])

    op.create_table('progress_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('body_fat', sa.Float(), nullable=True),
        sa.Column('muscle_mass', sa.Float(), nullable=True),
        sa.Column('bench_press_max', sa.Float(), nullable=True),
        sa.Column('squat_max', sa.Float(), nullable=True),
        sa.Column('deadlift_max', sa.Float(), nullable=True),
        sa.Column('vo2_max', sa.Float(), nullable=True),
        sa.Column('resting_heart_rate', sa.Integer(), nullable=True),
        sa.Column('progress_photos', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('mood', sa.Integer(), nullable=True),
        sa.Column('sleep_hours', sa.Float(), nullable=True),
        sa.Column('energy_level', sa.Integer(), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_progress_logs_id', 'progress_logs', ['id'])

    op.create_table('ai_insights',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('insight_type', sa.String(50), nullable=True),
        sa.Column('related_workout_id', sa.Integer(), nullable=True),
        sa.Column('related_file_id', sa.Integer(), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('is_actioned', sa.Boolean(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('ai_model_version', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['related_workout_id'], ['workout_sessions.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_insights_id', 'ai_insights', ['id'])

    op.create_table('exercises',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('name_en', sa.String(200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('primary_muscle', sa.String(100), nullable=True),
        sa.Column('secondary_muscles', sa.JSON(), nullable=True),
        sa.Column('equipment', sa.JSON(), nullable=True),
        sa.Column('instructions', sa.JSON(), nullable=True),
        sa.Column('tips', sa.JSON(), nullable=True),
        sa.Column('common_mistakes', sa.JSON(), nullable=True),
        sa.Column('video_url', sa.String(500), nullable=True),
        sa.Column('image_urls', sa.JSON(), nullable=True),
        sa.Column('difficulty', sa.Enum('beginner', 'intermediate', 'advanced', 'elite', name='difficultylevel'), nullable=True),
        sa.Column('popularity', sa.Integer(), nullable=True),
        sa.Column('avg_rating', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_exercises_id', 'exercises', ['id'])

    op.create_table('training_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration_weeks', sa.Integer(), nullable=True),
        sa.Column('days_per_week', sa.Integer(), nullable=True),
        sa.Column('goal', sa.String(100), nullable=True),
        sa.Column('difficulty', sa.Enum('beginner', 'intermediate', 'advanced', 'elite', name='difficultylevel'), nullable=True),
        sa.Column('weeks', sa.JSON(), nullable=True),
        sa.Column('is_ai_generated', sa.Boolean(), nullable=True),
        sa.Column('ai_prompt', sa.Text(), nullable=True),
        sa.Column('user_count', sa.Integer(), nullable=True),
        sa.Column('completion_rate', sa.Float(), nullable=True),
        sa.Column('avg_rating', sa.Float(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_training_plans_id', 'training_plans', ['id'])


def downgrade() -> None:
    op.drop_table('training_plans')
    op.drop_table('exercises')
    op.drop_table('ai_insights')
    op.drop_table('progress_logs')
    op.drop_table('workout_sessions')
    op.drop_table('folders')
    op.drop_table('users')
