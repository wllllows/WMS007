import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Alert, Tabs, Tag } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, ScheduleOutlined, DollarOutlined, BankOutlined, ToolOutlined } from '@ant-design/icons';
import { getDashboardStats } from '../services/dashboardService';
import { getPurchaseOrders, getSalesOrders, getWorkOrders, getOutsourcingOrders } from '../services/orderService';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [outsourcingOrders, setOutsourcingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardStats(),getPurchaseOrders({page_size:50}),getSalesOrders({page_size:50}),getWorkOrders({page_size:50}),getOutsourcingOrders({page_size:50})])
      .then(([s,po,so,wo,oo])=>{setStats(s);setPurchaseOrders(po.data||[]);setSalesOrders(so.data||[]);setWorkOrders(wo.data||[]);setOutsourcingOrders(oo.data||[]);setLoading(false);})
      .catch(()=>{setError('加载失败');setLoading(false);});
  }, []);

  if (loading) return <Spin size="large" style={{display:'block',margin:'100px auto'}}/>;
  if (error) return <Alert type="error" message={error} showIcon/>;

  const totalPO=purchaseOrders.length, totalSO=salesOrders.length;
  const totalPOAmt=purchaseOrders.reduce((s,o)=>s+o.total_quantity*o.unit_price,0);
  const totalSOAmt=salesOrders.reduce((s,o)=>s+o.total_quantity*o.unit_price,0);
  const completedWO=workOrders.filter((w:any)=>w.status==='completed').length;
  const inProgressWO=workOrders.filter((w:any)=>w.status!=='completed').length;

  const tabItems = [
    { key:'overview', label:'总览', children: (
      <div>
        <Row gutter={[16,16]} style={{marginBottom:24}}>
          <Col span={6}><Card><Statistic title="采购订单总数" value={totalPO} prefix={<ShoppingCartOutlined/>}/></Card></Col>
          <Col span={6}><Card><Statistic title="销售订单总数" value={totalSO} prefix={<ShoppingOutlined/>}/></Card></Col>
          <Col span={6}><Card><Statistic title="采购总金额" value={totalPOAmt} precision={2} prefix={<DollarOutlined/>} suffix="元"/></Card></Col>
          <Col span={6}><Card><Statistic title="销售总金额" value={totalSOAmt} precision={2} prefix={<DollarOutlined/>} suffix="元"/></Card></Col>
        </Row>
        <Row gutter={[16,16]} style={{marginBottom:24}}>
          <Col span={6}><Card><Statistic title="已完成工单" value={completedWO} valueStyle={{color:'#52c41a'}} prefix={<ScheduleOutlined/>}/></Card></Col>
          <Col span={6}><Card><Statistic title="进行中工单" value={inProgressWO} valueStyle={{color:'#fa8c16'}} prefix={<ScheduleOutlined/>}/></Card></Col>
          <Col span={6}><Card><Statistic title="外协订单数" value={outsourcingOrders.length} prefix={<ToolOutlined/>}/></Card></Col>
          <Col span={6}><Card><Statistic title="仓库数" value={(stats?.warehouse_distribution||[]).length} prefix={<BankOutlined/>}/></Card></Col>
        </Row>
        <Card title="月度采购趋势明细" size="small">
          <Table columns={[{title:'月份',dataIndex:'month'},{title:'订单数',dataIndex:'count'},{title:'采购金额(元)',dataIndex:'amount',render:(v:number)=>`¥${Number(v).toFixed(2)}`}]}
            dataSource={(stats?.monthly_purchase||[]).map((m:any,i:number)=>({...m,key:i}))} pagination={false} size="small"/>
        </Card>
      </div>
    )},
    { key:'purchase', label:`采购(${totalPO})`, children: <Table columns={[{title:'订单号',dataIndex:'purchase_order_id',width:140},{title:'数量',dataIndex:'total_quantity',width:60},{title:'单价',dataIndex:'unit_price',render:(v:number)=>`¥${v}`},{title:'总金额',key:'amt',render:(_:any,r:any)=>`¥${(r.total_quantity*r.unit_price).toFixed(2)}`},{title:'时间',dataIndex:'order_time',render:(v:string)=>new Date(v).toLocaleDateString()},{title:'发货',dataIndex:'shipped',render:(v:boolean)=><Tag color={v?'green':'orange'}>{v?'是':'否'}</Tag>}]} dataSource={purchaseOrders.map((o:any,i:number)=>({...o,key:i}))} pagination={{pageSize:15}} size="small" scroll={{x:800}}/> },
    { key:'sales', label:`销售(${totalSO})`, children: <Table columns={[{title:'订单号',dataIndex:'sales_order_id',width:140},{title:'数量',dataIndex:'total_quantity',width:60},{title:'单价',dataIndex:'unit_price',render:(v:number)=>`¥${v}`},{title:'总金额',key:'amt',render:(_:any,r:any)=>`¥${(r.total_quantity*r.unit_price).toFixed(2)}`},{title:'已付款',dataIndex:'paid_amount',render:(v:number)=>`¥${v}`},{title:'时间',dataIndex:'order_time',render:(v:string)=>new Date(v).toLocaleDateString()},{title:'发货',dataIndex:'shipped',render:(v:boolean)=><Tag color={v?'green':'orange'}>{v?'是':'否'}</Tag>}]} dataSource={salesOrders.map((o:any,i:number)=>({...o,key:i}))} pagination={{pageSize:15}} size="small" scroll={{x:900}}/> },
    { key:'work', label:`工单(${workOrders.length})`, children: <Table columns={[{title:'工单号',dataIndex:'work_order_id',width:120},{title:'类型',dataIndex:'work_order_type'},{title:'状态',dataIndex:'status',render:(v:string)=>{const m:Record<string,{color:string;text:string}>={completed:{color:'green',text:'已完工'},in_progress:{color:'blue',text:'进行中'},pending:{color:'orange',text:'待开工'}};const t=m[v]||{color:'default',text:v};return<Tag color={t.color}>{t.text}</Tag>;}},{title:'开工',dataIndex:'start_time',render:(v:string)=>new Date(v).toLocaleDateString()},{title:'下达日期',dataIndex:'issue_date'}]} dataSource={workOrders.map((w:any,i:number)=>({...w,key:i}))} pagination={{pageSize:15}} size="small"/> },
    { key:'outsource', label:`外协(${outsourcingOrders.length})`, children: <Table columns={[{title:'订单号',dataIndex:'outsourcing_order_id',width:140},{title:'状态',dataIndex:'order_status',render:(v:string)=>{const cm:Record<string,{color:string;text:string}>={completed:{color:'green',text:'已完工'},processing:{color:'blue',text:'加工中'},pending:{color:'orange',text:'待加工'},settled:{color:'purple',text:'已结算'}};const t=cm[v]||{color:'default',text:v};return<Tag color={t.color}>{t.text}</Tag>;}},{title:'金额',dataIndex:'order_amount',render:(v:number)=>`¥${v}`},{title:'日期',dataIndex:'order_date'},{title:'厂商',dataIndex:'supplier_id'}]} dataSource={outsourcingOrders.map((o:any,i:number)=>({...o,key:i}))} pagination={{pageSize:15}} size="small"/> },
  ];

  return <div><h2 style={{marginBottom:24,fontSize:20,fontWeight:600}}>数据分析报表</h2><Tabs defaultActiveKey="overview" items={tabItems}/></div>;
}
