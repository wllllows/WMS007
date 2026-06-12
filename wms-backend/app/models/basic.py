from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Employee(Base):
    __tablename__ = "employee"

    employee_id = Column(String(30), primary_key=True)
    name = Column(String(50), nullable=False)
    position = Column(String(50), nullable=False)
    contact_phone = Column(String(30), nullable=False)

    purchase_orders = relationship("PurchaseOrder", back_populates="purchaser")
    sales_orders = relationship("SalesOrder", back_populates="salesperson")
    managed_warehouses = relationship("Warehouse", back_populates="manager", foreign_keys="Warehouse.manager_employee_id")
    work_orders = relationship("WorkOrderEmployee", back_populates="employee")


class Workshop(Base):
    __tablename__ = "workshop"

    workshop_id = Column(String(30), primary_key=True)
    manager = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    contact_phone = Column(String(30), nullable=False)

    transfer_orders = relationship("TransferOrder", back_populates="workshop")


class Warehouse(Base):
    __tablename__ = "warehouse"

    warehouse_id = Column(String(30), primary_key=True)
    warehouse_location = Column(String(255), nullable=False)
    manager_employee_id = Column(String(30), ForeignKey("employee.employee_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    area = Column(Numeric(10, 2), nullable=False)
    category = Column(String(50), nullable=False)

    __table_args__ = (
        CheckConstraint("area > 0", name="chk_warehouse_area"),
    )

    manager = relationship("Employee", back_populates="managed_warehouses", foreign_keys=[manager_employee_id])
    raw_materials = relationship("RawMaterial", back_populates="warehouse")
    finished_products = relationship("FinishedProduct", back_populates="warehouse")


class RawMaterial(Base):
    __tablename__ = "raw_material"

    raw_material_id = Column(String(30), primary_key=True)
    raw_material_name = Column(String(100), nullable=False)
    specification_model = Column(String(100), nullable=False)
    material_attribute = Column(String(255), nullable=False)
    warehouse_id = Column(String(30), ForeignKey("warehouse.warehouse_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    warehouse = relationship("Warehouse", back_populates="raw_materials")


class FinishedProduct(Base):
    __tablename__ = "finished_product"

    finished_product_id = Column(String(30), primary_key=True)
    finished_product_name = Column(String(100), nullable=False)
    product_attribute = Column(String(255), nullable=False)
    brand_grade = Column(String(50), nullable=False)
    warehouse_id = Column(String(30), ForeignKey("warehouse.warehouse_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    warehouse = relationship("Warehouse", back_populates="finished_products")
