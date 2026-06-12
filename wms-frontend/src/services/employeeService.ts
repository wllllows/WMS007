import api from './api';
import type { Employee, PaginatedResponse } from '../types';
export async function getEmployees(params?: any) { const { data } = await api.get<PaginatedResponse<Employee>>('/employees/', { params }); return data; }
export async function createEmployee(body: any) { const { data } = await api.post('/employees/', body); return data; }
export async function updateEmployee(id: string, body: any) { const { data } = await api.put(`/employees/${id}`, body); return data; }
export async function deleteEmployee(id: string) { const { data } = await api.delete(`/employees/${id}`); return data; }
