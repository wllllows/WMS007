"""扩展业务接口：补充业务 + 数据库演示 SP/视图"""
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from pydantic import BaseModel
from app.database import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()


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

# ===== 数据库演示 SP 和视图接口 =====
@router.post("/sp/copy-purchase-order")
def call_sp_copy_purchase_order(source: str = Query(...), new_id: str = Query(...)):
    db = next(get_db())
    try:
        db.execute(text("CALL sp_copy_purchase_order(:src, :new, @r)"), {"src": source, "new": new_id})
        db.commit()
        result = db.execute(text("SELECT @r")).scalar()
        return {"status": "success", "result": result}
    except Exception as e: db.rollback(); raise HTTPException(400, detail=str(e))


@router.post("/sp/delete-expired-workorders")
def call_sp_delete_expired_workorders(days: int = Query(180)):
    db = next(get_db())
    try:
        db.execute(text("CALL sp_delete_expired_workorders(:d, @c)"), {"d": days})
        db.commit()
        cnt = db.execute(text("SELECT @c")).scalar()
        return {"status": "success", "deleted_count": cnt}
    except Exception as e: db.rollback(); raise HTTPException(400, detail=str(e))


@router.post("/sp/update-employee-contact")
def call_sp_update_employee_contact(old_phone: str = Query(...), new_phone: str = Query(...)):
    db = next(get_db())
    try:
        db.execute(text("CALL sp_update_employee_contact(:old, :new, @c)"), {"old": old_phone, "new": new_phone})
        db.commit()
        cnt = db.execute(text("SELECT @c")).scalar()
        return {"status": "success", "updated_count": cnt}
    except Exception as e: db.rollback(); raise HTTPException(400, detail=str(e))


@router.get("/sp/material-outsourcing-summary")
def call_sp_material_outsourcing_summary(material_id: str = Query(...)):
    db = next(get_db())
    db.execute(text("CALL sp_material_outsourcing_summary(:mid, @s)"), {"mid": material_id})
    db.commit()
    result = db.execute(text("SELECT @s")).scalar()
    return {"data": result}


@router.get("/sp/workshop-production-report")
def call_sp_workshop_production_report(workshop_id: str = Query(...)):
    db = next(get_db())
    db.execute(text("CALL sp_workshop_production_report(:wid, @r)"), {"wid": workshop_id})
    db.commit()
    result = db.execute(text("SELECT @r")).scalar()
    return {"data": result}


# ===== 视图接口 =====

@router.get("/view/employee-performance")
def get_employee_performance():
    db = next(get_db())
    rows = db.execute(text("SELECT * FROM employee_work_order_performance_view")).fetchall()
    return {"data": [dict(r._mapping) for r in rows]}


@router.get("/view/product-trace")
def get_product_trace():
    db = next(get_db())
    rows = db.execute(text("SELECT * FROM finished_product_work_order_trace_view")).fetchall()
    return {"data": [dict(r._mapping) for r in rows]}


@router.get("/view/outsourcing-material-detail")
def get_outsourcing_material_detail():
    db = next(get_db())
    rows = db.execute(text("SELECT * FROM outsourcing_order_raw_material_view")).fetchall()
    return {"data": [dict(r._mapping) for r in rows]}


@router.get("/view/payment-purchase-summary")
def get_payment_purchase_summary():
    db = next(get_db())
    rows = db.execute(text("SELECT * FROM payment_purchase_summary_view")).fetchall()
    return {"data": [dict(r._mapping) for r in rows]}


@router.get("/view/material-outsourcing")
def get_material_outsourcing():
    db = next(get_db())
    rows = db.execute(text("SELECT * FROM raw_material_outsourcing_view")).fetchall()
    return {"data": [dict(r._mapping) for r in rows]}

# ===== SP: 过期工单清理 =====
@router.post("/sp/delete-expired-workorders")
def call_sp_delete_expired_workorders(days: int = Query(180)):
    db = next(get_db())
    try:
        db.execute(text("CALL sp_delete_expired_workorders(:d, @c)"), {"d": days})
        db.commit()
        cnt = db.execute(text("SELECT @c")).scalar()
        return {"status": "success", "deleted_count": cnt}
    except Exception as e: db.rollback(); raise HTTPException(400, detail=str(e))


# ===== SP: 批量更新员工联系方式 =====
@router.post("/sp/update-employee-contact")
def call_sp_update_employee_contact(old_phone: str = Query(...), new_phone: str = Query(...)):
    db = next(get_db())
    try:
        db.execute(text("CALL sp_update_employee_contact(:old, :new, @c)"), {"old": old_phone, "new": new_phone})
        db.commit()
        cnt = db.execute(text("SELECT @c")).scalar()
        return {"status": "success", "updated_count": cnt}
    except Exception as e: db.rollback(); raise HTTPException(400, detail=str(e))
