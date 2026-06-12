import { useState } from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import {
  DashboardOutlined, DatabaseOutlined, InboxOutlined, ExportOutlined,
  ScheduleOutlined, ToolOutlined, AppstoreOutlined, BarChartOutlined,
  BankOutlined, LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const allMenuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '首页' },
  { key: 'basic-data', icon: <DatabaseOutlined />, label: '基础数据', children: [
    { key: '/basic-data/materials', label: '物料管理' }, { key: '/basic-data/warehouses', label: '仓库管理' },
    { key: '/basic-data/suppliers', label: '供应商管理' }, { key: '/basic-data/workshops', label: '车间管理' },
    { key: '/basic-data/employees', label: '员工管理' },
  ]},
  { key: 'inbound', icon: <InboxOutlined />, label: '入库管理', children: [{ key: '/inbound/purchase', label: '采购入库' }] },
  { key: 'outbound', icon: <ExportOutlined />, label: '出库管理', children: [{ key: '/outbound/sales', label: '销售出库' }] },
  { key: 'work-orders', icon: <ScheduleOutlined />, label: '工单管理' },
  { key: 'outsourcing', icon: <ToolOutlined />, label: '外协作业', children: [{ key: '/outsourcing/orders', label: '外协订单' }] },
  { key: 'inventory', icon: <AppstoreOutlined />, label: '库存管理', children: [
    { key: '/inventory/query', label: '库存查询' }, { key: '/inventory/transfer', label: '调拨管理' },
  ]},
  { key: 'reports', icon: <BarChartOutlined />, label: '数据分析' },
];

const roleLabels: Record<string, string> = { admin: '系统管理员', operator: '业务操作员', analyst: '数据分析师', auditor: '审计人员' };

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { name, role, canAccess, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filterMenus = (items: typeof allMenuItems) => items
    .filter(item => canAccess(item.key))
    .map(item => ({ ...item, children: item.children?.filter(c => canAccess(c.key.replace(/^\//,'').split('/')[0])) }));

  const menus = filterMenus(allMenuItems);

  const findSelectedKey = () => {
    for (const item of allMenuItems) {
      if (item.children) { const f = item.children.find(c => location.pathname.startsWith(c.key)); if (f) return f.key; }
      if (location.pathname.startsWith('/'+item.key)) return '/'+item.key;
    }
    return '/dashboard';
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? 0 : '0 20px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <BankOutlined style={{ fontSize: 22, color: '#fff' }} />
          {!collapsed && <span style={{ marginLeft: 10, color: '#fff', fontSize: 15, fontWeight: 600 }}>仓库管理系统</span>}
        </div>
        <Menu mode="inline" theme="dark" selectedKeys={[findSelectedKey()]} defaultOpenKeys={menus.filter(m => m.children).map(m => m.key)} items={menus} onClick={({ key }) => navigate(key.startsWith('/') ? key : `/${key}`)} />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s', height: '100vh', overflow: 'hidden' }}>
        <Header style={{ padding: '0 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 9 }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16 }} />
          <Dropdown menu={{ items: [{ key: 'info', label: `${name} · ${roleLabels[role]||role}`, disabled: true }, { type: 'divider' }, { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }], onClick: ({ key }) => { if (key==='logout') logout(); } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><UserOutlined style={{ fontSize: 16 }} /><span>{name}</span></div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, overflow: 'auto', height: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minHeight: '100%' }}><Outlet /></div>
        </Content>
      </Layout>
    </Layout>
  );
}
