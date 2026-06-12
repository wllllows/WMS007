import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getPurchaseOrders, createPurchaseOrder } from '../../services/orderService';
import type { PurchaseOrder } from '../../types';

export default function PurchaseInbound() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getPurchaseOrders({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await createPurchaseOrder(values); message.success('采购订单创建成功');
      setModalOpen(false); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('创建失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '订单号', dataIndex: 'purchase_order_id', width: 160 },
    { title: '数量', dataIndex: 'total_quantity', width: 80 },
    { title: '单价', dataIndex: 'unit_price', width: 80, render: (v: number) => `¥${v}` },
    { title: '订单时间', dataIndex: 'order_time', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    { title: '发货', dataIndex: 'shipped', width: 100, render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? '已发货' : '未发货'}</Tag> },
    { title: '采购员', dataIndex: 'purchaser_employee_id', width: 130 },
    { title: '付款单号', dataIndex: 'payment_id', width: 160 },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建采购订单</Button>
      <Table columns={columns} dataSource={data} rowKey="purchase_order_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title="新建采购订单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="purchase_order_id" label="订单编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="total_quantity" label="总数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="purchaser_employee_id" label="采购员编号" rules={[{ required: true }]}><Input placeholder="需为已存在的员工编号" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
