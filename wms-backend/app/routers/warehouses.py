from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.basic import Warehouse
from app.schemas.basic import WarehouseCreate, WarehouseUpdate, WarehouseResponse

router = APIRouter()


@router.get("/")
def list_warehouses(
    category: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Warehouse)
    if category:
        query = query.filter(Warehouse.category == category)
    total = query.count()
    items = query.order_by(Warehouse.warehouse_id).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [WarehouseResponse.model_validate(w).model_dump() for w in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db)):
    existing = db.query(Warehouse).filter(Warehouse.warehouse_id == data.warehouse_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="仓库编号已存在")
    wh = Warehouse(**data.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return {"data": WarehouseResponse.model_validate(wh).model_dump()}


@router.put("/{warehouse_id}")
def update_warehouse(warehouse_id: str, data: WarehouseUpdate, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="仓库不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(wh, key, value)
    db.commit()
    db.refresh(wh)
    return {"data": WarehouseResponse.model_validate(wh).model_dump()}


@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: str, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="仓库不存在")
    db.delete(wh)
    db.commit()
    return {"status": "deleted"}
