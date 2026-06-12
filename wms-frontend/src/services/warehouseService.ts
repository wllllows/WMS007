import api from './api';
import type { Warehouse, PaginatedResponse } from '../types';
export async function getWarehouses(params?: any) { const { data } = await api.get<PaginatedResponse<Warehouse>>('/warehouses/', { params }); return data; }
export async function createWarehouse(body: any) { const { data } = await api.post('/warehouses/', body); return data; }
export async function updateWarehouse(id: string, body: any) { const { data } = await api.put(`/warehouses/${id}`, body); return data; }
export async function deleteWarehouse(id: string) { const { data } = await api.delete(`/warehouses/${id}`); return data; }
