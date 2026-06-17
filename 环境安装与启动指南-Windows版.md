# 仓库管理系统 — 环境安装与启动指南（Windows 版）

> 适用于全新 Windows 10/11，从零安装所有依赖并启动项目。

---

## 一、环境清单

| 软件 | 用途 | 安装方式 |
|------|------|---------|
| MySQL 8.0 | 数据库 | 官网下载 |
| Python 3.12+ | 后端运行环境 | 官网下载 |
| Node.js | 前端运行环境 | 官网下载 |
| DataGrip（可选） | 数据库可视化管理 | 官网下载 |

---

## 二、安装 Python

1. 打开 https://www.python.org/downloads/
2. 点击黄色按钮下载最新版
3. 运行 `.exe` 安装包
4. **勾选底部 "Add Python to PATH"**
5. 点击 "Install Now"
6. 安装完成后，打开**新的**命令提示符验证：

```cmd
python --version
pip --version
```

---

## 三、安装 Node.js

1. 打开 https://nodejs.org/
2. 点击左侧 **LTS** 版本下载
3. 运行 `.msi`，一路 Next（全部默认即可）
4. 打开**新的**命令提示符验证：

```cmd
node --version
npm --version
```

---

## 四、安装 MySQL 8.0

### 4.1 下载

1. 打开 https://dev.mysql.com/downloads/installer/
2. 选第二个（约 300MB），点 Download
3. 提示登录时点底部小字 "No thanks, just start my download"

### 4.2 安装

1. 运行 `.msi`
2. 安装类型选 **Server only**
3. 一路 Next 直到配置界面

### 4.3 配置（关键步骤）

安装过程中会弹出 MySQL Configurator：

**Type and Networking** → 保持默认，Port `3306` → Next

**Authentication Method** → 选 **"Use Legacy Authentication Method"** → Next

**Accounts and Roles**：
- MySQL Root Password: `123456`
- Repeat Password: `123456`
- → Next

**Windows Service**：
- ✅ Configure MySQL Server as a Windows Service
- ✅ Start the MySQL Server at System Startup
- → Next → Execute → Finish

### 4.4 添加到 PATH（方便命令行使用）

1. 按 `Win + R`，输入 `sysdm.cpl`，回车
2. 高级 → 环境变量
3. 系统变量中找到 `Path` → 双击
4. 新建 → 粘贴 `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
5. 三个窗口都点确定

### 4.5 验证

打开新的命令提示符：

```cmd
mysql -u root -p123456 -e "SELECT 1;"
```

---

## 五、安装 DataGrip（可选但推荐）

1. 打开 https://www.jetbrains.com/datagrip/download/
2. 下载 Windows 版 `.exe`，安装
3. 用学校邮箱申请免费教育许可：https://www.jetbrains.com/community/education/#students
4. 打开 DataGrip → `+` → Data Source → MySQL
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: `123456`
5. Test Connection → OK

---

## 六、初始化数据库

> 项目代码应放在 `C:\Users\你的用户名\Desktop\HDU_WMS007\`，如果还没拷贝过去先做这一步。

打开命令提示符（cmd），逐条执行：

### 6.1 创建数据库

```cmd
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS production_purchase_sales_management DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;"
```

### 6.2 执行 SQL 脚本（建表）

```cmd
mysql -u root -p123456 < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\01_create_tables.sql"
```

### 6.3 创建索引

```cmd
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\04_create_indexes.sql"
```

### 6.4 创建视图

```cmd
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\05_create_views.sql"
```

### 6.5 创建触发器

```cmd
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\02_create_triggers.sql"
```

### 6.6 创建存储过程

```cmd
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\03_create_procedures.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\06_create_remaining_sp.sql"
```

### 6.7 填充演示数据

```cmd
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py
```

看到以下输出表示成功：

```
种子数据已插入完成！
  - 员工: 15 条
  - 仓库: 5 条
  - 物料: 15 条
  ...
```

---

## 七、启动后端

### 7.1 确认数据库连接配置

用记事本打开 `C:\Users\你的用户名\Desktop\HDU_WMS007\wms-backend\.env`：

```
DATABASE_URL=mysql+pymysql://root:123456@127.0.0.1:3306/production_purchase_sales_management
```

### 7.2 启动

打开一个命令提示符窗口：

```cmd
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend"
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

看到 `Uvicorn running on http://0.0.0.0:8000` 表示成功。

浏览器打开 `http://localhost:8000/docs` 可查看 API 文档。

---

## 八、启动前端

打开**另一个**命令提示符窗口（不要关后端的窗口）：

```cmd
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-frontend"
npm install
npm run dev
```

看到 `VITE ready` 和 `http://localhost:5173` 表示成功。

---

## 九、打开系统

浏览器打开 `http://localhost:5173`，自动进入登录页。

### 登录账号

| 用户名 | 密码 | 角色 | 权限范围 |
|--------|------|------|---------|
| `admin` | `admin123` | 系统管理员 | 所有功能 |
| `operator` | `operator123` | 业务操作员 | 所有功能 |
| `analyst` | `analyst123` | 数据分析师 | 首页 + 数据分析 |
| `auditor` | `auditor123` | 审计人员 | 仅首页 |

---

## 十、关闭与重新启动

### 关闭

- 前端窗口：`Ctrl+C`
- 后端窗口：`Ctrl+C`
- MySQL 不需要关（设为 Windows 服务开机自启）

### 重新启动（下次开机）

MySQL 开机自启，不需要手动启动。只启动前后端：

```cmd
:: 终端1 — 后端
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend"
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

:: 终端2 — 前端
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-frontend"
npm run dev
```

浏览器 → `http://localhost:5173`。

---

## 快速命令汇总

### 首次安装（一次性）

```cmd
:: 1. 安装 Python、Node.js、MySQL（见上面各节）

:: 2. 建库 + 执行所有 SQL
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS production_purchase_sales_management DEFAULT CHARACTER SET utf8mb4;"
mysql -u root -p123456 < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\01_create_tables.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\04_create_indexes.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\05_create_views.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\02_create_triggers.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\03_create_procedures.sql"
mysql -u root -p123456 production_purchase_sales_management < "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend\sql\06_create_remaining_sp.sql"

:: 3. 后端环境
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py

:: 4. 前端环境
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-frontend"
npm install
```

### 每次启动

```cmd
:: 终端1
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-backend" && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000

:: 终端2
cd "%USERPROFILE%\Desktop\HDU_WMS007\wms-frontend" && npm run dev
```
