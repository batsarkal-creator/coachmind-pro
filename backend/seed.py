"""
CoachMind Pro - Database Seeding Script
Populates database with initial data
"""
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.models import (
    User, Folder, File, Exercise,
    UserRole, DifficultyLevel, FileType
)
from app.api.v1.endpoints.auth import get_password_hash

def seed_database():
    db = SessionLocal()

    try:
        # Create admin user
        admin = User(
            email="admin@coachmind.pro",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="مدير النظام",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

        # Create demo user
        demo = User(
            email="demo@coachmind.pro",
            username="demo",
            hashed_password=get_password_hash("demo123"),
            full_name="متدرب تجريبي",
            role=UserRole.ATHLETE,
            age=28,
            weight=75.5,
            height=178,
            fitness_goal="muscle_gain",
            experience_level=DifficultyLevel.INTERMEDIATE,
            is_active=True
        )
        db.add(demo)
        db.flush()

        # Create system folders
        folders_data = [
            {"name": "القوة البدنية", "icon": "💪", "color": "#ef4444", "is_system": True, "sort_order": 1},
            {"name": "اللياقة القلبية", "icon": "🏃", "color": "#3b82f6", "is_system": True, "sort_order": 2},
            {"name": "المرونة والتمدد", "icon": "🧘", "color": "#8b5cf6", "is_system": True, "sort_order": 3},
            {"name": "التغذية الرياضية", "icon": "🥗", "color": "#f59e0b", "is_system": True, "sort_order": 4},
            {"name": "التعافي والاستشفاء", "icon": "🛌", "color": "#10b981", "is_system": True, "sort_order": 5},
            {"name": "خطط التدريب الجاهزة", "icon": "📋", "color": "#ec4899", "is_system": True, "sort_order": 6},
        ]

        for fd in folders_data:
            folder = Folder(
                **fd,
                owner_id=demo.id,
                description=f"مجلد {fd['name']}"
            )
            db.add(folder)

        db.flush()

        # Create exercises
        exercises_data = [
            {
                "name": "الضغط",
                "name_en": "Bench Press",
                "category": "strength",
                "primary_muscle": "الصدر",
                "secondary_muscles": ["الترايسبس", "الأكتاف"],
                "equipment": ["بار", "بنش"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": [
                    "استلقِ على البنش مع قبضة عرض الكتفين",
                    "أنزل القضيب ببطء للصدر",
                    "ادفع القضيب للأعلى حتى تمدد الذراعين"
                ],
                "tips": ["حافظ على قوس طبيعي في الظهر", "لا ترتخِ الأكتاف"]
            },
            {
                "name": "السكوات",
                "name_en": "Squat",
                "category": "strength",
                "primary_muscle": "الفخذ",
                "secondary_muscles": ["المؤخرة", "الظهر السفلي"],
                "equipment": ["بار", "راك"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": [
                    "قف مع القدمين بعرض الكتفين",
                    "انزل ببطء كأنك تجلس على كرسي",
                    "حافظ على ظهرك مستقيماً"
                ],
                "tips": ["ركبتك لا تتجاوز أصابع قدمك", "حافظ على ثبات الكعبين"]
            },
            {
                "name": "الديدليفت",
                "name_en": "Deadlift",
                "category": "strength",
                "primary_muscle": "الظهر",
                "secondary_muscles": ["الفخذ", "المؤخرة", "السواعد"],
                "equipment": ["بار", "أوزان"],
                "difficulty": DifficultyLevel.ADVANCED,
                "instructions": [
                    "قف مع القدمين تحت البار",
                    "انحنِ عند الوركين والركبتين",
                    "ادفع الأرض بقدميك وافرد ظهرك"
                ],
                "tips": ["حافظ على البار قريباً من جسمك", "لا تدير ظهرك أبداً"]
            }
        ]

        for ed in exercises_data:
            exercise = Exercise(**ed)
            db.add(exercise)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - Users: {db.query(User).count()}")
        print(f"   - Folders: {db.query(Folder).count()}")
        print(f"   - Exercises: {db.query(Exercise).count()}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
