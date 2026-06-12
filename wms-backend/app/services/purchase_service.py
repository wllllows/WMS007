from sqlalchemy import text
from app.database import SessionLocal


def create_purchase_order(order_no: str, total_qty: int,
                          unit_price: float, employee_id: str) -> dict:
    db = SessionLocal()
    try:
        db.execute(
            text("CALL sp_create_purchase_order(:no, :qty, :price, :emp, @p_result)"),
            {"no": order_no, "qty": total_qty, "price": unit_price, "emp": employee_id}
        )
        db.commit()
        return {"status": "success", "order_id": order_no}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
