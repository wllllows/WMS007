USE production_purchase_sales_management;

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
