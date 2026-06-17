import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth, RequireMenu } from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materials from './pages/basic-data/Materials';
import Warehouses from './pages/basic-data/Warehouses';
import Suppliers from './pages/basic-data/Suppliers';
import Workshops from './pages/basic-data/Workshops';
import Employees from './pages/basic-data/Employees';
import PurchaseInbound from './pages/inbound/PurchaseInbound';
import ReturnInbound from './pages/inbound/ReturnInbound';
import OutsourcingInbound from './pages/inbound/OutsourcingInbound';
import ProductionReturn from './pages/inbound/ProductionReturn';
import SalesOutbound from './pages/outbound/SalesOutbound';
import OutsourcingOutbound from './pages/outbound/OutsourcingOutbound';
import MaterialOutbound from './pages/outbound/MaterialOutbound';
import WorkOrders from './pages/WorkOrders';
import OutsourcingOrders from './pages/outsourcing/OutsourcingOrders';
import ProgressMonitor from './pages/outsourcing/ProgressMonitor';
import InventoryQuery from './pages/inventory/InventoryQuery';
import TransferManagement from './pages/inventory/TransferManagement';
import Reports from './pages/Reports';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="basic-data/materials" element={<RequireMenu menu="basic-data"><Materials /></RequireMenu>} />
        <Route path="basic-data/warehouses" element={<RequireMenu menu="basic-data"><Warehouses /></RequireMenu>} />
        <Route path="basic-data/suppliers" element={<RequireMenu menu="basic-data"><Suppliers /></RequireMenu>} />
        <Route path="basic-data/workshops" element={<RequireMenu menu="basic-data"><Workshops /></RequireMenu>} />
        <Route path="basic-data/employees" element={<RequireMenu menu="basic-data"><Employees /></RequireMenu>} />
        <Route path="inbound/purchase" element={<RequireMenu menu="inbound"><PurchaseInbound /></RequireMenu>} />
        <Route path="inbound/return" element={<RequireMenu menu="inbound"><ReturnInbound /></RequireMenu>} />
        <Route path="inbound/outsourcing" element={<RequireMenu menu="inbound"><OutsourcingInbound /></RequireMenu>} />
        <Route path="inbound/production-return" element={<RequireMenu menu="inbound"><ProductionReturn /></RequireMenu>} />
        <Route path="outbound/sales" element={<RequireMenu menu="outbound"><SalesOutbound /></RequireMenu>} />
        <Route path="outbound/outsourcing" element={<RequireMenu menu="outbound"><OutsourcingOutbound /></RequireMenu>} />
        <Route path="outbound/material" element={<RequireMenu menu="outbound"><MaterialOutbound /></RequireMenu>} />
        <Route path="work-orders" element={<RequireMenu menu="work-orders"><WorkOrders /></RequireMenu>} />
        <Route path="outsourcing/orders" element={<RequireMenu menu="outsourcing"><OutsourcingOrders /></RequireMenu>} />
        <Route path="outsourcing/progress" element={<RequireMenu menu="outsourcing"><ProgressMonitor /></RequireMenu>} />
        <Route path="inventory/query" element={<RequireMenu menu="inventory"><InventoryQuery /></RequireMenu>} />
        <Route path="inventory/transfer" element={<RequireMenu menu="inventory"><TransferManagement /></RequireMenu>} />
        <Route path="reports" element={<RequireMenu menu="reports"><Reports /></RequireMenu>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{
      token: {
        colorPrimary: '#2563eb',
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorInfo: '#3b82f6',
        borderRadius: 8,
        fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
        colorBgLayout: '#f8fafc',
      },
      components: {
        Card: { colorBgContainer: '#ffffff', boxShadowTertiary: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)' },
        Table: { headerBg: '#f8fafc', headerColor: '#475569', borderColor: '#f1f5f9' },
        Menu: { darkItemBg: 'transparent', darkItemSelectedBg: 'rgba(37,99,235,0.15)', darkItemSelectedColor: '#60a5fa' },
        Statistic: { contentFontSize: 28 },
      },
    }}>
      <AntApp>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
