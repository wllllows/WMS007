from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt
from app.routers import (
    employees, materials, warehouses, suppliers, workshops,
    purchase_orders, sales_orders, work_orders,
    outsourcing_orders, transfer_orders, inventory, dashboard, auth, extended
)

SECRET_KEY = "wms-course-project-secret-key-2026"
ALGORITHM = "HS256"

app = FastAPI(title="仓库管理系统 API", version="1.0.0")


# ===== 角色权限中间件 =====
@app.middleware("http")
async def role_access_control(request: Request, call_next):
    # 跳过不需要拦截的路径
    path = request.url.path
    if path in ("/", "/docs", "/openapi.json") or path.startswith("/api/auth"):
        return await call_next(request)

    # GET 请求：任何已认证用户可访问
    if request.method == "GET":
        return await call_next(request)

    # POST/PUT/DELETE：仅 admin 和 operator
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "请先登录"})

    try:
        payload = jwt.decode(auth_header[7:], SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role", "")
        if role not in ("admin", "operator"):
            return JSONResponse(status_code=403, content={"detail": f"权限不足：{role}角色不能执行写操作"})
    except JWTError:
        return JSONResponse(status_code=401, content={"detail": "认证令牌无效"})

    return await call_next(request)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    msg = str(exc.orig) if exc.orig else str(exc)
    if "Duplicate entry" in msg:
        return JSONResponse(status_code=400, content={"detail": "数据已存在，请检查编号是否重复"})
    if "foreign key constraint" in msg.lower() or "a foreign key constraint fails" in msg.lower():
        return JSONResponse(status_code=400, content={"detail": "关联数据不存在，请检查引用的编号是否正确"})
    return JSONResponse(status_code=400, content={"detail": f"数据完整性错误: {msg}"})


@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": f"服务器错误: {str(exc)}"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(employees.router, prefix="/api/employees", tags=["员工管理"])
app.include_router(materials.router, prefix="/api/materials", tags=["物料管理"])
app.include_router(warehouses.router, prefix="/api/warehouses", tags=["仓库管理"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["供应商管理"])
app.include_router(workshops.router, prefix="/api/workshops", tags=["车间管理"])
app.include_router(purchase_orders.router, prefix="/api/purchase-orders", tags=["采购订单"])
app.include_router(sales_orders.router, prefix="/api/sales-orders", tags=["销售订单"])
app.include_router(work_orders.router, prefix="/api/work-orders", tags=["工单管理"])
app.include_router(outsourcing_orders.router, prefix="/api/outsourcing-orders", tags=["外协订单"])
app.include_router(transfer_orders.router, prefix="/api/transfer-orders", tags=["调拨管理"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["库存管理"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["仪表盘"])
app.include_router(extended.router, prefix="/api", tags=["扩展业务"])


@app.get("/")
def root():
    return {"message": "仓库管理系统 API", "docs": "/docs"}
