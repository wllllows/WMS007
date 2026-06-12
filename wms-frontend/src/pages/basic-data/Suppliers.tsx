import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/supplierService';
import type { OutsourcingSupplier } from '../../types';

export default function Suppliers() {
  const [data, setData] = useState<OutsourcingSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OutsourcingSupplier | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const fetch = (p = 1, keyword = search) => {
    setLoading(true);
    getSuppliers({ page: p, keyword }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) { await updateSupplier(editing.supplier_id, values as OutsourcingSupplier); message.success('更新成功'); }
      else { await createSupplier(values as OutsourcingSupplier); message.success('新增成功'); }
      setModalOpen(false); setEditing(null); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '厂商编号', dataIndex: 'supplier_id', width: 120 },
    { title: '厂商名称', dataIndex: 'supplier_name', width: 180 },
    { title: '联系人', dataIndex: 'contact_person', width: 100 },
    { title: '联系电话', dataIndex: 'contact_phone', width: 140 },
    { title: '资质等级', dataIndex: 'qualification_level', width: 100 },
    { title: '地址', dataIndex: 'address', width: 200 },
    { title: '操作', width: 160, render: (_: any, r: OutsourcingSupplier) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={async () => { try { await deleteSupplier(r.supplier_id); message.success('删除成功'); fetch(page); } catch { message.error('删除失败'); } }}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索厂商名称" allowClear onSearch={v => { setSearch(v); fetch(1, v); }} style={{ width: 300 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增厂商</Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="supplier_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title={editing ? '编辑厂商' : '新增厂商'} open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="supplier_id" label="厂商编号" rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="supplier_name" label="厂商名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact_person" label="联系人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="qualification_level" label="资质等级" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
