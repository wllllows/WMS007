import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Radio, Space, message, Tag, Descriptions } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getSalesOrders, createSalesOrder, paySalesOrder } from '../../services/orderService';
import type { SalesOrder } from '../../types';

export default function SalesOutbound() {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [recvModalOpen, setRecvModalOpen] = useState(false);
  const [recvingOrder, setRecvingOrder] = useState<SalesOrder | null>(null);
  const [recvType, setRecvType] = useState<'full' | 'custom'>('full');
  const [form] = Form.useForm();
  const [recvForm] = Form.useForm();

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

  const handleRecv = async () => {
    try {
      const order = recvingOrder!;
      const totalAmount = order.total_quantity * order.unit_price;
      const remaining = totalAmount - order.paid_amount;
      const amount = recvType === 'full' ? remaining : recvForm.getFieldValue('custom_amount');
      if (!amount || amount <= 0) { message.error('请输入有效的回款金额'); return; }
      setSaving(true);
      const remark = recvForm.getFieldValue('remark');
      const res = await paySalesOrder(order.sales_order_id, amount);
      message.success(`回款登记成功！本次登记 ¥${amount}，剩余应收 ¥${res.remaining}`);
      setRecvModalOpen(false); setRecvingOrder(null); setRecvType('full'); fetch(page);
    } catch (err: any) {
      if (!err?.errorFields) message.error('登记失败: '+(err?.response?.data?.detail||err?.message||''));
    } finally { setSaving(false); }
  };

  const openRecvModal = (order: SalesOrder) => {
    setRecvingOrder(order);
    setRecvType('full');
    recvForm.resetFields();
    setRecvModalOpen(true);
  };

  const orderTotal = recvingOrder ? recvingOrder.total_quantity * recvingOrder.unit_price : 0;
  const orderPaid = recvingOrder ? recvingOrder.paid_amount : 0;
  const orderRemaining = orderTotal - orderPaid;

  const columns = [
    { title: '订单号', dataIndex: 'sales_order_id', width: 160 },
    { title: '销售明细', dataIndex: 'sales_detail', width: 180, ellipsis: true },
    { title: '数量', dataIndex: 'total_quantity', width: 80 },
    { title: '单价', dataIndex: 'unit_price', width: 80, render: (v: number) => `¥${v}` },
    { title: '订单时间', dataIndex: 'order_time', width: 160, render: (v: string) => new Date(v).toLocaleDateString() },
    { title: '已回款', dataIndex: 'paid_amount', width: 100, render: (v: number) => <span style={{ color: '#52c41a' }}>¥{v}</span> },
    { title: '发货', dataIndex: 'shipped', width: 90, render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? '已发货' : '未发货'}</Tag> },
    { title: '销售员', dataIndex: 'salesperson_employee_id', width: 120 },
    {
      title: '操作', width: 110, render: (_: any, r: SalesOrder) => {
        const remaining = r.total_quantity * r.unit_price - r.paid_amount;
        return remaining > 0 ? (
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => openRecvModal(r)}>登记回款</Button>
        ) : (
          <Tag color="green">已结清</Tag>
        );
      },
    },
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

      <Modal title="销售回款登记" open={recvModalOpen} onOk={handleRecv} confirmLoading={saving}
        onCancel={() => { setRecvModalOpen(false); setRecvingOrder(null); setRecvType('full'); }} okText="确认登记">
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 20 }}>
          <Descriptions.Item label="订单号">{recvingOrder?.sales_order_id}</Descriptions.Item>
          <Descriptions.Item label="订单总额">¥{orderTotal.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="已回款">¥{orderPaid.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="剩余应收"><strong style={{ color: '#fa8c16', fontSize: 16 }}>¥{orderRemaining.toFixed(2)}</strong></Descriptions.Item>
        </Descriptions>

        <Form form={recvForm} layout="vertical">
          <Form.Item label="回款金额">
            <Radio.Group value={recvType} onChange={e => setRecvType(e.target.value)}>
              <Radio.Button value="full">结清剩余 ¥{orderRemaining.toFixed(2)}</Radio.Button>
              <Radio.Button value="custom">部分回款</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {recvType === 'custom' && (
            <Form.Item name="custom_amount" label="回款金额" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber min={0.01} max={orderRemaining} style={{ width: '100%' }} placeholder={`不超过 ¥${orderRemaining.toFixed(2)}`} />
            </Form.Item>
          )}
          <Form.Item name="remark" label="备注（流水号/付款方）">
            <Input placeholder="例：银行转账 张三 6222xxx" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
