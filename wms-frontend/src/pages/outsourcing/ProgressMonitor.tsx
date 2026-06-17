import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Spin, Alert, Progress, Table } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../../services/api';

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: '#fa8c16', icon: <ClockCircleOutlined />, label: '待加工' },
  processing: { color: '#1677ff', icon: <SyncOutlined spin />, label: '加工中' },
  completed: { color: '#52c41a', icon: <CheckCircleOutlined />, label: '已完工' },
  settled: { color: '#722ed1', icon: <CheckCircleOutlined />, label: '已结算' },
};

export default function ProgressMonitor() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([api.get('/outsourcing-orders/?page_size=100'), api.get('/suppliers/?page_size=100')])
      .then(([ooRes, supRes]) => {
        setOrders(ooRes.data.data);
        const names: Record<string, string> = {};
        supRes.data.data.forEach((s: any) => { names[s.supplier_id] = s.supplier_name; });
        setSupplierNames(names);
        setLoading(false);
      })
      .catch(err => { setError('加载失败'); setLoading(false); });
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert type="error" message={error} showIcon />;

  const grouped = { pending: orders.filter(o => o.order_status === 'pending'), processing: orders.filter(o => o.order_status === 'processing'), completed: orders.filter(o => o.order_status === 'completed' || o.order_status === 'settled') };
  const totalAmount = orders.reduce((s, o) => s + Number(o.order_amount), 0);
  const completedCount = grouped.completed.length;
  const completionRate = orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0;

  const columns = [
    { title: '外协订单号', dataIndex: 'outsourcing_order_id', width: 150 },
    { title: '厂商', dataIndex: 'supplier_id', width: 160, render: (v: string) => supplierNames[v] || v },
    { title: '金额', dataIndex: 'order_amount', width: 100, render: (v: number) => `¥${Number(v).toFixed(0)}` },
    { title: '日期', dataIndex: 'order_date', width: 120 },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>外协进度监控</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="外协订单总数" value={orders.length} prefix={<SyncOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="外协总金额" value={totalAmount} precision={2} prefix="¥" /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={completedCount} valueStyle={{ color: '#52c41a' }} suffix={`/ ${orders.length}`} /></Card></Col>
        <Col span={6}>
          <Card>
            <div style={{ marginBottom: 4, fontSize: 14, color: '#8c8c8c' }}>完成率</div>
            <Progress percent={completionRate} strokeColor={completionRate >= 80 ? '#52c41a' : '#1677ff'} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {(['pending', 'processing', 'completed'] as const).map(status => {
          const items = grouped[status];
          const cfg = statusConfig[status];
          return (
            <Col xs={24} lg={8} key={status}>
              <Card
                title={<span>{cfg.icon} <span style={{ marginLeft: 8 }}>{cfg.label}</span></span>}
                extra={<Tag color={cfg.color}>{items.length} 单</Tag>}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  columns={columns}
                  dataSource={items.map((o, i) => ({ ...o, key: i }))}
                  pagination={false}
                  size="small"
                  showHeader={false}
                  locale={{ emptyText: '暂无' }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
