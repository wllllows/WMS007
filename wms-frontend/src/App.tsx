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
import SalesOutbound from './pages/outbound/SalesOutbound';
import WorkOrders from './pages/WorkOrders';
import OutsourcingOrders from './pages/outsourcing/OutsourcingOrders';
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
        <Route path="outbound/sales" element={<RequireMenu menu="outbound"><SalesOutbound /></RequireMenu>} />
        <Route path="work-orders" element={<RequireMenu menu="work-orders"><WorkOrders /></RequireMenu>} />
        <Route path="outsourcing/orders" element={<RequireMenu menu="outsourcing"><OutsourcingOrders /></RequireMenu>} />
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
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
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
