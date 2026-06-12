from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.basic import RawMaterial, FinishedProduct, Warehouse

router = APIRouter()


@router.get("/query")
def query_inventory(
    warehouse_id: str = Query(None),
    keyword: str = Query(None),
    db: Session = Depends(get_db)
):
    """多条件库存查询"""
    # 原料查询
    mat_query = db.query(
        RawMaterial.raw_material_id.label("id"),
        RawMaterial.raw_material_name.label("name"),
        RawMaterial.specification_model.label("spec"),
        RawMaterial.material_attribute.label("attr"),
        RawMaterial.warehouse_id,
        Warehouse.warehouse_location.label("warehouse_name")
    ).join(Warehouse, RawMaterial.warehouse_id == Warehouse.warehouse_id)

    if warehouse_id:
        mat_query = mat_query.filter(RawMaterial.warehouse_id == warehouse_id)
    if keyword:
        mat_query = mat_query.filter(RawMaterial.raw_material_name.contains(keyword))

    materials = mat_query.all()

    # 成品查询
    prod_query = db.query(
        FinishedProduct.finished_product_id.label("id"),
        FinishedProduct.finished_product_name.label("name"),
        FinishedProduct.product_attribute.label("spec"),
        FinishedProduct.brand_grade.label("attr"),
        FinishedProduct.warehouse_id,
        Warehouse.warehouse_location.label("warehouse_name")
    ).join(Warehouse, FinishedProduct.warehouse_id == Warehouse.warehouse_id)

    if warehouse_id:
        prod_query = prod_query.filter(FinishedProduct.warehouse_id == warehouse_id)
    if keyword:
        prod_query = prod_query.filter(FinishedProduct.finished_product_name.contains(keyword))

    products = prod_query.all()

    return {
        "materials": [dict(m._mapping) for m in materials],
        "products": [dict(p._mapping) for p in products]
    }


@router.get("/warehouse-stats")
def get_warehouse_stats(db: Session = Depends(get_db)):
    """仓库物料库存统计视图"""
    rows = db.execute(text("SELECT * FROM warehouse_material_statistics_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM warehouse_material_statistics_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
