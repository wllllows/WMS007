"""种子数据脚本：为所有表插入演示数据"""
import pymysql
from datetime import datetime, timedelta, date
import random

conn = pymysql.connect(host='localhost', user='root', password='123456',
                       database='production_purchase_sales_management', charset='utf8mb4')
cur = conn.cursor()
today = date.today()

# ========== 员工数据 ==========
employees = [
    ('EMP001', '张伟', '管理员', '13800001001'),
    ('EMP002', '李娜', '采购员', '13800001002'),
    ('EMP003', '王强', '采购员', '13800001003'),
    ('EMP004', '赵敏', '销售员', '13800001004'),
    ('EMP005', '刘洋', '销售员', '13800001005'),
    ('EMP006', '陈静', '仓库管理员', '13800001006'),
    ('EMP007', '杨磊', '仓库管理员', '13800001007'),
    ('EMP008', '周婷', '车间负责人', '13800001008'),
    ('EMP009', '吴昊', '车间负责人', '13800001009'),
    ('EMP010', '孙琳', '采购员', '13800001010'),
    ('EMP011', '宋涛', '车间负责人', '13800001011'),
    ('EMP012', '黄晓', '仓库管理员', '13800001012'),
    ('EMP013', '林芳', '销售员', '13800001013'),
    ('EMP014', '郑宇', '采购员', '13800001014'),
    ('EMP015', '何雪', '管理员', '13800001015'),
]
cur.executemany("INSERT INTO employee VALUES (%s,%s,%s,%s)", employees)

# ========== 付款状态 & 收款状态 ==========
payments = [(f'PAY{i:03d}', round(random.uniform(0, 50000), 2), round(random.uniform(0, 30000), 2)) for i in range(1, 31)]
cur.executemany("INSERT INTO payment_status VALUES (%s,%s,%s)", payments)
receipts = [(f'REC{i:03d}', round(random.uniform(0, 30000), 2), round(random.uniform(0, 15000), 2)) for i in range(1, 21)] + \
           [('REC021', 0, 8000)]  # C级厂商演示用
cur.executemany("INSERT INTO receipt_status VALUES (%s,%s,%s)", receipts)

# ========== 仓库 ==========
warehouses = [
    ('WH001', 'A栋1层原材料仓', 'EMP006', '13800001006', 1200.50, '原材料仓'),
    ('WH002', 'A栋2层半成品仓', 'EMP007', '13800001007', 800.00, '半成品仓'),
    ('WH003', 'B栋1层成品仓', 'EMP012', '13800001012', 1500.00, '成品仓'),
    ('WH004', '外协虚拟仓-华东区', 'EMP006', '13800001006', 1.00, '外协虚拟仓'),
    ('WH005', 'C栋车间现场仓', 'EMP008', '13800001008', 600.00, '车间现场仓'),
]
cur.executemany("INSERT INTO warehouse VALUES (%s,%s,%s,%s,%s,%s)", warehouses)

# ========== 车间 ==========
workshops = [
    ('WS001', '周婷', 'A栋3层裁剪车间', '13800001008'),
    ('WS002', '吴昊', 'A栋4层车缝车间', '13800001009'),
    ('WS003', '宋涛', 'B栋2层扪工车间', '13800001011'),
    ('WS004', '周婷', 'B栋3层组装车间', '13800001008'),
]
cur.executemany("INSERT INTO workshop VALUES (%s,%s,%s,%s)", workshops)

# ========== 原料 ==========
raw_materials = [
    ('MAT001', '涤纶面料-灰色', 'DL-001-240cm', '面料', 'WH001'),
    ('MAT002', '真皮皮革-棕色', 'PG-002-1.5mm', '皮革', 'WH001'),
    ('MAT003', '海绵30D', 'HM-003-2cm', '辅料', 'WH001'),
    ('MAT004', '松木框架条', 'SM-004-4cm×6cm', '木质', 'WH001'),
    ('MAT005', '五金螺丝M8', 'WJ-005-不锈钢', '五金', 'WH001'),
    ('MAT006', '弹簧包8圈', 'TH-006-18cm', '五金', 'WH001'),
    ('MAT007', '无纺布衬里', 'WFB-007-100cm', '辅料', 'WH001'),
    ('MAT008', '拉链YKK-80cm', 'LL-008-尼龙', '辅料', 'WH001'),
    ('MAT009', '橡木扶手', 'XM-009-弯弧', '木质', 'WH001'),
    ('MAT010', '沙发脚-镀铬', 'SFJ-010-15cm', '五金', 'WH001'),
    ('MAT011', '丝绵填充料', 'SM-011-500g', '辅料', 'WH005'),
    ('MAT012', '胶合板12mm', 'JHB-012-244cm×122cm', '木质', 'WH005'),
    ('MAT013', '尼龙线#40', 'NL-013-3000m', '辅料', 'WH005'),
    ('MAT014', '真皮皮革-黑色', 'PG-014-1.5mm', '皮革', 'WH001'),
    ('MAT015', '海绵40D', 'HM-015-3cm', '辅料', 'WH001'),
]
cur.executemany("INSERT INTO raw_material VALUES (%s,%s,%s,%s,%s)", raw_materials)

# ========== 成品 ==========
finished_products = [
    ('FP001', '欧式真皮三人沙发', '棕色/240cm×95cm', 'A级', 'WH003'),
    ('FP002', '简约布艺双人沙发', '灰色/160cm×90cm', 'B级', 'WH003'),
    ('FP003', '实木框架躺椅', '原木色/70cm×160cm', 'A级', 'WH003'),
    ('FP004', '现代转角沙发', '黑色/280cm×180cm', 'A级', 'WH003'),
    ('FP005', '北欧单人休闲椅', '米色/80cm×85cm', 'B级', 'WH003'),
]
cur.executemany("INSERT INTO finished_product VALUES (%s,%s,%s,%s,%s)", finished_products)

# ========== 采购订单 ==========
purchase_orders = []
for i in range(1, 31):
    oid = f'PO{i:04d}'
    pid = f'PAY{i:03d}'
    emp = random.choice(['EMP002', 'EMP003', 'EMP010', 'EMP014'])
    t = datetime.now() - timedelta(days=random.randint(5, 180))
    purchase_orders.append((oid, random.randint(50, 500), t.strftime('%Y-%m-%d %H:%M:%S'),
                            random.choice([True, False]), round(random.uniform(10, 500), 2), emp, pid))
cur.executemany("INSERT INTO purchase_order VALUES (%s,%s,%s,%s,%s,%s,%s)", purchase_orders)

# ========== 销售订单 ==========
sales_orders = []
for i in range(1, 31):
    oid = f'SO{i:04d}'
    emp = random.choice(['EMP004', 'EMP005', 'EMP013'])
    t = datetime.now() - timedelta(days=random.randint(5, 180))
    prod = random.choice(finished_products)
    qty = random.randint(1, 20)
    price = round(random.uniform(800, 8000), 2)
    paid = round(random.uniform(0, qty * price), 2)
    sales_orders.append((oid, f'客户订单-{prod[1]}×{qty}', qty, t.strftime('%Y-%m-%d %H:%M:%S'),
                         paid, random.choice([True, False]), price, emp))
cur.executemany("INSERT INTO sales_order VALUES (%s,%s,%s,%s,%s,%s,%s,%s)", sales_orders)

# ========== 工单 ==========
work_orders = []
types = ['裁剪工单', '车缝工单', '扪工工单', '组装工单', '包装工单']
statuses = ['pending', 'in_progress', 'completed', 'completed', 'completed']
for i in range(1, 41):
    oid = f'WO{i:04d}'
    tp = random.choice(types)
    st = statuses[i % 5]
    start_t = datetime.now() - timedelta(days=random.randint(10, 120))
    work_orders.append((oid, tp, start_t.strftime('%Y-%m-%d %H:%M:%S'), st,
                        (start_t.date() - timedelta(days=5)).strftime('%Y-%m-%d'), '标准耗材' if i % 3 == 0 else None))
cur.executemany("INSERT INTO work_order VALUES (%s,%s,%s,%s,%s,%s)", work_orders)

# ========== 外协厂商 ==========
suppliers = [
    ('SUP001', '华东纺织加工厂', '刘经理', '13900010001', 'A级', '浙江省绍兴市柯桥区'),
    ('SUP002', '华南皮革处理中心', '陈主管', '13900010002', 'A级', '广东省佛山市顺德区'),
    ('SUP003', '新东方五金制品', '黄厂', '13900010003', 'B级', '浙江省永康市五金城'),
    ('SUP004', '恒达木质加工厂', '吴主任', '13900010004', 'A级', '江西省赣州市南康区'),
    ('SUP005', '永利海绵厂', '郑经理', '13900010005', 'B级', '广东省东莞市厚街镇'),
    ('SUP006', '天工框架加工', '林老板', '13900010006', 'A级', '福建省莆田市仙游县'),
    ('SUP007', '益丰面料染整', '王主管', '13900010007', 'A级', '江苏省南通市通州区'),
    ('SUP008', '联达五金冲压', '李主管', '13900010008', 'B级', '广东省深圳市龙岗区'),
    ('SUP009', '低质五金加工坊', '王老板', '13900010009', 'C级', '浙江省某县五金城'),
]
cur.executemany("INSERT INTO outsourcing_supplier VALUES (%s,%s,%s,%s,%s,%s)", suppliers)

# ========== 外协订单 ==========
outsourcing_orders = []
for i in range(1, 21):
    oid = f'OO{i:04d}'
    sup = random.choice(suppliers)
    rec = f'REC{i:03d}'
    status = random.choice(['pending', 'processing', 'completed'])
    orders_date = today - timedelta(days=random.randint(10, 200))
    outsourcing_orders.append((oid, status, round(random.uniform(2000, 50000), 2),
                               orders_date.strftime('%Y-%m-%d'), sup[0], rec))
cur.executemany("INSERT INTO outsourcing_order VALUES (%s,%s,%s,%s,%s,%s)", outsourcing_orders)

# 额外加一条 C 级厂商的订单（演示触发器拦截用）
cur.execute("INSERT INTO outsourcing_order VALUES ('OO0021', 'pending', 8000, CURDATE(), 'SUP009', 'REC021')")

# ========== 调拨单 ==========
transfer_orders = []
for i in range(1, 16):
    oid = f'TR{i:04d}'
    ws = random.choice(workshops)
    mat = random.choice(raw_materials)
    transfer_orders.append((oid, '制造部', (today - timedelta(days=random.randint(5, 60))).strftime('%Y-%m-%d'),
                            f'{ws[2]}-区{i}', random.randint(10, 200), ws[0]))
cur.executemany("INSERT INTO transfer_order VALUES (%s,%s,%s,%s,%s,%s)", transfer_orders)

# ========== 关联表 ==========
for i in range(1, 31):
    wo = f'WO{i:04d}' if i <= 20 else f'WO{random.randint(1,40):04d}'
    emp = random.choice(employees)
    try:
        cur.execute("INSERT IGNORE INTO work_order_employee VALUES (%s,%s)", (emp[0], wo))
    except:
        pass

for i in range(1, 41):
    wo = f'WO{i:04d}' if i <= 20 else f'WO{random.randint(1,40):04d}'
    mat = random.choice(raw_materials)
    try:
        cur.execute("INSERT IGNORE INTO work_order_raw_material VALUES (%s,%s)", (wo, mat[0]))
    except:
        pass

for i in range(1, 21):
    wo = f'WO{i:04d}' if i <= 10 else f'WO{random.randint(1,40):04d}'
    fp = random.choice(finished_products)
    try:
        cur.execute("INSERT IGNORE INTO work_order_finished_product VALUES (%s,%s)", (wo, fp[0]))
    except:
        pass

for i in range(1, 21):
    oo = f'OO{i:04d}' if i <= 10 else f'OO{random.randint(1,20):04d}'
    mat = random.choice(raw_materials)
    try:
        cur.execute("INSERT IGNORE INTO outsourcing_order_raw_material VALUES (%s,%s)", (oo, mat[0]))
    except:
        pass

for i in range(1, 16):
    tr = f'TR{i:04d}' if i <= 8 else f'TR{random.randint(1,15):04d}'
    mat = random.choice(raw_materials)
    try:
        cur.execute("INSERT IGNORE INTO transfer_order_raw_material VALUES (%s,%s)", (tr, mat[0]))
    except:
        pass

conn.commit()

def count(table):
    cur.execute(f'SELECT COUNT(*) FROM {table}')
    return cur.fetchone()[0]

print("种子数据已插入完成！")
print(f"  - 员工: {count('employee')} 条")
print(f"  - 仓库: {count('warehouse')} 条")
print(f"  - 物料: {count('raw_material')} 条")
print(f"  - 成品: {count('finished_product')} 条")
print(f"  - 采购订单: {count('purchase_order')} 条")
print(f"  - 销售订单: {count('sales_order')} 条")
print(f"  - 工单: {count('work_order')} 条")
print(f"  - 外协订单: {count('outsourcing_order')} 条")
print(f"  - 调拨单: {count('transfer_order')} 条")

cur.close()
conn.close()
