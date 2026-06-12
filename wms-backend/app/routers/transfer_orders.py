from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.transfer import TransferOrder
from app.schemas.operations import TransferOrderCreate, TransferOrderResponse
from app.services.transfer_service import transfer_material

router = APIRouter()


@router.get("/")
def list_transfer_orders(
    workshop_id: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(TransferOrder)
    if workshop_id:
        query = query.filter(TransferOrder.workshop_id == workshop_id)
    total = query.count()
    items = query.order_by(TransferOrder.transfer_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [TransferOrderResponse.model_validate(t).model_dump() for t in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_transfer_order(data: TransferOrderCreate):
    result = transfer_material(data.transfer_order_id, data.transfer_unit,
                               data.location, data.quantity,
                               data.workshop_id, data.raw_material_id)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/workshop-stats")
def get_workshop_transfer_stats(db: Session = Depends(get_db)):
    """查询车间调拨作业统计视图"""
    rows = db.execute(text("SELECT * FROM workshop_transfer_statistics_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM workshop_transfer_statistics_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
