# 🧠 CoachMind Pro - عقل المدرب الذكي

منصة تدريب رياضي متكاملة مدعومة بالذكاء الاصطناعي تحاكي عقل المدرب الحقيقي.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CoachMind Pro                         │
├─────────────────────┬───────────────────────────────────────┤
│   🎨 Frontend       │   ⚙️ Backend (FastAPI)                │
│   HTML/CSS/JS       │   ├─ API Routes (REST)               │
│   Vanilla JS        │   ├─ AI Coach Engine                 │
│   Responsive        │   ├─ Auth (JWT)                      │
│                     │   └─ File Management                 │
├─────────────────────┴───────────────────────────────────────┤
│   🗄️ Database (SQLite/PostgreSQL)                          │
│   ├─ Users                                          │
│   ├─ Folders                                        │
│   ├─ Files                                          │
│   ├─ Workouts                                       │
│   ├─ AI Insights                                    │
│   ├─ Exercises                                      │
│   └─ Training Plans                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
# Open index.html in browser or use Live Server
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login & get JWT |
| GET | `/api/v1/auth/me` | Get current user |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/folders/` | List folders |
| POST | `/api/v1/folders/` | Create folder |
| GET | `/api/v1/folders/{id}` | Get folder |
| PUT | `/api/v1/folders/{id}` | Update folder |
| DELETE | `/api/v1/folders/{id}` | Delete folder |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/files/` | List files |
| POST | `/api/v1/files/` | Create file record |
| POST | `/api/v1/files/upload` | Upload file |
| GET | `/api/v1/files/{id}` | Get file |
| PUT | `/api/v1/files/{id}` | Update file |
| DELETE | `/api/v1/files/{id}` | Delete file |

### AI Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/analyze-workout` | Analyze workout |
| POST | `/api/v1/ai/analyze-recovery` | Analyze recovery |
| POST | `/api/v1/ai/generate-plan` | Generate training plan |
| GET | `/api/v1/ai/insights` | Get AI insights |

## 🤖 AI Coach Features

- **Performance Analysis**: Volume, intensity, heart rate analysis
- **Recovery Monitoring**: HRV, sleep, training load tracking
- **Training Plan Generation**: Custom plans based on goals
- **Progress Prediction**: Future performance forecasting
- **Smart Insights**: Real-time recommendations

## 📁 Project Structure

```
coachmind-pro/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Config
│   │   ├── models/   # DB models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── db/       # Database
│   ├── main.py       # Entry point
│   └── requirements.txt
├── frontend/         # HTML/CSS/JS
│   ├── index.html
│   └── src/
│       ├── css/      # Stylesheets
│       ├── js/       # JavaScript modules
│       └── assets/   # Images, videos
├── database/         # Migrations & seeds
├── docker/           # Docker configs
└── docs/             # Documentation
```

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
- **Frontend**: Vanilla JS, CSS3, HTML5
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Auth**: JWT with bcrypt
- **AI**: Custom analysis engine (expandable to ML models)
- **Deployment**: Docker, Docker Compose

## 📝 License

MIT License - Open Source
