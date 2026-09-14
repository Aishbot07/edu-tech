from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    submission_id = Column(
        Integer,
        ForeignKey("submissions.id"),
        nullable=False,
        index=True
    )

    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    status = Column(
        String(50),
        nullable=False
    )  # Approved, Rejected, Changes Requested

    comments = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
