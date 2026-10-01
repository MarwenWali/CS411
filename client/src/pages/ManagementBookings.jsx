import { useEffect, useState } from 'react'
import { getBookings, approveBooking, rejectBooking, returnBooking } from '../api/bookings'
import DataTable from '../components/DataTable'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { PageIntro } from './Dashboard'

export default function ManagementBookings() {
  const [rows, setRows] = useState(null); const [error, setError] = useState(''); const load = () => getBookings().then(setRows).catch((e) => setError(e.message)); useEffect(load, [])
  const action = async (fn, id) => { try { await fn(id); load() } catch (e) { setError(e.message) } }
  if (!rows) return <PageIntro eyebrow="OVERSIGHT" title="All bookings"><LoadingState /></PageIntro>
  return <PageIntro eyebrow="OVERSIGHT" title="All bookings" subtitle="Approve, reject, and close the booking queue.">{error && <div className="alert error">{error}</div>}<DataTable rows={rows} empty="The booking queue is clear." columns={[{ key: 'user_id', label: 'Student' }, { key: 'target', label: 'Resource', render: (r) => `${r.target_type} #${r.target_id}` }, { key: 'window', label: 'Window', render: (r) => <>{new Date(r.start_time).toLocaleString()}<br />to {new Date(r.end_time).toLocaleString()}</> }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'actions', label: '', render: (r) => r.status === 'pending' ? <span className="actions"><button className="table-action" onClick={() => action(approveBooking, r.id)}>Approve</button><button className="table-action danger" onClick={() => action(rejectBooking, r.id)}>Reject</button></span> : r.status === 'active' ? <button className="table-action" onClick={() => action(returnBooking, r.id)}>Mark returned</button> : null }]} /></PageIntro>
}
