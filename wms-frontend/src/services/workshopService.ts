import api from './api';
import type { Workshop, PaginatedResponse } from '../types';
export async function getWorkshops(params?: any) { const { data } = await api.get<PaginatedResponse<Workshop>>('/workshops/', { params }); return data; }
export async function createWorkshop(body: any) { const { data } = await api.post('/workshops/', body); return data; }
export async function deleteWorkshop(id: string) { const { data } = await api.delete(`/workshops/${id}`); return data; }
