from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.outsourcing import OutsourcingSupplier
from app.schemas.operations import OutsourcingSupplierCreate, OutsourcingSupplierResponse

router = APIRouter()


@router.get("/")
def list_suppliers(
    keyword: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(OutsourcingSupplier)
    if keyword:
        query = query.filter(OutsourcingSupplier.supplier_name.contains(keyword))
    total = query.count()
    items = query.order_by(OutsourcingSupplier.supplier_id).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [OutsourcingSupplierResponse.model_validate(s).model_dump() for s in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_supplier(data: OutsourcingSupplierCreate, db: Session = Depends(get_db)):
    existing = db.query(OutsourcingSupplier).filter(OutsourcingSupplier.supplier_id == data.supplier_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="供应商编号已存在")
    sup = OutsourcingSupplier(**data.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return {"data": OutsourcingSupplierResponse.model_validate(sup).model_dump()}


@router.put("/{supplier_id}")
def update_supplier(supplier_id: str, data: OutsourcingSupplierCreate, db: Session = Depends(get_db)):
    sup = db.query(OutsourcingSupplier).filter(OutsourcingSupplier.supplier_id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="供应商不存在")
    for key, value in data.model_dump().items():
        setattr(sup, key, value)
    db.commit()
    db.refresh(sup)
    return {"data": OutsourcingSupplierResponse.model_validate(sup).model_dump()}


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    sup = db.query(OutsourcingSupplier).filter(OutsourcingSupplier.supplier_id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="供应商不存在")
    db.delete(sup)
    db.commit()
    return {"status": "deleted"}
