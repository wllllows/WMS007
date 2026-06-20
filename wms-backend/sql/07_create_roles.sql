-- 仓库管理系统 —
USE production_purchase_sales_management;

-- 1. 创建角色
CREATE ROLE IF NOT EXISTS 'role_admin';
CREATE ROLE IF NOT EXISTS 'role_operator';
CREATE ROLE IF NOT EXISTS 'role_analyst';
CREATE ROLE IF NOT EXISTS 'role_auditor';

-- 2. 角色授权

-- admin: 全部权限（含授权能力）
GRANT ALL PRIVILEGES ON production_purchase_sales_management.* TO 'role_admin'@'%' WITH GRANT OPTION;

-- operator: 增删改查 + 执行全部 12 个存储过程
GRANT SELECT, INSERT, UPDATE, DELETE ON production_purchase_sales_management.* TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_create_purchase_order TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_complete_work_order TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_transfer_material TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_record_sales_payment TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_finish_outsourcing_order TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_supplier_statement TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_check_data_integrity TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_copy_purchase_order TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_delete_expired_workorders TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_update_employee_contact TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_material_outsourcing_summary TO 'role_operator'@'%';
GRANT EXECUTE ON PROCEDURE production_purchase_sales_management.sp_workshop_production_report TO 'role_operator'@'%';

-- analyst: 全部表只读
GRANT SELECT ON production_purchase_sales_management.* TO 'role_analyst'@'%';

-- auditor: 只能查 4 张日志表
GRANT SELECT ON production_purchase_sales_management.work_order_log TO 'role_auditor'@'%';
GRANT SELECT ON production_purchase_sales_management.work_order_delete_backup TO 'role_auditor'@'%';
GRANT SELECT ON production_purchase_sales_management.transfer_order_delete_log TO 'role_auditor'@'%';
GRANT SELECT ON production_purchase_sales_management.material_migration_log TO 'role_auditor'@'%';

-- 3. 创建用户
CREATE USER IF NOT EXISTS 'admin'@'localhost'   IDENTIFIED BY 'StrongAdmin123!';
CREATE USER IF NOT EXISTS 'operator'@'%'         IDENTIFIED BY 'Operator456!';
CREATE USER IF NOT EXISTS 'analyst'@'%'          IDENTIFIED BY 'Analyst789!';
CREATE USER IF NOT EXISTS 'auditor'@'%'          IDENTIFIED BY 'Auditor000!';

-- 4. 角色赋给用户
GRANT 'role_admin'    TO 'admin'@'localhost';
GRANT 'role_operator' TO 'operator'@'%';
GRANT 'role_analyst'  TO 'analyst'@'%';
GRANT 'role_auditor'  TO 'auditor'@'%';

-- 5. 激活角色（MySQL 8.0 默认不激活角色）
SET DEFAULT ROLE ALL TO 'admin'@'localhost';
SET DEFAULT ROLE ALL TO 'operator'@'%';
SET DEFAULT ROLE ALL TO 'analyst'@'%';
SET DEFAULT ROLE ALL TO 'auditor'@'%';

FLUSH PRIVILEGES;
