"""登录认证路由"""
from fastapi import APIRouter, HTTPException
from app.auth import USERS, verify_password, create_access_token, LoginRequest, ROLE_MENUS

router = APIRouter()


@router.post("/login")
def login(data: LoginRequest):
    user = USERS.get(data.username)
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({
        "sub": data.username,
        "role": user["role"],
        "name": user["name"],
    })

    return {
        "token": token,
        "username": data.username,
        "role": user["role"],
        "name": user["name"],
        "menus": ROLE_MENUS[user["role"]],
    }
