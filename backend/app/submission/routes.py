from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.auth.dependencies import get_db, get_current_user, require_permission
from app.models import Submission, User, Institution
from app.schemas.submission import SubmissionCreate, SubmissionUpdate, SubmissionResponse

router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)


@router.get("", response_model=List[SubmissionResponse])
def get_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Submission)
    # Multi-tenant resource security
    if current_user.institution_id:
        query = query.filter(Submission.institution_id == current_user.institution_id)
    if current_user.department_id:
        query = query.filter(Submission.department_id == current_user.department_id)
    return query.all()


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    sub_data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inst_id = current_user.institution_id or 1
    sub = Submission(
        institution_id=inst_id,
        cycle_id=sub_data.cycle_id,
        criterion_id=sub_data.criterion_id,
        department_id=sub_data.department_id or current_user.department_id,
        user_id=current_user.id,
        title=sub_data.title,
        metric_code=sub_data.metric_code,
        status="Draft",
        data_json=sub_data.data_json
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/{sub_id}", response_model=SubmissionResponse)
def get_submission(
    sub_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Multi-tenant check
    if current_user.institution_id and sub.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another institution")

    return sub


@router.put("/{sub_id}", response_model=SubmissionResponse)
def update_submission(
    sub_id: int,
    sub_data: SubmissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.institution_id and sub.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another institution")

    update_dict = sub_data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(sub, key, val)

    db.commit()
    db.refresh(sub)
    return sub
