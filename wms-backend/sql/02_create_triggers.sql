-- ============================================
-- 仓库管理系统 — 12个触发器
-- ============================================
USE production_purchase_sales_management;

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
