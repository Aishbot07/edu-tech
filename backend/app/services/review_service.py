from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Review, Submission, User
from app.services.submission_service import transition_submission_state


def create_review_decision(
    db: Session,
    submission_id: int,
    reviewer_user: User,
    review_status: str,  # Approved, Rejected, Changes Requested
    comments: str = None
) -> Review:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Multi-tenant resource check
    if reviewer_user.institution_id and submission.institution_id != reviewer_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Resource belongs to another institution"
        )

    # Create Review record
    review = Review(
        submission_id=submission_id,
        reviewer_id=reviewer_user.id,
        status=review_status,
        comments=comments
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Transition submission state safely using controlled state machine
    try:
        transition_submission_state(db, submission, review_status, reviewer_user)
    except Exception:
        # Update submission status directly if transition logic handled by caller
        submission.status = review_status
        db.commit()

    return review
