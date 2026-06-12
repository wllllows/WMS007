from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class OutsourcingSupplier(Base):
    __tablename__ = "outsourcing_supplier"

    supplier_id = Column(String(30), primary_key=True)
    supplier_name = Column(String(100), nullable=False)
    contact_person = Column(String(50), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    qualification_level = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)

    outsourcing_orders = relationship("OutsourcingOrder", back_populates="supplier")


class OutsourcingOrder(Base):
    __tablename__ = "outsourcing_order"

    outsourcing_order_id = Column(String(30), primary_key=True)
    order_status = Column(String(50), nullable=False)
    order_amount = Column(Numeric(12, 2), nullable=False)
    order_date = Column(Date, nullable=False)
    supplier_id = Column(String(30), ForeignKey("outsourcing_supplier.supplier_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    receipt_id = Column(String(30), ForeignKey("receipt_status.receipt_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        CheckConstraint("order_amount >= 0", name="chk_oo_amount"),
    )

    supplier = relationship("OutsourcingSupplier", back_populates="outsourcing_orders")
    receipt = relationship("ReceiptStatus", back_populates="outsourcing_orders")


class OutsourcingOrderRawMaterial(Base):
    __tablename__ = "outsourcing_order_raw_material"

    outsourcing_order_id = Column(String(30), ForeignKey("outsourcing_order.outsourcing_order_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    raw_material_id = Column(String(30), ForeignKey("raw_material.raw_material_id", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True)

    outsourcing_order = relationship("OutsourcingOrder")
    raw_material = relationship("RawMaterial")
