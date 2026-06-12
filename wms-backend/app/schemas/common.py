from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    page_size: int


class DashboardStats(BaseModel):
    purchase_order_count: int = 0
    sales_order_count: int = 0
    work_order_in_progress: int = 0
    low_stock_alert: int = 0
    total_revenue: float = 0.0
    monthly_purchase: List[dict] = []
    warehouse_distribution: List[dict] = []
