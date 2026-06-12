import api from './api';
export async function getDashboardStats() { const { data } = await api.get('/dashboard/stats'); return data; }
export async function getInventory(params?: any) { const { data } = await api.get('/inventory/query', { params }); return data; }
