from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.work_order import WorkOrder
from app.schemas.operations import WorkOrderResponse
from app.services.work_order_service import complete_work_order as sp_complete

router = APIRouter()


@router.get("/")
def list_work_orders(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(WorkOrder)
    if status:
        query = query.filter(WorkOrder.status == status)
    total = query.count()
    items = query.order_by(WorkOrder.issue_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [WorkOrderResponse.model_validate(wo).model_dump() for wo in items],
            "total": total, "page": page, "page_size": page_size}


@router.get("/{work_order_id}")
def get_work_order_detail(work_order_id: str, db: Session = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.work_order_id == work_order_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="工单不存在")
    return {"data": WorkOrderResponse.model_validate(wo).model_dump()}


@router.post("/{work_order_id}/complete")
def complete_work_order(work_order_id: str):
    result = sp_complete(work_order_id)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/resource-view")
def get_work_order_resource_view(db: Session = Depends(get_db)):
    """查询工单资源汇总视图"""
    rows = db.execute(text("SELECT * FROM work_order_resource_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM work_order_resource_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
