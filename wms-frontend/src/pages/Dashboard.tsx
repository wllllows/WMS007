import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Alert, Progress, Tag } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, ScheduleOutlined, DollarOutlined } from '@ant-design/icons';
import { getDashboardStats } from '../services/dashboardService';
import { getPurchaseOrders, getWorkOrders } from '../services/orderService';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentPO, setRecentPO] = useState<any[]>([]);
  const [recentWO, setRecentWO] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardStats(), getPurchaseOrders({ page: 1, page_size: 5 }), getWorkOrders({ page: 1, page_size: 5 })])
      .then(([s, po, wo]) => { setStats(s); setRecentPO(po.data||[]); setRecentWO(wo.data||[]); setLoading(false); })
      .catch(err => { setError('加载失败: '+(err?.message||'')); setLoading(false); });
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert type="error" message={error} showIcon />;
  if (!stats) return <Alert type="warning" message="暂无数据" showIcon />;

  const poCols = [
    { title: '订单号', dataIndex: 'purchase_order_id', width: 130 },
    { title: '数量', dataIndex: 'total_quantity', width: 60 },
    { title: '金额', key: 'amt', render: (_:any,r:any) => `¥${(r.total_quantity*r.unit_price).toFixed(0)}` },
    { title: '时间', dataIndex: 'order_time', render: (v:string) => new Date(v).toLocaleDateString() },
    { title: '状态', dataIndex: 'shipped', render: (v:boolean) => <Tag color={v?'green':'orange'}>{v?'已发货':'未发货'}</Tag> },
  ];
  const woCols = [
    { title: '工单号', dataIndex: 'work_order_id', width: 130 },
    { title: '类型', dataIndex: 'work_order_type', width: 80 },
    { title: '状态', dataIndex: 'status', render: (v:string) => { const m: Record<string,{color:string;text:string}> = {completed:{color:'green',text:'已完工'},in_progress:{color:'blue',text:'进行中'},pending:{color:'orange',text:'待开工'}}; const t=m[v]||{color:'default',text:v}; return <Tag color={t.color}>{t.text}</Tag>; } },
    { title: '下达日期', dataIndex: 'issue_date' },
  ];

  const monthlyData = (stats.monthly_purchase||[]).slice().reverse();
  const whData = stats.warehouse_distribution||[];
  const totalM = whData.reduce((s:number,w:any)=>s+Number(w.material_count),0);
  const maxCount = Math.max(...monthlyData.map((m:any)=>Number(m.count)),1);

  return (
    <div>
      <h2 className="page-title">系统首页</h2>
      <Row gutter={[16,16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="dashboard-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><ShoppingCartOutlined /></div>
              <Statistic title="采购订单" value={stats.purchase_order_count} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="dashboard-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><ShoppingOutlined /></div>
              <Statistic title="销售订单" value={stats.sales_order_count} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="dashboard-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><ScheduleOutlined /></div>
              <Statistic title="进行中工单" value={stats.work_order_in_progress} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="dashboard-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><DollarOutlined /></div>
              <Statistic title="销售总收入" value={stats.total_revenue} precision={2} suffix="元" />
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="月度采购趋势" styles={{ body: { padding: '12px 24px 24px' } }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 200, padding: '0 8px' }}>
              {monthlyData.map((m:any,i:number)=>{
                const h = (Number(m.count)/maxCount)*160;
                return <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:11, color:'#8c8c8c', fontWeight:600 }}>{Number(m.count)}</span>
                  <div style={{ width:'100%', maxWidth:48, height:h, borderRadius:'6px 6px 0 0', background:'linear-gradient(180deg, #1677ff 0%, #4096ff 100%)' }} />
                  <span style={{ fontSize:10, color:'#bfbfbf', marginTop:4 }}>{m.month}</span>
                </div>;
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="仓库物料分布" styles={{ body: { padding: '12px 24px 24px' } }}>
            {whData.map((w:any,i:number)=>{
              const pct=totalM>0?(Number(w.material_count)/totalM)*100:0;
              const colors=['#1677ff','#52c41a','#fa8c16','#722ed1','#eb2f96'];
              return <div key={i} style={{ marginBottom: i<whData.length-1?16:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span style={{ fontSize:13, color:'#595959' }}>{w.category}</span><span style={{ fontSize:13, fontWeight:600 }}>{w.material_count}</span></div>
                <Progress percent={Math.round(pct)} showInfo={false} strokeColor={colors[i%5]} trailColor="#f0f0f0" size="small" />
              </div>;
            })}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}><Card title="最近采购订单" extra={<a onClick={()=>window.location.hash='/inbound/purchase'}>查看全部</a>}><Table columns={poCols} dataSource={recentPO.map((p:any,i:number)=>({...p,key:i}))} pagination={false} size="small" /></Card></Col>
        <Col xs={24} lg={12}><Card title="最近工单" extra={<a onClick={()=>window.location.hash='/work-orders'}>查看全部</a>}><Table columns={woCols} dataSource={recentWO.map((w:any,i:number)=>({...w,key:i}))} pagination={false} size="small" /></Card></Col>
      </Row>
    </div>
  );
}
