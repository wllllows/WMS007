from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.basic import RawMaterial
from app.schemas.basic import RawMaterialCreate, RawMaterialUpdate, RawMaterialResponse

router = APIRouter()


@router.get("/")
def list_materials(
    keyword: str = Query(None),
    warehouse_id: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(RawMaterial)
    if keyword:
        query = query.filter(
            RawMaterial.raw_material_name.contains(keyword) |
            RawMaterial.specification_model.contains(keyword)
        )
    if warehouse_id:
        query = query.filter(RawMaterial.warehouse_id == warehouse_id)
    total = query.count()
    items = query.order_by(RawMaterial.raw_material_id).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [RawMaterialResponse.model_validate(m).model_dump() for m in items],
            "total": total, "page": page, "page_size": page_size}


@router.post("/")
def create_material(data: RawMaterialCreate, db: Session = Depends(get_db)):
    existing = db.query(RawMaterial).filter(RawMaterial.raw_material_id == data.raw_material_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="物料编号已存在")
    mat = RawMaterial(**data.model_dump())
    db.add(mat)
    db.commit()
    db.refresh(mat)
    return {"data": RawMaterialResponse.model_validate(mat).model_dump()}


@router.put("/{material_id}")
def update_material(material_id: str, data: RawMaterialUpdate, db: Session = Depends(get_db)):
    mat = db.query(RawMaterial).filter(RawMaterial.raw_material_id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="物料不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(mat, key, value)
    db.commit()
    db.refresh(mat)
    return {"data": RawMaterialResponse.model_validate(mat).model_dump()}


@router.delete("/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(RawMaterial).filter(RawMaterial.raw_material_id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="物料不存在")
    db.delete(mat)
    db.commit()
    return {"status": "deleted"}
