import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

export default function ProductionReturn() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/work-orders/'),
      api.get('/materials/'),
    ]).then(([woRes, matRes]) => {
      setWorkOrders(woRes.data.data);
      setMaterials(matRes.data.data.slice(0, 100));
      setData(woRes.data.data.filter((wo: any) => wo.status === 'completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await api.post('/work-orders/return-material', values);
      message.success('生产退料单已创建');
      setModalOpen(false); form.resetFields(); fetch();
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '工单号', dataIndex: 'work_order_id', width: 140 },
    { title: '工单类型', dataIndex: 'work_order_type', width: 100 },
    { title: '开工时间', dataIndex: 'start_time', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => { const m: Record<string,{color:string;text:string}> = {completed:{color:'green',text:'已完工'},in_progress:{color:'blue',text:'进行中'},pending:{color:'orange',text:'待开工'}}; const t=m[v]||{color:'default',text:v}; return <Tag color={t.color}>{t.text}</Tag>; } },
    { title: '下达日期', dataIndex: 'issue_date', width: 120 },
    { title: '耗材', dataIndex: 'consumables', width: 200, ellipsis: true },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>生产退料 — 完工后将剩余物料退回仓库</h3>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建退料单</Button>
      <Table columns={columns} dataSource={data} rowKey="work_order_id" loading={loading} pagination={{ pageSize: 20 }} />
      <Modal title="新建生产退料单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="work_order_id" label="工单号" rules={[{ required: true }]}>
            <Select options={workOrders.map(w => ({ value: w.work_order_id, label: w.work_order_id+' | '+w.work_order_type }))} />
          </Form.Item>
          <Form.Item name="raw_material_id" label="退料物料" rules={[{ required: true }]}>
            <Select showSearch options={materials.slice(0,50).map((m:any) => ({ value: m.raw_material_id, label: m.raw_material_id+' | '+m.raw_material_name }))} />
          </Form.Item>
          <Form.Item name="return_quantity" label="退料数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="return_reason" label="退料原因" rules={[{ required: true }]}>
            <Select options={[{ value: '工单变更', label: '工单变更' }, { value: '用料剩余', label: '用料剩余' }, { value: '规格更换', label: '规格更换' }]} />
          </Form.Item>
          <Form.Item name="warehouse_id" label="退入仓库" rules={[{ required: true }]}><Input placeholder="例: WH001" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
