import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

export default function ReturnInbound() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    api.get('/purchase-orders/').then(res => {
      setData(res.data.data.filter((o: any) => !o.shipped));
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      // 退货入库：标记原采购订单为退货
      await api.put(`/purchase-orders/${values.purchase_order_id}/return`, values);
      message.success('退货入库单已创建');
      setModalOpen(false); form.resetFields(); fetch();
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '采购订单号', dataIndex: 'purchase_order_id', width: 160 },
    { title: '数量', dataIndex: 'total_quantity', width: 80 },
    { title: '单价', dataIndex: 'unit_price', width: 80, render: (v: number) => `¥${v}` },
    { title: '订单时间', dataIndex: 'order_time', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    { title: '采购员', dataIndex: 'purchaser_employee_id', width: 130 },
    { title: '状态', dataIndex: 'shipped', width: 100, render: (v: boolean) => <Tag color="orange">可退货</Tag> },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>退货入库 — 针对未发货采购订单办理退货</h3>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建退货入库单</Button>
      <Table columns={columns} dataSource={data} rowKey="purchase_order_id" loading={loading} pagination={{ pageSize: 20 }} />
      <Modal title="新建退货入库单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="purchase_order_id" label="采购订单号" rules={[{ required: true }]}><Input placeholder="填写要退货的采购订单号" /></Form.Item>
          <Form.Item name="return_quantity" label="退货数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="return_reason" label="退货原因" rules={[{ required: true }]}>
            <Select options={[
              { value: '质检不合格', label: '质检不合格' }, { value: '规格不符', label: '规格不符' },
              { value: '数量差异', label: '数量差异' }, { value: '其他', label: '其他' },
            ]} />
          </Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
