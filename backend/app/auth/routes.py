from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models import (
    User,
    Role,
    Module,
    Permission,
    RoleModulePermission,
)
from app.schemas.auth import LoginRequest
from app.auth.security import verify_password, create_access_token
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

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

    role = db.query(Role).filter(
        Role.id == user.role_id
    ).first()

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": role.name if role else None
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role.name if role else None
        }
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # -----------------------------------------
    # 1. Get user's role from database
    # -----------------------------------------
    role = db.query(Role).filter(
        Role.id == current_user.role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=403,
            detail="User role not found"
        )

    # -----------------------------------------
    # 2. Get all permissions assigned to role
    # -----------------------------------------
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

    # -----------------------------------------
    # 3. Organize permissions module-wise
    # -----------------------------------------
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

    # -----------------------------------------
    # 4. Return verified user information
    # -----------------------------------------
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "institution_id": current_user.institution_id,
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