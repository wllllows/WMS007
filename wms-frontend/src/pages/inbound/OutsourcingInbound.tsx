import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

export default function OutsourcingInbound() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/outsourcing-orders/'),
      api.get('/materials/'),
    ]).then(([ooRes, matRes]) => {
      setOrders(ooRes.data.data);
      setData(ooRes.data.data.filter((o: any) => o.order_status === 'completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await api.post('/outsourcing-orders/inbound', values);
      message.success('外协回厂入库单已创建');
      setModalOpen(false); form.resetFields(); fetch();
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '外协订单号', dataIndex: 'outsourcing_order_id', width: 160 },
    { title: '状态', dataIndex: 'order_status', width: 100, render: (v: string) => { const sm: Record<string,{color:string;text:string}> = {completed:{color:'green',text:'已完工'},processing:{color:'blue',text:'加工中'},pending:{color:'orange',text:'待加工'}}; const t=sm[v]||{color:'default',text:v}; return <Tag color={t.color}>{t.text}</Tag>; }},
    { title: '金额', dataIndex: 'order_amount', width: 100, render: (v: number) => `¥${v}` },
    { title: '订单日期', dataIndex: 'order_date', width: 120 },
    { title: '厂商编号', dataIndex: 'supplier_id', width: 130 },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>外协入库 — 外协加工完成回厂入库</h3>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建外协入库单</Button>
      <Table columns={columns} dataSource={data} rowKey="outsourcing_order_id" loading={loading} pagination={{ pageSize: 20 }} />
      <Modal title="新建外协入库单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="outsourcing_order_id" label="外协订单号" rules={[{ required: true }]}>
            <Select options={orders.map(o => ({ value: o.outsourcing_order_id, label: o.outsourcing_order_id+' | '+o.supplier_id }))} />
          </Form.Item>
          <Form.Item name="inbound_quantity" label="回厂入库数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quality_check" label="质检结果" rules={[{ required: true }]}>
            <Select options={[{ value: '合格', label: '合格' }, { value: '不合格', label: '不合格（转入不良品仓）' }]} />
          </Form.Item>
          <Form.Item name="warehouse_id" label="入库仓库编号" rules={[{ required: true }]}><Input placeholder="例: WH001" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
