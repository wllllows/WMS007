import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Result, Button } from 'antd';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!useAuth().isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireMenu({ menu, children }: { menu: string; children: React.ReactNode }) {
  const { canAccess } = useAuth();
  if (!canAccess(menu)) {
    return <Result status="403" title="无访问权限" subTitle="你的角色无权访问此页面" extra={<Button type="primary" onClick={() => window.history.back()}>返回</Button>} />;
  }
  return <>{children}</>;
}
