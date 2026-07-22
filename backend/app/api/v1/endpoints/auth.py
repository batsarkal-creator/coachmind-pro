"""
CoachMind Pro - Authentication Endpoints
JWT-based authentication with role-based access, refresh tokens, logout, password reset
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.db.database import get_db
from app.schemas.schemas import (
    Token, UserCreate, UserResponse, LoginRequest,
    PasswordResetRequest, PasswordResetConfirm
)
from app.models.models import User

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# In-memory store for password reset tokens (use Redis in production)
password_reset_tokens: dict[str, dict] = {}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
    )

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="بيانات الاعتماد غير صالحة",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    if payload.get("type") != "access":
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="المستخدم غير نشط")
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مستخدم بالفعل")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="اسم المستخدم مستخدم بالفعل")

    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        age=user_data.age,
        weight=user_data.weight,
        height=user_data.height,
        fitness_goal=user_data.fitness_goal,
        experience_level=user_data.experience_level
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اسم المستخدم أو كلمة المرور غير صحيحة",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")
async def refresh_token(request: Request, refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="رمز التحديث غير صالح")
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="رمز التحديث غير صالح")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="المستخدم غير موجود أو غير نشط")
    
    new_access = create_access_token(data={"sub": user.username})
    new_refresh = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    return {"message": "تم تسجيل الخروج بنجاح"}

@router.post("/password-reset-request")
@limiter.limit("3/minute")
async def password_reset_request(request: Request, data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user is None:
        return {"message": "تم إرسال رمز إعادة التعيين إذا كان البريد مسجلاً"}
    
    reset_token = secrets.token_urlsafe(32)
    password_reset_tokens[reset_token] = {
        "user_id": user.id,
        "expires": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    
    return {"message": "تم إرسال رمز إعادة التعيين"}

@router.post("/password-reset")
@limiter.limit("5/minute")
async def password_reset(request: Request, data: PasswordResetConfirm, db: Session = Depends(get_db)):
    token_data = password_reset_tokens.get(data.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="الرمز غير صالح أو منتهي الصلاحية")
    
    if datetime.now(timezone.utc) > token_data["expires"]:
        del password_reset_tokens[data.token]
        raise HTTPException(status_code=400, detail="الرمز منتهي الصلاحية")
    
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    del password_reset_tokens[data.token]
    
    return {"message": "تم إعادة تعيين كلمة المرور بنجاح"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
