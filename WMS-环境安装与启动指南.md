# 仓库管理系统（WMS）— 环境安装与启动指南

> 适用于全新 macOS 电脑，从零开始安装所有依赖并启动项目。

---

## 目录

1. [环境概览](#一环境概览)
2. [安装 Homebrew](#二安装-homebrew)
3. [安装 Node.js](#三安装-nodejs)
4. [安装 MySQL](#四安装-mysql)
5. [Python 环境准备](#五python-环境准备)
6. [安装 DataGrip（可选）](#六安装-datagrip)
7. [初始化数据库](#七初始化数据库)
8. [配置并启动后端](#八配置并启动后端)
9. [配置并启动前端](#九配置并启动前端)
10. [打开系统](#十打开系统)
11. [关闭系统与重新启动](#十一关闭系统与重新启动)
12. [快速启动命令汇总](#十二快速启动命令汇总)

---

## 一、环境概览

项目需要以下软件，按顺序安装：

| 软件 | 作用 | 安装方式 |
|------|------|---------|
| Homebrew | macOS 包管理器（用来装其他软件） | 命令行 |
| Node.js | 运行前端项目（React + Vite） | Homebrew |
| MySQL 8.0 | 数据库，存储所有业务数据 | Homebrew |
| Python 3 | 运行后端项目（FastAPI） | macOS 自带 |

---

## 二、安装 Homebrew

Homebrew 是 macOS 上的软件包管理器，一行命令安装所有依赖。

打开 macOS 自带的 **终端（Terminal）** 应用（在 Launchpad → 其他 → 终端），粘贴以下命令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装过程中：
- 会提示输入 Mac 开机密码（输入时不显示字符，正常）
- 按 Enter 确认安装
- 等待几分钟

验证安装成功：

```bash
brew --version
# 应显示类似：Homebrew 5.x.x
```

---

## 三、安装 Node.js

Node.js 是运行前端 JavaScript 代码的环境。

```bash
brew install node
```

等待安装完成（大约 1-2 分钟）。验证：

```bash
node --version   # 应显示 v20+ 或 v22+
npm --version    # 应显示 10+
```

---

## 四、安装 MySQL

MySQL 是我们的数据库，用来存储所有业务数据。

```bash
brew install mysql@8.0
```

安装完成后的操作：

### 4.1 启动 MySQL 服务

```bash
brew services start mysql@8.0
```

如果 `brew services` 命令报错，用备选方式：

```bash
mysql.server start
```

### 4.2 设置 root 密码

```bash
mysql_secure_installation
```

执行后按以下步骤操作：

```
Would you like to setup VALIDATE PASSWORD component?
→ 输入 n，回车

New password:
→ 输入 123456，回车

Re-enter new password:
→ 再次输入 123456，回车

Remove anonymous users?
→ 输入 y，回车

Disallow root login remotely?
→ 输入 y，回车

Remove test database and access to it?
→ 输入 y，回车

Reload privilege tables now?
→ 输入 y，回车
```

### 4.3 验证 MySQL

```bash
mysql -u root -p123456 -e "SELECT 1;"
```

看到输出 `1` 即表示成功。

---

## 五、Python 环境准备

macOS 自带 Python 3，不需要额外安装。

验证：

```bash
python3 --version
# 应显示 Python 3.x.x
```

### 5.1 创建 Python 虚拟环境

虚拟环境让项目依赖独立安装，不影响系统 Python：

```bash
cd ~/Desktop/wms-backend
python3 -m venv venv
```

### 5.2 激活虚拟环境并安装依赖

```bash
source venv/bin/activate
pip install -r requirements.txt
```

等待安装完成（几十秒）。看到 `Successfully installed ...` 即可。

每次新开终端启动后端前，都需要先执行 `source venv/bin/activate` 激活虚拟环境。

---

## 六、安装 DataGrip（可选）

DataGrip 是查看和管理数据库的可视化工具，不是必须的，但强烈推荐。

### 6.1 下载安装

1. 浏览器打开 https://www.jetbrains.com/datagrip/download/
2. 点击 macOS `.dmg` 下载
3. 下载完成后双击 `.dmg` 文件
4. 把 DataGrip 图标拖到 Applications 文件夹

### 6.2 申请免费教育许可

1. 打开 https://www.jetbrains.com/community/education/#students
2. 点击 "Apply Now"
3. 填写学校邮箱（`.edu` 结尾的邮箱）
4. 收到确认邮件后点击链接激活
5. 打开 DataGrip，用 JetBrains 账号登录

### 6.3 连接数据库

1. DataGrip 左上角 `+` → Data Source → MySQL
2. 填写连接信息：

   | 字段 | 值 |
   |------|-----|
   | Host | `localhost` |
   | Port | `3306` |
   | User | `root` |
   | Password | `123456` |
   | Database | `production_purchase_sales_management` |

3. 点击左下角 "Test Connection"
4. 看到绿色 `Successful` → 点击 OK

---

## 七、初始化数据库

### 7.1 创建数据库和表

```bash
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS production_purchase_sales_management DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;"
```

然后执行建表 SQL 脚本：

```bash
mysql -u root -p123456 < ~/Desktop/wms-backend/sql/01_create_tables.sql
```

验证表已创建（应显示 22 张表）：

```bash
mysql -u root -p123456 production_purchase_sales_management -e "SHOW TABLES;"
```

### 7.2 创建必需存储过程

采购入库功能依赖一个存储过程，需要手动创建：

```bash
mysql -u root -p123456 production_purchase_sales_management -e "
DELIMITER \$\$
CREATE PROCEDURE sp_create_purchase_order(
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
END\$\$
DELIMITER ;
"
```

### 7.3 填充演示数据

```bash
cd ~/Desktop/wms-backend
source venv/bin/activate
python seed_data.py
```

输出应显示：

```
种子数据已插入完成！
  - 员工: 15 条
  - 仓库: 5 条
  - 物料: 15 条
  - 成品: 5 条
  - 采购订单: 30 条
  - 销售订单: 30 条
  - 工单: 40 条
  - 外协订单: 20 条
  - 调拨单: 15 条
```

---

## 八、配置并启动后端

### 8.1 确认配置文件

打开文件 `~/Desktop/wms-backend/.env`，确认内容为：

```
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/production_purchase_sales_management
```

如果安装 MySQL 时设了不同的密码，把 `123456` 改成你的密码。

### 8.2 启动后端

打开一个终端窗口：

```bash
cd ~/Desktop/wms-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

看到以下输出表示启动成功：

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 8.3 验证后端

浏览器打开 `http://localhost:8000/docs`，看到 Swagger API 文档页面即为成功。

或者终端输入：

```bash
curl http://localhost:8000/
# 应返回: {"message":"仓库管理系统 API","docs":"/docs"}
```

---

## 九、配置并启动前端

### 9.1 安装前端依赖

打开一个新终端窗口（不要关后端终端）：

```bash
cd ~/Desktop/wms-frontend
npm install
```

等待安装完成（大约 1-2 分钟）。

### 9.2 启动前端

```bash
npm run dev
```

看到以下输出表示启动成功：

```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://x.x.x.x:5173/
```

### 9.3 验证前端

浏览器打开 `http://localhost:5173`，应自动跳转到登录页面。

---

## 十、打开系统

1. 确保 MySQL 运行中：`mysql.server status`
2. 确保后端运行中：`curl http://localhost:8000/`
3. 浏览器打开：`http://localhost:5173`

### 登录账号

| 用户名 | 密码 | 角色 | 菜单权限 |
|--------|------|------|---------|
| `admin` | `admin123` | 系统管理员 | 全部功能 |
| `operator` | `operator123` | 业务操作员 | 全部功能 |
| `analyst` | `analyst123` | 数据分析师 | 首页 + 数据分析 |
| `auditor` | `auditor123` | 审计人员 | 仅首页 |

操作步骤：
1. 在下拉框选择角色
2. 输入对应密码
3. 点击"进入系统"

---

## 十一、关闭系统与重新启动

### 关闭

- **前端**：前端终端窗口按 `Ctrl+C`
- **后端**：后端终端窗口按 `Ctrl+C`
- **MySQL**：`mysql.server stop`（或保持运行，不影响）

### 重新启动（下次开机后）

```bash
# 1. 启动 MySQL（一次即可，保持在后台）
mysql.server start

# 2. 启动后端（终端窗口1）
cd ~/Desktop/wms-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 3. 启动前端（终端窗口2）
cd ~/Desktop/wms-frontend
npm run dev

# 4. 浏览器打开 http://localhost:5173
```

> 提示：MySQL 启动一次后会一直运行到关机。如果每天都要用，可以在安装时设置开机自启：`brew services start mysql@8.0`

---

## 十二、快速启动命令汇总

```bash
# ====== 仅首次安装时需要 ======
# 1. 装 Homebrew → 装 Node.js → 装 MySQL
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
brew install mysql@8.0

# 2. MySQL 初始化
mysql.server start
mysql_secure_installation   # 设密码为 123456

# 3. 建库建表
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS production_purchase_sales_management DEFAULT CHARACTER SET utf8mb4;"
mysql -u root -p123456 < ~/Desktop/wms-backend/sql/01_create_tables.sql

# 4. Python 虚拟环境 + 依赖
cd ~/Desktop/wms-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. 填充数据
python seed_data.py

# 6. 前端依赖
cd ~/Desktop/wms-frontend
npm install

# ====== 每次启动项目 ======
# 终端1 - 后端
cd ~/Desktop/wms-backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 终端2 - 前端
cd ~/Desktop/wms-frontend && npm run dev

# 终端3（可选）- 确认 MySQL 运行
mysql.server start

# 浏览器 → http://localhost:5173
```
