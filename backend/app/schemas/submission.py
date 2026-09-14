from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubmissionBase(BaseModel):
    title: str
    metric_code: Optional[str] = None
    status: str = "Draft"
    data_json: Optional[str] = None
    institution_id: int
    cycle_id: Optional[int] = None
    criterion_id: Optional[int] = None
    department_id: Optional[int] = None


class SubmissionCreate(BaseModel):
    title: str
    metric_code: Optional[str] = None
    data_json: Optional[str] = None
    criterion_id: Optional[int] = None
    department_id: Optional[int] = None
    cycle_id: Optional[int] = None


class SubmissionUpdate(BaseModel):
    title: Optional[str] = None
    metric_code: Optional[str] = None
    status: Optional[str] = None
    data_json: Optional[str] = None


class SubmissionResponse(SubmissionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
