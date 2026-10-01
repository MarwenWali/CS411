import { request } from './client'

export const getBookings = () => request('/bookings')
export const createBooking = (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) })
export const approveBooking = (id) => request(`/bookings/${id}/approve`, { method: 'PATCH' })
export const rejectBooking = (id) => request(`/bookings/${id}/reject`, { method: 'PATCH' })
export const returnBooking = (id) => request(`/bookings/${id}/return`, { method: 'PATCH' })
export const cancelBooking = (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' })
