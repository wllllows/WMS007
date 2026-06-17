-- ============================================
-- 仓库管理系统 — 存储过程（补充创建）
-- ============================================
USE production_purchase_sales_management;

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
