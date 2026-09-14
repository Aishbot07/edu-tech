from pydantic import BaseModel, EmailStr


# ============================================================
# ADMIN USER MANAGEMENT SCHEMAS
# ============================================================

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role_id: int

    institution_id: int | None = None
    faculty_id: int | None = None
    department_id: int | None = None

    is_active: bool = True


class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role_id: int | None = None

    institution_id: int | None = None
    faculty_id: int | None = None
    department_id: int | None = None

    is_active: bool | None = None