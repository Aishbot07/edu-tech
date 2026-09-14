from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.auth.dependencies import get_db, get_current_user
from app.models import Document, User
from app.schemas.document import DocumentCreate, DocumentResponse

router = APIRouter(
    prefix="/documents",
    tags=["Documents & Evidence"]
)


@router.get("", response_model=List[DocumentResponse])
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if current_user.institution_id:
        query = query.filter(Document.institution_id == current_user.institution_id)
    return query.all()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    doc_data: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inst_id = current_user.institution_id or 1
    doc = Document(
        institution_id=inst_id,
        submission_id=doc_data.submission_id,
        uploaded_by=current_user.id,
        title=doc_data.title,
        file_path=doc_data.file_path,
        file_type=doc_data.file_type,
        file_size=doc_data.file_size,
        status="Uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
