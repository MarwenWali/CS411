import { request } from './client'

export const getMachines = () => request('/machines')
export const createMachine = (body) => request('/machines', { method: 'POST', body: JSON.stringify(body) })
export const updateMachine = (id, body) => request(`/machines/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const deleteMachine = (id) => request(`/machines/${id}`, { method: 'DELETE' })
