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
