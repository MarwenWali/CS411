import { request } from './client'

export const getComponents = () => request('/components')
export const createComponent = (body) => request('/components', { method: 'POST', body: JSON.stringify(body) })
export const updateComponent = (id, body) => request(`/components/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const deleteComponent = (id) => request(`/components/${id}`, { method: 'DELETE' })
