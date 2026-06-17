import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTransferOrders, createTransferOrder, deleteTransferOrder } from '../../services/orderService';
import type { TransferOrder } from '../../types';

export default function TransferManagement() {
  const [data, setData] = useState<TransferOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getTransferOrders({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(()=>message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    try { await deleteTransferOrder(id); message.success('调拨单已删除（触发器已清理关联并记录日志）'); fetch(page); }
    catch (err: any) { message.error('删除失败: '+(err?.response?.data?.detail||err?.message||'')); }
  };

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await createTransferOrder(values); message.success('调拨单创建成功');
      setModalOpen(false); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('创建失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '调拨单号', dataIndex: 'transfer_order_id', width: 150 },
    { title: '调拨单位', dataIndex: 'transfer_unit', width: 120 },
    { title: '日期', dataIndex: 'transfer_date', width: 110 },
    { title: '位置', dataIndex: 'location', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70 },
    { title: '车间编号', dataIndex: 'workshop_id', width: 110 },
    { title: '操作', width: 100, render: (_: any, r: TransferOrder) => (
      <Popconfirm title="删除调拨单将清理原料关联，确定？" onConfirm={() => handleDelete(r.transfer_order_id)}>
        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </Popconfirm>
    )},
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新建调拨单</Button>
      <Table columns={columns} dataSource={data} rowKey="transfer_order_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title="新建调拨单" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="transfer_order_id" label="调拨单号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="transfer_unit" label="调拨单位" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="位置" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="workshop_id" label="车间编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="raw_material_id" label="原料编号" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
