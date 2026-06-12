import api from './api';
export interface LoginResponse { token: string; username: string; role: string; name: string; menus: string[]; }
export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
