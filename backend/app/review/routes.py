from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.auth.dependencies import get_db, get_current_user, require_permission
from app.models import Review, Submission, User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.submission import SubmissionResponse

router = APIRouter(
    prefix="",
    tags=["Review & Approval"]
)


@router.get("/reviews", response_model=List[ReviewResponse])
def get_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if current_user.institution_id:
        query = query.join(Submission, Review.submission_id == Submission.id).filter(
            Submission.institution_id == current_user.institution_id
        )
    return query.all()


@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    rev_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == rev_data.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.institution_id and sub.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another institution")

    review = Review(
        submission_id=rev_data.submission_id,
        reviewer_id=current_user.id,
        status=rev_data.status,
        comments=rev_data.comments
    )
    # Update submission status
    sub.status = rev_data.status
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/approver/dashboard")
def approver_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inst_id = current_user.institution_id
    query = db.query(Submission)
    if inst_id:
        query = query.filter(Submission.institution_id == inst_id)

    total_pending = query.filter(Submission.status.in_(["Submitted", "Under Review"])).count()
    total_approved = query.filter(Submission.status == "Approved").count()
    total_rejected = query.filter(Submission.status == "Rejected").count()

    return {
        "message": "Data Approver Dashboard",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": "Data Approver"
        },
        "statistics": {
            "pending_approvals": total_pending,
            "approved": total_approved,
            "rejected": total_rejected
        }
    }


@router.post("/approver/submissions/{sub_id}/approve", response_model=SubmissionResponse)
def approve_submission(
    sub_id: int,
    current_user: User = Depends(require_permission("FORMS_DATA", "Approve")),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.institution_id and sub.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another institution")

    if sub.status in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve submission that is already in state '{sub.status}'"
        )
    if sub.status == "Draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot approve a Draft submission directly"
        )

    sub.status = "Approved"

    # Audit logging
    audit_review = Review(
        submission_id=sub.id,
        reviewer_id=current_user.id,
        status="Approved",
        comments="Approved by Data Approver"
    )
    db.add(audit_review)

    db.commit()
    db.refresh(sub)
    return sub


@router.post("/approver/submissions/{sub_id}/reject", response_model=SubmissionResponse)
def reject_submission(
    sub_id: int,
    current_user: User = Depends(require_permission("FORMS_DATA", "Approve")),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.institution_id and sub.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Forbidden: Resource belongs to another institution")

    if sub.status in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject submission that is already in state '{sub.status}'"
        )
    if sub.status == "Draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject a Draft submission directly"
        )

    sub.status = "Rejected"

    # Audit logging
    audit_review = Review(
        submission_id=sub.id,
        reviewer_id=current_user.id,
        status="Rejected",
        comments="Rejected by Data Approver"
    )
    db.add(audit_review)

    db.commit()
    db.refresh(sub)
    return sub
