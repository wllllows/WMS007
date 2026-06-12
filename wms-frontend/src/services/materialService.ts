import api from './api';
import type { RawMaterial, PaginatedResponse } from '../types';
export async function getMaterials(params?: any) { const { data } = await api.get<PaginatedResponse<RawMaterial>>('/materials/', { params }); return data; }
export async function createMaterial(body: any) { const { data } = await api.post('/materials/', body); return data; }
export async function updateMaterial(id: string, body: any) { const { data } = await api.put(`/materials/${id}`, body); return data; }
export async function deleteMaterial(id: string) { const { data } = await api.delete(`/materials/${id}`); return data; }
