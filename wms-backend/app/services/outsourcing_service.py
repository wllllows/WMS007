from sqlalchemy import text
from app.database import SessionLocal


def finish_outsourcing_order(outsourcing_order_id: str, final_amount: float) -> dict:
    db = SessionLocal()
    try:
        db.execute(
            text("CALL sp_finish_outsourcing_order(:oid, :amt, @p_status)"),
            {"oid": outsourcing_order_id, "amt": final_amount}
        )
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()


def supplier_statement(supplier_id: str) -> str:
    db = SessionLocal()
    try:
        db.execute(
            text("CALL sp_supplier_statement(:sid, @p_statement)"),
            {"sid": supplier_id}
        )
        db.commit()
        result = db.execute(text("SELECT @p_statement")).scalar()
        return result or ""
    finally:
        db.close()
