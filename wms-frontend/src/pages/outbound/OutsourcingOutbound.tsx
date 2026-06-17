import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

export default function OutsourcingOutbound() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/outsourcing-orders/'),
      api.get('/suppliers/'),
      api.get('/materials/'),
    ]).then(([ooRes, supRes, matRes]) => {
      setSuppliers(supRes.data.data);
      setMaterials(matRes.data.data);
      setData(ooRes.data.data.filter((o: any) => o.order_status === 'processing' || o.order_status === 'pending'));
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await api.post('/outsourcing-orders/outbound', values);
      message.success('外协发料出库单已创建');
      setModalOpen(false); form.resetFields(); fetch();
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '外协订单号', dataIndex: 'outsourcing_order_id', width: 160 },
    { title: '状态', dataIndex: 'order_status', width: 100, render: (v: string) => { const sm: Record<string,{color:string;text:string}> = {completed:{color:'green',text:'已完工'},processing:{color:'blue',text:'加工中'},pending:{color:'orange',text:'待加工'}}; const t=sm[v]||{color:'default',text:v}; return <Tag color={t.color}>{t.text}</Tag>; }},
    { title: '金额', dataIndex: 'order_amount', width: 100, render: (v: number) => `¥${v}` },
    { title: '厂商编号', dataIndex: 'supplier_id', width: 130 },
    { title: '订单日期', dataIndex: 'order_date', width: 120 },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>外协出库 — 向供应商发料</h3>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建外协发料单</Button>
      <Table columns={columns} dataSource={data} rowKey="outsourcing_order_id" loading={loading} pagination={{ pageSize: 20 }} />
      <Modal title="新建外协发料单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="outsourcing_order_id" label="外协订单号" rules={[{ required: true }]}>
            <Select options={data.map(o => ({ value: o.outsourcing_order_id, label: o.outsourcing_order_id+' | '+o.supplier_id }))} />
          </Form.Item>
          <Form.Item name="raw_material_id" label="发料物料" rules={[{ required: true }]}>
            <Select showSearch options={materials.slice(0,50).map((m:any) => ({ value: m.raw_material_id, label: m.raw_material_id+' | '+m.raw_material_name }))} />
          </Form.Item>
          <Form.Item name="out_quantity" label="发料数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="expected_return_date" label="预计回厂日期" rules={[{ required: true }]}><Input placeholder="例: 2026-07-15" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
