from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class PaymentStatus(Base):
    __tablename__ = "payment_status"

    payment_id = Column(String(30), primary_key=True)
    paid_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    unpaid_amount = Column(Numeric(12, 2), nullable=False, default=0.00)

    __table_args__ = (
        CheckConstraint("paid_amount >= 0", name="chk_payment_paid"),
        CheckConstraint("unpaid_amount >= 0", name="chk_payment_unpaid"),
    )

    purchase_orders = relationship("PurchaseOrder", back_populates="payment")


class ReceiptStatus(Base):
    __tablename__ = "receipt_status"

    receipt_id = Column(String(30), primary_key=True)
    received_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    unreceived_amount = Column(Numeric(12, 2), nullable=False, default=0.00)

    __table_args__ = (
        CheckConstraint("received_amount >= 0", name="chk_receipt_received"),
        CheckConstraint("unreceived_amount >= 0", name="chk_receipt_unreceived"),
    )

    outsourcing_orders = relationship("OutsourcingOrder", back_populates="receipt")


class PurchaseOrder(Base):
    __tablename__ = "purchase_order"

    purchase_order_id = Column(String(30), primary_key=True)
    total_quantity = Column(Integer, nullable=False)
    order_time = Column(DateTime, nullable=False)
    shipped = Column(Boolean, nullable=False, default=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    purchaser_employee_id = Column(String(30), ForeignKey("employee.employee_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    payment_id = Column(String(30), ForeignKey("payment_status.payment_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        CheckConstraint("unit_price >= 0", name="chk_po_price"),
    )

    purchaser = relationship("Employee", back_populates="purchase_orders")
    payment = relationship("PaymentStatus", back_populates="purchase_orders")


class SalesOrder(Base):
    __tablename__ = "sales_order"

    sales_order_id = Column(String(30), primary_key=True)
    sales_detail = Column(Text, nullable=False)
    total_quantity = Column(Integer, nullable=False)
    order_time = Column(DateTime, nullable=False)
    paid_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    shipped = Column(Boolean, nullable=False, default=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    salesperson_employee_id = Column(String(30), ForeignKey("employee.employee_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        CheckConstraint("paid_amount >= 0", name="chk_so_paid"),
        CheckConstraint("unit_price >= 0", name="chk_so_price"),
    )

    salesperson = relationship("Employee", back_populates="sales_orders")
