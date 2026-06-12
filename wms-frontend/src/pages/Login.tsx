import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { LockOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  { value: 'admin', label: '系统管理员', hint: '全部功能，管理用户', color: '#1677ff' },
  { value: 'operator', label: '业务操作员', hint: '业务数据增删改查', color: '#52c41a' },
  { value: 'analyst', label: '数据分析师', hint: '只读查看报表和数据', color: '#722ed1' },
  { value: 'auditor', label: '审计人员', hint: '仅查看操作日志', color: '#fa8c16' },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('admin');
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  if (isLoggedIn) { navigate('/dashboard'); return null; }
  const currentRole = roles.find(r => r.value === role)!;

  const handleSubmit = async (values: { password: string }) => {
    setLoading(true);
    try { await login(role, values.password); message.success('登录成功'); }
    catch (err: any) { message.error(err?.response?.data?.detail || '登录失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ width: 380, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)', borderRadius: '16px 0 0 16px', boxShadow: '0 8px 40px rgba(22,119,255,0.15)' }}>
        <BankOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }} />
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: 2 }}>仓库管理系统</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: 0, lineHeight: 1.8 }}>仓储数字化管理平台<br/>采购 · 生产 · 外协 · 销售 · 库存</p>
        <div style={{ marginTop: 40 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>演示账号</div>
          {roles.map(r => <div key={r.value} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 2 }}>{r.label}：{r.value}123</div>)}
        </div>
      </div>
      <Card style={{ width: 400, borderRadius: '0 16px 16px 0', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: 'none' }} styles={{ body: { padding: '48px 44px' } }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600 }}>登录</h2>
        <p style={{ color: '#8c8c8c', margin: '0 0 36px', fontSize: 14 }}>选择身份并输入密码进入系统</p>
        <Form onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item label="选择身份"><Select value={role} onChange={setRole} options={roles} /></Form.Item>
          <Form.Item name="password" label="登录密码" rules={[{ required: true, message: '请输入密码' }]}><Input.Password prefix={<LockOutlined />} placeholder="输入密码" /></Form.Item>
          <div style={{ background: `${currentRole.color}0a`, borderLeft: `3px solid ${currentRole.color}`, borderRadius: 4, padding: '10px 14px', marginBottom: 28 }}>
            <span style={{ color: '#595959', fontSize: 13 }}><strong style={{ color: currentRole.color }}>{currentRole.label}</strong>{' — '}{currentRole.hint}</span>
          </div>
          <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 46, borderRadius: 8, fontSize: 15, fontWeight: 600 }}>进入系统</Button>
        </Form>
      </Card>
    </div>
  );
}
