from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.basic import Employee
from app.schemas.basic import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter()


@router.get("/")
def list_employees(
    position: str = Query(None),
    keyword: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if position:
        query = query.filter(Employee.position == position)
    if keyword:
        query = query.filter(Employee.name.contains(keyword))
    total = query.count()
    items = query.order_by(Employee.employee_id).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [EmployeeResponse.model_validate(e).model_dump() for e in items],
            "total": total, "page": page, "page_size": page_size}


@router.get("/{employee_id}")
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="员工不存在")
    return {"data": EmployeeResponse.model_validate(emp).model_dump()}


@router.post("/")
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(Employee.employee_id == data.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="员工编号已存在")
    emp = Employee(**data.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return {"data": EmployeeResponse.model_validate(emp).model_dump()}


@router.put("/{employee_id}")
def update_employee(employee_id: str, data: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="员工不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(emp, key, value)
    db.commit()
    db.refresh(emp)
    return {"data": EmployeeResponse.model_validate(emp).model_dump()}


@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="员工不存在")
    db.delete(emp)
    db.commit()
    return {"status": "deleted"}
