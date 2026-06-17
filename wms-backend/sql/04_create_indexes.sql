-- 采购订单
CREATE INDEX idx_po_employee ON purchase_order(purchaser_employee_id);
CREATE INDEX idx_po_payment ON purchase_order(payment_id);
CREATE INDEX idx_po_ship_time ON purchase_order(shipped, order_time);

-- 外协厂商
CREATE INDEX idx_supplier_name ON outsourcing_supplier(supplier_name);
CREATE INDEX idx_supplier_level ON outsourcing_supplier(qualification_level);

-- 外协订单
CREATE INDEX idx_out_vendor ON outsourcing_order(supplier_id);
CREATE INDEX idx_out_receipt ON outsourcing_order(receipt_id);
CREATE INDEX idx_out_status_date ON outsourcing_order(order_status, order_date);

-- 调拨单
CREATE INDEX idx_trans_workshop ON transfer_order(workshop_id);
CREATE INDEX idx_trans_date ON transfer_order(transfer_date);

-- 车间
CREATE INDEX idx_workshop_leader ON workshop(manager);

-- 员工
CREATE INDEX idx_employee_name ON employee(name);
CREATE INDEX idx_employee_position ON employee(position);

-- 工单
CREATE INDEX idx_wo_status_date ON work_order(status, issue_date);
CREATE INDEX idx_wo_type ON work_order(work_order_type);

-- 原料
CREATE INDEX idx_mat_warehouse ON raw_material(warehouse_id);
CREATE INDEX idx_mat_name ON raw_material(raw_material_name);
CREATE INDEX idx_mat_attr ON raw_material(material_attribute);

-- 仓库
CREATE INDEX idx_wh_manager ON warehouse(manager_employee_id);
CREATE INDEX idx_wh_category ON warehouse(category);

-- 成品
CREATE INDEX idx_prod_warehouse ON finished_product(warehouse_id);
CREATE INDEX idx_prod_name ON finished_product(finished_product_name);
CREATE INDEX idx_prod_brand ON finished_product(brand_grade);

-- 销售订单
CREATE INDEX idx_so_employee ON sales_order(salesperson_employee_id);
CREATE INDEX idx_so_pay_time ON sales_order(paid_amount, order_time);
CREATE INDEX idx_so_ship_time ON sales_order(shipped, order_time);

-- 关联表（双向查询）
CREATE INDEX idx_wo_emp_emp ON work_order_employee(employee_id);
CREATE INDEX idx_wo_mat_mat ON work_order_raw_material(raw_material_id);
CREATE INDEX idx_wo_prod_prod ON work_order_finished_product(finished_product_id);
CREATE INDEX idx_out_mat_mat ON outsourcing_order_raw_material(raw_material_id);
CREATE INDEX idx_trans_mat_mat ON transfer_order_raw_material(raw_material_id);
