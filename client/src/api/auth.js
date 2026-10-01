import { request } from './client'

export const login = (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
export const register = (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) })
