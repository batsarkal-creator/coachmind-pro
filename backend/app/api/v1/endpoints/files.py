"""
CoachMind Pro - File Endpoints
File management with AI analysis
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import FileCreate, FileUpdate, FileResponse, FileType
from app.models.models import File, Folder
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

# Allowed file types and max size (100MB)
ALLOWED_TYPES = {
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf",
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "audio/mpeg", "audio/wav", "audio/mp3"
}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

@router.get("/", response_model=List[FileResponse])
async def list_files(
    folder_id: Optional[int] = None,
    file_type: Optional[FileType] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List files with filters and pagination"""
    query = db.query(File)

    if folder_id:
        query = query.filter(File.folder_id == folder_id)
    if file_type:
        query = query.filter(File.file_type == file_type)
    if difficulty:
        query = query.filter(File.difficulty == difficulty)
    if search:
        query = query.filter(File.name.contains(search))

    files = query.order_by(File.created_at.desc()).offset(skip).limit(limit).all()
    return files

@router.post("/", response_model=FileResponse, status_code=201)
async def create_file(
    file_data: FileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create file record (metadata)"""
    # Verify folder exists
    folder = db.query(Folder).filter(Folder.id == file_data.folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="المجلد غير موجود")

    db_file = File(
        **file_data.model_dump(),
        uploaded_by=current_user.id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Update folder stats
    folder.file_count = db.query(File).filter(File.folder_id == folder.id).count()
    db.commit()

    return db_file

@router.post("/upload")
async def upload_file(
    folder_id: int,
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload file to server with validation"""
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"نوع الملف غير مدعوم. الأنواع المسموحة: فيديو، PDF، صور، جداول بيانات، صوت"
        )

    # Validate file size (read first chunk to check)
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"حجم الملف يتجاوز الحد المسموح (100 ميجابايت)"
        )
    
    # Reset file pointer
    await file.seek(0)

    # Determine file type
    content_type = file.content_type
    if "video" in content_type:
        file_type = FileType.VIDEO
    elif "pdf" in content_type:
        file_type = FileType.PDF
    elif "image" in content_type:
        file_type = FileType.IMAGE
    elif "spreadsheet" in content_type or "excel" in content_type:
        file_type = FileType.SPREADSHEET
    elif "audio" in content_type:
        file_type = FileType.AUDIO
    else:
        file_type = FileType.PDF

    # Save file (simplified - in production use cloud storage)
    file_path = f"uploads/{current_user.id}/{file.filename}"

    db_file = File(
        name=file.filename,
        file_type=file_type,
        mime_type=content_type,
        file_path=file_path,
        file_size=len(content),
        folder_id=folder_id,
        uploaded_by=current_user.id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {"message": "تم رفع الملف بنجاح", "file_id": db_file.id}

@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get file details"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    # Check ownership or admin
    if file.uploaded_by != current_user.id and current_user.role.value not in ("admin", "coach"):
        raise HTTPException(status_code=403, detail="لا تملك صلاحية عرض هذا الملف")

    # Increment view count
    file.view_count += 1
    db.commit()

    return file

@router.put("/{file_id}", response_model=FileResponse)
async def update_file(
    file_id: int,
    file_update: FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update file metadata"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    # Check ownership or admin
    if file.uploaded_by != current_user.id and current_user.role.value not in ("admin", "coach"):
        raise HTTPException(status_code=403, detail="لا تملك صلاحية تعديل هذا الملف")

    for field, value in file_update.model_dump(exclude_unset=True).items():
        setattr(file, field, value)

    db.commit()
    db.refresh(file)
    return file

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete file"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    # Check ownership or admin
    if file.uploaded_by != current_user.id and current_user.role.value not in ("admin", "coach"):
        raise HTTPException(status_code=403, detail="لا تملك صلاحية حذف هذا الملف")

    db.delete(file)
    db.commit()

    return {"message": "تم حذف الملف بنجاح"}
