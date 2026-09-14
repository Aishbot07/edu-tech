from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, require_permission
from app.auth.security import hash_password

from app.models import (
    User,
    Role,
    Module,
    Permission,
    Institution,
    Faculty,
    Department,
    AccreditationCycle,
    RegistrationRequest,
)

from app.schemas.admin import (
    AdminUserCreate,
    AdminUserUpdate,
)

from app.schemas.registration_admin import (
    RegistrationApprovalRequest,
    RegistrationRejectionRequest,
)


# ============================================================
# ADMIN ROUTER
# ============================================================

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()

    active_users = db.query(User).filter(
        User.is_active == True
    ).count()

    total_roles = db.query(Role).count()
    total_modules = db.query(Module).count()
    total_permissions = db.query(Permission).count()
    total_institutions = db.query(Institution).count()
    total_cycles = db.query(AccreditationCycle).count()

    return {
        "message": "Admin dashboard data",

        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
        },

        "statistics": {
            "total_users": total_users,
            "active_users": active_users,
            "total_roles": total_roles,
            "total_modules": total_modules,
            "total_permissions": total_permissions,
            "total_institutions": total_institutions,
            "total_accreditation_cycles": total_cycles,
        }
    }


# ============================================================
# GET ALL USERS
# ============================================================

@router.get("/users")
def get_users(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    result = []

    for user in users:

        role = db.query(Role).filter(
            Role.id == user.role_id
        ).first()

        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role_id": user.role_id,
            "role": role.name if role else None,

            "institution_id": user.institution_id,
            "faculty_id": user.faculty_id,
            "department_id": user.department_id,

            "is_active": user.is_active,
        })

    return result


# ============================================================
# CREATE USER
# ============================================================

@router.post(
    "/users",
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: AdminUserCreate,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "Create")
    ),
    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # Check duplicate email
    # --------------------------------------------------------

    email = user_data.email.strip().lower()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    # --------------------------------------------------------
    # Check role
    # --------------------------------------------------------

    role = db.query(Role).filter(
        Role.id == user_data.role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    # ========================================================
    # INSTITUTION VALIDATION
    # ========================================================

    if user_data.institution_id is not None:

        institution = db.query(Institution).filter(
            Institution.id == user_data.institution_id
        ).first()

        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )

    # ========================================================
    # FACULTY VALIDATION
    # ========================================================

    if user_data.faculty_id is not None:

        faculty = db.query(Faculty).filter(
            Faculty.id == user_data.faculty_id
        ).first()

        if not faculty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Faculty not found"
            )

        if (
            user_data.institution_id is not None
            and faculty.institution_id != user_data.institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected faculty does not belong "
                    "to the selected institution"
                )
            )

    # ========================================================
    # DEPARTMENT VALIDATION
    # ========================================================

    if user_data.department_id is not None:

        department = db.query(Department).filter(
            Department.id == user_data.department_id
        ).first()

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        if (
            user_data.institution_id is not None
            and department.institution_id != user_data.institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected institution"
                )
            )

        if (
            user_data.faculty_id is not None
            and department.faculty_id != user_data.faculty_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected faculty"
                )
            )

    # ========================================================
    # CREATE USER
    # ========================================================

    new_user = User(
        name=user_data.name.strip(),
        email=email,
        password_hash=hash_password(user_data.password),
        role_id=user_data.role_id,

        institution_id=user_data.institution_id,
        faculty_id=user_data.faculty_id,
        department_id=user_data.department_id,

        is_active=user_data.is_active,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",

        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role_id": new_user.role_id,
            "role": role.name,

            "institution_id": new_user.institution_id,
            "faculty_id": new_user.faculty_id,
            "department_id": new_user.department_id,

            "is_active": new_user.is_active,
        }
    }


# ============================================================
# GET USER BY ID
# ============================================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    role = db.query(Role).filter(
        Role.id == user.role_id
    ).first()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role_id": user.role_id,
        "role": role.name if role else None,

        "institution_id": user.institution_id,
        "faculty_id": user.faculty_id,
        "department_id": user.department_id,

        "is_active": user.is_active,
    }


# ============================================================
# UPDATE USER
# ============================================================

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "Edit")
    ),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # --------------------------------------------------------
    # Email
    # --------------------------------------------------------

    if user_data.email is not None:

        email = user_data.email.strip().lower()

        existing_user = db.query(User).filter(
            User.email == email,
            User.id != user_id
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        user.email = email

    # --------------------------------------------------------
    # Name
    # --------------------------------------------------------

    if user_data.name is not None:
        user.name = user_data.name.strip()

    # --------------------------------------------------------
    # Password
    # --------------------------------------------------------

    if user_data.password is not None:
        user.password_hash = hash_password(
            user_data.password
        )

    # --------------------------------------------------------
    # Role
    # --------------------------------------------------------

    if user_data.role_id is not None:

        role = db.query(Role).filter(
            Role.id == user_data.role_id
        ).first()

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )

        user.role_id = user_data.role_id

    # ========================================================
    # INSTITUTION / FACULTY / DEPARTMENT
    # ========================================================

    institution_id = (
        user_data.institution_id
        if user_data.institution_id is not None
        else user.institution_id
    )

    faculty_id = (
        user_data.faculty_id
        if user_data.faculty_id is not None
        else user.faculty_id
    )

    department_id = (
        user_data.department_id
        if user_data.department_id is not None
        else user.department_id
    )

    # --------------------------------------------------------
    # Institution
    # --------------------------------------------------------

    if user_data.institution_id is not None:

        institution = db.query(Institution).filter(
            Institution.id == institution_id
        ).first()

        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )

    # --------------------------------------------------------
    # Faculty
    # --------------------------------------------------------

    if faculty_id is not None:

        faculty = db.query(Faculty).filter(
            Faculty.id == faculty_id
        ).first()

        if not faculty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Faculty not found"
            )

        if (
            institution_id is not None
            and faculty.institution_id != institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected faculty does not belong "
                    "to the selected institution"
                )
            )

    # --------------------------------------------------------
    # Department
    # --------------------------------------------------------

    if department_id is not None:

        department = db.query(Department).filter(
            Department.id == department_id
        ).first()

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        if (
            institution_id is not None
            and department.institution_id != institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected institution"
                )
            )

        if (
            faculty_id is not None
            and department.faculty_id != faculty_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected faculty"
                )
            )

    # --------------------------------------------------------
    # Save hierarchy
    # --------------------------------------------------------

    if user_data.institution_id is not None:
        user.institution_id = institution_id

    if user_data.faculty_id is not None:
        user.faculty_id = faculty_id

    if user_data.department_id is not None:
        user.department_id = department_id

    # --------------------------------------------------------
    # Active status
    # --------------------------------------------------------

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    role = db.query(Role).filter(
        Role.id == user.role_id
    ).first()

    return {
        "message": "User updated successfully",

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role_id": user.role_id,
            "role": role.name if role else None,

            "institution_id": user.institution_id,
            "faculty_id": user.faculty_id,
            "department_id": user.department_id,

            "is_active": user.is_active,
        }
    }


# ============================================================
# DELETE USER
# ============================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "Delete")
    ),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }


# ============================================================
# ROLES
# ============================================================

@router.get("/roles")
def get_roles(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    roles = db.query(Role).all()

    return [
        {
            "id": role.id,
            "name": role.name,
            "description": role.description,
        }
        for role in roles
    ]


# ============================================================
# PERMISSIONS
# ============================================================

@router.get("/permissions")
def get_permissions(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    permissions = db.query(Permission).all()

    return [
        {
            "id": permission.id,
            "name": permission.name,
            "description": permission.description,
        }
        for permission in permissions
    ]


# ============================================================
# MODULES
# ============================================================

@router.get("/modules")
def get_modules(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    modules = db.query(Module).all()

    return [
        {
            "id": module.id,
            "name": module.name,
            "code": module.code,
            "description": module.description,
        }
        for module in modules
    ]


# ============================================================
# INSTITUTIONS
# ============================================================

@router.get("/institutions")
def get_institutions(
    current_user: User = Depends(
        require_permission("INSTITUTION_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    institutions = db.query(Institution).all()

    return [
        {
            "id": institution.id,
            "name": institution.name,
            "code": institution.code,
            "city": institution.city,
            "state": institution.state,
            "institution_type": institution.institution_type,
            "established_year": institution.established_year,
            "website": institution.website,
        }
        for institution in institutions
    ]


# ============================================================
# ACCREDITATION CYCLES
# ============================================================

@router.get("/accreditation-cycles")
def get_accreditation_cycles(
    current_user: User = Depends(
        require_permission("ACCREDITATION_CYCLES", "View")
    ),
    db: Session = Depends(get_db)
):
    cycles = db.query(AccreditationCycle).all()

    return [
        {
            "id": cycle.id,
            "institution_id": cycle.institution_id,
            "name": cycle.name,
            "code": cycle.code,
            "academic_period": cycle.academic_period,
            "status": cycle.status,
            "description": cycle.description,
        }
        for cycle in cycles
    ]


# ============================================================
# REGISTRATION REQUESTS
# ============================================================

@router.get("/registration-requests")
def get_registration_requests(
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    requests = (
        db.query(RegistrationRequest)
        .order_by(RegistrationRequest.created_at.desc())
        .all()
    )

    result = []

    for request in requests:

        assigned_role = None

        if request.assigned_role_id:

            assigned_role = (
                db.query(Role)
                .filter(
                    Role.id == request.assigned_role_id
                )
                .first()
            )

        faculty = None

        if request.faculty_id:

            faculty = (
                db.query(Faculty)
                .filter(
                    Faculty.id == request.faculty_id
                )
                .first()
            )

        department = None

        if request.department_id:

            department = (
                db.query(Department)
                .filter(
                    Department.id == request.department_id
                )
                .first()
            )

        institution = None

        if request.institution_id:

            institution = (
                db.query(Institution)
                .filter(
                    Institution.id == request.institution_id
                )
                .first()
            )

        result.append({
            "id": request.id,

            "full_name": request.full_name,
            "email": request.email,

            "institution": request.institution,
            "institution_id": request.institution_id,
            "institution_name": (
                institution.name
                if institution
                else request.institution
            ),

            "faculty_id": request.faculty_id,
            "faculty": (
                faculty.name
                if faculty
                else None
            ),

            "department": request.department,
            "department_id": request.department_id,
            "department_name": (
                department.name
                if department
                else request.department
            ),

            "designation": request.designation,

            "status": request.status,

            "assigned_role_id": request.assigned_role_id,

            "assigned_role": (
                assigned_role.name
                if assigned_role
                else None
            ),

            "reviewed_by": request.reviewed_by,
            "reviewed_at": request.reviewed_at,

            "rejection_reason": request.rejection_reason,

            "created_at": request.created_at,
            "updated_at": request.updated_at,
        })

    return result


# ============================================================
# GET SINGLE REGISTRATION REQUEST
# ============================================================

@router.get("/registration-requests/{request_id}")
def get_registration_request(
    request_id: int,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "View")
    ),
    db: Session = Depends(get_db)
):
    registration_request = (
        db.query(RegistrationRequest)
        .filter(
            RegistrationRequest.id == request_id
        )
        .first()
    )

    if not registration_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found"
        )

    assigned_role = None

    if registration_request.assigned_role_id:

        assigned_role = (
            db.query(Role)
            .filter(
                Role.id == registration_request.assigned_role_id
            )
            .first()
        )

    faculty = None

    if registration_request.faculty_id:

        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.id == registration_request.faculty_id
            )
            .first()
        )

    department = None

    if registration_request.department_id:

        department = (
            db.query(Department)
            .filter(
                Department.id == registration_request.department_id
            )
            .first()
        )

    institution = None

    if registration_request.institution_id:

        institution = (
            db.query(Institution)
            .filter(
                Institution.id == registration_request.institution_id
            )
            .first()
        )

    return {
        "id": registration_request.id,

        "full_name": registration_request.full_name,
        "email": registration_request.email,

        "institution": registration_request.institution,
        "institution_id": registration_request.institution_id,
        "institution_name": (
            institution.name
            if institution
            else registration_request.institution
        ),

        "faculty_id": registration_request.faculty_id,
        "faculty": (
            faculty.name
            if faculty
            else None
        ),

        "department": registration_request.department,
        "department_id": registration_request.department_id,
        "department_name": (
            department.name
            if department
            else registration_request.department
        ),

        "designation": registration_request.designation,

        "status": registration_request.status,

        "assigned_role_id": (
            registration_request.assigned_role_id
        ),

        "assigned_role": (
            assigned_role.name
            if assigned_role
            else None
        ),

        "reviewed_by": registration_request.reviewed_by,
        "reviewed_at": registration_request.reviewed_at,

        "rejection_reason": (
            registration_request.rejection_reason
        ),

        "created_at": registration_request.created_at,
        "updated_at": registration_request.updated_at,
    }


# ============================================================
# APPROVE REGISTRATION REQUEST
# ============================================================

@router.post(
    "/registration-requests/{request_id}/approve"
)
def approve_registration_request(
    request_id: int,
    approval_data: RegistrationApprovalRequest,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "Create")
    ),
    db: Session = Depends(get_db)
):
    registration_request = (
        db.query(RegistrationRequest)
        .filter(
            RegistrationRequest.id == request_id
        )
        .first()
    )

    if not registration_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found"
        )

    # --------------------------------------------------------
    # Only pending requests can be approved
    # --------------------------------------------------------

    if registration_request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Registration request is already "
                f"{registration_request.status}"
            )
        )

    # --------------------------------------------------------
    # Validate role
    # --------------------------------------------------------

    role = (
        db.query(Role)
        .filter(
            Role.id == approval_data.role_id
        )
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected role not found"
        )

    # --------------------------------------------------------
    # Check duplicate user
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == registration_request.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )

    # ========================================================
    # INSTITUTION VALIDATION
    # ========================================================

    institution = None

    if approval_data.institution_id is not None:

        institution = (
            db.query(Institution)
            .filter(
                Institution.id == approval_data.institution_id
            )
            .first()
        )

        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )

    # ========================================================
    # FACULTY VALIDATION
    # ========================================================

    faculty = None

    if approval_data.faculty_id is not None:

        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.id == approval_data.faculty_id
            )
            .first()
        )

        if not faculty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Faculty not found"
            )

        if (
            approval_data.institution_id is not None
            and faculty.institution_id
            != approval_data.institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected faculty does not belong "
                    "to the selected institution"
                )
            )

    # ========================================================
    # DEPARTMENT VALIDATION
    # ========================================================

    department = None

    if approval_data.department_id is not None:

        department = (
            db.query(Department)
            .filter(
                Department.id == approval_data.department_id
            )
            .first()
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        if (
            approval_data.institution_id is not None
            and department.institution_id
            != approval_data.institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected institution"
                )
            )

        if (
            approval_data.faculty_id is not None
            and department.faculty_id
            != approval_data.faculty_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected department does not belong "
                    "to the selected faculty"
                )
            )

    # ========================================================
    # CREATE USER
    # ========================================================

    new_user = User(
        name=registration_request.full_name,
        email=registration_request.email,
        password_hash=registration_request.password_hash,

        role_id=role.id,

        institution_id=approval_data.institution_id,
        faculty_id=approval_data.faculty_id,
        department_id=approval_data.department_id,

        is_active=True,
    )

    db.add(new_user)

    # ========================================================
    # UPDATE REGISTRATION REQUEST
    # ========================================================

    registration_request.status = "APPROVED"

    registration_request.assigned_role_id = role.id

    registration_request.reviewed_by = current_user.id

    registration_request.reviewed_at = datetime.utcnow()

    registration_request.rejection_reason = None

    # Store the approved hierarchy on the request too
    registration_request.institution_id = (
        approval_data.institution_id
    )

    registration_request.faculty_id = (
        approval_data.faculty_id
    )

    registration_request.department_id = (
        approval_data.department_id
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve registration request"
        )

    db.refresh(new_user)
    db.refresh(registration_request)

    return {
        "message": "Registration request approved successfully",

        "registration_request": {
            "id": registration_request.id,
            "status": registration_request.status,
            "assigned_role": role.name,

            "institution_id": (
                registration_request.institution_id
            ),

            "faculty_id": (
                registration_request.faculty_id
            ),

            "department_id": (
                registration_request.department_id
            ),
        },

        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,

            "role_id": new_user.role_id,
            "role": role.name,

            "institution_id": new_user.institution_id,
            "faculty_id": new_user.faculty_id,
            "department_id": new_user.department_id,

            "is_active": new_user.is_active,
        }
    }


# ============================================================
# REJECT REGISTRATION REQUEST
# ============================================================

@router.post(
    "/registration-requests/{request_id}/reject"
)
def reject_registration_request(
    request_id: int,
    rejection_data: RegistrationRejectionRequest,
    current_user: User = Depends(
        require_permission("USER_MANAGEMENT", "Edit")
    ),
    db: Session = Depends(get_db)
):
    registration_request = (
        db.query(RegistrationRequest)
        .filter(
            RegistrationRequest.id == request_id
        )
        .first()
    )

    if not registration_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found"
        )

    # --------------------------------------------------------
    # Only pending requests can be rejected
    # --------------------------------------------------------

    if registration_request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Registration request is already "
                f"{registration_request.status}"
            )
        )

    # --------------------------------------------------------
    # Validate reason
    # --------------------------------------------------------

    reason = rejection_data.reason.strip()

    if not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason cannot be empty"
        )

    # --------------------------------------------------------
    # Update request
    # --------------------------------------------------------

    registration_request.status = "REJECTED"

    registration_request.reviewed_by = current_user.id

    registration_request.reviewed_at = datetime.utcnow()

    registration_request.rejection_reason = reason

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    db.commit()

    db.refresh(registration_request)

    return {
        "message": "Registration request rejected successfully",

        "registration_request": {
            "id": registration_request.id,
            "status": registration_request.status,
            "rejection_reason": (
                registration_request.rejection_reason
            ),
        }
    }