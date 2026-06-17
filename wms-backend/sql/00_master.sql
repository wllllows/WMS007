-- ============================================
-- 仓库管理系统 完整数据库脚本
-- 按顺序执行：建库 → 建表 → 索引 → 视图 → 触发器 → 存储过程
-- 执行方式：mysql -u root -p123456 < 00_master.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS production_purchase_sales_management
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE production_purchase_sales_management;


-- ========================================
-- 01_create_tables.sql
-- ========================================

-- 1. employee
CREATE TABLE employee (
  employee_id VARCHAR(30) NOT NULL,
  name VARCHAR(50) NOT NULL,
  position VARCHAR(50) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  PRIMARY KEY (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. payment_status
CREATE TABLE payment_status (
  payment_id VARCHAR(30) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  unpaid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (payment_id),
  CHECK (paid_amount >= 0),
  CHECK (unpaid_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. receipt_status
CREATE TABLE receipt_status (
  receipt_id VARCHAR(30) NOT NULL,
  received_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  unreceived_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (receipt_id),
  CHECK (received_amount >= 0),
  CHECK (unreceived_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. outsourcing_supplier
CREATE TABLE outsourcing_supplier (
  supplier_id VARCHAR(30) NOT NULL,
  supplier_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(50) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  qualification_level VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. workshop
CREATE TABLE workshop (
  workshop_id VARCHAR(30) NOT NULL,
  manager VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  PRIMARY KEY (workshop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. warehouse
CREATE TABLE warehouse (
  warehouse_id VARCHAR(30) NOT NULL,
  warehouse_location VARCHAR(255) NOT NULL,
  manager_employee_id VARCHAR(30) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  PRIMARY KEY (warehouse_id),
  CONSTRAINT fk_warehouse_manager FOREIGN KEY (manager_employee_id) REFERENCES employee (employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (area > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. purchase_order
CREATE TABLE purchase_order (
  purchase_order_id VARCHAR(30) NOT NULL,
  total_quantity INT UNSIGNED NOT NULL,
  order_time DATETIME NOT NULL,
  shipped BOOLEAN NOT NULL DEFAULT FALSE,
  unit_price DECIMAL(12,2) NOT NULL,
  purchaser_employee_id VARCHAR(30) NOT NULL,
  payment_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (purchase_order_id),
  CONSTRAINT fk_purchase_order_purchaser FOREIGN KEY (purchaser_employee_id) REFERENCES employee (employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_purchase_order_payment FOREIGN KEY (payment_id) REFERENCES payment_status (payment_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. outsourcing_order
CREATE TABLE outsourcing_order (
  outsourcing_order_id VARCHAR(30) NOT NULL,
  order_status VARCHAR(50) NOT NULL,
  order_amount DECIMAL(12,2) NOT NULL,
  order_date DATE NOT NULL,
  supplier_id VARCHAR(30) NOT NULL,
  receipt_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (outsourcing_order_id),
  CONSTRAINT fk_outsourcing_order_supplier FOREIGN KEY (supplier_id) REFERENCES outsourcing_supplier (supplier_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_outsourcing_order_receipt FOREIGN KEY (receipt_id) REFERENCES receipt_status (receipt_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (order_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. transfer_order
CREATE TABLE transfer_order (
  transfer_order_id VARCHAR(30) NOT NULL,
  transfer_unit VARCHAR(100) NOT NULL,
  transfer_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  workshop_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (transfer_order_id),
  CONSTRAINT fk_transfer_order_workshop FOREIGN KEY (workshop_id) REFERENCES workshop (workshop_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. work_order
CREATE TABLE work_order (
  work_order_id VARCHAR(30) NOT NULL,
  work_order_type VARCHAR(50) NOT NULL,
  start_time DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL,
  consumables TEXT,
  PRIMARY KEY (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. raw_material
CREATE TABLE raw_material (
  raw_material_id VARCHAR(30) NOT NULL,
  raw_material_name VARCHAR(100) NOT NULL,
  specification_model VARCHAR(100) NOT NULL,
  material_attribute VARCHAR(255) NOT NULL,
  warehouse_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (raw_material_id),
  CONSTRAINT fk_raw_material_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. finished_product
CREATE TABLE finished_product (
  finished_product_id VARCHAR(30) NOT NULL,
  finished_product_name VARCHAR(100) NOT NULL,
  product_attribute VARCHAR(255) NOT NULL,
  brand_grade VARCHAR(50) NOT NULL,
  warehouse_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (finished_product_id),
  CONSTRAINT fk_finished_product_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse (warehouse_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. sales_order
CREATE TABLE sales_order (
  sales_order_id VARCHAR(30) NOT NULL,
  sales_detail TEXT NOT NULL,
  total_quantity INT UNSIGNED NOT NULL,
  order_time DATETIME NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  shipped BOOLEAN NOT NULL DEFAULT FALSE,
  unit_price DECIMAL(12,2) NOT NULL,
  salesperson_employee_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (sales_order_id),
  CONSTRAINT fk_sales_order_salesperson FOREIGN KEY (salesperson_employee_id) REFERENCES employee (employee_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (paid_amount >= 0),
  CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. work_order_employee
CREATE TABLE work_order_employee (
  employee_id VARCHAR(30) NOT NULL,
  work_order_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (employee_id, work_order_id),
  CONSTRAINT fk_woe_employee FOREIGN KEY (employee_id) REFERENCES employee (employee_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_woe_work_order FOREIGN KEY (work_order_id) REFERENCES work_order (work_order_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. work_order_raw_material
CREATE TABLE work_order_raw_material (
  work_order_id VARCHAR(30) NOT NULL,
  raw_material_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (work_order_id, raw_material_id),
  CONSTRAINT fk_worm_work_order FOREIGN KEY (work_order_id) REFERENCES work_order (work_order_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_worm_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_material (raw_material_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. work_order_finished_product
CREATE TABLE work_order_finished_product (
  work_order_id VARCHAR(30) NOT NULL,
  finished_product_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (work_order_id, finished_product_id),
  CONSTRAINT fk_wofp_work_order FOREIGN KEY (work_order_id) REFERENCES work_order (work_order_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_wofp_finished_product FOREIGN KEY (finished_product_id) REFERENCES finished_product (finished_product_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. outsourcing_order_raw_material
CREATE TABLE outsourcing_order_raw_material (
  outsourcing_order_id VARCHAR(30) NOT NULL,
  raw_material_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (outsourcing_order_id, raw_material_id),
  CONSTRAINT fk_oorm_order FOREIGN KEY (outsourcing_order_id) REFERENCES outsourcing_order (outsourcing_order_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_oorm_material FOREIGN KEY (raw_material_id) REFERENCES raw_material (raw_material_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. transfer_order_raw_material
CREATE TABLE transfer_order_raw_material (
  transfer_order_id VARCHAR(30) NOT NULL,
  raw_material_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (transfer_order_id, raw_material_id),
  CONSTRAINT fk_torm_transfer FOREIGN KEY (transfer_order_id) REFERENCES transfer_order (transfer_order_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_torm_material FOREIGN KEY (raw_material_id) REFERENCES raw_material (raw_material_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. work_order_log
CREATE TABLE work_order_log (
  log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id VARCHAR(30) NOT NULL,
  operation VARCHAR(50) NOT NULL,
  operation_time DATETIME NOT NULL,
  PRIMARY KEY (log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. work_order_delete_backup
CREATE TABLE work_order_delete_backup (
  backup_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id VARCHAR(30) NOT NULL,
  work_order_type VARCHAR(50) NOT NULL,
  start_time DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  deleted_time DATETIME NOT NULL,
  PRIMARY KEY (backup_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. transfer_order_delete_log
CREATE TABLE transfer_order_delete_log (
  log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transfer_order_id VARCHAR(30) NOT NULL,
  transfer_unit VARCHAR(100) NOT NULL,
  deleted_time DATETIME NOT NULL,
  PRIMARY KEY (log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. material_migration_log
CREATE TABLE material_migration_log (
  log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  raw_material_id VARCHAR(30) NOT NULL,
  old_warehouse_id VARCHAR(30) NOT NULL,
  new_warehouse_id VARCHAR(30) NOT NULL,
  migration_time DATETIME NOT NULL,
  PRIMARY KEY (log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 04_create_indexes.sql
-- ========================================
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

-- ========================================
-- 05_create_views.sql
-- ========================================
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

-- ========================================
-- 02_create_triggers.sql
-- ========================================
-- 仓库管理系统 — 12个触发器

-- 触发器1: 采购订单插入后自动更新付款情况总金额
DELIMITER $$
CREATE TRIGGER trg_purchase_order_after_insert
AFTER INSERT ON purchase_order
FOR EACH ROW
BEGIN
    UPDATE payment_status
    SET unpaid_amount = unpaid_amount + NEW.total_quantity * NEW.unit_price
    WHERE payment_id = NEW.payment_id;
END$$
DELIMITER ;

-- 触发器2: 工单删除前备份主表记录
DELIMITER $$
CREATE TRIGGER trg_work_order_before_delete
BEFORE DELETE ON work_order
FOR EACH ROW
BEGIN
    INSERT INTO work_order_delete_backup
      (work_order_id, work_order_type, start_time, status, deleted_time)
    VALUES
      (OLD.work_order_id, OLD.work_order_type, OLD.start_time, OLD.status, NOW());
END$$
DELIMITER ;

-- 触发器3: 销售订单更新时校验付款金额不能超过订单总额
DELIMITER $$
CREATE TRIGGER trg_sales_order_before_update
BEFORE UPDATE ON sales_order
FOR EACH ROW
BEGIN
    IF NEW.paid_amount > NEW.total_quantity * NEW.unit_price THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '付款金额不能超过订单总额';
    END IF;
END$$
DELIMITER ;

-- 触发器4: 外协订单原料插入时校验厂商资质和订单状态
DELIMITER $$
CREATE TRIGGER trg_outsourcing_material_before_insert
BEFORE INSERT ON outsourcing_order_raw_material
FOR EACH ROW
BEGIN
    DECLARE v_grade VARCHAR(50);
    DECLARE v_status VARCHAR(50);

    SELECT os.qualification_level, oo.order_status
    INTO v_grade, v_status
    FROM outsourcing_order oo
    JOIN outsourcing_supplier os ON oo.supplier_id = os.supplier_id
    WHERE oo.outsourcing_order_id = NEW.outsourcing_order_id;

    IF v_grade = 'C' OR v_grade = 'C级' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'C级厂商不能添加原料关联';
    END IF;

    IF v_status IN ('completed', 'settled') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '已完成或已结算的外协订单不能添加原料关联';
    END IF;
END$$
DELIMITER ;

-- 触发器5: 调拨单删除时自动解除原料关联并记录日志
DELIMITER $$
CREATE TRIGGER trg_transfer_before_delete
BEFORE DELETE ON transfer_order
FOR EACH ROW
BEGIN
    DELETE FROM transfer_order_raw_material
    WHERE transfer_order_id = OLD.transfer_order_id;

    INSERT INTO transfer_order_delete_log
      (transfer_order_id, transfer_unit, deleted_time)
    VALUES
      (OLD.transfer_order_id, OLD.transfer_unit, NOW());
END$$
DELIMITER ;

-- 触发器6: 成品更新时同步修改关联工单耗材说明
DELIMITER $$
CREATE TRIGGER trg_product_after_update
AFTER UPDATE ON finished_product
FOR EACH ROW
BEGIN
    UPDATE work_order wo
    JOIN work_order_finished_product wofp ON wo.work_order_id = wofp.work_order_id
    SET wo.consumables = CONCAT(IFNULL(wo.consumables, ''), ' 成品已更新: ', NEW.finished_product_name)
    WHERE wofp.finished_product_id = NEW.finished_product_id;
END$$
DELIMITER ;

-- 触发器7: 员工删除前检查是否有关联业务
DELIMITER $$
CREATE TRIGGER trg_employee_before_delete
BEFORE DELETE ON employee
FOR EACH ROW
BEGIN
    DECLARE v_count INT;

    SELECT
      (SELECT COUNT(*) FROM purchase_order WHERE purchaser_employee_id = OLD.employee_id) +
      (SELECT COUNT(*) FROM sales_order WHERE salesperson_employee_id = OLD.employee_id) +
      (SELECT COUNT(*) FROM warehouse WHERE manager_employee_id = OLD.employee_id)
    INTO v_count;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '该员工有关联业务记录，无法删除';
    END IF;
END$$
DELIMITER ;

-- 触发器8: 外协订单更新时校验状态和金额
DELIMITER $$
CREATE TRIGGER trg_outsourcing_order_before_update
BEFORE UPDATE ON outsourcing_order
FOR EACH ROW
BEGIN
    IF NEW.order_amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '订单金额不能为负数';
    END IF;

    IF OLD.order_status IN ('completed', 'settled') AND NEW.order_status NOT IN ('completed', 'settled') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '已完成的外协订单状态不能回退';
    END IF;
END$$
DELIMITER ;

-- 触发器9: 仓库删除时检查是否有原料或成品依赖
DELIMITER $$
CREATE TRIGGER trg_warehouse_before_delete
BEFORE DELETE ON warehouse
FOR EACH ROW
BEGIN
    DECLARE v_count INT;

    SELECT
      (SELECT COUNT(*) FROM raw_material WHERE warehouse_id = OLD.warehouse_id) +
      (SELECT COUNT(*) FROM finished_product WHERE warehouse_id = OLD.warehouse_id)
    INTO v_count;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '仓库内仍有物料或成品，无法删除';
    END IF;
END$$
DELIMITER ;

-- 触发器10: 收款情况更新时自动同步外协订单状态
DELIMITER $$
CREATE TRIGGER trg_receipt_after_update
AFTER UPDATE ON receipt_status
FOR EACH ROW
BEGIN
    IF NEW.unreceived_amount = 0 AND OLD.unreceived_amount > 0 THEN
        UPDATE outsourcing_order
        SET order_status = 'settled'
        WHERE receipt_id = NEW.receipt_id;
    END IF;
END$$
DELIMITER ;

-- 触发器11: 原料仓库变更时记录迁移日志
DELIMITER $$
CREATE TRIGGER trg_material_before_update
BEFORE UPDATE ON raw_material
FOR EACH ROW
BEGIN
    IF OLD.warehouse_id <> NEW.warehouse_id THEN
        INSERT INTO material_migration_log
          (raw_material_id, old_warehouse_id, new_warehouse_id, migration_time)
        VALUES
          (OLD.raw_material_id, OLD.warehouse_id, NEW.warehouse_id, NOW());
    END IF;
END$$
DELIMITER ;

-- 触发器12: 销售订单发货后自动记录发货时间
DELIMITER $$
CREATE TRIGGER trg_sales_order_before_update_ship
BEFORE UPDATE ON sales_order
FOR EACH ROW
BEGIN
    IF NEW.shipped = TRUE AND OLD.shipped = FALSE THEN
        SET NEW.sales_detail = CONCAT(IFNULL(NEW.sales_detail, ''), ' | 发货时间: ', NOW());
    END IF;
END$$
DELIMITER ;

-- ========================================
-- 03_create_procedures.sql
-- ========================================
-- 仓库管理系统 — 存储过程（补充创建）

-- SP1: 新增采购订单并自动创建付款单
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_create_purchase_order(
    IN p_order_no VARCHAR(30),
    IN p_total_qty INT UNSIGNED,
    IN p_unit_price DECIMAL(12,2),
    IN p_employee_id VARCHAR(30),
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_payment_id VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'failed';
    END;
    START TRANSACTION;
    SET v_payment_id = CONCAT('PAY', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), LPAD(FLOOR(RAND() * 1000), 3, '0'));
    INSERT INTO payment_status (payment_id, paid_amount, unpaid_amount) VALUES (v_payment_id, 0.00, 0.00);
    INSERT INTO purchase_order (purchase_order_id, total_quantity, order_time, shipped, unit_price, purchaser_employee_id, payment_id)
    VALUES (p_order_no, p_total_qty, NOW(), FALSE, p_unit_price, p_employee_id, v_payment_id);
    SET p_result = CONCAT('success, payment_id: ', v_payment_id);
    COMMIT;
END$$
DELIMITER ;

-- SP2: 工单完工自动更新状态 + 记录日志
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_complete_work_order(
    IN p_work_order_id VARCHAR(30),
    OUT p_status_msg VARCHAR(100)
)
BEGIN
    DECLARE v_current_status VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_msg = 'failed: transaction rolled back';
    END;

    START TRANSACTION;
    SELECT status INTO v_current_status
    FROM work_order
    WHERE work_order_id = p_work_order_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '工单不存在';
    ELSEIF v_current_status = 'completed' THEN
        SET p_status_msg = '工单已处于完工状态';
        ROLLBACK;
    ELSE
        UPDATE work_order
        SET status = 'completed',
            consumables = CONCAT(IFNULL(consumables, ''), ' 完工时间: ', NOW())
        WHERE work_order_id = p_work_order_id;

        INSERT INTO work_order_log (work_order_id, operation, operation_time)
        VALUES (p_work_order_id, 'completed', NOW());

        SET p_status_msg = '工单已完工';
        COMMIT;
    END IF;
END$$
DELIMITER ;

-- SP3: 原料调拨处理
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_transfer_material(
    IN p_transfer_id VARCHAR(30),
    IN p_unit VARCHAR(100),
    IN p_location VARCHAR(255),
    IN p_qty INT UNSIGNED,
    IN p_workshop_id VARCHAR(30),
    IN p_material_id VARCHAR(30),
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'transfer failed';
    END;

    START TRANSACTION;
    INSERT INTO transfer_order
      (transfer_order_id, transfer_unit, transfer_date, location, quantity, workshop_id)
    VALUES
      (p_transfer_id, p_unit, CURDATE(), p_location, p_qty, p_workshop_id);

    INSERT INTO transfer_order_raw_material (transfer_order_id, raw_material_id)
    VALUES (p_transfer_id, p_material_id);

    SET p_result = CONCAT('transfer order ', p_transfer_id, ' created');
    COMMIT;
END$$
DELIMITER ;

-- SP4: 销售订单付款登记
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_record_sales_payment(
    IN p_sales_order_id VARCHAR(30),
    IN p_payment_amount DECIMAL(12,2),
    OUT p_remaining DECIMAL(12,2)
)
BEGIN
    DECLARE v_total DECIMAL(12,2);
    DECLARE v_paid DECIMAL(12,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_remaining = NULL;
    END;

    START TRANSACTION;
    SELECT total_quantity * unit_price, paid_amount
    INTO v_total, v_paid
    FROM sales_order
    WHERE sales_order_id = p_sales_order_id
    FOR UPDATE;

    IF v_total IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '销售订单不存在';
    ELSEIF p_payment_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '付款金额必须大于零';
    ELSEIF v_paid + p_payment_amount > v_total THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '付款金额超过订单总额';
    ELSE
        UPDATE sales_order
        SET paid_amount = v_paid + p_payment_amount
        WHERE sales_order_id = p_sales_order_id;

        SET p_remaining = v_total - (v_paid + p_payment_amount);
        COMMIT;
    END IF;
END$$
DELIMITER ;

-- SP5: 外协订单完成并结算
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_finish_outsourcing_order(
    IN p_outsourcing_order_id VARCHAR(30),
    IN p_final_amount DECIMAL(12,2),
    OUT p_status VARCHAR(100)
)
BEGIN
    DECLARE v_receipt_id VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'failed: transaction rolled back';
    END;

    START TRANSACTION;
    SELECT receipt_id INTO v_receipt_id
    FROM outsourcing_order
    WHERE outsourcing_order_id = p_outsourcing_order_id
    FOR UPDATE;

    IF v_receipt_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '外协订单不存在';
    END IF;

    UPDATE outsourcing_order
    SET order_amount = p_final_amount,
        order_status = 'completed'
    WHERE outsourcing_order_id = p_outsourcing_order_id;

    UPDATE receipt_status
    SET received_amount = p_final_amount,
        unreceived_amount = 0
    WHERE receipt_id = v_receipt_id;

    SET p_status = '外协订单已完成并结算';
    COMMIT;
END$$
DELIMITER ;

-- SP6: 生成外协厂商对账单
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_supplier_statement(
    IN p_supplier_id VARCHAR(30),
    OUT p_statement TEXT
)
BEGIN
    DECLARE v_order_total INT;
    DECLARE v_amount_total DECIMAL(12,2);
    DECLARE v_unreceived DECIMAL(12,2);

    SELECT COUNT(*), COALESCE(SUM(oo.order_amount), 0), COALESCE(SUM(rs.unreceived_amount), 0)
    INTO v_order_total, v_amount_total, v_unreceived
    FROM outsourcing_order oo
    JOIN receipt_status rs ON oo.receipt_id = rs.receipt_id
    WHERE oo.supplier_id = p_supplier_id;

    SET p_statement = CONCAT(
        'supplier_id: ', p_supplier_id, '\n',
        'order_total: ', IFNULL(v_order_total, 0), '\n',
        'amount_total: ', IFNULL(v_amount_total, 0), '\n',
        'unreceived_amount: ', IFNULL(v_unreceived, 0), '\n',
        'statement_date: ', CURDATE()
    );
END$$
DELIMITER ;

-- SP7: 系统数据完整性检查
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_check_data_integrity(
    OUT p_integrity_report TEXT
)
BEGIN
    DECLARE v_orphan_count INT;
    SET p_integrity_report = '';

    SELECT COUNT(*) INTO v_orphan_count
    FROM work_order_employee woe
    LEFT JOIN work_order wo ON woe.work_order_id = wo.work_order_id
    WHERE wo.work_order_id IS NULL;
    SET p_integrity_report = CONCAT(p_integrity_report, '工单-员工 孤儿记录: ', v_orphan_count, '\n');

    SELECT COUNT(*) INTO v_orphan_count
    FROM work_order_raw_material worm
    LEFT JOIN raw_material rm ON worm.raw_material_id = rm.raw_material_id
    WHERE rm.raw_material_id IS NULL;
    SET p_integrity_report = CONCAT(p_integrity_report, '工单-原料 孤儿记录: ', v_orphan_count, '\n');

    SELECT COUNT(*) INTO v_orphan_count
    FROM outsourcing_order_raw_material oorm
    LEFT JOIN outsourcing_order oo ON oorm.outsourcing_order_id = oo.outsourcing_order_id
    WHERE oo.outsourcing_order_id IS NULL;
    SET p_integrity_report = CONCAT(p_integrity_report, '外协-原料 孤儿记录: ', v_orphan_count, '\n');

    SET p_integrity_report = CONCAT(p_integrity_report, '检查时间: ', NOW());
END$$
DELIMITER ;

-- ========================================
-- 06_create_remaining_sp.sql
-- ========================================
-- 剩余的5个存储过程（文档12个，之前已创建7个）

-- SP6: 批量删除过期工单
DELIMITER $$
CREATE PROCEDURE sp_delete_expired_workorders(IN p_days_threshold INT, OUT p_deleted_count INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_deleted_count = -1; END;
    START TRANSACTION;
    DELETE FROM work_order WHERE status = 'completed' AND start_time < DATE_SUB(NOW(), INTERVAL p_days_threshold DAY);
    SET p_deleted_count = ROW_COUNT();
    COMMIT;
END$$
DELIMITER ;

-- SP7: 车间生产统计报表
DELIMITER $$
CREATE PROCEDURE sp_workshop_production_report(IN p_workshop_id VARCHAR(30), OUT p_report_text TEXT)
BEGIN
    DECLARE v_order_count INT DEFAULT 0;
    DECLARE v_total_materials INT DEFAULT 0;
    DECLARE v_total_products INT DEFAULT 0;
    SELECT COUNT(DISTINCT wo.work_order_id), COUNT(DISTINCT worm.raw_material_id), COUNT(DISTINCT wofp.finished_product_id)
    INTO v_order_count, v_total_materials, v_total_products
    FROM transfer_order tr
    JOIN transfer_order_raw_material torm ON tr.transfer_order_id = torm.transfer_order_id
    JOIN work_order_raw_material worm ON torm.raw_material_id = worm.raw_material_id
    JOIN work_order wo ON worm.work_order_id = wo.work_order_id
    LEFT JOIN work_order_finished_product wofp ON wo.work_order_id = wofp.work_order_id
    WHERE tr.workshop_id = p_workshop_id;
    SET p_report_text = CONCAT('workshop_id: ', p_workshop_id, '\n', 'work_order_count: ', IFNULL(v_order_count,0), '\n',
        'raw_material_type_count: ', IFNULL(v_total_materials,0), '\n', 'finished_product_type_count: ', IFNULL(v_total_products,0), '\n', 'report_time: ', NOW());
END$$
DELIMITER ;

-- SP8: 复制采购订单
DELIMITER $$
CREATE PROCEDURE sp_copy_purchase_order(IN p_source_order_id VARCHAR(30), IN p_new_order_id VARCHAR(30), OUT p_result VARCHAR(100))
BEGIN
    DECLARE v_total_qty INT UNSIGNED;
    DECLARE v_unit_price DECIMAL(12,2);
    DECLARE v_employee_id VARCHAR(30);
    SELECT total_quantity, unit_price, purchaser_employee_id INTO v_total_qty, v_unit_price, v_employee_id
    FROM purchase_order WHERE purchase_order_id = p_source_order_id;
    IF v_total_qty IS NULL THEN SET p_result = 'source purchase order not found';
    ELSE CALL sp_create_purchase_order(p_new_order_id, v_total_qty, v_unit_price, v_employee_id, p_result);
    END IF;
END$$
DELIMITER ;

-- SP9: 原料与外协订单关联汇总
DELIMITER $$
CREATE PROCEDURE sp_material_outsourcing_summary(IN p_material_id VARCHAR(30), OUT p_summary VARCHAR(500))
BEGIN
    DECLARE v_order_count INT;
    DECLARE v_total_amount DECIMAL(12,2);
    DECLARE v_last_date DATE;
    SELECT COUNT(DISTINCT oorm.outsourcing_order_id), SUM(oo.order_amount), MAX(oo.order_date)
    INTO v_order_count, v_total_amount, v_last_date
    FROM outsourcing_order_raw_material oorm
    JOIN outsourcing_order oo ON oorm.outsourcing_order_id = oo.outsourcing_order_id
    WHERE oorm.raw_material_id = p_material_id;
    SET p_summary = CONCAT('raw_material_id: ', p_material_id, ', outsourcing_order_count: ', IFNULL(v_order_count,0),
        ', total_amount: ', IFNULL(v_total_amount,0), ', latest_date: ', IFNULL(v_last_date,'none'));
END$$
DELIMITER ;

-- SP10: 批量更新员工联系方式
DELIMITER $$
CREATE PROCEDURE sp_update_employee_contact(IN p_old_phone VARCHAR(30), IN p_new_phone VARCHAR(30), OUT p_updated_count INT)
BEGIN
    START TRANSACTION;
    UPDATE employee SET contact_phone = p_new_phone WHERE contact_phone = p_old_phone;
    SET p_updated_count = ROW_COUNT();
    COMMIT;
END$$
DELIMITER ;
