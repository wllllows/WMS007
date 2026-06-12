import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Tag } from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import { getSalesOrders, createSalesOrder, paySalesOrder } from '../../services/orderService';
import type { SalesOrder } from '../../types';

export default function SalesOutbound() {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<SalesOrder | null>(null);
  const [form] = Form.useForm();
  const [payForm] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getSalesOrders({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await createSalesOrder(values); message.success('销售订单创建成功');
      setModalOpen(false); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('创建失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const handlePay = async () => {
    try { const values = await payForm.validateFields(); setSaving(true);
      const res = await paySalesOrder(payingOrder!.sales_order_id, values.payment_amount);
      message.success(`付款成功，剩余应收: ¥${res.remaining}`);
      setPayModalOpen(false); setPayingOrder(null); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('付款失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '订单号', dataIndex: 'sales_order_id', width: 160 },
    { title: '销售明细', dataIndex: 'sales_detail', width: 200, ellipsis: true },
    { title: '数量', dataIndex: 'total_quantity', width: 80 },
    { title: '单价', dataIndex: 'unit_price', width: 80, render: (v: number) => `¥${v}` },
    { title: '订单时间', dataIndex: 'order_time', width: 180, render: (v: string) => new Date(v).toLocaleString() },
    { title: '已付款', dataIndex: 'paid_amount', width: 100, render: (v: number) => `¥${v}` },
    { title: '发货', dataIndex: 'shipped', width: 90, render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? '已发货' : '未发货'}</Tag> },
    { title: '销售员', dataIndex: 'salesperson_employee_id', width: 120 },
    { title: '操作', width: 100, render: (_: any, r: SalesOrder) => (
      <Button size="small" icon={<DollarOutlined />} onClick={() => { setPayingOrder(r); payForm.resetFields(); setPayModalOpen(true); }}>付款</Button>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建销售订单</Button></Space>
      <Table columns={columns} dataSource={data} rowKey="sales_order_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title="新建销售订单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="sales_order_id" label="订单编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sales_detail" label="销售明细" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="total_quantity" label="总数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="salesperson_employee_id" label="销售员编号" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
      <Modal title="销售付款" open={payModalOpen} onOk={handlePay} confirmLoading={saving} onCancel={() => { setPayModalOpen(false); setPayingOrder(null); }}>
        <Form form={payForm} layout="vertical">
          <Form.Item name="payment_amount" label="付款金额" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
