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
                "instructions": ["استلقِ على البنش مع قبضة عرض الكتفين", "أنزل القضيب ببطء للصدر", "ادفع القضيب للأعلى حتى تمدد الذراعين"],
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
                "instructions": ["قف مع القدمين بعرض الكتفين", "انزل ببطء كأنك تجلس على كرسي", "حافظ على ظهرك مستقيماً"],
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
                "instructions": ["قف مع القدمين تحت البار", "انحنِ عند الوركين والركبتين", "ادفع الأرض بقدميك وافرد ظهرك"],
                "tips": ["حافظ على البار قريباً من جسمك", "لا تدير ظهرك أبداً"]
            },
            {
                "name": "السحب (Bench Pull)",
                "name_en": "Pull Up",
                "category": "strength",
                "primary_muscle": "الظهر",
                "secondary_muscles": ["ال bíceps", "السواعد"],
                "equipment": ["بار علوي"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["اعتنق ب Barclays بقبضة واسعة", "اسحب جسمك للأعلى حتى تصل ذقنك فوق البار", "أنزل ببطء"],
                "tips": ["لا تتأرجح", "ركز على شد لوحي الكتف"]
            },
            {
                "name": "ال蹲 الأمامي",
                "name_en": "Front Squat",
                "category": "strength",
                "primary_muscle": "الفخذ",
                "secondary_muscles": ["المؤخرة", "ال/core"],
                "equipment": ["بار", "راك"],
                "difficulty": DifficultyLevel.ADVANCED,
                "instructions": ["ضع البار على الكتفين الأماميين", "انزل ببطء مع الحفاظ على ظهر مستقيم", "ادفع للأعلى من الكعبيين"],
                "tips": ["حافظ على المرفقين عاليين", "النظر للأمام"]
            },
            {
                "name": "أوزان حرة",
                "name_en": "Dumbbell Press",
                "category": "strength",
                "primary_muscle": "الصدر",
                "secondary_muscles": ["الأكتاف", "الترايسبس"],
                "equipment": ["أوزان حرة", "بنش"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["استلقِ على البنش وامسك وزنتين", "ادفع الوزنتين للأعلى حتى تمدد الذراعين", "أنزل ببطء حتى تشعر بتمدد الصدر"],
                "tips": ["لا تضرب الوزنتين ببعض", "تحكم في النزول"]
            },
            {
                "name": "المؤخرة على السكوات",
                "name_en": "Hip Thrust",
                "category": "strength",
                "primary_muscle": "المؤخرة",
                "secondary_muscles": ["الفخذ الخلفي"],
                "equipment": ["بنش", "بار"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["استلقِ على ظهرك مع الاعتماد على البنش", "اضغط الكعبين وارفع الحوض للأعلى", "اضغط المؤخرة في الأعلى"],
                "tips": ["لا تفرط في انحناء الظهر", "ثبّت في الأعلى ثانيتين"]
            },
            {
                "name": "الشد الأمامي",
                "name_en": "Overhead Press",
                "category": "strength",
                "primary_muscle": "الأكتاف",
                "secondary_muscles": ["الترايسبس", "الرقبة"],
                "equipment": ["بار"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["قف مستقيماً مع البار عند مستوى الكتفين", "ادفع البار للأعلى حتى تمدد الذراعين", "أنزل ببطء"],
                "tips": ["لا تarch ظهرك", "شد البطن طوال التمرين"]
            },
            {
                "name": "الرومانية",
                "name_en": "Romanian Deadlift",
                "category": "strength",
                "primary_muscle": "الفخذ الخلفي",
                "secondary_muscles": ["المؤخرة", "الظهر السفلي"],
                "equipment": ["بار"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["قف مع البار أمام فخذيك", "انحنِ عند الوركين مع إبقاء الركبتين ثابتتين", "انزل البار حتى تشعر بتمدد الفخذ الخلفي"],
                "tips": ["حافظ على الظهر مستقيماً", "لا تنزل أكثر من مستوى الساقين"]
            },
            {
                "name": "المجداف",
                "name_en": "Barbell Row",
                "category": "strength",
                "primary_muscle": "الظهر",
                "secondary_muscles": ["ال bíceps", "السواعد"],
                "equipment": ["بار"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["انحنِ للأمام مع قبضة واسعة على البار", "اسحب البار نحو بطنك", "اضغط لوحي الكتف في الأعلى"],
                "tips": ["لا ترتفع بالجذع", "تحكم في النزول"]
            },
            {
                "name": "البلايع",
                "name_en": "Lunges",
                "category": "strength",
                "primary_muscle": "الفخذ",
                "secondary_muscles": ["المؤخرة", "الcore"],
                "equipment": ["أوزان حرة"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["قف مستقيماً وخذ خطوة للأمام", "انزل حتى ركبتك الأمامية تلمس الأرض", "ادفع الأرض بقدمك الأمامية للعودة"],
                "tips": ["حافظ على ظهرك مستقيماً", "لا تتجاوز ركبتك أصابع قدمك"]
            },
            {
                "name": "الـ Dip",
                "name_en": "Dips",
                "category": "strength",
                "primary_muscle": "الترايسبس",
                "secondary_muscles": ["الصدر", "الأكتاف الأمامية"],
                "equipment": ["-bars parallel"],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["امسك الـ bars وارفع جسمك", "أنزل ببطء حتى تصل زاوية 90 درجة", "ادفع للأعلى"],
                "tips": ["لا تنزل أكثر من 90 درجة", "حافظ على الجسم عمودياً"]
            },
            {
                "name": "البطن",
                "name_en": "Plank",
                "category": "strength",
                "primary_muscle": "الcore",
                "secondary_muscles": ["الظهر", "الأكتاف"],
                "equipment": [],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["استلقِ على بطنك وارفع جسمك على الساعدین", "حافظ على الجسم مستقيماً من الرأس إلى الكعبين", "شد البطن طوال الوقت"],
                "tips": ["لا ترفع المؤخرة", "تنفس بشكل طبيعي"]
            },
            {
                "name": "الجري",
                "name_en": "Running",
                "category": "cardio",
                "primary_muscle": "القلب",
                "secondary_muscles": ["الفخذ", "الساقين"],
                "equipment": ["جهاز جري"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["ابدأ بالإحماء 5 دقائق", "زد السرعة تدريجياً", "انتهِ بتهدئة 5 دقائق"],
                "tips": ["ابدأ بمشي سريع ثم جري خفيف", "راقب نبض القلب"]
            },
            {
                "name": "الHIIT",
                "name_en": "High Intensity Interval Training",
                "category": "cardio",
                "primary_muscle": "القلب",
                "secondary_muscles": ["الجسم بالكامل"],
                "equipment": [],
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "instructions": ["30 ثانية جهد عالي", "60 ثانية راحة", "كرر 8-10 مرات"],
                "tips": ["ابدأ بـ 6 مرات وزد تدريجياً", "اختر تمرين مكثف"]
            },
            {
                "name": "المشي السريع",
                "name_en": "Brisk Walking",
                "category": "cardio",
                "primary_muscle": "القلب",
                "secondary_muscles": ["الساقين", "المؤخرة"],
                "equipment": [],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["مشي بسرعة 6-7 كم/ساعة", "30-45 دقيقة", "3-5 مرات أسبوعياً"],
                "tips": ["حرك ذراعيك", "حافظ على وقف مستقيم"]
            },
            {
                "name": "الإطالة",
                "name_en": "Stretching",
                "category": "flexibility",
                "primary_muscle": "الجسم بالكامل",
                "secondary_muscles": [],
                "equipment": [],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["احتفظ بكل وضعية 20-30 ثانية", "لا تتأرجح", "تنفس بعمق"],
                "tips": ["لا تؤلم", "افعلها بعد التمرين"]
            },
            {
                "name": "اليوغا",
                "name_en": "Yoga",
                "category": "flexibility",
                "primary_muscle": "الجسم بالكامل",
                "secondary_muscles": ["الcore", "الفخذ"],
                "equipment": ["سجادة"],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["ابدأ بوضعية الت salute", "انتقل بسلاسة بين الوضعيات", "ركز على التنفس"],
                "tips": ["لا تقارن نفسك بالآخرين", "استمر يومياً"]
            },
            {
                "name": "الإحماء الديناميكي",
                "name_en": "Dynamic Warm-up",
                "category": "flexibility",
                "primary_muscle": "الجسم بالكامل",
                "secondary_muscles": [],
                "equipment": [],
                "difficulty": DifficultyLevel.BEGINNER,
                "instructions": ["5 دقائق جري خفيف", "تمديدات ديناميكية", "حركات مفصلية"],
                "tips": ["احرك كل المفاصل", "زد الوتيرة تدريجياً"]
            },
            {
                "name": "القفز المتعدد",
                "name_en": "Plyometrics",
                "category": "strength",
                "primary_muscle": "الفخذ",
                "secondary_muscles": ["المؤخرة", "الساقين"],
                "equipment": [],
                "difficulty": DifficultyLevel.ADVANCED,
                "instructions": ["قفز عالي مع رفع الركبتين", "قفز صندوق", "قفز متر"],
                "tips": ["ابدأ بارتفاع منخفض", "هبط بنعومة"]
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
