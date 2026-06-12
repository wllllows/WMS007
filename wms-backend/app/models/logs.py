from sqlalchemy import Column, String, BigInteger, DateTime
from app.database import Base


class WorkOrderLog(Base):
    __tablename__ = "work_order_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_order_id = Column(String(30), nullable=False)
    operation = Column(String(50), nullable=False)
    operation_time = Column(DateTime, nullable=False)


class WorkOrderDeleteBackup(Base):
    __tablename__ = "work_order_delete_backup"

    backup_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_order_id = Column(String(30), nullable=False)
    work_order_type = Column(String(50), nullable=False)
    start_time = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False)
    deleted_time = Column(DateTime, nullable=False)


class TransferOrderDeleteLog(Base):
    __tablename__ = "transfer_order_delete_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    transfer_order_id = Column(String(30), nullable=False)
    transfer_unit = Column(String(100), nullable=False)
    deleted_time = Column(DateTime, nullable=False)


class MaterialMigrationLog(Base):
    __tablename__ = "material_migration_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    raw_material_id = Column(String(30), nullable=False)
    old_warehouse_id = Column(String(30), nullable=False)
    new_warehouse_id = Column(String(30), nullable=False)
    migration_time = Column(DateTime, nullable=False)
