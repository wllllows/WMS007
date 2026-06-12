export interface Employee { employee_id: string; name: string; position: string; contact_phone: string; }
export interface RawMaterial { raw_material_id: string; raw_material_name: string; specification_model: string; material_attribute: string; warehouse_id: string; }
export interface Warehouse { warehouse_id: string; warehouse_location: string; manager_employee_id: string; contact_phone: string; area: number; category: string; }
export interface Workshop { workshop_id: string; manager: string; location: string; contact_phone: string; }
export interface OutsourcingSupplier { supplier_id: string; supplier_name: string; contact_person: string; contact_phone: string; qualification_level: string; address: string; }
export interface PurchaseOrder { purchase_order_id: string; total_quantity: number; order_time: string; shipped: boolean; unit_price: number; purchaser_employee_id: string; payment_id: string; }
export interface SalesOrder { sales_order_id: string; sales_detail: string; total_quantity: number; order_time: string; paid_amount: number; shipped: boolean; unit_price: number; salesperson_employee_id: string; }
export interface WorkOrder { work_order_id: string; work_order_type: string; start_time: string; status: string; issue_date: string; consumables?: string; }
export interface OutsourcingOrder { outsourcing_order_id: string; order_status: string; order_amount: number; order_date: string; supplier_id: string; receipt_id: string; }
export interface TransferOrder { transfer_order_id: string; transfer_unit: string; transfer_date: string; location: string; quantity: number; workshop_id: string; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; page_size: number; }
