from sqlalchemy import text
from app.database import SessionLocal


def check_data_integrity() -> str:
    db = SessionLocal()
    try:
        db.execute(text("CALL sp_check_data_integrity(@p_report)"))
        db.commit()
        result = db.execute(text("SELECT @p_report")).scalar()
        return result or ""
    finally:
        db.close()
