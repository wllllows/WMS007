import { useEffect, useState } from 'react';
import { Table, Input, Space, Card, Spin } from 'antd';
import { getInventory } from '../../services/dashboardService';

export default function InventoryQuery() {
  const [data, setData] = useState<any>({ materials: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);

  const fetch = () => { setLoading(true); getInventory({ keyword, warehouse_id: warehouseId }).then(setData).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, [warehouseId]);

  const matCols = [
    { title: '物料编号', dataIndex: 'id', width: 130 }, { title: '物料名称', dataIndex: 'name', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 150 }, { title: '属性', dataIndex: 'attr', width: 120 }, { title: '所在仓库', dataIndex: 'warehouse_name', width: 150 },
  ];
  const prodCols = [
    { title: '成品编号', dataIndex: 'id', width: 130 }, { title: '成品名称', dataIndex: 'name', width: 150 },
    { title: '品牌等级', dataIndex: 'attr', width: 120 }, { title: '所在仓库', dataIndex: 'warehouse_name', width: 150 },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索名称" allowClear onSearch={v => { setKeyword(v); fetch(); }} style={{ width: 300 }} />
        <Input placeholder="仓库编号筛选" allowClear style={{ width: 200 }} onChange={e => setWarehouseId(e.target.value || undefined)} />
      </Space>
      <Spin spinning={loading}>
        <Card title="原料库存" style={{ marginBottom: 16 }}><Table columns={matCols} dataSource={data.materials} rowKey="id" pagination={{ pageSize: 10 }} size="small" /></Card>
        <Card title="成品库存"><Table columns={prodCols} dataSource={data.products} rowKey="id" pagination={{ pageSize: 10 }} size="small" /></Card>
      </Spin>
    </div>
  );
}
