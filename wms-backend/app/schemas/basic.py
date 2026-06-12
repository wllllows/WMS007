from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# ========== Employee ==========
class EmployeeBase(BaseModel):
    name: str
    position: str
    contact_phone: str


class EmployeeCreate(EmployeeBase):
    employee_id: str


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    contact_phone: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    employee_id: str

    model_config = {"from_attributes": True}


# ========== Material ==========
class RawMaterialBase(BaseModel):
    raw_material_name: str
    specification_model: str
    material_attribute: str
    warehouse_id: str


class RawMaterialCreate(RawMaterialBase):
    raw_material_id: str


class RawMaterialUpdate(BaseModel):
    raw_material_name: Optional[str] = None
    specification_model: Optional[str] = None
    material_attribute: Optional[str] = None
    warehouse_id: Optional[str] = None


class RawMaterialResponse(RawMaterialBase):
    raw_material_id: str

    model_config = {"from_attributes": True}


# ========== Warehouse ==========
class WarehouseBase(BaseModel):
    warehouse_location: str
    manager_employee_id: str
    contact_phone: str
    area: float
    category: str


class WarehouseCreate(WarehouseBase):
    warehouse_id: str


class WarehouseUpdate(BaseModel):
    warehouse_location: Optional[str] = None
    manager_employee_id: Optional[str] = None
    contact_phone: Optional[str] = None
    area: Optional[float] = None
    category: Optional[str] = None


class WarehouseResponse(WarehouseBase):
    warehouse_id: str

    model_config = {"from_attributes": True}


# ========== Workshop ==========
class WorkshopBase(BaseModel):
    manager: str
    location: str
    contact_phone: str


class WorkshopCreate(WorkshopBase):
    workshop_id: str


class WorkshopResponse(WorkshopBase):
    workshop_id: str

    model_config = {"from_attributes": True}
