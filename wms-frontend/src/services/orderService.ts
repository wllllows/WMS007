import api from './api';
import type { PurchaseOrder, SalesOrder, WorkOrder, OutsourcingOrder, TransferOrder, PaginatedResponse } from '../types';

export async function getPurchaseOrders(params?: any) { const { data } = await api.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders/', { params }); return data; }
export async function createPurchaseOrder(body: any) { const { data } = await api.post('/purchase-orders/', body); return data; }

export async function getSalesOrders(params?: any) { const { data } = await api.get<PaginatedResponse<SalesOrder>>('/sales-orders/', { params }); return data; }
export async function createSalesOrder(body: any) { const { data } = await api.post('/sales-orders/', body); return data; }
export async function paySalesOrder(id: string, payment_amount: number) { const { data } = await api.post(`/sales-orders/${id}/payment`, { payment_amount }); return data; }

export async function getWorkOrders(params?: any) { const { data } = await api.get<PaginatedResponse<WorkOrder>>('/work-orders/', { params }); return data; }
export async function completeWorkOrder(id: string) { const { data } = await api.post(`/work-orders/${id}/complete`); return data; }

export async function getOutsourcingOrders(params?: any) { const { data } = await api.get<PaginatedResponse<OutsourcingOrder>>('/outsourcing-orders/', { params }); return data; }
export async function createOutsourcingOrder(body: any) { const { data } = await api.post('/outsourcing-orders/', body); return data; }
export async function settleOutsourcingOrder(id: string, final_amount: number) { const { data } = await api.post(`/outsourcing-orders/${id}/settle`, { final_amount }); return data; }

export async function getTransferOrders(params?: any) { const { data } = await api.get<PaginatedResponse<TransferOrder>>('/transfer-orders/', { params }); return data; }
export async function createTransferOrder(body: any) { const { data } = await api.post('/transfer-orders/', body); return data; }
