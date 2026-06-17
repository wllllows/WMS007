import api from './api';

// SP 接口
export async function copyPurchaseOrder(source: string, newId: string) { const { data } = await api.post(`/sp/copy-purchase-order?source=${source}&new_id=${newId}`); return data; }
export async function getMaterialOutsourcingSummary(materialId: string) { const { data } = await api.get(`/sp/material-outsourcing-summary?material_id=${materialId}`); return data; }
export async function getWorkshopReport(workshopId: string) { const { data } = await api.get(`/sp/workshop-production-report?workshop_id=${workshopId}`); return data; }

// 视图接口
export async function getEmployeePerformance() { const { data } = await api.get('/view/employee-performance'); return data; }
export async function getProductTrace() { const { data } = await api.get('/view/product-trace'); return data; }
export async function getOutsourcingMaterialDetail() { const { data } = await api.get('/view/outsourcing-material-detail'); return data; }
export async function getPaymentPurchaseSummary() { const { data } = await api.get('/view/payment-purchase-summary'); return data; }
export async function getMaterialOutsourcing() { const { data } = await api.get('/view/material-outsourcing'); return data; }
export async function deleteExpiredWorkOrders(days: number) { const { data } = await api.post(`/sp/delete-expired-workorders?days=${days}`); return data; }
export async function updateEmployeeContact(oldPhone: string, newPhone: string) { const { data } = await api.post(`/sp/update-employee-contact?old_phone=${oldPhone}&new_phone=${newPhone}`); return data; }
