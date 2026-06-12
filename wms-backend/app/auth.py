"""认证模块：JWT + 角色权限"""
import hashlib, hmac
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

SECRET_KEY = "wms-course-project-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

security = HTTPBearer()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


# 用户数据
USERS = {
    "admin":    {"password": hash_password("admin123"),    "role": "admin",    "name": "系统管理员"},
    "operator": {"password": hash_password("operator123"), "role": "operator", "name": "业务操作员"},
    "analyst":  {"password": hash_password("analyst123"),  "role": "analyst",  "name": "数据分析师"},
    "auditor":  {"password": hash_password("auditor123"),  "role": "auditor",  "name": "审计人员"},
}

# 角色可访问的菜单
ROLE_MENUS = {
    "admin":    ["dashboard", "basic-data", "inbound", "outbound", "work-orders", "outsourcing", "inventory", "reports"],
    "operator": ["dashboard", "basic-data", "inbound", "outbound", "work-orders", "outsourcing", "inventory", "reports"],
    "analyst":  ["dashboard", "reports"],
    "auditor":  ["dashboard"],
}


class TokenData(BaseModel):
    username: str
    role: str
    name: str


class LoginRequest(BaseModel):
    username: str
    password: str


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenData(username=payload["sub"], role=payload["role"], name=payload["name"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的认证令牌")


def require_role(*roles: str):
    def checker(user: TokenData = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="权限不足")
        return user
    return checker
