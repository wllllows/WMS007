import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../services/warehouseService';
import type { Warehouse } from '../../types';

export default function Warehouses() {
  const [data, setData] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getWarehouses({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) { await updateWarehouse(editing.warehouse_id, values); message.success('更新成功'); }
      else { await createWarehouse(values as Warehouse); message.success('新增成功'); }
      setModalOpen(false); setEditing(null); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '仓库编号', dataIndex: 'warehouse_id', width: 130 },
    { title: '位置', dataIndex: 'warehouse_location', width: 200 },
    { title: '负责人编号', dataIndex: 'manager_employee_id', width: 130 },
    { title: '联系电话', dataIndex: 'contact_phone', width: 140 },
    { title: '面积(㎡)', dataIndex: 'area', width: 100 },
    { title: '类别', dataIndex: 'category', width: 100 },
    { title: '操作', width: 160, render: (_: any, r: Warehouse) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={async () => { try { await deleteWarehouse(r.warehouse_id); message.success('删除成功'); fetch(page); } catch { message.error('删除失败'); } }}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增仓库</Button>
      <Table columns={columns} dataSource={data} rowKey="warehouse_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title={editing ? '编辑仓库' : '新增仓库'} open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="warehouse_id" label="仓库编号" rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="warehouse_location" label="位置" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="manager_employee_id" label="负责人编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="area" label="面积(㎡)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
