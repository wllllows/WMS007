from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.orders import SalesOrder
from app.schemas.orders import SalesOrderCreate, SalesPaymentCreate, SalesOrderResponse
from app.services.sales_service import record_sales_payment

router = APIRouter()


@router.get("/")
def list_sales_orders(
    shipped: bool = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(SalesOrder)
    if shipped is not None:
        query = query.filter(SalesOrder.shipped == shipped)
    total = query.count()
    items = query.order_by(SalesOrder.order_time.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [SalesOrderResponse.model_validate(so).model_dump() for so in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_sales_order(data: SalesOrderCreate, db: Session = Depends(get_db)):
    so = SalesOrder(**data.model_dump())
    db.add(so)
    db.commit()
    db.refresh(so)
    return {"data": SalesOrderResponse.model_validate(so).model_dump()}


@router.post("/{sales_order_id}/payment")
def pay_sales_order(sales_order_id: str, data: SalesPaymentCreate):
    result = record_sales_payment(sales_order_id, data.payment_amount)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/payment-view")
def get_sales_payment_view(db: Session = Depends(get_db)):
    """查询销售订单付款进度视图"""
    rows = db.execute(text("SELECT * FROM sales_order_payment_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM sales_order_payment_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
