import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, message, Tag } from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import { getOutsourcingOrders, createOutsourcingOrder, settleOutsourcingOrder } from '../../services/orderService';
import type { OutsourcingOrder } from '../../types';
import dayjs from 'dayjs';

export default function OutsourcingOrders() {
  const [data, setData] = useState<OutsourcingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<OutsourcingOrder | null>(null);
  const [form] = Form.useForm();
  const [settleForm] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getOutsourcingOrders({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(()=>message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await createOutsourcingOrder({ ...values, order_date: values.order_date.format('YYYY-MM-DD') });
      message.success('外协订单创建成功'); setModalOpen(false); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('创建失败'); }
    finally { setSaving(false); }
  };

  const handleSettle = async () => {
    try { const { final_amount } = await settleForm.validateFields(); setSaving(true);
      await settleOutsourcingOrder(settlingOrder!.outsourcing_order_id, final_amount);
      message.success('结算完成'); setSettleModalOpen(false); setSettlingOrder(null); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('结算失败'); }
    finally { setSaving(false); }
  };

  const statusColor: Record<string, string> = { completed: 'green', settled: 'blue', processing: 'orange', pending: 'default' };

  const columns = [
    { title: '外协订单号', dataIndex: 'outsourcing_order_id', width: 160 },
    { title: '状态', dataIndex: 'order_status', width: 100, render: (v: string) => <Tag color={statusColor[v] || 'default'}>{v}</Tag> },
    { title: '金额', dataIndex: 'order_amount', width: 100, render: (v: number) => `¥${v}` },
    { title: '订单日期', dataIndex: 'order_date', width: 120 },
    { title: '厂商编号', dataIndex: 'supplier_id', width: 130 },
    { title: '收款单号', dataIndex: 'receipt_id', width: 160 },
    { title: '操作', width: 100, render: (_: any, r: OutsourcingOrder) => (
      r.order_status !== 'completed' && r.order_status !== 'settled' && <Button size="small" icon={<DollarOutlined />} onClick={() => { setSettlingOrder(r); settleForm.resetFields(); setSettleModalOpen(true); }}>结算</Button>
    )},
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建外协订单</Button>
      <Table columns={columns} dataSource={data} rowKey="outsourcing_order_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title="新建外协订单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="outsourcing_order_id" label="外协订单号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="order_status" label="状态" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="order_amount" label="金额" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="order_date" label="订单日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="supplier_id" label="厂商编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="receipt_id" label="收款单号" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
      <Modal title="外协结算" open={settleModalOpen} onOk={handleSettle} confirmLoading={saving} onCancel={() => { setSettleModalOpen(false); setSettlingOrder(null); }}>
        <Form form={settleForm} layout="vertical">
          <Form.Item name="final_amount" label="最终结算金额" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
