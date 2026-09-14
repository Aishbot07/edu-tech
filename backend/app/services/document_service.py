from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Document, User, Submission


def create_document_record(
    db: Session,
    user: User,
    title: str,
    file_path: str,
    file_type: str = None,
    file_size: int = None,
    submission_id: int = None
) -> Document:
    inst_id = user.institution_id or 1

    if submission_id:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if sub and user.institution_id and sub.institution_id != user.institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot attach document to another institution's submission"
            )

    doc = Document(
        institution_id=inst_id,
        submission_id=submission_id,
        uploaded_by=user.id,
        title=title,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        status="Uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
