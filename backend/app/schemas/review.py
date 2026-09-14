from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    submission_id: int
    status: str  # Approved, Rejected, Changes Requested
    comments: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_id: int
    status: str
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
