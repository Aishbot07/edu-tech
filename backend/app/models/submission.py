from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False,
        index=True
    )

    cycle_id = Column(
        Integer,
        ForeignKey("accreditation_cycles.id"),
        nullable=True,
        index=True
    )

    criterion_id = Column(
        Integer,
        ForeignKey("criteria.id"),
        nullable=True,
        index=True
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(String(200), nullable=False)
    metric_code = Column(String(50), nullable=True)
    status = Column(
        String(50),
        nullable=False,
        default="Draft"
    )  # Draft, Submitted, Under Review, Approved, Rejected, Changes Requested

    data_json = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
