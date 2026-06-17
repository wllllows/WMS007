-- 视图1：采购订单执行情况
CREATE OR REPLACE VIEW purchase_order_execution_view AS
SELECT po.purchase_order_id, po.order_time, po.total_quantity, po.unit_price,
  po.total_quantity * po.unit_price AS order_total_amount, po.shipped,
  e.name AS purchaser, ps.paid_amount, ps.unpaid_amount,
  CASE WHEN po.shipped = TRUE AND ps.unpaid_amount = 0 THEN 'completed'
       WHEN po.shipped = TRUE AND ps.unpaid_amount > 0 THEN 'shipped_waiting_payment'
       ELSE 'not_shipped' END AS execution_status,
  DATEDIFF(CURDATE(), DATE(po.order_time)) AS order_days
FROM purchase_order po
JOIN employee e ON po.purchaser_employee_id = e.employee_id
JOIN payment_status ps ON po.payment_id = ps.payment_id;

-- 视图2：外协订单原料明细
CREATE OR REPLACE VIEW outsourcing_order_raw_material_view AS
SELECT oo.outsourcing_order_id, oo.order_status, oo.order_amount, oo.order_date,
  os.supplier_name, os.contact_person, rm.raw_material_id, rm.raw_material_name,
  rm.specification_model, rs.received_amount, rs.unreceived_amount,
  CONCAT(os.supplier_name, ' - ', oo.outsourcing_order_id) AS order_label,
  DATE_FORMAT(oo.order_date, '%Y-%m') AS order_month
FROM outsourcing_order oo
JOIN outsourcing_supplier os ON oo.supplier_id = os.supplier_id
JOIN receipt_status rs ON oo.receipt_id = rs.receipt_id
JOIN outsourcing_order_raw_material oorm ON oo.outsourcing_order_id = oorm.outsourcing_order_id
JOIN raw_material rm ON oorm.raw_material_id = rm.raw_material_id;

-- 视图3：工单资源汇总
CREATE OR REPLACE VIEW work_order_resource_view AS
SELECT wo.work_order_id, wo.work_order_type, wo.start_time, wo.status, wo.issue_date,
  COUNT(DISTINCT woe.employee_id) AS employee_count,
  COUNT(DISTINCT worm.raw_material_id) AS raw_material_type_count,
  COUNT(DISTINCT wofp.finished_product_id) AS finished_product_type_count,
  GROUP_CONCAT(DISTINCT e.name SEPARATOR ',') AS employee_names,
  DATEDIFF(CURDATE(), wo.issue_date) AS days_since_issue
FROM work_order wo
LEFT JOIN work_order_employee woe ON wo.work_order_id = woe.work_order_id
LEFT JOIN employee e ON woe.employee_id = e.employee_id
LEFT JOIN work_order_raw_material worm ON wo.work_order_id = worm.work_order_id
LEFT JOIN work_order_finished_product wofp ON wo.work_order_id = wofp.work_order_id
GROUP BY wo.work_order_id, wo.work_order_type, wo.start_time, wo.status, wo.issue_date;

-- 视图4：仓库物料库存统计
CREATE OR REPLACE VIEW warehouse_material_statistics_view AS
SELECT w.warehouse_id, w.warehouse_location, w.category,
  COUNT(DISTINCT rm.raw_material_id) AS raw_material_type_count,
  COUNT(DISTINCT fp.finished_product_id) AS finished_product_type_count,
  CONCAT(w.warehouse_location, ' (', w.category, ')') AS warehouse_description
FROM warehouse w
LEFT JOIN raw_material rm ON w.warehouse_id = rm.warehouse_id
LEFT JOIN finished_product fp ON w.warehouse_id = fp.warehouse_id
GROUP BY w.warehouse_id, w.warehouse_location, w.category;

-- 视图5：销售订单付款进度
CREATE OR REPLACE VIEW sales_order_payment_view AS
SELECT so.sales_order_id, so.sales_detail, so.total_quantity, so.unit_price,
  so.total_quantity * so.unit_price AS order_total_amount, so.paid_amount,
  so.total_quantity * so.unit_price - so.paid_amount AS unpaid_amount, so.shipped,
  e.name AS salesperson,
  CASE WHEN so.paid_amount >= so.total_quantity * so.unit_price THEN 'paid_off'
       WHEN so.paid_amount > 0 THEN 'partial_paid'
       ELSE 'unpaid' END AS payment_status,
  DATE_FORMAT(so.order_time, '%Y-%m-%d') AS order_date
FROM sales_order so
JOIN employee e ON so.salesperson_employee_id = e.employee_id;

-- 视图6：车间调拨作业统计
CREATE OR REPLACE VIEW workshop_transfer_statistics_view AS
SELECT ws.workshop_id, ws.manager, ws.location,
  COUNT(DISTINCT tr.transfer_order_id) AS transfer_order_count,
  COALESCE(SUM(tr.quantity), 0) AS transfer_total_quantity,
  COUNT(DISTINCT torm.raw_material_id) AS raw_material_type_count,
  AVG(tr.quantity) AS average_transfer_quantity,
  MAX(tr.transfer_date) AS latest_transfer_date
FROM workshop ws
LEFT JOIN transfer_order tr ON ws.workshop_id = tr.workshop_id
LEFT JOIN transfer_order_raw_material torm ON tr.transfer_order_id = torm.transfer_order_id
GROUP BY ws.workshop_id, ws.manager, ws.location;

-- 视图7：员工参与工单绩效
CREATE OR REPLACE VIEW employee_work_order_performance_view AS
SELECT e.employee_id, e.name, e.position,
  COUNT(DISTINCT woe.work_order_id) AS work_order_count,
  COUNT(DISTINCT wo.work_order_type) AS work_order_type_count,
  GROUP_CONCAT(DISTINCT wo.status SEPARATOR ',') AS work_order_status_summary,
  MIN(wo.start_time) AS earliest_start_time,
  MAX(wo.start_time) AS latest_start_time
FROM employee e
LEFT JOIN work_order_employee woe ON e.employee_id = woe.employee_id
LEFT JOIN work_order wo ON woe.work_order_id = wo.work_order_id
GROUP BY e.employee_id, e.name, e.position
HAVING work_order_count > 0;

-- 视图8：原料与外协订单关联
CREATE OR REPLACE VIEW raw_material_outsourcing_view AS
SELECT rm.raw_material_id, rm.raw_material_name, rm.specification_model,
  COUNT(DISTINCT oorm.outsourcing_order_id) AS outsourcing_order_count,
  COUNT(DISTINCT oo.supplier_id) AS supplier_count,
  COALESCE(SUM(oo.order_amount), 0) AS total_outsourcing_amount,
  GROUP_CONCAT(DISTINCT os.supplier_name SEPARATOR ',') AS supplier_names,
  MAX(oo.order_date) AS latest_outsourcing_date
FROM raw_material rm
LEFT JOIN outsourcing_order_raw_material oorm ON rm.raw_material_id = oorm.raw_material_id
LEFT JOIN outsourcing_order oo ON oorm.outsourcing_order_id = oo.outsourcing_order_id
LEFT JOIN outsourcing_supplier os ON oo.supplier_id = os.supplier_id
GROUP BY rm.raw_material_id, rm.raw_material_name, rm.specification_model;

-- 视图9：成品生产工单追溯
CREATE OR REPLACE VIEW finished_product_work_order_trace_view AS
SELECT fp.finished_product_id, fp.finished_product_name, fp.brand_grade,
  COUNT(DISTINCT wofp.work_order_id) AS production_work_order_count,
  GROUP_CONCAT(DISTINCT wo.work_order_type SEPARATOR ',') AS work_order_types,
  GROUP_CONCAT(DISTINCT wo.status SEPARATOR ',') AS work_order_statuses,
  MIN(wo.start_time) AS earliest_production_time,
  MAX(wo.start_time) AS latest_production_time
FROM finished_product fp
LEFT JOIN work_order_finished_product wofp ON fp.finished_product_id = wofp.finished_product_id
LEFT JOIN work_order wo ON wofp.work_order_id = wo.work_order_id
GROUP BY fp.finished_product_id, fp.finished_product_name, fp.brand_grade;

-- 视图10：付款与采购订单汇总
CREATE OR REPLACE VIEW payment_purchase_summary_view AS
SELECT ps.payment_id, ps.paid_amount, ps.unpaid_amount,
  COUNT(po.purchase_order_id) AS related_order_count,
  COALESCE(SUM(po.total_quantity * po.unit_price), 0) AS order_total_amount,
  AVG(po.unit_price) AS average_unit_price,
  MIN(po.order_time) AS earliest_order_time,
  MAX(po.order_time) AS latest_order_time
FROM payment_status ps
LEFT JOIN purchase_order po ON ps.payment_id = po.payment_id
GROUP BY ps.payment_id, ps.paid_amount, ps.unpaid_amount;

-- 视图11：外协厂商订单统计
CREATE OR REPLACE VIEW outsourcing_supplier_order_view AS
SELECT os.supplier_id, os.supplier_name, os.qualification_level,
  COUNT(DISTINCT oo.outsourcing_order_id) AS order_count,
  COALESCE(SUM(oo.order_amount), 0) AS order_total_amount,
  AVG(oo.order_amount) AS average_order_amount,
  MAX(oo.order_date) AS latest_order_date,
  COALESCE(SUM(rs.unreceived_amount), 0) AS total_unreceived_amount
FROM outsourcing_supplier os
LEFT JOIN outsourcing_order oo ON os.supplier_id = oo.supplier_id
LEFT JOIN receipt_status rs ON oo.receipt_id = rs.receipt_id
GROUP BY os.supplier_id, os.supplier_name, os.qualification_level;

-- 视图12：全业务关联总览
CREATE OR REPLACE VIEW all_business_overview_view AS
SELECT 'purchase' AS business_type, po.purchase_order_id AS document_id,
  e.name AS owner_name, po.order_time AS business_time,
  po.total_quantity * po.unit_price AS amount, ps.paid_amount AS settled_amount
FROM purchase_order po
JOIN employee e ON po.purchaser_employee_id = e.employee_id
JOIN payment_status ps ON po.payment_id = ps.payment_id
UNION ALL
SELECT 'sales' AS business_type, so.sales_order_id AS document_id,
  e2.name AS owner_name, so.order_time AS business_time,
  so.total_quantity * so.unit_price AS amount, so.paid_amount AS settled_amount
FROM sales_order so
JOIN employee e2 ON so.salesperson_employee_id = e2.employee_id
UNION ALL
SELECT 'outsourcing' AS business_type, oo.outsourcing_order_id AS document_id,
  os.contact_person AS owner_name, oo.order_date AS business_time,
  oo.order_amount AS amount, rs.received_amount AS settled_amount
FROM outsourcing_order oo
JOIN outsourcing_supplier os ON oo.supplier_id = os.supplier_id
JOIN receipt_status rs ON oo.receipt_id = rs.receipt_id;
