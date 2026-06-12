from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class WorkOrder(Base):
    __tablename__ = "work_order"

    work_order_id = Column(String(30), primary_key=True)
    work_order_type = Column(String(50), nullable=False)
    start_time = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False)
    issue_date = Column(Date, nullable=False)
    consumables = Column(Text, nullable=True)

    employees = relationship("WorkOrderEmployee", back_populates="work_order")
    raw_materials = relationship("WorkOrderRawMaterial", back_populates="work_order")
    finished_products = relationship("WorkOrderFinishedProduct", back_populates="work_order")


class WorkOrderEmployee(Base):
    __tablename__ = "work_order_employee"

    employee_id = Column(String(30), ForeignKey("employee.employee_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    work_order_id = Column(String(30), ForeignKey("work_order.work_order_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)

    employee = relationship("Employee", back_populates="work_orders")
    work_order = relationship("WorkOrder", back_populates="employees")


class WorkOrderRawMaterial(Base):
    __tablename__ = "work_order_raw_material"

    work_order_id = Column(String(30), ForeignKey("work_order.work_order_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    raw_material_id = Column(String(30), ForeignKey("raw_material.raw_material_id", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True)

    work_order = relationship("WorkOrder", back_populates="raw_materials")
    raw_material = relationship("RawMaterial")


class WorkOrderFinishedProduct(Base):
    __tablename__ = "work_order_finished_product"

    work_order_id = Column(String(30), ForeignKey("work_order.work_order_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    finished_product_id = Column(String(30), ForeignKey("finished_product.finished_product_id", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True)

    work_order = relationship("WorkOrder", back_populates="finished_products")
    finished_product = relationship("FinishedProduct")
