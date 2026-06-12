from sqlalchemy import text
from app.database import SessionLocal


def transfer_material(transfer_id: str, unit: str, location: str,
                      qty: int, workshop_id: str, material_id: str) -> dict:
    db = SessionLocal()
    try:
        db.execute(
            text("CALL sp_transfer_material(:tid, :unit, :loc, :qty, :wid, :mid, @p_result)"),
            {"tid": transfer_id, "unit": unit, "loc": location,
             "qty": qty, "wid": workshop_id, "mid": material_id}
        )
        db.commit()
        return {"status": "success", "transfer_id": transfer_id}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
