from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey,
)

from app.db.database import Base


class RegistrationRequest(Base):
    __tablename__ = "registration_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # APPLICANT INFORMATION
    # ========================================================

    full_name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(150),
        nullable=False,
        index=True
    )

    institution = Column(
        String(250),
        nullable=False
    )

    # Institution ID
    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True,
        index=True
    )

    # Faculty ID
    faculty_id = Column(
        Integer,
        ForeignKey("faculties.id"),
        nullable=True,
        index=True
    )

    department = Column(
        String(150),
        nullable=False
    )

    # Department ID
    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
        index=True
    )

    designation = Column(
        String(150),
        nullable=False
    )

    # ========================================================
    # PASSWORD
    # ========================================================

    # Password is stored hashed, never plain text
    password_hash = Column(
        String(255),
        nullable=False
    )

    # ========================================================
    # REGISTRATION WORKFLOW
    # ========================================================

    status = Column(
        String(30),
        nullable=False,
        default="PENDING"
    )

    # Role will be assigned AFTER approval
    assigned_role_id = Column(
        Integer,
        nullable=True
    )

    # ========================================================
    # REVIEW INFORMATION
    # ========================================================

    # Admin/authorized person who processed the request
    reviewed_by = Column(
        Integer,
        nullable=True
    )

    reviewed_at = Column(
        DateTime,
        nullable=True
    )

    rejection_reason = Column(
        Text,
        nullable=True
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

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