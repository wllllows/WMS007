from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ========== Purchase Order ==========
class PurchaseOrderCreate(BaseModel):
    purchase_order_id: str
    total_quantity: int
    unit_price: float
    purchaser_employee_id: str


class PurchaseOrderResponse(BaseModel):
    purchase_order_id: str
    total_quantity: int
    order_time: datetime
    shipped: bool
    unit_price: float
    purchaser_employee_id: str
    payment_id: str

    model_config = {"from_attributes": True}


# ========== Sales Order ==========
class SalesOrderCreate(BaseModel):
    sales_order_id: str
    sales_detail: str
    total_quantity: int
    unit_price: float
    salesperson_employee_id: str


class SalesPaymentCreate(BaseModel):
    payment_amount: float


class SalesOrderResponse(BaseModel):
    sales_order_id: str
    sales_detail: str
    total_quantity: int
    order_time: datetime
    paid_amount: float
    shipped: bool
    unit_price: float
    salesperson_employee_id: str

    model_config = {"from_attributes": True}
