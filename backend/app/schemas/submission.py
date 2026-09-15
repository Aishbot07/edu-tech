from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, Field


class SubmissionCreate(BaseModel):
    institution_id: Optional[int] = None
    cycle_id: Optional[int] = None
    criterion_id: Optional[int] = None
    department_id: Optional[int] = None

    title: str = Field(
        min_length=2,
        max_length=200
    )

    metric_code: Optional[str] = Field(
        default=None,
        max_length=50
    )

    data_json: Optional[Any] = None


class SubmissionUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    metric_code: Optional[str] = Field(
        default=None,
        max_length=50
    )

    criterion_id: Optional[int] = None
    department_id: Optional[int] = None
    data_json: Optional[Any] = None


class SubmissionResponse(BaseModel):
    id: int

    institution_id: int
    cycle_id: Optional[int] = None
    criterion_id: Optional[int] = None
    department_id: Optional[int] = None

    user_id: int

    title: str
    metric_code: Optional[str] = None
    status: str

    data_json: Optional[Any] = None

    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None

    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None

    final_approved_by: Optional[int] = None
    final_approved_at: Optional[datetime] = None

    change_request_reason: Optional[str] = None
    rejection_reason: Optional[str] = None

    final_submitted_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionReviewRequest(BaseModel):
    status: str = Field(
        pattern="^(Approved|Rejected|Changes Requested)$"
    )

    comments: Optional[str] = Field(
        default=None,
        max_length=2000
    )


class SubmissionApprovalRequest(BaseModel):
    comments: Optional[str] = Field(
        default=None,
        max_length=2000
    )


class SubmissionChangeRequest(BaseModel):
    reason: str = Field(
        min_length=3,
        max_length=2000
    )


class SubmissionRejectionRequest(BaseModel):
    reason: str = Field(
        min_length=3,
        max_length=2000
    )


class FinalApprovalRequest(BaseModel):
    comments: Optional[str] = Field(
        default=None,
        max_length=2000
    )


class WorkflowActionResponse(BaseModel):
    message: str
    submission: SubmissionResponse