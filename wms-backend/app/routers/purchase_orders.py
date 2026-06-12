from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.orders import PurchaseOrder
from app.schemas.orders import PurchaseOrderCreate, PurchaseOrderResponse
from app.services.purchase_service import create_purchase_order as sp_create

router = APIRouter()


@router.get("/")
def list_purchase_orders(
    shipped: bool = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(PurchaseOrder)
    if shipped is not None:
        query = query.filter(PurchaseOrder.shipped == shipped)
    total = query.count()
    items = query.order_by(PurchaseOrder.order_time.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [PurchaseOrderResponse.model_validate(po).model_dump() for po in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_purchase_order(data: PurchaseOrderCreate):
    result = sp_create(data.purchase_order_id, data.total_quantity,
                       data.unit_price, data.purchaser_employee_id)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/execution")
def get_purchase_execution(db: Session = Depends(get_db)):
    """查询采购订单执行情况视图"""
    rows = db.execute(text("SELECT * FROM purchase_order_execution_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM purchase_order_execution_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
