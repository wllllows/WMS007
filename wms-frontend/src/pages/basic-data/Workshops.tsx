import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getWorkshops, createWorkshop, deleteWorkshop } from '../../services/workshopService';
import type { Workshop } from '../../types';

export default function Workshops() {
  const [data, setData] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = (p = 1) => {
    setLoading(true);
    getWorkshops({ page: p }).then(res => { setData(res.data); setTotal(res.total); setPage(p); })
      .catch(()=>message.error('加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try { const values = await form.validateFields(); setSaving(true);
      await createWorkshop(values as Workshop); message.success('新增成功');
      setModalOpen(false); form.resetFields(); fetch(page);
    } catch (err: any) { if (!err?.errorFields) message.error('操作失败'); }
    finally { setSaving(false); }
  };

  const columns = [
    { title: '车间编号', dataIndex: 'workshop_id', width: 130 },
    { title: '负责人', dataIndex: 'manager', width: 120 },
    { title: '位置', dataIndex: 'location', width: 200 },
    { title: '联系电话', dataIndex: 'contact_phone', width: 140 },
    { title: '操作', width: 100, render: (_: any, r: Workshop) => (
      <Popconfirm title="确定删除？" onConfirm={async () => { try { await deleteWorkshop(r.workshop_id); message.success('删除成功'); fetch(page); } catch { message.error('删除失败'); } }}>
        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </Popconfirm>
    )},
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setModalOpen(true); }}>新增车间</Button>
      <Table columns={columns} dataSource={data} rowKey="workshop_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: p => fetch(p) }} />
      <Modal title="新增车间" open={modalOpen} onOk={handleSave} confirmLoading={saving} onCancel={() => { setModalOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="workshop_id" label="车间编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="manager" label="负责人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="位置" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
