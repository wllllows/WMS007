import { useEffect, useState } from 'react';
import { Table, Button, Select, Space, message, Tag, Popconfirm, InputNumber } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { getWorkOrders, completeWorkOrder, deleteWorkOrder } from '../services/orderService';
import { deleteExpiredWorkOrders } from '../services/dbDemoService';
import type { WorkOrder } from '../types';

export default function WorkOrders() {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [expireDays, setExpireDays] = useState(180);
  const [cleaning, setCleaning] = useState(false);

  const fetch = (p = 1) => {
    setLoading(true);
    getWorkOrders({ page: p, status: statusFilter }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(()=>message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [statusFilter]);

  const handleCleanExpired = async () => {
    setCleaning(true);
    try { const res = await deleteExpiredWorkOrders(expireDays); message.success(`清理完成！共删除 ${res.deleted_count} 条已完工工单（已触发备份）`); fetch(page); }
    catch (err: any) { message.error('清理失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setCleaning(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteWorkOrder(id); message.success('工单已删除（触发器已自动备份）'); fetch(page); }
    catch (err: any) { message.error('删除失败: '+(err?.response?.data?.detail||err?.message||'')); }
  };

  const handleComplete = async (id: string) => {
    try { await completeWorkOrder(id); message.success('工单已完工'); fetch(page); }
    catch (err: any) { message.error('完工失败: '+(err?.response?.data?.detail||err?.message||'')); }
  };

  const columns = [
    { title: '工单号', dataIndex: 'work_order_id', width: 160 },
    { title: '工单类型', dataIndex: 'work_order_type', width: 100 },
    { title: '开工时间', dataIndex: 'start_time', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => {
      const m: Record<string, { color: string; text: string }> = { completed: { color: 'green', text: '已完工' }, in_progress: { color: 'blue', text: '进行中' }, pending: { color: 'orange', text: '待开工' } };
      const t = m[v] || { color: 'default', text: v };
      return <Tag color={t.color}>{t.text}</Tag>;
    } },
    { title: '下达日期', dataIndex: 'issue_date', width: 120 },
    { title: '耗材说明', dataIndex: 'consumables', width: 200, ellipsis: true },
    { title: '操作', width: 180, render: (_: any, r: WorkOrder) => (
      <Space>
        {r.status !== 'completed' && <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleComplete(r.work_order_id)}>完工</Button>}
        <Popconfirm title="删除工单将自动备份，确定？" onConfirm={() => handleDelete(r.work_order_id)}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select placeholder="筛选状态" allowClear style={{ width: 150 }} onChange={v => setStatusFilter(v)}
          options={[{ value: 'completed', label: '已完工' }, { value: 'in_progress', label: '进行中' }, { value: 'pending', label: '待开工' }]} />
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>清理</span>
        <InputNumber min={30} max={3650} value={expireDays} onChange={v => setExpireDays(v||180)} style={{ width: 100 }} />
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>天前已完工工单</span>
        <Button size="small" danger icon={<ClearOutlined />} loading={cleaning} onClick={handleCleanExpired}>批量清理</Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="work_order_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
    </div>
  );
}
