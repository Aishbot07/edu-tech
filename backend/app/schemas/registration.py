from pydantic import BaseModel, EmailStr, Field


# ============================================================
# REGISTRATION
# ============================================================

class RegistrationRequestCreate(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    # Display names - kept for compatibility
    institution: str = Field(
        min_length=2,
        max_length=250
    )

    department: str = Field(
        min_length=2,
        max_length=150
    )

    designation: str = Field(
        min_length=2,
        max_length=150
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )

    # ========================================================
    # HIERARCHY IDs
    # ========================================================

    institution_id: int | None = None

    faculty_id: int | None = None

    department_id: int | None = None


class RegistrationRequestResponse(BaseModel):
    message: str
    request_id: int
    status: str