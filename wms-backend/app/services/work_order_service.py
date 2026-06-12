from sqlalchemy import text
from app.database import SessionLocal


def complete_work_order(work_order_id: str) -> dict:
    db = SessionLocal()
    try:
        db.execute(
            text("CALL sp_complete_work_order(:oid, @p_status_msg)"),
            {"oid": work_order_id}
        )
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
