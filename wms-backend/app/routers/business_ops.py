"""补充业务接口：退货入库、外协入库、生产退料、外协出库、生产领料"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from pydantic import BaseModel
from app.database import SessionLocal

router = APIRouter()


class ReturnInboundData(BaseModel):
    purchase_order_id: str
    return_quantity: int
    return_reason: str
    remark: str = ""


class OutsourcingInboundData(BaseModel):
    outsourcing_order_id: str
    inbound_quantity: int
    quality_check: str
    warehouse_id: str
    remark: str = ""


class ProductionReturnData(BaseModel):
    work_order_id: str
    raw_material_id: str
    return_quantity: int
    return_reason: str
    warehouse_id: str


class OutsourcingOutboundData(BaseModel):
    outsourcing_order_id: str
    raw_material_id: str
    out_quantity: int
    expected_return_date: str
    remark: str = ""


class MaterialPickData(BaseModel):
    work_order_id: str
    raw_material_id: str
    pick_quantity: int
    workshop_id: str
    applicant: str
    purpose: str = ""


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()


@router.put("/purchase-orders/{order_id}/return")
def create_return_inbound(order_id: str, data: ReturnInboundData):
    db = next(get_db())
    try:
        result = db.execute(text(
            "SELECT * FROM purchase_order WHERE purchase_order_id = :oid"
        ), {"oid": order_id}).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="采购订单不存在")
        db.execute(text(
            "UPDATE purchase_order SET shipped = TRUE, total_quantity = total_quantity - :qty WHERE purchase_order_id = :oid"
        ), {"qty": data.return_quantity, "oid": order_id})
        # 记录到操作日志
        db.execute(text(
            "INSERT INTO work_order_log (work_order_id, operation, operation_time) VALUES (:oid, :op, NOW())"
        ), {"oid": order_id, "op": f"退货入库: {data.return_reason}, 数量: {data.return_quantity}"})
        db.commit()
        return {"status": "success", "message": "退货入库完成"}
    except HTTPException: raise
    except Exception as e: db.rollback(); raise HTTPException(status_code=400, detail=str(e))


@router.post("/outsourcing-orders/inbound")
def create_outsourcing_inbound(data: OutsourcingInboundData):
    db = next(get_db())
    try:
        oo = db.execute(text(
            "SELECT * FROM outsourcing_order WHERE outsourcing_order_id = :oid"
        ), {"oid": data.outsourcing_order_id}).fetchone()
        if not oo:
            raise HTTPException(status_code=404, detail="外协订单不存在")
        db.execute(text(
            "INSERT INTO work_order_log (work_order_id, operation, operation_time) VALUES (:oid, :op, NOW())"
        ), {"oid": data.outsourcing_order_id, "op": f"外协回厂入库: 数量{data.inbound_quantity}, 质检{data.quality_check}, 仓库{data.warehouse_id}"})
        db.commit()
        return {"status": "success", "message": "外协入库完成"}
    except HTTPException: raise
    except Exception as e: db.rollback(); raise HTTPException(status_code=400, detail=str(e))


@router.post("/outsourcing-orders/outbound")
def create_outsourcing_outbound(data: OutsourcingOutboundData):
    db = next(get_db())
    try:
        oo = db.execute(text(
            "SELECT * FROM outsourcing_order WHERE outsourcing_order_id = :oid"
        ), {"oid": data.outsourcing_order_id}).fetchone()
        if not oo:
            raise HTTPException(status_code=404, detail="外协订单不存在")
        db.execute(text(
            "INSERT INTO work_order_log (work_order_id, operation, operation_time) VALUES (:oid, :op, NOW())"
        ), {"oid": data.outsourcing_order_id, "op": f"外协发料出库: 物料{data.raw_material_id}, 数量{data.out_quantity}, 预计回厂{data.expected_return_date}"})
        db.execute(text(
            "INSERT IGNORE INTO outsourcing_order_raw_material (outsourcing_order_id, raw_material_id) VALUES (:oid, :mid)"
        ), {"oid": data.outsourcing_order_id, "mid": data.raw_material_id})
        db.commit()
        return {"status": "success", "message": "外协发料完成"}
    except HTTPException: raise
    except Exception as e: db.rollback(); raise HTTPException(status_code=400, detail=str(e))


@router.post("/work-orders/return-material")
def create_production_return(data: ProductionReturnData):
    db = next(get_db())
    try:
        wo = db.execute(text(
            "SELECT * FROM work_order WHERE work_order_id = :oid"
        ), {"oid": data.work_order_id}).fetchone()
        if not wo:
            raise HTTPException(status_code=404, detail="工单不存在")
        db.execute(text(
            "INSERT INTO work_order_log (work_order_id, operation, operation_time) VALUES (:oid, :op, NOW())"
        ), {"oid": data.work_order_id, "op": f"生产退料: 物料{data.raw_material_id}, 数量{data.return_quantity}, 原因{data.return_reason}, 仓库{data.warehouse_id}"})
        db.commit()
        return {"status": "success", "message": "生产退料完成"}
    except HTTPException: raise
    except Exception as e: db.rollback(); raise HTTPException(status_code=400, detail=str(e))


@router.post("/work-orders/pick-material")
def create_material_pick(data: MaterialPickData):
    db = next(get_db())
    try:
        wo = db.execute(text(
            "SELECT * FROM work_order WHERE work_order_id = :oid"
        ), {"oid": data.work_order_id}).fetchone()
        if not wo:
            raise HTTPException(status_code=404, detail="工单不存在")
        db.execute(text(
            "INSERT INTO work_order_log (work_order_id, operation, operation_time) VALUES (:oid, :op, NOW())"
        ), {"oid": data.work_order_id, "op": f"生产领料: 物料{data.raw_material_id}, 数量{data.pick_quantity}, 车间{data.workshop_id}, 申请人{data.applicant}"})
        db.execute(text(
            "INSERT IGNORE INTO work_order_raw_material (work_order_id, raw_material_id) VALUES (:oid, :mid)"
        ), {"oid": data.work_order_id, "mid": data.raw_material_id})
        db.commit()
        return {"status": "success", "message": "生产领料完成"}
    except HTTPException: raise
    except Exception as e: db.rollback(); raise HTTPException(status_code=400, detail=str(e))
