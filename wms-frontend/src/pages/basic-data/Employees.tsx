import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService';
import type { Employee } from '../../types';

export default function Employees() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const fetch = (p = 1, keyword = search) => {
    setLoading(true);
    getEmployees({ page: p, keyword }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(err => message.error('加载失败: '+(err?.response?.data?.detail||err?.message||''))).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) { await updateEmployee(editing.employee_id, values); message.success('更新成功'); }
      else { await createEmployee(values as any); message.success('新增成功'); }
      setModalOpen(false); setEditing(null); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败: '+(err?.response?.data?.detail||err?.message||'')); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '员工编号', dataIndex: 'employee_id', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '岗位', dataIndex: 'position', width: 120 },
    { title: '联系电话', dataIndex: 'contact_phone', width: 140 },
    { title: '操作', width: 160, render: (_: any, r: Employee) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={async () => { try { await deleteEmployee(r.employee_id); message.success('删除成功'); fetch(page); } catch(err:any) { message.error('删除失败'); } }}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索姓名" allowClear onSearch={v => { setSearch(v); fetch(1, v); }} style={{ width: 300 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增员工</Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="employee_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title={editing ? '编辑员工' : '新增员工'} open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="employee_id" label="员工编号" rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="position" label="岗位" rules={[{ required: true }]}>
            <Select options={[{ value: '采购员', label: '采购员' }, { value: '销售员', label: '销售员' }, { value: '仓库管理员', label: '仓库管理员' }, { value: '车间负责人', label: '车间负责人' }, { value: '管理员', label: '管理员' }]} />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
