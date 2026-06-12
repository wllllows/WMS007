from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.outsourcing import OutsourcingOrder
from app.schemas.operations import OutsourcingOrderCreate, OutsourcingOrderSettle, OutsourcingOrderResponse
from app.services.outsourcing_service import finish_outsourcing_order, supplier_statement

router = APIRouter()


@router.get("/")
def list_outsourcing_orders(
    order_status: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(OutsourcingOrder)
    if order_status:
        query = query.filter(OutsourcingOrder.order_status == order_status)
    total = query.count()
    items = query.order_by(OutsourcingOrder.order_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [OutsourcingOrderResponse.model_validate(o).model_dump() for o in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_outsourcing_order(data: OutsourcingOrderCreate, db: Session = Depends(get_db)):
    existing = db.query(OutsourcingOrder).filter(
        OutsourcingOrder.outsourcing_order_id == data.outsourcing_order_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="外协订单号已存在")
    oo = OutsourcingOrder(**data.model_dump())
    db.add(oo)
    db.commit()
    db.refresh(oo)
    return {"data": OutsourcingOrderResponse.model_validate(oo).model_dump()}


@router.post("/{outsourcing_order_id}/settle")
def settle_outsourcing_order(outsourcing_order_id: str, data: OutsourcingOrderSettle):
    result = finish_outsourcing_order(outsourcing_order_id, data.final_amount)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/{supplier_id}/statement")
def get_supplier_statement(supplier_id: str):
    statement = supplier_statement(supplier_id)
    return {"data": statement}


@router.get("/supplier-stats")
def get_supplier_stats(db: Session = Depends(get_db)):
    """查询外协厂商订单统计视图"""
    rows = db.execute(text("SELECT * FROM outsourcing_supplier_order_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM outsourcing_supplier_order_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
