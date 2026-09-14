from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal

from app.models import (
    User,
    Role,
    Module,
    Permission,
    RoleModulePermission,
    RegistrationRequest,
    Institution,
    Faculty,
    Department,
)

from app.schemas.auth import LoginRequest

from app.schemas.registration import (
    RegistrationRequestCreate,
    RegistrationRequestResponse,
)

from app.auth.security import (
    verify_password,
    create_access_token,
    hash_password,
)

from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# PUBLIC REGISTRATION LOOKUP APIs
# These APIs are available before login.
# ============================================================

@router.get("/institutions")
def get_registration_institutions(
    db: Session = Depends(get_db)
):
    institutions = (
        db.query(Institution)
        .order_by(Institution.name)
        .all()
    )

    return [
        {
            "id": institution.id,
            "name": institution.name,
        }
        for institution in institutions
    ]


@router.get("/faculties")
def get_registration_faculties(
    institution_id: int,
    db: Session = Depends(get_db)
):
    faculties = (
        db.query(Faculty)
        .filter(
            Faculty.institution_id == institution_id
        )
        .order_by(Faculty.name)
        .all()
    )

    return [
        {
            "id": faculty.id,
            "name": faculty.name,
            "institution_id": faculty.institution_id,
        }
        for faculty in faculties
    ]


@router.get("/departments")
def get_registration_departments(
    institution_id: int,
    faculty_id: int,
    db: Session = Depends(get_db)
):
    departments = (
        db.query(Department)
        .filter(
            Department.institution_id == institution_id,
            Department.faculty_id == faculty_id,
        )
        .order_by(Department.name)
        .all()
    )

    return [
        {
            "id": department.id,
            "name": department.name,
            "institution_id": department.institution_id,
            "faculty_id": department.faculty_id,
        }
        for department in departments
    ]


# ============================================================
# REGISTRATION
# ============================================================

@router.post(
    "/register",
    response_model=RegistrationRequestResponse
)
def register(
    registration_data: RegistrationRequestCreate,
    db: Session = Depends(get_db)
):
    email = registration_data.email.strip().lower()

    full_name = registration_data.full_name.strip()
    designation = registration_data.designation.strip()

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    # --------------------------------------------------------
    # CHECK PENDING REQUEST
    # --------------------------------------------------------

    existing_request = (
        db.query(RegistrationRequest)
        .filter(
            RegistrationRequest.email == email,
            RegistrationRequest.status == "PENDING"
        )
        .first()
    )

    if existing_request:
        raise HTTPException(
            status_code=409,
            detail=(
                "A registration request for this email "
                "is already pending."
            )
        )

    # --------------------------------------------------------
    # VALIDATE INSTITUTION
    # --------------------------------------------------------

    if registration_data.institution_id is None:
        raise HTTPException(
            status_code=400,
            detail="Institution selection is required."
        )

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == registration_data.institution_id
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Selected institution not found."
        )

    # --------------------------------------------------------
    # VALIDATE FACULTY
    # --------------------------------------------------------

    if registration_data.faculty_id is None:
        raise HTTPException(
            status_code=400,
            detail="Faculty selection is required."
        )

    faculty = (
        db.query(Faculty)
        .filter(
            Faculty.id == registration_data.faculty_id
        )
        .first()
    )

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Selected faculty not found."
        )

    if faculty.institution_id != institution.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected faculty does not belong "
                "to the selected institution."
            )
        )

    # --------------------------------------------------------
    # VALIDATE DEPARTMENT
    # --------------------------------------------------------

    if registration_data.department_id is None:
        raise HTTPException(
            status_code=400,
            detail="Department selection is required."
        )

    department = (
        db.query(Department)
        .filter(
            Department.id == registration_data.department_id
        )
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Selected department not found."
        )

    if department.institution_id != institution.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected department does not belong "
                "to the selected institution."
            )
        )

    if department.faculty_id != faculty.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected department does not belong "
                "to the selected faculty."
            )
        )

    # --------------------------------------------------------
    # PASSWORD HASH
    # --------------------------------------------------------

    password_hash = hash_password(
        registration_data.password
    )

    # --------------------------------------------------------
    # CREATE REGISTRATION REQUEST
    # --------------------------------------------------------

    registration_request = RegistrationRequest(
        full_name=full_name,
        email=email,

        institution=institution.name,
        institution_id=institution.id,

        faculty_id=faculty.id,

        department=department.name,
        department_id=department.id,

        designation=designation,

        password_hash=password_hash,

        status="PENDING",

        assigned_role_id=None,
        reviewed_by=None,
        reviewed_at=None,
        rejection_reason=None,
    )

    db.add(registration_request)

    db.commit()

    db.refresh(registration_request)

    return {
        "message": (
            "Registration request submitted successfully. "
            "Your account is pending approval."
        ),
        "request_id": registration_request.id,
        "status": registration_request.status,
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.email == login_data.email.strip().lower()
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # GET ROLE
    # --------------------------------------------------------

    role = (
        db.query(Role)
        .filter(Role.id == user.role_id)
        .first()
    )

    actual_role_name = role.name if role else None

    # --------------------------------------------------------
    # VALIDATE SELECTED ROLE
    # --------------------------------------------------------

    if login_data.role:

        def normalize_role(role_name):
            if not role_name:
                return ""

            clean = role_name.strip().lower()

            clean = (
                clean
                .replace(".", "")
                .replace("/", "")
                .replace("_", "")
                .replace("-", "")
                .replace(" ", "")
            )

            if clean in [
                "departmentcoordinator",
                "deptcoordinator"
            ]:
                return "deptcoordinator"

            if clean in [
                "principaldirector",
                "principal"
            ]:
                return "principaldirector"

            if clean in [
                "naaccoordinator",
                "coordinator"
            ]:
                return "naaccoordinator"

            return clean

        if (
            normalize_role(login_data.role)
            != normalize_role(actual_role_name)
        ):
            raise HTTPException(
                status_code=401,
                detail=(
                    "Selected role does not match "
                    "your account role."
                )
            )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": actual_role_name,

        "institution_id": user.institution_id,
        "faculty_id": user.faculty_id,
        "department_id": user.department_id,
    })

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Login successful",

        "access_token": access_token,

        "token_type": "bearer",

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": actual_role_name,

            "institution_id": user.institution_id,
            "faculty_id": user.faculty_id,
            "department_id": user.department_id,
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = (
        db.query(Role)
        .filter(Role.id == current_user.role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=403,
            detail="User role not found"
        )

    # --------------------------------------------------------
    # GET ROLE PERMISSIONS
    # --------------------------------------------------------

    role_permissions = (
        db.query(
            Module,
            Permission,
            RoleModulePermission
        )
        .join(
            RoleModulePermission,
            RoleModulePermission.module_id == Module.id
        )
        .join(
            Permission,
            Permission.id == RoleModulePermission.permission_id
        )
        .filter(
            RoleModulePermission.role_id == role.id,
            RoleModulePermission.allowed == True
        )
        .all()
    )

    permissions_by_module = {}

    for module, permission, mapping in role_permissions:

        if module.code not in permissions_by_module:

            permissions_by_module[module.code] = {
                "module_id": module.id,
                "module_name": module.name,
                "module_code": module.code,
                "permissions": []
            }

        permissions_by_module[
            module.code
        ]["permissions"].append(
            permission.name
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,

            "institution_id": current_user.institution_id,
            "faculty_id": current_user.faculty_id,
            "department_id": current_user.department_id,

            "is_active": current_user.is_active
        },

        "role": {
            "id": role.id,
            "name": role.name,
            "description": role.description
        },

        "permissions": list(
            permissions_by_module.values()
        )
    }