import { request } from './client'

export const getAvailability = () => request('/availability')
export const createAvailability = (body) => request('/availability', { method: 'POST', body: JSON.stringify(body) })
export const updateAvailability = (id, body) => request(`/availability/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
