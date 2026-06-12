import api from './api';
import type { OutsourcingSupplier, PaginatedResponse } from '../types';
export async function getSuppliers(params?: any) { const { data } = await api.get<PaginatedResponse<OutsourcingSupplier>>('/suppliers/', { params }); return data; }
export async function createSupplier(body: any) { const { data } = await api.post('/suppliers/', body); return data; }
export async function updateSupplier(id: string, body: any) { const { data } = await api.put(`/suppliers/${id}`, body); return data; }
export async function deleteSupplier(id: string) { const { data } = await api.delete(`/suppliers/${id}`); return data; }
