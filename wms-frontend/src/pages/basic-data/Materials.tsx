import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../services/materialService';
import type { RawMaterial } from '../../types';

export default function Materials() {
  const [data, setData] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const fetch = (p = 1, keyword = search) => {
    setLoading(true);
    getMaterials({ page: p, page_size: 20, keyword })
      .then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败: '+(err?.response?.data?.detail||err?.message||'')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) { await updateMaterial(editing.raw_material_id, values); message.success('更新成功'); }
      else { await createMaterial(values as RawMaterial); message.success('新增成功'); }
      setModalOpen(false); setEditing(null); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '物料编号', dataIndex: 'raw_material_id', width: 130 },
    { title: '物料名称', dataIndex: 'raw_material_name', width: 150 },
    { title: '规格型号', dataIndex: 'specification_model', width: 150 },
    { title: '物料属性', dataIndex: 'material_attribute', width: 120 },
    { title: '仓库编号', dataIndex: 'warehouse_id', width: 130 },
    { title: '操作', width: 160, render: (_: any, r: RawMaterial) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={async () => { try { await deleteMaterial(r.raw_material_id); message.success('删除成功'); fetch(page); } catch(err:any) { message.error('删除失败'); } }}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索物料名称/规格" allowClear onSearch={v => { setSearch(v); fetch(1, v); }} style={{ width: 300 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增物料</Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="raw_material_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title={editing ? '编辑物料' : '新增物料'} open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="raw_material_id" label="物料编号" rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="raw_material_name" label="物料名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="specification_model" label="规格型号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="material_attribute" label="物料属性" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="warehouse_id" label="仓库编号" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
