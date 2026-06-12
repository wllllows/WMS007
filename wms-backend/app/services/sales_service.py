from sqlalchemy import text
from app.database import SessionLocal


def record_sales_payment(sales_order_id: str, payment_amount: float) -> dict:
    db = SessionLocal()
    try:
        result = db.execute(
            text("CALL sp_record_sales_payment(:oid, :amt, @p_remaining)"),
            {"oid": sales_order_id, "amt": payment_amount}
        )
        db.commit()
        remaining = db.execute(text("SELECT @p_remaining")).scalar()
        return {"status": "success", "remaining": float(remaining) if remaining else 0}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
