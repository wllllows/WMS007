from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ========== Supplier ==========
class OutsourcingSupplierCreate(BaseModel):
    supplier_id: str
    supplier_name: str
    contact_person: str
    contact_phone: str
    qualification_level: str
    address: str


class OutsourcingSupplierResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    contact_person: str
    contact_phone: str
    qualification_level: str
    address: str

    model_config = {"from_attributes": True}


# ========== Outsourcing Order ==========
class OutsourcingOrderCreate(BaseModel):
    outsourcing_order_id: str
    order_status: str
    order_amount: float
    order_date: date
    supplier_id: str
    receipt_id: str


class OutsourcingOrderSettle(BaseModel):
    final_amount: float


class OutsourcingOrderResponse(BaseModel):
    outsourcing_order_id: str
    order_status: str
    order_amount: float
    order_date: date
    supplier_id: str
    receipt_id: str

    model_config = {"from_attributes": True}


# ========== Transfer Order ==========
class TransferOrderCreate(BaseModel):
    transfer_order_id: str
    transfer_unit: str
    location: str
    quantity: int
    workshop_id: str
    raw_material_id: str


class TransferOrderResponse(BaseModel):
    transfer_order_id: str
    transfer_unit: str
    transfer_date: date
    location: str
    quantity: int
    workshop_id: str

    model_config = {"from_attributes": True}


# ========== Work Order ==========
class WorkOrderResponse(BaseModel):
    work_order_id: str
    work_order_type: str
    start_time: datetime
    status: str
    issue_date: date
    consumables: Optional[str] = None

    model_config = {"from_attributes": True}
