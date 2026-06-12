from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    employees, materials, warehouses, suppliers, workshops,
    purchase_orders, sales_orders, work_orders,
    outsourcing_orders, transfer_orders, inventory, dashboard, auth
)

app = FastAPI(title="仓库管理系统 API", version="1.0.0")

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


@app.get("/")
def root():
    return {"message": "仓库管理系统 API", "docs": "/docs"}
