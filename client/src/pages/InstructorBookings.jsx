import { useEffect, useState } from 'react'
import { getBookings, approveBooking, rejectBooking } from '../api/bookings'
import DataTable from '../components/DataTable'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { PageIntro } from './Dashboard'

export default function InstructorBookings() { const [rows, setRows] = useState(null); const [error, setError] = useState(''); const load = () => getBookings().then((all) => setRows(all.filter((r) => r.target_type === 'machine' && r.status === 'pending'))).catch((e) => setError(e.message)); useEffect(load, [])
  const action = async (fn, id) => { try { await fn(id); load() } catch (e) { setError(e.message) } }
  if (!rows) return <PageIntro eyebrow="SUPERVISION" title="Pending approvals"><LoadingState /></PageIntro>
  return <PageIntro eyebrow="SUPERVISION" title="Pending machine bookings" subtitle="Review requests that need your approval and a matching availability window.">{error && <div className="alert error">{error}</div>}<DataTable rows={rows} empty="No pending machine bookings." columns={[{ key: 'user_id', label: 'Student' }, { key: 'target_id', label: 'Machine' }, { key: 'window', label: 'Window', render: (r) => <>{new Date(r.start_time).toLocaleString()}<br />to {new Date(r.end_time).toLocaleString()}</> }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'actions', label: '', render: (r) => <span className="actions"><button className="table-action" onClick={() => action(approveBooking, r.id)}>Approve</button><button className="table-action danger" onClick={() => action(rejectBooking, r.id)}>Reject</button></span> }]} /></PageIntro> }
