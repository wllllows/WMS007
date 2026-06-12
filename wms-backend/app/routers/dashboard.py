from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.database import get_db
from app.models.orders import PurchaseOrder, SalesOrder
from app.models.work_order import WorkOrder

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """仪表盘统计数据"""

    purchase_count = db.query(func.count(PurchaseOrder.purchase_order_id)).scalar()
    sales_count = db.query(func.count(SalesOrder.sales_order_id)).scalar()
    work_in_progress = db.query(func.count(WorkOrder.work_order_id)) \
        .filter(WorkOrder.status != "completed").scalar()

    # 销售收入总额
    total_revenue = db.query(func.sum(SalesOrder.paid_amount)).scalar() or 0

    # 月度采购趋势（近6个月）
    monthly_purchase = db.execute(text("""
        SELECT DATE_FORMAT(order_time, '%Y-%m') AS month,
               COUNT(*) AS count,
               SUM(total_quantity * unit_price) AS amount
        FROM purchase_order
        GROUP BY DATE_FORMAT(order_time, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
    """)).fetchall()

    # 仓库物料分布
    warehouse_dist = db.execute(text("""
        SELECT w.category, COUNT(rm.raw_material_id) AS material_count
        FROM warehouse w
        LEFT JOIN raw_material rm ON w.warehouse_id = rm.warehouse_id
        GROUP BY w.warehouse_id, w.category
    """)).fetchall()

    return {
        "purchase_order_count": purchase_count or 0,
        "sales_order_count": sales_count or 0,
        "work_order_in_progress": work_in_progress or 0,
        "low_stock_alert": 0,
        "total_revenue": float(total_revenue),
        "monthly_purchase": [dict(m._mapping) for m in monthly_purchase],
        "warehouse_distribution": [dict(w._mapping) for w in warehouse_dist]
    }


@router.get("/all-business")
def get_all_business_overview(db: Session = Depends(get_db)):
    """全业务关联总览视图"""
    rows = db.execute(text("SELECT * FROM all_business_overview_view")).fetchall()
    columns = db.execute(text("SHOW COLUMNS FROM all_business_overview_view")).fetchall()
    col_names = [c[0] for c in columns]
    return {"data": [dict(zip(col_names, row)) for row in rows]}
