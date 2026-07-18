"""
CoachMind Pro - File Endpoints
File management with AI analysis
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import FileCreate, FileUpdate, FileResponse, FileType
from app.models.models import File, Folder
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/", response_model=List[FileResponse])
async def list_files(
    folder_id: Optional[int] = None,
    file_type: Optional[FileType] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List files with filters"""
    query = db.query(File)

    if folder_id:
        query = query.filter(File.folder_id == folder_id)
    if file_type:
        query = query.filter(File.file_type == file_type)
    if difficulty:
        query = query.filter(File.difficulty == difficulty)
    if search:
        query = query.filter(File.name.contains(search))

    files = query.order_by(File.created_at.desc()).all()
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
    """Upload file to server"""
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
    else:
        file_type = FileType.PDF

    # Save file (simplified - in production use cloud storage)
    file_path = f"uploads/{current_user.id}/{file.filename}"

    db_file = File(
        name=file.filename,
        file_type=file_type,
        mime_type=content_type,
        file_path=file_path,
        file_size=0,  # Would get actual size
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

    db.delete(file)
    db.commit()

    return {"message": "تم حذف الملف بنجاح"}
