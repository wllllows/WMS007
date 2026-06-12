from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.basic import Workshop
from app.schemas.basic import WorkshopCreate, WorkshopResponse

router = APIRouter()


@router.get("/")
def list_workshops(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Workshop)
    total = query.count()
    items = query.order_by(Workshop.workshop_id).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [WorkshopResponse.model_validate(w).model_dump() for w in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_workshop(data: WorkshopCreate, db: Session = Depends(get_db)):
    existing = db.query(Workshop).filter(Workshop.workshop_id == data.workshop_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="车间编号已存在")
    ws = Workshop(**data.model_dump())
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return {"data": WorkshopResponse.model_validate(ws).model_dump()}


@router.put("/{workshop_id}")
def update_workshop(workshop_id: str, data: WorkshopCreate, db: Session = Depends(get_db)):
    ws = db.query(Workshop).filter(Workshop.workshop_id == workshop_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="车间不存在")
    for key, value in data.model_dump().items():
        setattr(ws, key, value)
    db.commit()
    db.refresh(ws)
    return {"data": WorkshopResponse.model_validate(ws).model_dump()}


@router.delete("/{workshop_id}")
def delete_workshop(workshop_id: str, db: Session = Depends(get_db)):
    ws = db.query(Workshop).filter(Workshop.workshop_id == workshop_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="车间不存在")
    db.delete(ws)
    db.commit()
    return {"status": "deleted"}
