"""
CoachMind Pro - Folder Endpoints
File system-like folder management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.schemas import FolderCreate, FolderUpdate, FolderResponse
from app.models.models import Folder, File
from app.api.v1.endpoints.auth import get_current_active_user, User

router = APIRouter()

@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List folders (optionally filtered by parent) with pagination"""
    query = db.query(Folder).filter(Folder.owner_id == current_user.id)
    if parent_id:
        query = query.filter(Folder.parent_id == parent_id)
    else:
        query = query.filter(Folder.parent_id.is_(None))

    folders = query.order_by(Folder.sort_order).offset(skip).limit(limit).all()

    result = []
    for f in folders:
        result.append({
            "id": f.id,
            "name": f.name,
            "description": f.description,
            "icon": f.icon,
            "color": f.color,
            "parent_id": f.parent_id,
            "file_count": db.query(File).filter(File.folder_id == f.id).count(),
            "total_size": f.total_size or 0,
            "is_system": f.is_system or False,
            "created_at": f.created_at,
            "updated_at": f.updated_at,
            "children": []
        })
    return result

@router.post("/", response_model=FolderResponse, status_code=201)
async def create_folder(
    folder: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new folder"""
    db_folder = Folder(
        **folder.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get folder with contents"""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="المجلد غير موجود")

    # Update file count
    folder.file_count = db.query(File).filter(File.folder_id == folder_id).count()

    return folder

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update folder"""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="المجلد غير موجود")

    for field, value in folder_update.model_dump(exclude_unset=True).items():
        setattr(folder, field, value)

    db.commit()
    db.refresh(folder)
    return folder

@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete folder and all contents"""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="المجلد غير موجود")

    # Delete all files in folder
    db.query(File).filter(File.folder_id == folder_id).delete()
    db.delete(folder)
    db.commit()

    return {"message": "تم حذف المجلد بنجاح"}
