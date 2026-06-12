from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TransferOrder(Base):
    __tablename__ = "transfer_order"

    transfer_order_id = Column(String(30), primary_key=True)
    transfer_unit = Column(String(100), nullable=False)
    transfer_date = Column(Date, nullable=False)
    location = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    workshop_id = Column(String(30), ForeignKey("workshop.workshop_id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)

    workshop = relationship("Workshop", back_populates="transfer_orders")


class TransferOrderRawMaterial(Base):
    __tablename__ = "transfer_order_raw_material"

    transfer_order_id = Column(String(30), ForeignKey("transfer_order.transfer_order_id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    raw_material_id = Column(String(30), ForeignKey("raw_material.raw_material_id", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True)

    transfer_order = relationship("TransferOrder")
    raw_material = relationship("RawMaterial")
